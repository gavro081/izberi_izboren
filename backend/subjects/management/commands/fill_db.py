import json
import os
from django.core.management.base import BaseCommand
from subjects.models import Subject, Subject_Info
from pathlib import Path

class Command(BaseCommand):
    help = "Drop existing tables and fill db with subjects and subject info from JSON"

    def handle(self, *args, **kwargs):
        Subject_Info.objects.all().delete()
        Subject.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Existing data cleared successfully!'))

        base_dir = Path(__file__).resolve().parent
        data_path = base_dir / 'subject_details.json'
        
        with open(data_path, 'r', encoding='utf-8') as f:
            subject_details = json.load(f)

        for item in subject_details.values():
            name = item["subject"].lower()
            code = item["code"] if "," not in item["code"] else item["code"].split(",")[1].strip()

        subjects = []
        for item in subject_details.values():
            code = item["code"] if "," not in item["code"] else item["code"].split(",")[1].strip()
            subject = Subject(
                name=item["subject"],
                code=code,
                abstract=item.get("abstract")
            )
            subjects.append(subject)

        created_subjects = Subject.objects.bulk_create(subjects)

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
                short=item.get("short"),
                prerequisite=prereq,
                activated=item["activated"],
                participants=item.get("participants", [0, 0, 0]),
                mandatory=item["mandatory"],
                mandatory_for=item.get("mandatoryFor", []),
                semester=item["semester"],
                season=item["season"],
                elective_for=item.get("electiveFor", []),
                professors=item.get("professors", []),
                assistants=item.get("assistants", [])
            )
            subject_infos.append(info)
        
        Subject_Info.objects.bulk_create(subject_infos)
        
        self.stdout.write(self.style.SUCCESS('Database filled successfully!'))
        