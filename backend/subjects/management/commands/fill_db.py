import json
from django.core.management.base import BaseCommand
from subjects.serializers import EvaluationReviewSerializer, OtherReviewSerializer
from subjects.models import Review, Subject, Subject_Info
from pathlib import Path
from auth_form.models import User, Student

class Command(BaseCommand):
    help = "Fill db with subjects and subject info from JSON"

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Delete existing Subjects and Subject_Info before filling.'
        )

    def create_subject(self, subject_details):
        subjects = []
        for item in subject_details.values():
            # only get the 23 accreditation code
            code = item["code"] if "," not in item["code"] else item["code"].split(",")[1].strip()
            subject = Subject(
                name=item["subject"],
                code=code,
                abstract=item.get("abstract")
            )
            subjects.append(subject)

        created_subjects = Subject.objects.bulk_create(subjects)
        return created_subjects

    def create_subject_info(self, created_subjects, subject_details):
        name_to_id = {subj.name.lower(): subj.id for subj in created_subjects}
        subject_infos = []
        for db_subject, item in zip(created_subjects, subject_details.values()):
            prereq = item.get("prerequisite", {})
            if "subjects" in prereq:
                subjects_list = prereq["subjects"]
                subjects_id_list = []
                for subject_name in subjects_list:
                    subject_id = name_to_id.get(subject_name.lower())
                    if subject_id is not None:
                        subjects_id_list.append(subject_id)
                    else:
                        self.stdout.write(self.style.WARNING(f"Warning: Subject {subject_name} not found in DB"))
            
                prereq = {"subjects": subjects_id_list}
                                        
            info = Subject_Info(
                subject=db_subject,
                level=item["level"],
                prerequisite=prereq,
                activated=item["activated"],
                participants=item.get("participants", [0, 0, 0]),
                mandatory=item["mandatory"],
                mandatory_for=item.get("mandatoryFor", []),
                semester=item["semester"],
                season=item["season"],
                elective_for=item.get("electiveFor", []),
                professors=item.get("professors", []),
                assistants=item.get("assistants", []),
                tags=item.get("tags", []),
                technologies=item.get("technologies", []),
                evaluation=item.get("evaluation", []),
                is_easy=item.get("isEasy", False),
            )
            subject_infos.append(info)
    
        Subject_Info.objects.bulk_create(subject_infos)

    def create_review(self, review_data, student):
        review_type = review_data.get('type')
        subject_name = review_data.get('subject')

        if not review_type or not subject_name:
            print(f"Skipping review due to missing type or subject: {review_data}")
            return

        try:
            subject = Subject.objects.get(name=subject_name)
        except Subject.DoesNotExist:
            print(f"Skipping review because subject '{subject_name}' not found.")
            return
        review = Review.objects.create(
            student=student,
            subject=subject,
            review_type=review_type,
        )

        context = {'review': review}
        if review_type == "evaluation":
            serializer = EvaluationReviewSerializer(data=review_data, context=context)
        elif review_type == "other":
            serializer = OtherReviewSerializer(data=review_data, context=context)
        else:
            review.delete()
            self.stdout.write(self.style.WARNING(f"Unknown review type: {review_type}"))
            return

        if serializer.is_valid():
            self.stdout.write(self.style.SUCCESS(f"Successfully added review for {subject_name}"))
            serializer.save()
        else:
            self.stdout.write(self.style.WARNING(f"Error saving review for {subject_name}: {serializer.errors}"))
            review.delete()

    def handle(self, *args, **options):
        reset_db = options['reset']

        if reset_db:
            self.stdout.write("Reset flag enabled: Clearing existing database entries...")
            Review.objects.all().delete()
            Subject_Info.objects.all().delete()
            Subject.objects.all().delete()

        base_dir = Path(__file__).resolve().parent.parent
        file_path = base_dir / 'data' / 'subject_details.json'
        reviews_file_path = base_dir / 'data' / 'reviews.json'
        
        with open(file_path, 'r', encoding='utf-8') as f:
            subject_details = json.load(f)
        
        with open(reviews_file_path, 'r', encoding='utf-8') as f:
            all_reviews = json.load(f)

        created_subjects = self.create_subject(subject_details)

        self.create_subject_info(created_subjects, subject_details)
        
        self.stdout.write(self.style.SUCCESS('Subjects and SubjectInfo filled successfully.'))

        # dummy student for reviews
        user, _ = User.objects.get_or_create(
            username='teststudent',
            defaults={
                'email': 'teststudent@students.finki.ukim.mk',
                'first_name': 'Тест',
                'last_name': 'Студент',
                'user_type': 'student'
            }
        )
        student, _ = Student.objects.get_or_create(user=user)
        if student.index is None:
            student.index = '230000'
            student.save()

        self.stdout.write(self.style.SUCCESS(f'Using student "{student.index}" for reviews.'))

        for review_data in all_reviews:
            self.create_review(review_data, student)
        
        self.stdout.write(self.style.SUCCESS('Reviews filled successfully.'))
