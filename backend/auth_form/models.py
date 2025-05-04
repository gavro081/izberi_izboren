from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.postgres.fields import ArrayField
# Create your models here.

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, full_name=None, **extra_fields):
        if not email:
            raise ValueError('The Email field but be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('username', email)

        user = self.model(email=email, full_name=full_name, **extra_fields)
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
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student')
    index = models.CharField(max_length=20, unique=True, null=True, blank=True)

    STUDY_TRACK_CHOICES = [
        ('SIIS23', 'SIIS'),
        ('SEIS23', 'SEIS'),
        ('KI23', 'KI'),
        ('KN23', 'KN'),
        ('IMB23', 'IMB'),
        ('PIT23', 'PIT'),
    ]
    study_track = models.CharField(max_length=20, choices=STUDY_TRACK_CHOICES, null=True, blank=True)
    has_filled_form = models.BooleanField(default=False)
    
    current_year = models.PositiveIntegerField(null=True)
    study_effort = models.PositiveIntegerField(help_text="Hours per week", null=True)
    preferred_domains = ArrayField(models.CharField(max_length=64), null=True, blank=True)
    preferred_technologies = ArrayField(models.CharField(max_length=64), null=True, blank=True)
    preferred_evaluation = ArrayField(models.CharField(max_length=16), null=True, blank=True)
    # update max_length to 64
    favorite_professors = ArrayField(models.CharField(max_length=16), null=True, blank=True)

    passed_subjects = models.ManyToManyField('subjects.subject', related_name="passed_subjects", blank=True)

    

    def update_info(self, new_preferences):
        self.preferred_domains = new_preferences
        self.save()

    def get_recommendations(self):
        # Placeholder for recommendation logic
        pass

    def get_user_info(self):
        return self
    
    def get_subjects_info(self):
        return [
            {
                'subject_name': subject.name,
                'subject_info': subject.subject_info._dict__,
            }
            for subject in self.passed_subjects.all()
        ]


    