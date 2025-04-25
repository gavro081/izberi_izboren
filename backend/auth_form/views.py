from django.shortcuts import render
from rest_framework import serializers, status, views
from rest_framework.views import APIView
from rest_framework.response import Response

# Create your views here.

class SomeView(APIView):
    def get(self, request):
        return Response({"message": "You are authenticated!"})
