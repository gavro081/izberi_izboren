from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Student

admin.site.register(User, UserAdmin)
admin.site.register(Student)
