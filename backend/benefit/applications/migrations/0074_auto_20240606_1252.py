# Generated by Django 3.2.23 on 2024-06-06 09:52

from django.db import migrations, models
import django.db.models.deletion
import encrypted_fields.fields
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('companies', '0004_localized_iban_field'),
        ('applications', '0073_alter_ahjostatus_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='application',
            name='status',
            field=models.CharField(choices=[('draft', 'Draft'), ('received', 'Received'), ('handling', 'Handling'), ('additional_information_needed', 'Additional information requested'), ('cancelled', 'Cancelled'), ('accepted', 'Accepted'), ('rejected', 'Rejected'), ('archival', 'Archival')], default='draft', max_length=64, verbose_name='status'),
        ),
        migrations.AlterField(
            model_name='applicationlogentry',
            name='from_status',
            field=models.CharField(choices=[('draft', 'Draft'), ('received', 'Received'), ('handling', 'Handling'), ('additional_information_needed', 'Additional information requested'), ('cancelled', 'Cancelled'), ('accepted', 'Accepted'), ('rejected', 'Rejected'), ('archival', 'Archival')], max_length=64),
        ),
        migrations.AlterField(
            model_name='applicationlogentry',
            name='to_status',
            field=models.CharField(choices=[('draft', 'Draft'), ('received', 'Received'), ('handling', 'Handling'), ('additional_information_needed', 'Additional information requested'), ('cancelled', 'Cancelled'), ('accepted', 'Accepted'), ('rejected', 'Rejected'), ('archival', 'Archival')], max_length=64),
        ),
        migrations.AlterField(
            model_name='historicalapplication',
            name='status',
            field=models.CharField(choices=[('draft', 'Draft'), ('received', 'Received'), ('handling', 'Handling'), ('additional_information_needed', 'Additional information requested'), ('cancelled', 'Cancelled'), ('accepted', 'Accepted'), ('rejected', 'Rejected'), ('archival', 'Archival')], default='draft', max_length=64, verbose_name='status'),
        ),
        migrations.AlterField(
            model_name='historicalapplicationlogentry',
            name='from_status',
            field=models.CharField(choices=[('draft', 'Draft'), ('received', 'Received'), ('handling', 'Handling'), ('additional_information_needed', 'Additional information requested'), ('cancelled', 'Cancelled'), ('accepted', 'Accepted'), ('rejected', 'Rejected'), ('archival', 'Archival')], max_length=64),
        ),
        migrations.AlterField(
            model_name='historicalapplicationlogentry',
            name='to_status',
            field=models.CharField(choices=[('draft', 'Draft'), ('received', 'Received'), ('handling', 'Handling'), ('additional_information_needed', 'Additional information requested'), ('cancelled', 'Cancelled'), ('accepted', 'Accepted'), ('rejected', 'Rejected'), ('archival', 'Archival')], max_length=64),
        ),
        migrations.CreateModel(
            name='ArchivalApplication',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='time created')),
                ('modified_at', models.DateTimeField(auto_now=True, verbose_name='time modified')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('application_number', models.TextField(blank=True, null=True, verbose_name='application_number')),
                ('submitted_at', models.TextField(blank=True, null=True, verbose_name='submitted_at')),
                ('encrypted_employee_first_name', encrypted_fields.fields.EncryptedCharField(blank=True, max_length=128, verbose_name='first name')),
                ('encrypted_employee_last_name', encrypted_fields.fields.EncryptedCharField(blank=True, max_length=128, verbose_name='last name')),
                ('employee_first_name', encrypted_fields.fields.SearchField(blank=True, db_index=True, encrypted_field_name='encrypted_employee_first_name', hash_key='02c5b8605cd4f9c188eee422209069b7bd3a607f0ae0a166eab0da223d1b6735', max_length=66, null=True)),
                ('employee_last_name', encrypted_fields.fields.SearchField(blank=True, db_index=True, encrypted_field_name='encrypted_employee_last_name', hash_key='af1b5a67d11197865a731c26bf9659716b9ded71c2802b4363856fe613b6b527', max_length=66, null=True)),
                ('start_date', models.DateField(blank=True, null=True, verbose_name='start_date')),
                ('end_date', models.DateField(blank=True, null=True, verbose_name='end_date')),
                ('benefit_type', models.TextField(blank=True, null=True, verbose_name='benefit_type')),
                ('months_total', models.TextField(blank=True, null=True, verbose_name='months_total')),
                ('year_of_birth', models.TextField(blank=True, null=True, verbose_name='day_of_birth')),
                ('status', models.TextField(choices=[('draft', 'Draft'), ('received', 'Received'), ('handling', 'Handling'), ('additional_information_needed', 'Additional information requested'), ('cancelled', 'Cancelled'), ('accepted', 'Accepted'), ('rejected', 'Rejected'), ('archival', 'Archival')], default='archival')),
                ('handled_at', models.DateField(blank=True, null=True, verbose_name='handled_at')),
                ('company', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='archival_applications', to='companies.company', verbose_name='company')),
            ],
            options={
                'db_table': 'bf_applications_archival_application',
            },
        ),
    ]
