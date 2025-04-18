import json
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.db import connection
from django.core import serializers
from .models import Subject

# Create your views here.
def index(request):
    return HttpResponse("ok")


def test_api(request):
    subjects = Subject.objects.all()
    subjects_data = list(subjects.values())  
    json_data = json.dumps({"rows": subjects_data})
    
    return JsonResponse(json.loads(json_data), safe=False)
