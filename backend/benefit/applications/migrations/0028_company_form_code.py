# Generated by Django 3.2.4 on 2022-03-10 07:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0027_applicationlogentry_ordering"),
    ]

    operations = [
        migrations.AddField(
            model_name="application",
            name="company_form_code",
            field=models.IntegerField(
                default=16, verbose_name="YTJ type code for company form"
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="historicalapplication",
            name="company_form_code",
            field=models.IntegerField(
                default=16, verbose_name="YTJ type code for company form"
            ),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="application",
            name="company_form",
            field=models.CharField(
                max_length=64, verbose_name="company form as user-readable text"
            ),
        ),
        migrations.AlterField(
            model_name="historicalapplication",
            name="company_form",
            field=models.CharField(
                max_length=64, verbose_name="company form as user-readable text"
            ),
        ),
    ]
