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
]
