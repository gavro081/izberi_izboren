import json
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.db import connection
from .models import Subject_Info, Subject

# Create your views here.
def index(request):
    return HttpResponse("ok")


def all_subjects(request):
    all_subjects = Subject.objects.select_related('subject_info').filter(subject_info__isnull=False).order_by('id')

    result = []
    for subject in all_subjects:
        subject_info = subject.subject_info

        subject_data = {
            "id": subject.id,
            "name": subject.name,
            "code": subject.code,
            "abstract": subject.abstract,
            "info": {
                "level": subject_info.level,
                "short": subject_info.short,
                "prerequisite": subject_info.prerequisite,
                "activated": subject_info.activated,
                "participants": subject_info.participants,
                "mandatory": subject_info.mandatory,
                "mandatory_for": subject_info.mandatory_for,
                "semester": subject_info.semester,
                "season": subject_info.season,
                "elective_for": subject_info.elective_for,
                "professors": subject_info.professors,
                "assistants": subject_info.assistants,
            }
        }
        result.append(subject_data)
    
    return JsonResponse({"subjects": result}, safe=False)
