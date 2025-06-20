from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.db.models import Sum
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import *
from django.db.models import Avg
from django.core.mail import send_mail
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings

class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="This email is already in use.")]
    )
    username = serializers.CharField(
        validators=[UniqueValidator(queryset=User.objects.all(), message="This username is already taken.")]
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
        extra_kwargs = {
            "password": {"write_only": True},
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
    number = serializers.CharField(source="user_card.card.number", read_only=True)
    set_name = serializers.CharField(source="user_card.card.set.name", read_only=True)

    class Meta:
        model = TradeOfferedCard
        fields = [
            "user_card", "quantity", "name", "image_url",
            "market_price", "number", "set_name"
        ]

class TradeRequestedCardSerializer(serializers.ModelSerializer):
    card_id = serializers.CharField(source="card.card_id", read_only=True)
    name = serializers.CharField(source="card.name", read_only=True)
    image_url = serializers.URLField(source="card.image_url", read_only=True)
    market_price = serializers.FloatField(source="card.market_price", read_only=True)
    number = serializers.CharField(source="card.number", read_only=True)
    set_name = serializers.CharField(source="card.set.name", read_only=True)

    class Meta:
        model = TradeRequestedCard
        fields = [
            "card", "quantity", "card_id", "name", "image_url",
            "market_price", "number", "set_name"
        ]

class TradeCreateSerializer(serializers.ModelSerializer):
    offered_items = serializers.ListField()
    requested_items = serializers.ListField()
    offered_coins = serializers.IntegerField(required=False, default=0)
    requested_coins = serializers.IntegerField(required=False, default=0)

    class Meta:
        model = Trade
        fields = ["offered_items", "requested_items", "offered_coins", "requested_coins"]

    def create(self, validated_data):
        user = self.context["request"].user

        offered_items = validated_data.pop("offered_items", [])
        requested_items = validated_data.pop("requested_items", [])
        offered_coins = validated_data.pop("offered_coins", 0)
        requested_coins = validated_data.pop("requested_coins", 0)

        trade = Trade.objects.create(
            user=user,
            offered_coins=offered_coins,
            requested_coins=requested_coins
        )

        for item in offered_items:
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

        for item in requested_items:
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
    offered_coins = serializers.IntegerField()
    requested_coins = serializers.IntegerField()
    user_coins = serializers.SerializerMethodField()
    poster_rating = serializers.SerializerMethodField()

    class Meta:
        model = Trade
        fields = [
            "id", "user", "created_at", "is_active",
            "offered_items", "requested_items",
            "offered_coins", "requested_coins",
            "accepted_by", "user_coins", "poster_rating"
        ]

    def get_user_coins(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return request.user.userprofile.coins
        return 0

    def get_poster_rating(self, obj):
        from django.db.models import Q, Avg
        user = obj.user
        completed_trades = CompletedTrade.objects.filter(Q(user=user) | Q(accepted_by=user))
        avg = \
        TradeRating.objects.filter(trade__in=completed_trades).exclude(rated_by=user).aggregate(avg=Avg("rating"))[
            "avg"]
        return round(avg, 1) if avg is not None else None

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "trade", "sender", "sender_username", "text", "timestamp"]
        read_only_fields = ["id", "timestamp", "sender", "sender_username", "trade"]

class TradeConfirmationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TradeConfirmation
        fields = ["poster_confirmed", "accepter_confirmed"]

class CompletedTradeSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username", read_only=True)
    accepted_by = serializers.CharField(source="accepted_by.username", read_only=True)
    offered_items_snapshot = serializers.JSONField()
    requested_items_snapshot = serializers.JSONField()
    offered_coins = serializers.IntegerField()
    requested_coins = serializers.IntegerField()
    rating_given = serializers.SerializerMethodField()

    class Meta:
        model = CompletedTrade
        fields = [
            "id", "user", "accepted_by", "created_at", "completed_at",
            "offered_items_snapshot", "requested_items_snapshot",
            "offered_coins", "requested_coins", "rating_given"
        ]

    def get_rating_given(self, obj):
        user = self.context["request"].user
        rating = obj.ratings.filter(rated_by=user).first()
        return rating.rating if rating else None

class TradeRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = TradeRating
        fields = ['trade', 'rated_by', 'rating']
        read_only_fields = ['rated_by']

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['username', 'coins', 'average_rating']

    def get_average_rating(self, obj):
        from django.db.models import Avg, Q
        user = obj.user

        completed_trades = CompletedTrade.objects.filter(
            Q(user=user) | Q(accepted_by=user)
        )

        avg = TradeRating.objects.filter(
            trade__in=completed_trades
        ).exclude(
            rated_by=user
        ).aggregate(avg=Avg('rating'))['avg']

        return round(avg, 1) if avg else None

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user with this email.")
        return value

    def save(self):
        email = self.validated_data["email"]
        user = User.objects.get(email=email)
        token = RefreshToken.for_user(user).access_token
        frontend_url = "http://localhost:5173/reset-password"
        reset_link = f"{frontend_url}?token={str(token)}"

        send_mail(
            subject="Password Reset Request",
            message=f"Click the link to reset your password: {reset_link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
        )

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        from rest_framework_simplejwt.tokens import AccessToken
        try:
            token = AccessToken(attrs["token"])
            user_id = token["user_id"]
            user = User.objects.get(id=user_id)
        except Exception:
            raise serializers.ValidationError("Invalid or expired token.")
        attrs["user"] = user
        return attrs

    def save(self):
        user = self.validated_data["user"]
        password = self.validated_data["password"]
        user.set_password(password)
        user.save()








