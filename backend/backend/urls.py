from django.contrib import admin
from django.urls import path, include
from subjects.views import index, all_subjects, get_recommendations, ToggleSubjectPreferences, PreferencesView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('subjects/', all_subjects),
    path('recommendations/', get_recommendations),
    path('student/preferences/', PreferencesView.as_view(), name='student-preferences'),
    path('student/toggle-subject-pref/', ToggleSubjectPreferences.as_view(), name='student-toggle-favorite'),
    path('auth/', include('auth_form.urls')),
    path('', index),
]
