# Generated by Django 5.1.7 on 2025-04-28 20:27

import django.contrib.postgres.fields
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Subject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField()),
                ('code', models.TextField()),
                ('abstract', models.TextField()),
            ],
            options={
                'db_table': 'subject',
            },
        ),
        migrations.CreateModel(
            name='Subject_Info',
            fields=[
                ('subject', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='subjects.subject')),
                ('level', models.IntegerField()),
                ('short', models.TextField(blank=True, null=True)),
                ('prerequisite', models.JSONField(blank=True, null=True)),
                ('activated', models.BooleanField()),
                ('participants', django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(blank=True), size=None)),
                ('mandatory', models.BooleanField()),
                ('mandatory_for', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=16), size=None)),
                ('semester', models.IntegerField()),
                ('season', models.TextField()),
                ('elective_for', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=16), size=None)),
                ('professors', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=64), size=None)),
                ('assistants', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=64), size=None)),
            ],
            options={
                'db_table': 'subject_info',
            },
        ),
    ]
