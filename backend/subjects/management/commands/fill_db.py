import json
import os
from django.core.management.base import BaseCommand
from subjects.models import Subject, Subject_Info
from pathlib import Path

class Command(BaseCommand):
    help = "Fill db with subjects and subject info from JSON"

    def handle(self, *args, **kwargs):
        base_dir = Path(__file__).resolve().parent
        data_path = base_dir / 'subject_details.json'
        
        with open(data_path, 'r', encoding='utf-8') as f:
            subject_details = json.load(f)

        subjects = []
        for item in subject_details.values():
            code = item["code"] if "," not in item["code"] else item["code"].split(",")[1].strip()
            subject = Subject(
                name=item["subject"],
                code=code,
                abstract=item.get("abstract", "")
            )
            subjects.append(subject)

        created_subjects = Subject.objects.bulk_create(subjects)

        subject_infos = []
        for db_subject, item in zip(created_subjects, subject_details.values()):
            info = Subject_Info(
                subject=db_subject,
                level=item["level"],
                short=item.get("short"),
                prerequisite=item.get("prerequisite"),
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
        