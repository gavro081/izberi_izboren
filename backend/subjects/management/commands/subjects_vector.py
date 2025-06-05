from pathlib import Path
import json
from django.core.management.base import BaseCommand
from numpy import average

class Command(BaseCommand):
    help = "Vectorize all subjects"
    
    def handle(self, *args, **options):
        base_dir = Path(__file__).resolve().parent.parent
        information_file_path = base_dir / 'data' / 'subject_details.json'
        output_file_path = base_dir / 'data' / 'subjects_vector.json'
        vocab_file_path = base_dir / 'data' / 'vocabulary.json'
        try:
            with open(information_file_path, 'r', encoding='utf-8') as f:
                subject_details_file_data = json.load(f)
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"Could not find file at {information_file_path}"))
            exit(1)

        keys_to_extract = [
            "subject", "level", "activated", "participants", "semester",
            "professors", "assistants", "tags", "technologies", "evaluation", "isEasy"
        ]
        subject_details = {}

        for subject in subject_details_file_data.values():
            name = subject.get("subject")
            if not name:
                continue
            subject_details[name] = {k: subject.get(k) for k in keys_to_extract}

        distinct_professors = set()
        distinct_assistants = set()
        distinct_tags = set()
        distinct_technologies = set()
        distinct_evaluations = set()

        for details in subject_details.values():
            professors = details.get("professors") or []
            assistants = details.get("assistants") or []
            tags = details.get("tags") or []
            technologies = details.get("technologies") or []
            evaluation = details.get("evaluation") or []

            distinct_professors.update(professors)
            distinct_assistants.update(assistants)
            distinct_tags.update(tags)
            distinct_technologies.update(technologies)
            if evaluation:
                distinct_evaluations.update(evaluation)


        # vocabulary = list(sorted(distinct_professors)) + list(sorted(distinct_assistants)) + list(sorted(distinct_technologies)) \
            # + list(sorted(distinct_tags)) + list(sorted(distinct_evaluations)) + ['isEasy', 'activated', 'participants'] 

        vocabulary = {
            "professors": list(sorted(distinct_professors)),
            "assistants": list(sorted(distinct_assistants)),
            "technologies": list(sorted(distinct_technologies)),
            "tags": list(sorted(distinct_tags)),
            "evaluation": list(sorted(distinct_evaluations)),
            # "isEasy": [],
            # "activated": [],
            # "participants": []
        }

        vectors = {}

        for subject_name in subject_details:
            values = subject_details[subject_name]
            subject_vector = {}
            subject_vector['professors'] = []
            subject_vector['assistants'] = []
            subject_vector['tags'] = []
            subject_vector['evaluation'] = []
            subject_vector['technologies'] = []
            for word in distinct_professors:
                subject_vector['professors'].append(0 if word not in values['professors'] else 1)
            for word in distinct_assistants:
                subject_vector['assistants'].append(0 if word not in values['assistants'] else 1)
            for word in distinct_tags:
                subject_vector['tags'].append(0 if word not in values['tags'] else 1)
            for word in distinct_evaluations:
                subject_vector['evaluation'].append(0 if word not in values['evaluation'] else 1)
            for word in distinct_technologies:
                subject_vector['technologies'].append(0 if word not in values['technologies'] else 1)
            
            subject_vector['isEasy'] = 1 if values['isEasy'] else 0
            subject_vector['activated'] = 1 if values['activated'] else 0
            participants = average(values['participants'])
            val = -1
            if participants < 100:
                val = 0
            elif participants < 300:
                val = 0.5
            else: 
                val = 1
            subject_vector['participants'] = val

            vectors[subject_name] = subject_vector



        with open(output_file_path, "w", encoding='utf-8') as f:
            json.dump(vectors, f, ensure_ascii=False, indent=4)
            self.stdout.write(self.style.SUCCESS(f"Data successfully stored in {output_file_path}"))


        with open(vocab_file_path, "w", encoding='utf-8') as f:
            json.dump(vocabulary, f, ensure_ascii=False, indent=4)
            self.stdout.write(self.style.SUCCESS(f"Data successfully stored in {vocab_file_path}"))
