import json
from django.http import HttpResponse
from django.core.cache import cache
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Case, When
from subjects.utils import get_eligible_subjects, get_recommendations, get_recommendations_cache_key, map_to_subjects_vector, score_for_preferences, get_student_vector
from .serializers import SubjectSerializer
from .models import Subject

def index(request):
    return HttpResponse("ok")

@api_view(['GET'])
def all_subjects(request):
    subjects = Subject.objects.select_related('subject_info').filter(subject_info__isnull=False).order_by('id')
    serializer = SubjectSerializer(subjects, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_suggestions(request):
    season = request.query_params.get('season')
    if not season: season = 2 # 2 -> any season
    try:
        season = int(season)
    except ValueError:
        return Response({"message": "Invalid season"}, status=status.HTTP_400_BAD_REQUEST)
    
    student = request.user.student
    if not student:
        return Response({"message": "Could not find student"}, status=status.HTTP_400_BAD_REQUEST)
    cache_key = get_recommendations_cache_key(student, season)
    if cache_key:
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response({"data": json.loads(cached_data)}, status=status.HTTP_200_OK)
    try:
        subjects = get_eligible_subjects(student, season=season)
        subject_vectors = map_to_subjects_vector(subjects)
        student_vector = get_student_vector(student)
    
        final_subjects = get_recommendations(score_for_preferences(student_vector, subject_vectors))

        order = Case(*[When(name=subject_name, then=pos) for pos, subject_name in enumerate(final_subjects)])

        recommended_subject_objects = Subject.objects.filter(name__in=final_subjects).order_by(order)

        serializer = SubjectSerializer(recommended_subject_objects, many=True)
        if cache_key:
            cache.set(cache_key, json.dumps(serializer.data), timeout=60 * 60 * 24 * 14) # 14 days  
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({"message": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class PreferencesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            student = request.user.student
            favorite_ids = list(student.favorite_subjects.all().values_list('id', flat=True))
            liked_ids = list(student.liked_subjects.all().values_list('id', flat=True))
            disliked_ids = list(student.disliked_subjects.all().values_list('id', flat=True))
            return Response({'favorite_ids': favorite_ids, 'liked_ids': liked_ids, 'disliked_ids': disliked_ids}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ToggleSubjectPreferences(APIView):
    """
    Toggles the favorite status of a subject for the authenticated user.
    Expects a POST request with {'subject_id': <id>}.
    """
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        subject_id = request.data.get('subject_id')
        action_type = request.data.get('action_type') 
        if not subject_id:
            return Response({"message": "Subject ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            student = request.user.student
            subject = Subject.objects.get(id=subject_id)

            if action_type not in ['favorite', 'liked', 'disliked']:
                return Response({"message": "Invalid action type. Use 'favorite', 'liked', or 'disliked'."}, status=status.HTTP_400_BAD_REQUEST)
            
            if action_type == 'favorite':
                if subject in student.favorite_subjects.all():
                    student.favorite_subjects.remove(subject)
                    action = 'removed'
                else:
                    student.favorite_subjects.add(subject)
                    action = 'added'
            elif action_type == 'liked':
                if subject in student.liked_subjects.all():
                    student.liked_subjects.remove(subject)
                    action = 'removed'
                else:
                    student.liked_subjects.add(subject)
                    action = 'added'
            elif action_type == 'disliked':
                if subject in student.disliked_subjects.all():
                    student.disliked_subjects.remove(subject)
                    action = 'removed'
                else:
                    student.disliked_subjects.add(subject)
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
