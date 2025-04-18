from django.db import models
from django.contrib.postgres.fields import ArrayField

class Subject_Info(models.Model):
    name = models.TextField(null=False)
    code = models.TextField(null=False)
    level = models.IntegerField(null=False)
    short = models.TextField(blank=True, null=True)
    prerequisite = models.TextField(blank=True, null=True)
    activated = models.BooleanField(null=False)
    e_2024_2025 = models.IntegerField(blank=True, null=True)
    e_2023_2024 = models.IntegerField(blank=True, null=True)
    e_2022_2023 = models.IntegerField(blank=True, null=True)
    mandatory = models.BooleanField(null=False)
    mandatoryfor = ArrayField(models.CharField(blank=True))
    semester = models.IntegerField(null=False)
    season = models.TextField(null=False)
    electivefor = ArrayField(models.CharField(blank=True))
    professors = ArrayField(models.CharField(blank=True))
    assistants = ArrayField(models.CharField(blank=True))

    def __str__(self):
        return f"{self.code} - {self.name}"

    class Meta:
        db_table = 'subject_data'