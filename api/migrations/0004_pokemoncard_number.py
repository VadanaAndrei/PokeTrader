# Generated by Django 5.1.7 on 2025-03-26 21:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_set_release_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='pokemoncard',
            name='number',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
    ]
