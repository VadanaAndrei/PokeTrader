# Generated by Django 5.1.7 on 2025-03-31 09:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_usercard'),
    ]

    operations = [
        migrations.AddField(
            model_name='set',
            name='series',
            field=models.CharField(default='Other', max_length=100),
        ),
        migrations.AlterField(
            model_name='usercard',
            name='quantity',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
