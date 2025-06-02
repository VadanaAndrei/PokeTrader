from django.contrib import admin
from .models import *

admin.site.register(Set)
admin.site.register(PokemonCard)
admin.site.register(Trade)
admin.site.register(PokemonInfo)
admin.site.register(PokemonGuessGame)
admin.site.register(CompletedTrade)
admin.site.register(TradeRating)


