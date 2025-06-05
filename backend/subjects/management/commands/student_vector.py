from pathlib import Path
import json
from django.core.management.base import BaseCommand
from numpy import average

class Command(BaseCommand):
    help = "Vectorize all subjects"
    
    def handle(self, *args, **options):
        base_dir = Path(__file__).resolve().parent.parent
        information_file_path = base_dir / 'data' / 'test_student.json'
        vocab_file_path = base_dir / 'data' / 'vocabulary.json'
        output_file_path = base_dir / 'data' / 'test123.json'
        try:
            with open(information_file_path, 'r', encoding='utf-8') as f:
                student_data = json.load(f)
            with open(vocab_file_path, 'r', encoding='utf-8') as f:
                vocabulary = json.load(f)
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"Could not find file at {information_file_path}"))
            exit(1)

        # student keys
        keys_to_extract = [
            "index", "current_year", "study_effort", "professors",
            "domains", "technologies", "evaluation"
        ]
        student_data = student_data[0]
        student_vector = {}
        student_vector['index'] = student_data['index']

        for key in vocabulary:
            if key == "assistants": continue
            student_values = student_data[key]
            student_vector[key] = []
            words = vocabulary[key]
            for word in words:
                student_vector[key].append(0 if word not in student_values else 1)
        
        student_vector['study_effort'] = student_data["study_effort"] / 5
        student_vector['current_year'] = student_data["current_year"]


        with open(output_file_path, "w", encoding='utf-8') as f:
            json.dump(student_vector, f, ensure_ascii=False, indent=4)
            self.stdout.write(self.style.SUCCESS(f"Data successfully stored in {output_file_path}"))
