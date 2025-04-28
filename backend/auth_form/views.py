from .serializers import RegistrationSerializer
from rest_framework import serializers, status, views
from rest_framework.views import APIView
from rest_framework.response import Response

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