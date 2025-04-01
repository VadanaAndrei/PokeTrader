from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.filters import SearchFilter
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import  AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import *
from .serializers import *
from django.db.models.functions import Cast
from django.db.models import IntegerField


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


