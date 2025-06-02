from django.db import models
from django.contrib.auth.models import User
import json

class Set(models.Model):
    set_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    logo_url = models.URLField()
    release_date = models.DateField(null=True, blank=True)
    series = models.CharField(max_length=100, default="Other")

    def __str__(self):
        return self.name

class PokemonCard(models.Model):
    card_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    image_url = models.URLField()
    number = models.CharField(max_length=10, null=True, blank=True)
    set = models.ForeignKey(Set, on_delete=models.CASCADE, related_name='cards')
    market_price = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.name

class UserCard(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='collection')
    card = models.ForeignKey(PokemonCard, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=0)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'card')

    def __str__(self):
        return f"{self.user.username} - {self.card.name} x{self.quantity}"


class Trade(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="trades")
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    accepted_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="accepted_trades")
    offered_coins = models.IntegerField(default=0)
    requested_coins = models.IntegerField(default=0)

    def __str__(self):
        return f"Trade by {self.user.username}"


class TradeOfferedCard(models.Model):
    trade = models.ForeignKey(Trade, on_delete=models.CASCADE, related_name="offered_items")
    user_card = models.ForeignKey(UserCard, on_delete=models.CASCADE, related_name="in_trades")
    quantity = models.PositiveIntegerField()

    name = models.CharField(max_length=255, null=True, blank=True)
    image_url = models.URLField(null=True, blank=True)
    market_price = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.quantity}x {self.user_card.card.name} from {self.user_card.user.username}"


class TradeRequestedCard(models.Model):
    trade = models.ForeignKey(Trade, on_delete=models.CASCADE, related_name="requested_items")
    card = models.ForeignKey(PokemonCard, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.quantity}x {self.card.name}"


class Message(models.Model):
    trade = models.ForeignKey('Trade', on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username}: {self.text[:30]}"


class TradeConfirmation(models.Model):
    trade = models.OneToOneField(Trade, on_delete=models.CASCADE, related_name="confirmation")
    poster_confirmed = models.BooleanField(default=False)
    accepter_confirmed = models.BooleanField(default=False)

    def __str__(self):
        return f"Confirmation for trade {self.trade.id}"


class PokemonInfo(models.Model):
    name = models.CharField(max_length=100)
    height = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    image_url = models.URLField(null=True, blank=True)
    types = models.TextField(null=True, blank=True)
    stats = models.TextField(null=True, blank=True)

    def get_types(self):
        return json.loads(self.types) if self.types else []

    def get_stats(self):
        return json.loads(self.stats) if self.stats else {}

    def __str__(self):
        return self.name


class PokemonGuessGame(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    target = models.ForeignKey("PokemonInfo", on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    started_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} is guessing {self.target.name}"


class GuessMessage(models.Model):
    game = models.ForeignKey(PokemonGuessGame, on_delete=models.CASCADE, related_name="messages")
    is_guess = models.BooleanField(default=False)
    text = models.TextField()
    answer = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    coins = models.IntegerField(default=0)

class CompletedTrade(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="completed_trades_as_poster")
    accepted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="completed_trades_as_accepter")
    created_at = models.DateTimeField()
    completed_at = models.DateTimeField(auto_now_add=True)

    offered_items_snapshot = models.JSONField(null=True, blank=True)
    requested_items_snapshot = models.JSONField(null=True, blank=True)
    offered_coins = models.IntegerField(default=0)
    requested_coins = models.IntegerField(default=0)

    def __str__(self):
        return f"Completed Trade between {self.user.username} and {self.accepted_by.username}"

class TradeRating(models.Model):
    trade = models.ForeignKey("CompletedTrade", on_delete=models.CASCADE, related_name="ratings")
    rated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField()

    class Meta:
        unique_together = ('trade', 'rated_by')

    def __str__(self):
        return f"{self.rated_by.username} rated {self.trade.id} with {self.rating}"


