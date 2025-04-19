import json
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.db import connection
from django.core import serializers
from .models import Subject_Info, Subject

# Create your views here.
def index(request):
    return HttpResponse("ok")


def test_api(request):
    # subject_info = Subject.objects.all()
    # subject_info_data = list(subject_info.values())  
    # json_data = json.dumps({"rows": subject_info_data})

    subjects = Subject_Info.objects.all()
    subjects_data = list(subjects.values())  
    json_data = json.dumps({"rows": subjects_data})
    
    return JsonResponse(json.loads(json_data), safe=False)
