from rest_framework import serializers
from .models import (Subject, Subject_Info, EvaluationMethod, EvaluationComponent,
                     EvaluationReview, OtherReview, Review, ReviewVote)

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

class ReviewMetaSerializer(serializers.ModelSerializer):
    student = serializers.SerializerMethodField()
    subject = serializers.SerializerMethodField()
    user_has_voted = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'student', 'subject', 'is_confirmed', 'votes_score', 'user_has_voted', 'date_posted']


    def get_user_has_voted(self, obj):
        request = self.context.get("request")
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            if hasattr(request.user, 'student'):
                student = request.user.student
                try:
                    vote = ReviewVote.objects.get(review=obj, student=student)
                    return vote.vote_type
                except ReviewVote.DoesNotExist:
                    return 'none'
        return 'none'


    def get_student(self, obj):
        return obj.student.index

    def get_subject(self, obj):
        return {"name": obj.subject.name, "code": obj.subject.code}

class EvaluationComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationComponent
        fields = ['category', 'percentage']


class EvaluationMethodSerializer(serializers.ModelSerializer):
    components = EvaluationComponentSerializer(many=True)

    class Meta:
        model = EvaluationMethod
        fields = ['note', 'components']

    def validate(self, data):
        total = sum(comp['percentage'] for comp in data['components'])
        if total != 100:
            raise serializers.ValidationError("Sum of component percentages must equal 100.")
        return data

    def create(self, validated_data):
        components_data = validated_data.pop('components')
        method = EvaluationMethod.objects.create(**validated_data)

        for comp_data in components_data:
            EvaluationComponent.objects.create(evaluation_method=method, **comp_data)

        return method


class EvaluationReviewSerializer(serializers.ModelSerializer):
    methods = EvaluationMethodSerializer(many=True)
    review = serializers.SerializerMethodField()

    class Meta:
        model = EvaluationReview
        fields = ['review', 'methods', 'signature_condition']

    def validate(self, data):
        methods = data.get('methods', [])
        if len(methods) > 3:
            raise serializers.ValidationError("A subject can't have more than 3 evaluation methods.")
        return data

    def get_review(self, obj):
        if obj:
            return ReviewMetaSerializer(obj.review, context=self.context).data
        return None

    def create(self, validated_data):
        methods_data = validated_data.pop('methods')
        review = self.context['review']
        evaluation_review = EvaluationReview.objects.create(review=review, **validated_data)
        for method_data in methods_data:
            validated_method_data = self.fields['methods'].child.run_validation(method_data)
            validated_method_data['evaluation_review'] = evaluation_review
            self.fields['methods'].child.create(validated_method_data)

        return evaluation_review

class OtherReviewSerializer(serializers.ModelSerializer):
    review = serializers.SerializerMethodField()

    class Meta:
        model = OtherReview
        fields = ['review', 'category', 'content']

    def validate(self, data):
        content: str = data['content']
        if len(content) > 700:
            raise serializers.ValidationError("Content length can be bigger than 700 characters.")
        return data

    def get_review(self, obj):
        return ReviewMetaSerializer(obj.review, context=self.context).data

    def create(self, validated_data):
        review = self.context['review']
        return OtherReview.objects.create(review=review, **validated_data)