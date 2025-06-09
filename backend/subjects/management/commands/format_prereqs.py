import json
from pathlib import Path
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Format subject prerequisites from strings to JSON"

    def handle(self, *args, **options):
        base_dir = Path(__file__).resolve().parent.parent
        input_path = base_dir / 'data' / 'prerequisites.json'
        output_path = base_dir / 'data' / 'formatted_prereqs.json'

        try:
            with open(input_path, "r", encoding='utf-8') as f:
                prerequisite_data = json.load(f)
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"Could not find file at {input_path}"))
            exit(1)

        formatted_prereqs = {}
        # map of all misspelled subject names on the website :|
        misspelled = {
            "дсикретна математика": "дискретна математика",
            "бизнис и статистика": "бизнис статистика",
            "основи на теорија на информации": "основи на теоријата на информации",
            "основи на роботика": "основи на роботиката",
            "комјутерски мрежи": "компјутерски мрежи",
            "примена на алгоритми и податочни стуктури": "Примена на алгоритми и податочни структури",
            "примена на алгоритни и податочни структури": "примена на алгоритми и податочни структури",
            "анализа на софтверски барања": "анализа на софтверските барања",
        }

        arr = []
        for entry in prerequisite_data:
            _, val, _, _ = entry.values()
            if val in arr:
                self.stdout.write(self.style.ERROR(f"${val} is a duplicate value. Remove it before you rerun this script"))
                exit(1)
            arr.append(val)
        self.stdout.write(self.style.SUCCESS("No duplicate values."))
        

        for entry in prerequisite_data:
            code, subject, prereq, _ = entry.values()
            # have to convert everything to lowercase, to avoid inconsistencies in data
            formatted_prereqs[subject] = {}
            formatted_prereqs[subject]["code"] = code
            prereq = prereq.lower()
            if prereq == "": 
                formatted_prereqs[subject]["prerequisite"] = {}
                continue
            a = ""
            if "|" in prereq:
                # only look at 2023 accreditation
                prereq = prereq.split(" | ")[1].split("(2023")[0].strip()
            
            if "кредити" in prereq:
                num_credits = int(prereq.split(" кредити")[0].strip())
                formatted_prereqs[subject]["prerequisite"] = {"credits": num_credits} 
                # no subject has prerequsite in format: 
                # N credits OR subject(s)
                # so it is okay to continue here
                continue
            
            if " или " in prereq:
                new_subjects = []
                for name in prereq.split(" или "):
                    new_subjects.append(name if name not in misspelled else misspelled[name])

                formatted_prereqs[subject]["prerequisite"] = {"subjects": new_subjects }
                continue
            
            formatted_prereqs[subject]["prerequisite"] = {"subjects": [prereq if prereq not in misspelled else misspelled[prereq]]}

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(formatted_prereqs, f, ensure_ascii=False ,indent=4)
            self.stdout.write(self.style.SUCCESS(f"Data successfully stored in {output_path}."))


            