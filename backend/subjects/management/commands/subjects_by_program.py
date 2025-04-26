import json
from pathlib import Path
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "For each subject store in which semester they should be picked, and which programs they are mandatory for."

    def handle(self, *args, **options):
        base_dir = Path(__file__).resolve().parent.parent
        file_path = base_dir / 'data' / 'mandatory.json'

        output_path = base_dir / 'data' / 'subjects_by_program1.json'

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                mandatory_data = json.load(f)
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"Could not find file at {file_path}"))
            exit(1)

        subject_data = {}

        for program_name, semesters in mandatory_data.items():
            for semester, subjects in semesters.items():
                try:
                    semester_num = int(semester)
                except ValueError:
                    self.stdout.write(self.style.WARNING(f"Warning: Semester {semester} could not be converted to integer and is being skipped."))
                    continue
                
                for subject in subjects:
                    if subject not in subject_data:
                        subject_data[subject] = {
                            "semester": semester_num,
                            "programs": [program_name]
                        }
                    else:
                        existing_semester = subject_data[subject]["semester"]
                        if program_name not in subject_data[subject]["programs"]:
                            subject_data[subject]["programs"].append(program_name)


        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(subject_data, f, ensure_ascii=False, indent=4)
            self.stdout.write(self.style.SUCCESS(f"Data successfully stored in {output_path}."))