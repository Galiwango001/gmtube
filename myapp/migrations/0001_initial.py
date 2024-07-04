# Generated by Django 5.0.6 on 2024-06-25 20:58

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='DownloadedVideo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('video_id', models.CharField(max_length=50)),
                ('download_url', models.URLField()),
            ],
        ),
    ]