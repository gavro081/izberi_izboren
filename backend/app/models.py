from django.db import models
from django.contrib.postgres.fields import ArrayField

# to access subject_info for a subject use subject.subject_info.<optional_field>
# to access subject from subject_info use subject_info.subject.<optional_field>

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
    short = models.TextField(blank=True, null=True)
    prerequisite = models.TextField(blank=True, null=True)
    activated = models.BooleanField(null=False)
    participants = ArrayField(models.IntegerField(blank=True))
    mandatory = models.BooleanField(null=False)
    mandatory_for = ArrayField(models.CharField(blank=True))
    semester = models.IntegerField(null=False)
    season = models.TextField(null=False)
    elective_for = ArrayField(models.CharField(blank=True))
    professors = ArrayField(models.CharField(blank=True))
    assistants = ArrayField(models.CharField(blank=True))

    def __str__(self):
        return f"Subject info for {self.subject.name}"

    class Meta:
        db_table = 'subject_info'