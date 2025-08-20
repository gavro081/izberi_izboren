import re
from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Student
from subjects.models import Subject

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    student_index = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ('user_type', 'full_name', 'student_index')

    def get_student_index(self, obj):
        if obj.user_type == 'student':
            return obj.student.index

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user_type'] = self.user.user_type
        if hasattr(self.user, 'full_name'):
            data['full_name'] = self.user.full_name
        if hasattr(self.user, 'student'):
            data['student_index'] = self.user.student.index
        return data

class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['email', 'full_name', 'password', 'confirm_password', 'user_type']
    
    def validate(self, data):
        errors = {}
        if not re.match(r"^[^@]+@(students\.)?finki\.ukim\.mk$", data['email']):
            errors['email'] = ["Email must be a valid FINKI email address"]
        if data['password'] != data['confirm_password']:
            errors['confirm_password'] = ["Passwords do not match"]
        if errors:
            raise serializers.ValidationError(errors)
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        if "students" in validated_data['email']:
            user = User.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                full_name = validated_data['full_name'],
                user_type='student',
            )
        else:
            user = User.objects.create_superuser(
                email=validated_data['email'],
                password=validated_data['password'],
                full_name=validated_data['full_name'],
                user_type='admin',
            )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        # AuthenticationFailed error
        if email and password:
            user = authenticate(username=email, password=password)
            if user is None:
                raise AuthenticationFailed('Invalid email or password')
            if not user.is_active:
                raise AuthenticationFailed('User account is disabled')
            
            data['user'] = user
            return data
        else:
            raise serializers.ValidationError('Must include "email" and "password"')
        
class GoogleLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate(self, data):
        try:
            email = data.get('email')
            User = get_user_model()
            user = User.objects.get(email=email)
            if user is None:
                raise AuthenticationFailed('Invalid email or password')
            if not user.is_active:
                raise AuthenticationFailed('User account is disabled')
            data['user'] = user
            return data
        except:
            raise serializers.ValidationError('Must include email.')
        

class StudentFormSerializer(serializers.ModelSerializer):
    passed_subjects = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all(), many=True)

    class Meta:
        model = Student
        exclude = ['user', 'id']
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['passed_subjects'] = [subject.id for subject in instance.passed_subjects.all()]
        rep['passed_subjects_per_semester'] = {
            str(sem): [ subj_id for subj_id in subjects]
            for sem, subjects in (instance.passed_subjects_per_semester or {}).items()
        }
        return rep