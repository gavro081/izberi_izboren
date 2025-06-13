import json
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Case, When
from auth_form.serializers import StudentFormSerializer
from subjects.utils import get_eligible_subjects, get_recommendations, map_to_subjects_vector, score_for_preferences, student_vector
from .serializers import SubjectSerializer
from .models import Subject_Info, Subject
from datetime import datetime

def index(request):
    return HttpResponse("ok")


# @api_view(['GET'])
# def subject_view(request, code):
#     subject = Subject.objects.get(code=code)
#     serializer = SubjectSerializer(subject)
#     return Response(serializer.data)

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
    try:
        subjects = get_eligible_subjects(student, season=season)
        mapped_subjects = map_to_subjects_vector(subjects)
        vector = student_vector(student)
    
        final_subjects = get_recommendations(score_for_preferences(vector, mapped_subjects))

        order = Case(*[When(name=subject_name, then=pos) for pos, subject_name in enumerate(final_subjects)])

        recommended_subject_objects = Subject.objects.filter(name__in=final_subjects).order_by(order)

        serializer = SubjectSerializer(recommended_subject_objects, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({"message": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class FavoriteSubjectsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            student = request.user.student
            # .values_list('id', flat=True) is very efficient
            favorite_ids = list(student.favorite_subjects.all().values_list('id', flat=True))
            return Response({'favorite_ids': favorite_ids}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ToggleFavoriteSubjectView(APIView):
    """
    Toggles the favorite status of a subject for the authenticated user.
    Expects a POST request with {'subject_id': <id>}.
    """
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        subject_id = request.data.get('subject_id')
        if not subject_id:
            return Response({"message": "Subject ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            student = request.user.student
            subject = Subject.objects.get(id=subject_id)

            if subject in student.favorite_subjects.all():
                student.favorite_subjects.remove(subject)
                action = 'removed'
            else:
                student.favorite_subjects.add(subject)
                action = 'added'
            
            return Response({
                'status': 'success',
                'action': action,
                'subject_id': subject.id
            }, status=status.HTTP_200_OK)

        except Subject.DoesNotExist:
            return Response({'error': 'Subject not found.'}, status=status.HTTP_404_NOT_FOUND)
        except AttributeError:
            # This error happens if request.user.student doesn't exist
            return Response({'error': 'Student profile not found for this user.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'An unexpected error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
