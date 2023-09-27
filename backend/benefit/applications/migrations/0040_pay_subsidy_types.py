# Generated by Django 3.2.18 on 2023-09-21 10:39

from django.db import migrations, models
from applications.enums import PaySubsidyGranted


def migrate_pay_subsidy_types(apps, _):
    def _migrate_pay_subsidy_types(applications):
        for app in applications.objects.all():
            app.pay_subsidy_granted = (
                PaySubsidyGranted.GRANTED
                if app.pay_subsidy_granted_old
                else PaySubsidyGranted.NOT_GRANTED
            )
            app.save()

    application = apps.get_model("applications", "Application")
    hist_application = apps.get_model("applications", "HistoricalApplication")
    _migrate_pay_subsidy_types(application)
    _migrate_pay_subsidy_types(hist_application)


class Migration(migrations.Migration):
    dependencies = [
        ("applications", "0039_alter_paysubsidy_percentages"),
    ]

    operations = [
        migrations.RenameField(
            model_name="application",
            old_name="pay_subsidy_granted",
            new_name="pay_subsidy_granted_old",
        ),
        migrations.RenameField(
            model_name="historicalapplication",
            old_name="pay_subsidy_granted",
            new_name="pay_subsidy_granted_old",
        ),
        migrations.AddField(
            model_name="application",
            name="pay_subsidy_granted",
            field=models.CharField(
                blank=True,
                choices=[
                    ("granted", "Pay subsidy granted (default)"),
                    ("granted_aged", "Pay subsidy granted (aged)"),
                    ("not_granted", "No granted pay subsidy"),
                ],
                max_length=128,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="historicalapplication",
            name="pay_subsidy_granted",
            field=models.CharField(
                blank=True,
                choices=[
                    ("granted", "Pay subsidy granted (default)"),
                    ("granted_aged", "Pay subsidy granted (aged)"),
                    ("not_granted", "No granted pay subsidy"),
                ],
                max_length=128,
                null=True,
            ),
        ),
        migrations.RunPython(
            migrate_pay_subsidy_types, reverse_code=migrations.RunPython.noop
        ),
        migrations.RemoveField(
            model_name="application",
            name="pay_subsidy_granted_old",
        ),
        migrations.RemoveField(
            model_name="historicalapplication",
            name="pay_subsidy_granted_old",
        ),
    ]
