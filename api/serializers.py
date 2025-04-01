from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
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
    card_id = serializers.CharField(source="card.card_id")
    name = serializers.CharField(source="card.name")
    image_url = serializers.URLField(source="card.image_url")
    quantity = serializers.IntegerField()

    class Meta:
        model = UserCard
        fields = ["card_id", "name", "image_url", "quantity"]