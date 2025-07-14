from auth_form.models import Student
from auth_form.serializers import RegistrationSerializer, LoginSerializer, StudentFormSerializer, UserSerializer
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from auth_form.permissions import IsStudent, CanSubmitForm, CanUpdateForm
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter


class RegisterView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = RegistrationSerializer(data = request.data)

        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'User registered successfully',
                'user': serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data = request.data)
        # Another way of doing error checking istead of .is_valid()
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user_id': user.id,
            'user_type': user.user_type,
        }, status=status.HTTP_200_OK)

class LogoutView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()

            # 205 Reset Content is a good choice for a successful logout
            # as it tells the client to reset its view.
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
class StudentFormView(APIView):
    def get_permissions(self):
        if self.request.method=='POST':
            return [IsAuthenticated(), CanSubmitForm(), IsStudent()]
        elif self.request.method == 'PATCH':
            return [IsAuthenticated(), IsStudent(), CanUpdateForm()]
        return [IsAuthenticated(), IsStudent()]
    
    def get(self, request):
        student = request.user.student
        serializer = StudentFormSerializer(student)
        return Response(serializer.data)
    
    def post(self, request):
        if hasattr(request.user, 'student') and request.user.student.has_filled_form:
            return Response({"detail": "Student profile already exists."}, status=status.HTTP_400_BAD_REQUEST)
        
        index_match = Student.objects.filter(index=request.data['index'])
        
        if index_match.exists():
           return Response({'message': "Постои студент со тој индекс."}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = StudentFormSerializer(instance=request.user.student, data=request.data)

        if serializer.is_valid():
            serializer.save()
            request.user.student.has_filled_form = True
            request.user.student.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request):
        if not hasattr(request.user, 'student'):
            return Response({"detail": "No student profile found."}, status=status.HTTP_404_NOT_FOUND)
        
        index = request.data['index']
        index_match = Student.objects.filter(index=index).exclude(pk=request.user.student.pk)
        if index_match.exists():
            return Response({'message': "Постои студент со тој индекс."}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = StudentFormSerializer(instance=request.user.student, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class UserDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class CustomGoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter

    def get_response(self):
        refresh = RefreshToken.for_user(self.user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'full_name': self.user.full_name,
            'user_type': self.user.user_type,
        }, status=status.HTTP_200_OK)



