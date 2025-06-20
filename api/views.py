from django.db import transaction
from rest_framework import generics, status
from rest_framework.filters import SearchFilter
from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import *
from .serializers import *
from django.db.models.functions import Cast
from django.db.models import IntegerField, Sum
import random
import re
from django.utils import timezone
from django.db.models import Avg
from datetime import date
from rest_framework.decorators import api_view, permission_classes
from django.utils.timezone import now

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

class SetListView(generics.ListAPIView):
    queryset = Set.objects.all().order_by("-release_date")
    serializer_class = SetSerializer
    permission_classes = [AllowAny]

class SetCardsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, set_id):
        cards = (
            PokemonCard.objects
            .filter(set_id=set_id)
            .annotate(number_int=Cast("number", IntegerField()))
            .order_by("number_int")
        )

        serializer = PokemonCardSerializer(cards, many=True)
        return Response(serializer.data)

class UserCollectionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        collection = UserCard.objects.filter(user=request.user)
        serializer = UserCardSerializer(collection, many=True)
        return Response(serializer.data)

class AddToCollectionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        card_id = request.data.get("card_id")
        if not card_id:
            return Response({"error": "card_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            card = PokemonCard.objects.get(card_id=card_id)
        except PokemonCard.DoesNotExist:
            return Response({"error": "Card not found"}, status=status.HTTP_404_NOT_FOUND)

        entry, created = UserCard.objects.get_or_create(user=request.user, card=card)
        entry.quantity += 1
        entry.save()

        return Response({"message": "Card added to collection", "quantity": entry.quantity})

class RemoveFromCollectionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        card_id = request.data.get("card_id")
        if not card_id:
            return Response({"error": "card_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            card = PokemonCard.objects.get(card_id=card_id)
            entry = UserCard.objects.get(user=request.user, card=card)
        except (PokemonCard.DoesNotExist, UserCard.DoesNotExist):
            return Response({"error": "Card not in collection"}, status=status.HTTP_404_NOT_FOUND)

        entry.quantity -= 1
        if entry.quantity <= 0:
            entry.delete()
            return Response({"message": "Card removed from collection", "quantity": 0})

        entry.save()
        return Response({"message": "Decreased quantity", "quantity": entry.quantity})

class CardSearchView(ListAPIView):
    queryset = PokemonCard.objects.all()
    serializer_class = PokemonCardSerializer
    filter_backends = [SearchFilter]
    search_fields = ["name"]
    permission_classes = [AllowAny]

class TradeListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        posted_by_me = self.request.query_params.get("posted_by_me") == "true"

        if posted_by_me and user.is_authenticated:
            return Trade.objects.filter(user=user).order_by("-created_at")

        return Trade.objects.filter(is_active=True).order_by("-created_at")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TradeCreateSerializer
        return TradeSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        trade = serializer.save(user=request.user)

        offered_coins = request.data.get("offered_coins", 0)
        if offered_coins:
            profile = request.user.userprofile
            if profile.coins < offered_coins:
                return Response({"error": "You don't have enough coins."}, status=status.HTTP_400_BAD_REQUEST)
            profile.coins -= offered_coins
            profile.save()

            trade.offered_coins = offered_coins
            trade.save()

        output_serializer = TradeSerializer(trade)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

class TradeDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Trade.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = TradeSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.offered_coins > 0:
            profile, _ = UserProfile.objects.get_or_create(user=instance.user)
            profile.coins += instance.offered_coins
            profile.save()

        self.perform_destroy(instance)
        return Response({"message": "Trade deleted and coins returned."}, status=status.HTTP_204_NO_CONTENT)

class AcceptTradeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, trade_id):
        try:
            trade = Trade.objects.get(id=trade_id, is_active=True)
        except Trade.DoesNotExist:
            return Response({"error": "Trade not found or already inactive."}, status=404)

        with transaction.atomic():
            for requested in trade.requested_items.all():
                try:
                    user_card = UserCard.objects.get(user=request.user, card=requested.card)
                except UserCard.DoesNotExist:
                    return Response({"error": f"You do not own {requested.card.name}"}, status=400)

                blocked = TradeOfferedCard.objects.filter(
                    user_card=user_card,
                    trade__is_active=True
                ).aggregate(total=Sum("quantity"))["total"] or 0

                available_quantity = user_card.quantity - blocked
                if available_quantity < requested.quantity:
                    return Response({"error": f"Not enough of {requested.card.name}"}, status=400)

            if trade.requested_coins > 0:
                if request.user.userprofile.coins < trade.requested_coins:
                    return Response({"error": "Not enough coins to accept this trade."}, status=400)
                request.user.userprofile.coins -= trade.requested_coins
                request.user.userprofile.save()

            trade.is_active = False
            trade.accepted_by = request.user
            trade.save()

        return Response({"message": "Trade accepted!"}, status=200)

class AcceptedTradesView(ListAPIView):
    serializer_class = TradeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Trade.objects.filter(
            accepted_by=self.request.user
        ).order_by("-created_at")

class MessageListCreateView(ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        trade_id = self.kwargs["trade_id"]
        return Message.objects.filter(trade_id=trade_id).order_by("timestamp")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        trade_id = self.kwargs["trade_id"]
        serializer.save(sender=request.user, trade_id=trade_id)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ConfirmTradeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, trade_id):
        try:
            trade = Trade.objects.get(id=trade_id, is_active=False)
            confirmation, _ = TradeConfirmation.objects.get_or_create(trade=trade)

            if request.user == trade.user:
                confirmation.poster_confirmed = True
            elif request.user == trade.accepted_by:
                confirmation.accepter_confirmed = True
            else:
                return Response({"error": "Not part of this trade"}, status=403)

            confirmation.save()

            if confirmation.poster_confirmed and confirmation.accepter_confirmed:
                with transaction.atomic():
                    for offered in trade.offered_items.all():
                        offered.user_card.quantity -= offered.quantity
                        offered.user_card.save()

                        accepter_card, _ = UserCard.objects.get_or_create(
                            user=trade.accepted_by, card=offered.user_card.card
                        )
                        accepter_card.quantity += offered.quantity
                        accepter_card.save()

                    for requested in trade.requested_items.all():
                        accepter_card = UserCard.objects.get(
                            user=trade.accepted_by, card=requested.card
                        )
                        accepter_card.quantity -= requested.quantity
                        accepter_card.save()

                        poster_card, _ = UserCard.objects.get_or_create(
                            user=trade.user, card=requested.card
                        )
                        poster_card.quantity += requested.quantity
                        poster_card.save()

                    if trade.offered_coins > 0:
                        trade.accepted_by.userprofile.coins += trade.offered_coins
                        trade.accepted_by.userprofile.save()

                    if trade.requested_coins > 0:
                        trade.user.userprofile.coins += trade.requested_coins
                        trade.user.userprofile.save()

                    offered_items_data = TradeOfferedCardSerializer(trade.offered_items.all(), many=True).data
                    requested_items_data = TradeRequestedCardSerializer(trade.requested_items.all(), many=True).data

                    CompletedTrade.objects.create(
                        user=trade.user,
                        accepted_by=trade.accepted_by,
                        created_at=trade.created_at,
                        completed_at=timezone.now(),
                        offered_coins=trade.offered_coins,
                        requested_coins=trade.requested_coins,
                        offered_items_snapshot=offered_items_data,
                        requested_items_snapshot=requested_items_data
                    )

                    trade.delete()

                return Response({
                    "message": "Trade fully confirmed and executed!",
                    "confirmed": True
                })

            return Response({
                "message": "Confirmation saved. Waiting for the other user.",
                "confirmed": False
            })

        except Trade.DoesNotExist:
            return Response({"error": "Trade not found"}, status=404)

class TradeConfirmationStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, trade_id):
        try:
            trade = Trade.objects.get(id=trade_id)
            confirmation = TradeConfirmation.objects.filter(trade=trade).first()
            if not confirmation:
                return Response({
                    "poster_confirmed": False,
                    "accepter_confirmed": False,
                    "user_is_poster": request.user == trade.user
                })

            return Response({
                "poster_confirmed": confirmation.poster_confirmed,
                "accepter_confirmed": confirmation.accepter_confirmed,
                "user_is_poster": request.user == trade.user
            })

        except Trade.DoesNotExist:
            return Response({"error": "Trade not found"}, status=404)

class StartGuessGameView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = user.userprofile
        current_time = now()

        midnight_today = current_time.replace(hour=0, minute=0, second=0, microsecond=0)

        if profile.last_guess_game_played and profile.last_guess_game_played >= midnight_today.date():
            return Response({"message": "You already played today!"}, status=403)

        if PokemonGuessGame.objects.filter(user=user, is_active=True).exists():
            return Response({"message": "You already have an active game."}, status=400)

        pokemon = random.choice(PokemonInfo.objects.all())
        PokemonGuessGame.objects.create(user=user, target=pokemon)

        profile.last_guess_game_played = current_time
        profile.save()

        print(f"Chosen Pokemon: {pokemon.name}")

        return Response({"message": "New game started!"})

def save_guess_message(game, text, answer, is_guess=False):
    GuessMessage.objects.create(
        game=game,
        text=text,
        answer=answer,
        is_guess=is_guess
    )

class AskQuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        question = request.data.get("question", "").lower()
        try:
            game = PokemonGuessGame.objects.get(user=request.user, is_active=True)
        except PokemonGuessGame.DoesNotExist:
            return Response({"error": "No active game found."}, status=404)

        pokemon = game.target
        types = json.loads(pokemon.types)
        stats = json.loads(pokemon.stats)

        if "type" in question:
            for t in ["bug", "dragon", "electric", "fighting", "fire", "flying", "ghost", "grass", "ground", "ice", "normal", "poison", "psychic", "rock", "water"]:
                if t in question:
                    answer = "yes" if t in types else "no"
                    save_guess_message(game, question, answer)
                    return Response({"answer": answer})

        if "height" in question or "tall" in question or "short" in question:
            height = pokemon.height
            match = re.search(r"(\d+(\.\d+)?)(\s)?(m|meter|meters)", question)

            if match:
                value = float(match.group(1))

                if "more" in question or "greater" in question or "taller" in question:
                    answer = "yes" if height > value else "no"
                    save_guess_message(game, question, answer)
                    return Response({"answer": answer})

                if "less" in question or "shorter" in question:
                    answer = "yes" if height < value else "no"
                    save_guess_message(game, question, answer)
                    return Response({"answer": answer})

        if "weight" in question or "weigh" in question:
            weight = pokemon.weight
            match = re.search(r"(\d+(\.\d+)?)(\s)?(kg|kilograms|kilos)", question)

            if match:
                value = float(match.group(1))

                if "more" in question or "greater" in question:
                    answer = "yes" if weight > value else "no"
                    save_guess_message(game, question, answer)
                    return Response({"answer": answer})

                if "less" in question or "lighter" in question:
                    answer = "yes" if weight < value else "no"
                    save_guess_message(game, question, answer)
                    return Response({"answer": answer})

        stats = json.loads(pokemon.stats)
        stat_aliases = {
            "hp": "hp",
            "health": "hp",
            "health-points": "hp",
            "health points": "hp",
            "special-attack": "special-attack",
            "special attack": "special-attack",
            "special-defense": "special-defense",
            "special defense": "special-defense",
            "attack": "attack",
            "defense": "defense",
            "speed": "speed"
        }

        q = question.lower()

        for alias, stat_key in stat_aliases.items():
            if alias in q:
                match = re.search(r"(\d+(\.\d+)?)(\s)?", q)
                if match:
                    value = float(match.group(1))
                    actual_stat = stats.get(stat_key, 0)

                    if "more" in q or "greater" in q or "higher" in q:
                        answer = "yes" if actual_stat > value else "no"
                        save_guess_message(game, question, answer)
                        return Response({"answer": answer})

                    if "less" in q or "lower" in q:
                        answer = "yes" if actual_stat < value else "no"
                        save_guess_message(game, question, answer)
                        return Response({"answer": answer})

        save_guess_message(game, question, "I don't understand the question.")
        return Response({"answer": "I don't understand the question."})

class GuessPokemonView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        guess = request.data.get("guess", "").lower()

        try:
            game = PokemonGuessGame.objects.get(user=request.user, is_active=True)
        except PokemonGuessGame.DoesNotExist:
            return Response({"error": "No active game."}, status=404)

        if guess == game.target.name.lower():
            profile = request.user.userprofile
            profile.coins += 10
            profile.save()
            save_guess_message(game, guess, "Correct!", is_guess=True)
            game.delete()

            return Response({"correct": True, "message": "Correct! You earned 10 coins."})

        save_guess_message(game, guess, "Incorrect. Try again!", is_guess=True)
        return Response({"correct": False, "message": "Incorrect. Try again!"})

class ActiveGameView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        game = PokemonGuessGame.objects.filter(user=request.user, is_active=True).first()
        if not game:
            return Response({"active": False})

        messages = game.messages.order_by("timestamp").values("is_guess", "text", "answer", "timestamp")
        return Response({
            "active": True,
            "target_name": game.target.name,
            "messages": list(messages)
        })

class CompletedTradesView(ListAPIView):
    serializer_class = CompletedTradeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return CompletedTrade.objects.filter(
            models.Q(user=user) | models.Q(accepted_by=user)
        ).order_by("-completed_at")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

class RateTradeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            trade_id = request.data.get("trade")
            rating_value = request.data.get("rating")

            trade = CompletedTrade.objects.get(id=trade_id)

            rating_obj, _ = TradeRating.objects.update_or_create(
                trade=trade,
                rated_by=request.user,
                defaults={"rating": rating_value}
            )

            return Response({
                "trade": trade.id,
                "rating": rating_obj.rating,
                "rated_by": request.user.username
            }, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

class MyTradeRatingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ratings = TradeRating.objects.filter(rated_by=request.user)
        data = {rating.trade.id: rating.rating for rating in ratings}
        return Response(data)

class AverageUserRatingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        trades = CompletedTrade.objects.filter(user=request.user)
        avg_rating = TradeRating.objects.filter(trade__in=trades).aggregate(avg=Avg('rating'))['avg']
        return Response({"average_rating": round(avg_rating or 0, 2)})

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def guess_game_daily_access(request):
    profile = request.user.userprofile
    today = date.today()

    if request.method == "GET":
        already_played = profile.last_guess_game_played == today
        return Response({"already_played": already_played})

    if profile.last_guess_game_played == today:
        return Response({"error": "Already played today."}, status=400)

    profile.last_guess_game_played = today
    profile.save()
    return Response({"success": "Play registered."})

class PasswordResetView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Password reset email sent."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Password reset successful."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
