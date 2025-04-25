from django.urls import path
from .views import SomeView
urlpatterns = [
    path('register/', SomeView.as_view(), name='register'),
    # path('login/', LoginView.as_view(), name='login')
]