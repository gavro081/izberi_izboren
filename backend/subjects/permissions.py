from rest_framework.permissions import BasePermission

class IsUserType(BasePermission):
    allowed_user_types = []

    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and user.user_type in self.allowed_user_types

class IsAdminUserType(IsUserType):
    allowed_user_types = ['admin']

class IsStudentUserType(IsUserType):
    allowed_user_types = ['student']