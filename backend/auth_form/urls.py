from django.urls import path
from .views import RegisterView, LoginView, StudentFormView, UserDetailView, LogoutView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(serializer_class=CustomTokenObtainPairSerializer), name='token_obtain_pair'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('form/', StudentFormView.as_view(), name="student_form"),
    path('user/', UserDetailView.as_view(), name='user_detail'),
]
