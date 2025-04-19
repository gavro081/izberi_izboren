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
    all_subjects = Subject.objects.all()
    all_subjects_info = Subject_Info.objects.all()

    all_subjects_list = list(all_subjects.values())  
    all_subjects_info_list = list(all_subjects_info.values())  

    for subject, subject_info in zip(all_subjects_list, all_subjects_info_list):
        subject["info"] = subject_info

    json_data = json.dumps({"rows": all_subjects_list[:177]})
    
    return JsonResponse(json.loads(json_data), safe=False)
