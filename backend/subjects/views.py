import json
from django.http import HttpResponse
from django.core.cache import cache
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Case, When, F
from subjects.utils import get_eligible_subjects, get_recommendations_cache_key, get_recommended_subjects, map_to_subjects_vector, score_for_preferences, get_student_vector
from .serializers import SubjectSerializer, EvaluationReviewSerializer, OtherReviewSerializer
from .models import Subject, Review, EvaluationReview, OtherReview, ReviewVote

def index(request):
    return HttpResponse("ok")

@api_view(['GET'])
def all_subjects(request):
    subjects = Subject.objects.select_related('subject_info').filter(subject_info__isnull=False).order_by('id')
    serializer = SubjectSerializer(subjects, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_recommendations(request):
    season = request.query_params.get('season', 2)
    not_activated = request.query_params.get('not_activated', 0)
    try:
        not_activated = int(not_activated)
        season = int(season)
    except ValueError:
        return Response({"message": "invalid params"}, status=status.HTTP_400_BAD_REQUEST)
    
    student = request.user.student
    if not student:
        return Response({"message": "Could not find student"}, status=status.HTTP_400_BAD_REQUEST)
    cache_key = get_recommendations_cache_key(student, season, not_activated)
    if cache_key:
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response({"data": json.loads(cached_data)}, status=status.HTTP_200_OK)
    try:
        subjects = get_eligible_subjects(student, season=season, not_activated=not_activated)
        subject_vectors = map_to_subjects_vector(subjects)
        student_vector = get_student_vector(student)
    
        final_subjects = get_recommended_subjects(score_for_preferences(student_vector, subject_vectors))

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
            else:
                return Response({"message": "Invalid action type. Use 'favorite', 'liked', or 'disliked'."},
                                status=status.HTTP_400_BAD_REQUEST)
                
            return Response({
                'status': 'success',
                'action': action,
                'subject_id': subject.id
            }, status=status.HTTP_200_OK)

        except Subject.DoesNotExist:
            return Response({'error': 'Subject not found.'}, status=status.HTTP_404_NOT_FOUND)
        except AttributeError:
            return Response({'error': 'Student profile not found for this user.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'An unexpected error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SubjectReview(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        student = request.user.student
        subject_id = request.data.get('subject_id')
        review_type = request.data.get('type')

        if not subject_id or review_type not in ['evaluation', 'other']:
            return Response({'error': 'Missing or invalid data.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            subject_id = int(subject_id)
        except (TypeError, ValueError):
            return Response({'error': 'Invalid subject ID.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            subject = Subject.objects.get(pk=subject_id)
        except Subject.DoesNotExist:
            return Response({'error': 'Subject not found.'}, status=status.HTTP_404_NOT_FOUND)

        existing = Review.objects.filter(
            student=student,
            subject_id=subject_id,
            review_type=review_type
        ).exists()

        if existing:
            return Response(
                {"error": "You have already submitted this type of review for this subject."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if review_type == 'evaluation' and \
            EvaluationReview.objects.filter(review__subject_id=subject_id).exists():
            return Response(
                {"error": "An evaluation review for this subject already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        review = Review.objects.create(
            student=student,
            subject=subject,
            review_type=review_type
        )

        if review_type == "evaluation":
            serializer = EvaluationReviewSerializer(data=request.data, context={'review': review})
        else:
            serializer = OtherReviewSerializer(data=request.data, context={'review': review})

        if serializer.is_valid():
            serializer.save()
            return Response({
                    "message": f"{review_type.capitalize()} review created.",
                    "review_id": review.id,
                    },
                status=status.HTTP_201_CREATED)
        else:
            review.delete()
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReviewsForSubject(APIView):
    def get(self, request, code):
        subject = Subject.objects.filter(code=code)
        if not subject.exists():
            return Response({'error': 'Subject not found.'}, status=status.HTTP_404_NOT_FOUND)

        reviews = Review.objects.filter(subject__code=code)

        evaluation_review = EvaluationReview.objects.filter(review__in=reviews).first()
        other_reviews = OtherReview.objects.filter(review__in=reviews)

        context = {'request': request}
        evaluation_serializer = EvaluationReviewSerializer(evaluation_review, context=context)
        other_serializer = OtherReviewSerializer(other_reviews, many=True, context=context)

        return Response({
            "evaluation": evaluation_serializer.data,
            "other": other_serializer.data
        }, status=status.HTTP_200_OK)

class ToggleVote(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        review_id = request.data.get('review_id')
        vote_type = request.data.get('vote_type')
        if vote_type not in ['up', 'down']:
            return Response({"error": "Invalid vote type."}, status=status.HTTP_400_BAD_REQUEST)
        if not review_id:
            return Response({"error": "Review ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        student = request.user.student

        try:
            review = Review.objects.get(pk=review_id)
        except Review.DoesNotExist:
            return Response({"error": "Review not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            vote = ReviewVote.objects.get(review=review, student=student)
            if vote.vote_type == vote_type:
                vote.delete()
                return Response({"message": "Vote deleted.", "vote_score": review.votes_score}, status=status.HTTP_200_OK)
            vote.vote_type = vote_type
            vote.save()
            return Response({"message": "Vote updated.", "vote_score": review.votes_score}, status=status.HTTP_200_OK)
        except ReviewVote.DoesNotExist:
            ReviewVote.objects.create(review=review, student=student, vote_type=vote_type)
            return Response({"message": "Vote recorded.", "vote_score": review.votes_score}, status=status.HTTP_201_CREATED)

