from rest_framework import serializers
from .models import Subject, Subject_Info, EvaluationMethod, EvaluationComponent, EvaluationReview, OtherReview

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

class EvaluationComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationComponent
        fields = ['category', 'percentage']

    # def validate(self, data):
    #     try:
    #         category = data['category']
    #         percentage = data['percentage']
    #         try:
    #             percentage = int(percentage)
    #         except ValueError:
    #             raise ValidationError("percentage should be an integer.")
    #     except:
    #         raise ValidationError("invalid data for evaluation component.")
    #
    #     return data



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

    class Meta:
        model = EvaluationReview
        fields = ['methods']

    def validate(self, data):
        methods = data.get('methods', [])
        if len(methods) > 3:
            raise serializers.ValidationError("A subject can't have more than 3 evaluation methods.")
        return data

    def create(self, validated_data):
        methods_data = validated_data.pop('methods')
        review = self.context['review']
        evaluation_review = EvaluationReview.objects.create(review=review)
        for method_data in methods_data:
            method_data['evaluation_review'] = evaluation_review
            self.fields['methods'].create(method_data)
        return evaluation_review

class OtherReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = OtherReview
        fields = ['category', 'content']

    def create(self, validated_data):
        review = self.context['review']
        return OtherReview.objects.create(review=review, **validated_data)