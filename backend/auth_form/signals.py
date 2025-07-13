from django.core.cache import cache
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Student
from subjects.utils import get_recommendations_cache_key

@receiver(post_save, sender=User)
def create_student_profile(sender, instance, created, **kwargs):
    if created and instance.user_type == 'student': 
        Student.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_student_profile(sender, instance, **kwargs):
    if instance.user_type == 'student':
        instance.student.save()

@receiver(post_save, sender=Student)
def invalidate_recommendations_cache(sender, instance, **kwargs):
    for season in [0,1,2]:
        for not_activated in [0, 1]:
            cache_key = get_recommendations_cache_key(instance, season, not_activated)
            if cache_key:
                cache.delete(cache_key)
