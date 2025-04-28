from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.postgres.fields import ArrayField
# Create your models here.

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field but be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('username', email)

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('username', email)

        return self.create_user(email, password, **extra_fields)
    
class User(AbstractUser):
    USER_TYPE_CHOICES = [
    ('student', 'Student'),
    ('admin', 'Admin'),
    ('superadmin', 'Superadmin'),
    ]
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='student')
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = UserManager()

    def __str__(self):
        return self.email
    def get_user_type(self):
        return self.user_type

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    index = models.CharField(max_length=20, unique=True)

    STUDY_TRACK_CHOICES = [
        ('SIIS23', 'SIIS'),
        ('SEIS23', 'SEIS'),
        ('KI23', 'KI'),
        ('KN23', 'KN'),
        ('IMB23', 'IMB'),
        ('PIT23', 'PIT'),
    ]
    study_track = models.CharField(max_length=20, choices=STUDY_TRACK_CHOICES)

    current_year = models.PositiveIntegerField()
    study_effort = models.PositiveIntegerField(help_text="Hours per week")
    preferred_domains = ArrayField(models.CharField(max_length=64))
    preferred_technologies = ArrayField(models.CharField(max_length=64))
    preferred_evaluation = ArrayField(models.CharField(max_length=16))
    favorite_professors = ArrayField(models.CharField(max_length=16))

    
    passed_subjects = models.ManyToManyField('subjects.subject', related_name="passed_subjects")
    enrolled_subjects = models.ManyToManyField('subjects.subject', related_name="enrolled_subjects")

    

    def update_info(self, new_preferences):
        self.preferred_domains = new_preferences
        self.save()

    def get_recommendations(self):
        # Placeholder for recommendation logic
        pass

    def get_user_info(self):
        return self


    