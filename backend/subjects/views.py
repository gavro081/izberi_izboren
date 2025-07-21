import json
from django.http import HttpResponse
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Case, When, Count, F, Q
from subjects.utils import get_eligible_subjects, get_recommendations_cache_key, get_recommendations_with_details, map_to_subjects_vector, score_for_preferences, get_student_vector
from .serializers import SubjectSerializer, EvaluationReviewSerializer, OtherReviewSerializer
from .models import Subject, Review, EvaluationReview, OtherReview, ReviewVote
from rest_framework.pagination import LimitOffsetPagination
from auth_form.permissions import IsStudent, IsAdmin
import logging

def index(request):
    return HttpResponse("ok")

@api_view(['GET'])
def all_subjects(request):
    subjects = Subject.objects.select_related('subject_info').filter(subject_info__isnull=False).order_by('id')
    serializer = SubjectSerializer(subjects, many=True)
    return Response(serializer.data)

class RecommendationsView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]
    def get(self, request):
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
                return Response(json.loads(cached_data), status=status.HTTP_200_OK)
        try:
            eligible_subjects = get_eligible_subjects(student, season=season, not_activated=not_activated)
            if not eligible_subjects:
                return Response({"data": []}, status=status.HTTP_200_OK)
            
            eligible_subjects_dict = map_to_subjects_vector(eligible_subjects)
            student_vector = get_student_vector(student)

            subjects_scores = score_for_preferences(student_vector, eligible_subjects_dict)
            
            recommendations_with_details = get_recommendations_with_details(
                subjects_scores
            )

            if not recommendations_with_details:
                return Response({"data": []}, status=status.HTTP_200_OK)
            final_subject_names = [rec['subject_name'] for rec in recommendations_with_details]
            details_map = {rec['subject_name']: rec for rec in recommendations_with_details}

            order = Case(*[When(name=name, then=pos) for pos, name in enumerate(final_subject_names)])
            recommended_subject_objects = Subject.objects.filter(name__in=final_subject_names).order_by(order)

            serializer = SubjectSerializer(recommended_subject_objects, many=True)
            
            final_response_data = []
            for subject_data in serializer.data:
                details = details_map.get(subject_data['name'])
                if details:
                    subject_data['recommendation_details'] = {
                        'match_percentage': details['match_percentage'],
                        # 'primary_reason': details['primary_reason'],
                        'explanations': details['explanations'],
                        # 'matching_tags': details['matching_tags'],
                        # 'detailed_scores': details['detailed_scores']
                    }
                final_response_data.append(subject_data)

            response_payload = {"data": final_response_data}
            if cache_key:
                cache.set(cache_key, json.dumps(response_payload), timeout=60 * 60 * 24 * 14)
            return Response(response_payload, status=status.HTTP_200_OK)

        except Exception as e:
            logging.error(f"Recommendation error for student {student.id}: {e}", exc_info=True)
            return Response({"message": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PreferencesView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

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
    permission_classes = [IsAuthenticated, IsStudent]
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
    permission_classes = [IsAuthenticated, IsStudent]
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

        # if review_type == 'evaluation' and \
        #     EvaluationReview.objects.filter(review__subject_id=subject_id).exists():
        #     return Response(
        #         {"error": "An evaluation review for this subject already exists."},
        #         status=status.HTTP_400_BAD_REQUEST
        #     )

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

class AdminSubjectReview(APIView):
    def get_permissions(self):
        if self.request.method=='DELETE':
            return [IsAuthenticated()]
        elif self.request.method == 'PATCH':
            return [IsAuthenticated(), IsAdmin()]
        return []
    def delete(self, request, pk):
        review = get_object_or_404(Review, pk=pk)
        review.delete()
        return Response({"message": "Review deleted"}, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        review = get_object_or_404(Review, pk=pk)
        is_confirmed = request.data.get('is_confirmed')
        if is_confirmed is None:
            return Response({"message": "Missing is_confirmed param."}, status=status.HTTP_400_BAD_REQUEST)
        review.is_confirmed = is_confirmed
        review.save()
        return Response({"message": "Review confirmed"}, status=status.HTTP_200_OK)
    
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

class ReviewListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        review_query_set = Review.objects.all()

        review_type = request.query_params.get('type')
        if review_type:
            if review_type not in ["evaluation", "other"]:
                return Response({"message": "Invalid type."}, status=status.HTTP_400_BAD_REQUEST)
            review_query_set = review_query_set.filter(review_type=review_type)

        is_confirmed = request.query_params.get('is_confirmed')
        if is_confirmed:
            if is_confirmed not in ["true", "false"]:
                    return Response({"message": "Invalid is_confirmed param."}, status=status.HTTP_400_BAD_REQUEST)
            is_confirmed = True if is_confirmed == "true" else False
            review_query_set = review_query_set.filter(is_confirmed=is_confirmed)

        subject_code = request.query_params.get("subject_code")
        if subject_code:
            review_query_set = review_query_set.filter(subject__code=subject_code)

        my_reviews = request.query_params.get('my_reviews')
        if my_reviews and my_reviews.lower() == 'true':
            if hasattr(request.user, 'student'):
                review_query_set = review_query_set.filter(student=request.user.student)
            else:
                review_query_set = review_query_set.none()

        sort_by = request.query_params.get('sort_by', 'date')  
        sort_order = request.query_params.get('sort_order', 'desc')
        
        if sort_by not in ['date', 'votes']:
            return Response({"message": "Invalid sort_by param."}, status=status.HTTP_400_BAD_REQUEST)
        
        if sort_order not in ['asc', 'desc']:
            return Response({"message": "Invalid sort_order param."}, status=status.HTTP_400_BAD_REQUEST)

        if sort_by == 'votes':
            review_query_set = review_query_set.annotate(
                vote_score=Count('votes', filter=Q(reviewvote__vote_type='up')) -
                           Count('votes', filter=Q(reviewvote__vote_type='down'))
            )

            if sort_order == 'desc':
                review_query_set = review_query_set.order_by('-vote_score', '-id')
            else:
                review_query_set = review_query_set.order_by('vote_score', 'id')
        else:  
            if sort_order == 'desc':
                review_query_set = review_query_set.order_by('-id')
            else:
                review_query_set = review_query_set.order_by('id')

        review_query_set = review_query_set.select_related("evaluation_review", "other_review")

        paginator = LimitOffsetPagination()
        paginated_query_set = paginator.paginate_queryset(review_query_set, request)

        data = []
        for review in paginated_query_set:
            if review.review_type == 'evaluation' and hasattr(review, "evaluation_review"):
                    serializer = EvaluationReviewSerializer(review.evaluation_review, context={'request': request})
                    data.append(serializer.data)
            elif review.review_type == 'other' and hasattr(review, "other_review"):
                serializer = OtherReviewSerializer(review.other_review, context={'request': request})
                data.append(serializer.data)

        return paginator.get_paginated_response(data)