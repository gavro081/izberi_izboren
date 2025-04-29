from .serializers import RegistrationSerializer, LoginSerializer
from rest_framework import serializers, status, views
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

# Create your views here.

class RegisterView(APIView):
    def post(self, request, *args, **kwargs):
        # Step 1: Initialize the serializer with the request data
        serializer = RegistrationSerializer(data = request.data)

        # Step 2: Validate the serialized data
        if serializer.is_valid():
            # Step 3: Save the user
            user = serializer.save()

            # Step 4: Return a success response
            return Response({
                'message': 'User registered successfully',
                'user': serializer.data
            }, status=status.HTTP_201_CREATED)

        # If the serializer is not valid, return an error response
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
            'role': user.role,
        }, status=status.HTTP_200_OK)


