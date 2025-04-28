from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.
class User(AbstractUser):
    USER_TYPE_CHOICES = [
    ('student', 'Student'),
    ('admin', 'Admin'),
    ('superadmin', 'Superadmin'),
    ]
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='student')
    full_name = models.CharField(max_length=255)

    def get_user_type(self):
        return self.user_type

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    index = models.CharField(max_length=20, unique=True)

    STUDY_TRACK_CHOICES = [
        ('SIIS', 'SIIS'),
        ('SEIS', 'SEIS'),
        ('KI', 'KI'),
        ('KN', 'KN'),
        ('IMB', 'IMB'),
        ('PIT', 'PIT'),
        ('SSP', 'SSP')
    ]
    study_track = models.CharField(max_length=20, choices=STUDY_TRACK_CHOICES)

    current_year = models.PositiveIntegerField()
    study_effort = models.PositiveIntegerField(help_text="Hours per week")

    preferred_domains = models.JSONField(default=list)
    preferred_technologies = models.JSONField(default=list)
    preferred_evaluation = models.JSONField(default=list)
    favorite_professors = models.JSONField(default=list)

    # finish the subjects relation logic
    passed_subjects = models.ManyToManyField('subjects.subject', related_name="passed_subjects")

    def update_info(self, new_preferences):
        self.preferred_domains = new_preferences
        self.save()

    def get_recommendations(self):
        # Placeholder for recommendation logic
        pass

    def get_user_info(self):
        return self