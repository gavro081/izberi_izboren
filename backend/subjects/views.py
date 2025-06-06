import json
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Case, When
from auth_form.serializers import StudentFormSerializer
from subjects.utils import get_eligible_subjects, get_recommendations, map_to_subjects_vector, score_for_preferences, student_vector
from .serializers import SubjectSerializer
from .models import Subject_Info, Subject
from datetime import datetime

def index(request):
    return HttpResponse("ok")


@api_view(['GET'])
def subject_view(request, pk):
    subject = Subject.objects.get(pk=pk)
    serializer = SubjectSerializer(subject)
    return Response(serializer.data)

@api_view(['GET'])
def all_subjects(request):
    subjects = Subject.objects.select_related('subject_info').filter(subject_info__isnull=False).order_by('id')
    serializer = SubjectSerializer(subjects, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_suggestions(request):
    season = request.query_params.get('season')
    if not season: season = 2
    try:
        season = int(season)
    except ValueError:
        return Response({"message": "Invalid season"}, status=status.HTTP_400_BAD_REQUEST)
    
    student = request.user.student
    if not student:
        return Response({"message": "Could not find student"}, status=status.HTTP_400_BAD_REQUEST)

    subjects = get_eligible_subjects(student, season=season)
    mapped_subjects = map_to_subjects_vector(subjects)
    vector = student_vector(student)
    
    final_subjects = get_recommendations(score_for_preferences(vector, mapped_subjects))

    order = Case(*[When(name=subject_name, then=pos) for pos, subject_name in enumerate(final_subjects)])

    recommended_subject_objects = Subject.objects.filter(name__in=final_subjects).order_by(order)

    serializer = SubjectSerializer(recommended_subject_objects, many=True)
    return Response({"data": serializer.data}, status=status.HTTP_200_OK)

