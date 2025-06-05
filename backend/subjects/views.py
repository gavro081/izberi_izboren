import json
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from auth_form.serializers import StudentFormSerializer
from subjects.utils import get_eligible_subjects, get_recommendations, map_to_subjects_vector, score_for_preferences, student_vector
from .serializers import SubjectSerializer
from .models import Subject_Info, Subject

def index(request):
    return HttpResponse("ok")


@api_view(['GET'])
def subject_view(reuest, pk):
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
    student = request.user.student
    if not student:
        return Response({"message": "Could not find student"}, status=status.HTTP_400_BAD_REQUEST)

    subjects = get_eligible_subjects(student)
    mapped_subjects = map_to_subjects_vector(subjects)
    vector = student_vector(student)
    
    final_subjects = get_recommendations(score_for_preferences(vector, mapped_subjects))

    # subject_dict = {subject.name: subject for subject in Subject.objects.filter(name__in=final_subjects)}
    # sorted_subjects = [subject_dict[name] for name in final_subjects if name in subject_dict]  

    # serializer = SubjectSerializer(sorted_subjects, many=True)
    return Response({"data": final_subjects}, status=status.HTTP_200_OK)

