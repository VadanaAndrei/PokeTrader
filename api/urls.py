from django.urls import path
from .views import SetListView
from .views import *
from . import views

urlpatterns = [
    path("sets/", SetListView.as_view(), name="set-list"),
    path("sets/<str:set_id>/cards/", SetCardsView.as_view(), name="set-cards"),
    path("collection/", UserCollectionView.as_view(), name="user-collection"),
    path("collection/add/", AddToCollectionView.as_view(), name="add-to-collection"),
    path("collection/remove/", RemoveFromCollectionView.as_view(), name="remove-from-collection"),
    path("cards/", CardSearchView.as_view(), name="card-search"),
    path("trades/", TradeListCreateView.as_view(), name="trade-list-create"),
    path("trades/<int:pk>/", TradeDetailView.as_view(), name="trade-detail"),
    path("trades/<int:trade_id>/accept/", AcceptTradeView.as_view(), name="accept-trade"),
    path("trades/accepted/", AcceptedTradesView.as_view(), name="accepted-trades"),
    path("trades/<int:trade_id>/messages/", MessageListCreateView.as_view(), name="trade-messages"),
    path("trades/<int:trade_id>/confirm/", ConfirmTradeView.as_view(), name="confirm-trade"),
    path("trades/<int:trade_id>/confirmation/", TradeConfirmationStatusView.as_view(),
         name="trade-confirmation-status"),
    path("start-game/", StartGuessGameView.as_view(), name="start-game"),
    path("ask-question/", AskQuestionView.as_view(), name="ask-question"),
    path("guess/", GuessPokemonView.as_view(), name="guess-pokemon"),
    path("active-game/", ActiveGameView.as_view(), name="active-game"),
    path("profile/", ProfileView.as_view(), name='profile'),
    path("trades/completed/", CompletedTradesView.as_view(), name="completed-trades"),
    path("trades/rate/", RateTradeView.as_view(), name="rate-trade"),
    path("trades/my-ratings/", MyTradeRatingsView.as_view(), name="my-trade-ratings"),
    path("trades/average-rating/", AverageUserRatingView.as_view(), name="average-user-rating"),
    path("guess-game-access/", guess_game_daily_access),
    path("password-reset/", PasswordResetView.as_view(), name="password-reset"),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
]
