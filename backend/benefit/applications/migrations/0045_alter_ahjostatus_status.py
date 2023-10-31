# Generated by Django 3.2.18 on 2023-10-31 10:06

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("applications", "0044_ahjostatus"),
    ]

    operations = [
        migrations.AlterField(
            model_name="ahjostatus",
            name="status",
            field=models.CharField(
                choices=[
                    (
                        "submitted_but_not_sent_to_ahjo",
                        "Submitted but not sent to AHJO",
                    ),
                    (
                        "request_to_open_case_sent",
                        "Request to open the case sent to AHJO",
                    ),
                    ("case_opened", "Case opened in AHJO"),
                    ("update_request_sent", "Update request sent"),
                    ("update_request_received", "Update request received"),
                    ("decision_proposal_sent", "Decision proposal sent"),
                    ("decision_proposal_accepted", "Decision proposal accepted"),
                    ("decision_proposal_rejected", "Decision proposal rejected"),
                    ("delete_request_sent", "Delete request sent"),
                    ("delete_request_received", "Delete request received"),
                ],
                default="submitted_but_not_sent_to_ahjo",
                max_length=64,
                verbose_name="status",
            ),
        ),
    ]
