from django.urls import path
from .views import ToggleSubjectPreferences, PreferencesView, all_subjects, get_recommendations, SubjectReview, ReviewsForSubject
urlpatterns = [
    path('all/', all_subjects, name='all_subjects'),
    path('recommendations/', get_recommendations, name='get_recommendations'),
    path('preferences/', PreferencesView.as_view(), name='student-preferences'),
    path('toggle-subject-pref/', ToggleSubjectPreferences.as_view(), name='student-toggle-preferences'),
    path('subject-review', SubjectReview.as_view(), name='subject-review'),
    path('subject-review/<str:code>', ReviewsForSubject.as_view(), name='subject-review')
]
