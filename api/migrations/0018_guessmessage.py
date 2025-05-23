# Generated by Django 5.1.7 on 2025-04-25 10:18

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0017_pokemonguessgame'),
    ]

    operations = [
        migrations.CreateModel(
            name='GuessMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_guess', models.BooleanField(default=False)),
                ('text', models.TextField()),
                ('answer', models.CharField(blank=True, max_length=10, null=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('game', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='api.pokemonguessgame')),
            ],
        ),
    ]
