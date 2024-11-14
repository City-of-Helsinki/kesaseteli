# Generated by Django 4.2.11 on 2024-11-15 08:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("calculator", "0017_instalment"),
    ]

    operations = [
        migrations.AddField(
            model_name="instalment",
            name="amount_paid",
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                editable=False,
                max_digits=7,
                null=True,
                verbose_name="To be set only ONCE when final amount is sent to Talpa. The set value should be defined by 'amount' field that is reduced by handled ApplicationAlteration recoveries at the time of Talpa robot visit.",
            ),
        ),
    ]
