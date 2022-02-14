# Generated by Django 3.2.4 on 2021-12-03 06:32

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0012_add_youthapplication_youthsummervoucher"),
    ]

    operations = [
        migrations.CreateModel(
            name="School",
            fields=[
                (
                    "created_at",
                    models.DateTimeField(
                        auto_now_add=True, verbose_name="time created"
                    ),
                ),
                (
                    "modified_at",
                    models.DateTimeField(auto_now=True, verbose_name="time modified"),
                ),
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("name", models.CharField(db_index=True, max_length=256, unique=True)),
                (
                    "deleted_at",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="time deleted"
                    ),
                ),
            ],
            options={
                "verbose_name": "school",
                "verbose_name_plural": "schools",
                "ordering": ["name"],
            },
        ),
    ]
