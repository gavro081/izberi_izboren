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
    pass
