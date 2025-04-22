from django.contrib.auth.models import User
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
from django.db.models import IntegerField, Sum, Prefetch


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

        output_serializer = TradeSerializer(trade)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class TradeDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Trade.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = TradeSerializer


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



