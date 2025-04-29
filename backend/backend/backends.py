from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

class EmailBackend(ModelBackend):
    """
    Custom authentication backend to authenticate using email instead of username.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # Try to get the user based on the provided email (username is set to email)
            user = get_user_model().objects.get(email=username)
            if user.check_password(password):  # Check if the password is correct
                return user  # If valid, return the user
        except get_user_model().DoesNotExist:
            return None  # Return None if user doesn't exist
