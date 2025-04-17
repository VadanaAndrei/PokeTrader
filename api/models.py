from django.db import models
from django.contrib.auth.models import User

class Set(models.Model):
    set_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    logo_url = models.URLField()
    release_date = models.DateField(null=True, blank=True)
    series = models.CharField(max_length=100, default="Other")  # ← AICI

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
    accepted_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL,
                                    related_name="accepted_trades")

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
