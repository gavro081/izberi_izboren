import json
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import SubjectSerializer
from .models import Subject_Info, Subject

# Create your views here.
def index(request):
    return HttpResponse("ok")

@api_view(['GET'])
def all_subjects(request):
    subjects = Subject.objects.select_related('subject_info').filter(subject_info__isnull=False).order_by('id')
    serializer = SubjectSerializer(subjects, many=True)
    return Response(serializer.data)
