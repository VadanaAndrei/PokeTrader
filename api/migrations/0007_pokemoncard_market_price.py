# Generated by Django 5.1.7 on 2025-04-01 11:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_set_series_alter_usercard_quantity'),
    ]

    operations = [
        migrations.AddField(
            model_name='pokemoncard',
            name='market_price',
            field=models.FloatField(blank=True, null=True),
        ),
    ]
