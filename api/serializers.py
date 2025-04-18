from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.db.models import Sum
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": True},
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        return token

    def validate(self, attrs):
        User = get_user_model()
        email = attrs.get("username")
        password = attrs.get("password")

        user = User.objects.filter(email=email).first()
        if user and user.check_password(password):
            data = super().validate({"username": user.username, "password": password})
            return data
        else:
            raise serializers.ValidationError("Invalid email or password.")

class SetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Set
        fields = "__all__"

class PokemonCardSerializer(serializers.ModelSerializer):
    set_name = serializers.CharField(source="set.name", read_only=True)

    class Meta:
        model = PokemonCard
        fields = "__all__"

class UserCardSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    card_id = serializers.CharField(source="card.card_id")
    name = serializers.CharField(source="card.name")
    image_url = serializers.URLField(source="card.image_url")
    quantity = serializers.IntegerField()
    in_trade = serializers.SerializerMethodField()
    set_name = serializers.CharField(source="card.set.name")
    available_quantity = serializers.SerializerMethodField()
    market_price = serializers.FloatField(source="card.market_price", read_only=True)
    number = serializers.CharField(source="card.number", read_only=True)

    class Meta:
        model = UserCard
        fields = "__all__"

    def get_in_trade(self, obj):
        return obj.in_trades.filter(trade__is_active=True).exists()

    def get_available_quantity(self, obj):
        blocked_active = obj.in_trades.filter(trade__is_active=True).aggregate(
            total=Sum("quantity")
        )["total"] or 0

        blocked_accepted_as_responder = TradeRequestedCard.objects.filter(
            trade__accepted_by=obj.user,
            trade__is_active=False,
            card=obj.card
        ).aggregate(total=Sum("quantity"))["total"] or 0

        blocked_accepted_as_creator = TradeOfferedCard.objects.filter(
            user_card=obj,
            trade__is_active=False,
            trade__accepted_by__isnull=False
        ).aggregate(total=Sum("quantity"))["total"] or 0

        return obj.quantity - blocked_active - blocked_accepted_as_responder - blocked_accepted_as_creator



class TradeOfferedCardSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="user_card.card.name", read_only=True)
    image_url = serializers.URLField(source="user_card.card.image_url", read_only=True)
    market_price = serializers.FloatField(source="user_card.card.market_price", read_only=True)

    class Meta:
        model = TradeOfferedCard
        fields = ["user_card", "quantity", "name", "image_url", "market_price"]




class TradeRequestedCardSerializer(serializers.ModelSerializer):
    card_id = serializers.CharField(source="card.card_id", read_only=True)
    name = serializers.CharField(source="card.name", read_only=True)
    image_url = serializers.URLField(source="card.image_url", read_only=True)
    market_price = serializers.FloatField(source="card.market_price", read_only=True)

    class Meta:
        model = TradeRequestedCard
        fields = ["card", "quantity", "card_id", "name", "image_url", "market_price"]



class TradeCreateSerializer(serializers.ModelSerializer):
    offered_items = serializers.ListField()
    requested_items = serializers.ListField()

    class Meta:
        model = Trade
        fields = ["offered_items", "requested_items"]

    def create(self, validated_data):
        user = self.context["request"].user
        trade = Trade.objects.create(user=user)

        for item in validated_data["offered_items"]:
            user_card = UserCard.objects.get(id=item["user_card"])
            card = user_card.card

            TradeOfferedCard.objects.create(
                trade=trade,
                user_card=user_card,
                quantity=item["quantity"],
                name=card.name,
                image_url=card.image_url,
                market_price=card.market_price
            )

        for item in validated_data["requested_items"]:
            TradeRequestedCard.objects.create(
                trade=trade,
                card=PokemonCard.objects.get(id=item["card"]),
                quantity=item["quantity"]
            )

        return trade



class TradeSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username", read_only=True)
    accepted_by = serializers.CharField(source="accepted_by.username", read_only=True)
    offered_items = TradeOfferedCardSerializer(many=True, read_only=True)
    requested_items = TradeRequestedCardSerializer(many=True, read_only=True)

    class Meta:
        model = Trade
        fields = ["id", "user", "created_at", "is_active", "offered_items", "requested_items", "accepted_by"]


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "trade", "sender", "sender_username", "text", "timestamp"]
        read_only_fields = ["id", "timestamp", "sender", "sender_username", "trade"]







