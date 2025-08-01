from django.urls import path
from .views import (ToggleSubjectPreferences, PreferencesView, all_subjects,
                    RecommendationsView, SubjectReview, ReviewsForSubject, ToggleVote, ReviewListView,
                    AdminSubjectReview)
urlpatterns = [
    path('all/', all_subjects, name='all_subjects'),
    path('recommendations/', RecommendationsView.as_view(), name='get_recommendations'),
    path('preferences/', PreferencesView.as_view(), name='student-preferences'),
    path('toggle-subject-pref/', ToggleSubjectPreferences.as_view(), name='student-toggle-preferences'),
    path('subject-review/', SubjectReview.as_view(), name='subject-review'),
    path('admin-subject-review/<int:pk>/', AdminSubjectReview.as_view(), name='subject-review'),
    path('subjects-reviews-list/', ReviewListView.as_view(), name='review-list'),
    path('subject-review/toggle-vote/', ToggleVote.as_view(), name='toggle-vote'),
    path('subject-review/<str:code>/', ReviewsForSubject.as_view(), name='subject-review'),

]
