# Generated by Django 5.1.7 on 2025-04-17 09:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_trade_accepted_by'),
    ]

    operations = [
        migrations.AddField(
            model_name='tradeofferedcard',
            name='image_url',
            field=models.URLField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='tradeofferedcard',
            name='market_price',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='tradeofferedcard',
            name='name',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
