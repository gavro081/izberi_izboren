import json
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from auth_form.serializers import StudentFormSerializer
from auth_form.utils import get_eligible_subjects
from .serializers import SubjectSerializer
from .models import Subject_Info, Subject

def index(request):
    return HttpResponse("ok")

@api_view(['GET'])
def all_subjects(request):
    subjects = Subject.objects.select_related('subject_info').filter(subject_info__isnull=False).order_by('id')
    serializer = SubjectSerializer(subjects, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_suggestions(request):
    student = request.user.student
    if not student:
        return Response({"message": "Could not find student"}, status=status.HTTP_400_BAD_REQUEST)

    subjects = get_eligible_subjects(student)
    serializer = SubjectSerializer(subjects, many=True)
    return Response({"data": serializer.data}, status=status.HTTP_200_OK)
