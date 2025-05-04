from rest_framework.permissions import BasePermission

class IsStudent(BasePermission):
    def has_perimssion(self, request, view):
        return hasattr(request.user, 'student')
    
class CanSubmitForm(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'student') and not request.user.student.has_filled_form

class CanUpdateForm(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'student') and request.user.student.has_filled_form