# Generated by Django 5.1.7 on 2025-06-04 15:56

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auth_form', '0013_student_total_credits'),
    ]

    operations = [
        migrations.AddField(
            model_name='student',
            name='level_credits',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.PositiveIntegerField(null=True), blank=True, null=True, size=None),
        ),
    ]
