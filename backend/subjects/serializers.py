from rest_framework import serializers
from .models import Subject, Subject_Info

class SubjectInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject_Info
        fields = [
            'level',
            'prerequisite',
            'activated',
            'participants',
            'mandatory',
            'mandatory_for',
            'semester',
            'season',
            'elective_for',
            'professors',
            'assistants',
            'tags',
            'technologies',
            'evaluation',
            'is_easy'
        ]
class SubjectSerializer(serializers.ModelSerializer):
    subject_info = SubjectInfoSerializer()
    class Meta:
        model = Subject
        fields = [
            'id', 'name', 'code', 'abstract', 'subject_info'
        ]