# Generated by Django 5.1.7 on 2025-03-26 20:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_set_pokemoncard_delete_note'),
    ]

    operations = [
        migrations.AddField(
            model_name='set',
            name='release_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
