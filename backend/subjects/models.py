from django.db import models
from django.contrib.postgres.fields import ArrayField

class Subject(models.Model):
    name = models.TextField(null=False)
    code = models.TextField(null=False)
    abstract = models.TextField()

    def __str__(self):
        return f"{self.code} - {self.name}"
    
    class Meta:
        db_table = "subject"

class Subject_Info(models.Model):
    subject = models.OneToOneField(
        Subject,
        on_delete=models.CASCADE,
        primary_key=True
    )

    level = models.IntegerField(null=False)
    prerequisite = models.JSONField(blank=True, null=True)
    activated = models.BooleanField(null=False)
    participants = ArrayField(models.IntegerField(blank=True))
    mandatory = models.BooleanField(null=False)
    mandatory_for = ArrayField(models.CharField(max_length=16, blank=True))
    semester = models.IntegerField(null=False)
    season = models.TextField(null=False)
    elective_for = ArrayField(models.CharField(max_length=16, blank=True))
    professors = ArrayField(models.CharField(max_length=64, blank=True))
    assistants = ArrayField(models.CharField(max_length=64, blank=True))
    tags = ArrayField(models.CharField(max_length=64, blank=True))
    technologies = ArrayField(models.CharField(max_length=64, blank=True))
    evaluation = ArrayField(models.CharField(max_length=64, blank=True))
    is_easy = models.BooleanField(null=False)

    def __str__(self):
        return f"Subject info for {self.subject.name}"

    class Meta:
        db_table = 'subject_info'