import django
import os
import requests
import json

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "PokeTrader.settings")
django.setup()

from api.models import PokemonInfo

def import_pokemon_info():
    url = "https://pokeapi.co/api/v2/pokemon?offset=0&limit=151"
    response = requests.get(url)
    data = response.json()

    for entry in data["results"]:
        detail_url = entry["url"]
        detail = requests.get(detail_url).json()

        name = detail["name"].capitalize()
        height = detail["height"] / 10
        weight = detail["weight"] / 10
        image = detail["sprites"]["front_default"]
        types = [t["type"]["name"] for t in detail["types"]]
        stats = {s["stat"]["name"]: s["base_stat"] for s in detail["stats"]}

        pokemon = PokemonInfo.objects.create(
            name=name,
            height=height,
            weight=weight,
            image_url=image,
            types=json.dumps(types),
            stats=json.dumps(stats)
        )

        print(f"Added: {pokemon.name}")

if __name__ == "__main__":
    import_pokemon_info()
