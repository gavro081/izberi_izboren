import json
from pathlib import Path
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Aggregates all relevant data from multiple JSON files, and stores it in subject_details.json which could later be used to fill the database."

    def add_arguments(self, parser):
        parser.add_argument(
            '--warnings',
            action='store_true',
            help='Print warnings when a subject is not in the dataset or there is a casting error.'

        )

        parser.add_argument(
            '--flags',
            action='store_true',
            help='Running with flags stores each case when there is an exception in the staff data as a flag value, and also prints it in the terminal.'

        )

    def handle(self, *args, **options):
        with_warnings = options['warnings']
        with_flags = options['flags']

        ALL_PROGRAMS = ["SIIS23", "IMB23", "PIT23", "IE23", "KI23", "KN23"]
        subject_data = {} # the holy grail, everything goes here

        base_dir = Path(__file__).resolve().parent.parent
        information_file_path = base_dir / 'data' / 'information.json' # code, subject name, level
        participants_file_path = base_dir / 'data' / 'participants.json' # participant counts
        subjects_by_program_file_path = base_dir / 'data' / 'subjects_by_program.json' # which subjects are mandatory and in which semester
        professors_file_path = base_dir / 'data' / 'professors.json' # teaching staff for each subject'
        elective_file_path = base_dir / 'data' / 'elective.json' # which elective subjects can a certain program choose from
        abstract_file_path = base_dir / 'data' / 'abstracts.json' # short descriptions for all subjects
        formatted_prereqs_file_path = base_dir / 'data' / 'formatted_prereqs.json' # prerequisites for each subject

        output_path = base_dir / 'data' / 'subject_details123.json'

        try:
            with open(information_file_path, 'r', encoding='utf-8') as f:
                information_data = json.load(f)
            with open(participants_file_path, 'r', encoding='utf-8') as f:
                participants_data = json.load(f)
            with open(subjects_by_program_file_path, 'r', encoding='utf-8') as f:
                subjects_by_program_data = json.load(f)
            with open(professors_file_path, 'r', encoding='utf-8') as f:
                professors_data = json.load(f)
            with open(elective_file_path, 'r', encoding='utf-8') as f:
                elective_data = json.load(f)
            with open(abstract_file_path, 'r', encoding='utf-8') as f:
                abstract_data = json.load(f)
            with open(formatted_prereqs_file_path, 'r', encoding='utf-8') as f:
                formatted_prereq_data = json.load(f)
        except FileNotFoundError as e:
            self.stdout.write(self.style.ERROR(f"Could not find file: {e.filename}"))
            exit(1)
        
        self.stdout.write(self.style.SUCCESS("Opened all files..."))
        for entry in information_data:
            code, course, level, _ = entry.values()
            try:
                semester = int(level)
            except ValueError:
                if with_warnings:
                    self.stdout.write(self.style.WARNING(f"Warning: Semester {level} could not be converted to integer and is being skipped"))
                continue

            subject_data[course] = {
                "subject": course,
                "code": code,
                "level": level,
                "abstract": abstract_data[course]
            }
        self.stdout.write(self.style.SUCCESS(f"Information data collected..."))
        for course in formatted_prereq_data:
            code, prereqs = formatted_prereq_data[course].values()
            if course in subject_data:
                subject_data[course]["short"] = code
                subject_data[course]["prerequisite"] = prereqs
            else:
                if with_warnings:
                    self.stdout.write(self.style.WARNING(f"Course {course} is not in subject data"))
        self.stdout.write(self.style.SUCCESS("Prerequisite data collected..."))
        for i, entry in enumerate(participants_data):
            _, *semesters = entry.keys()
            course, *semester_data = entry.values()
            if course in subject_data:
                try:
                    # course is not activated if participant count is 0
                    # potentially check if the condition should change to < 20 or similar
                    subject_data[course]['activated'] = False if int(semester_data[0]) == 0 else True
                except ValueError:
                    subject_data[course]['activated'] = 'ERROR'
                    self.stdout.write(self.style.WARNING(f"Error: Course {course} has a value that is not an integer"))
                
                # gets last 3 semesters, adjust for less/more
                subject_data[course]["participants"] = [participants_data[i][semester] for semester in semesters[:3]]
                # for semester in semesters[:3]: 
                    # subject_data[course][semester] = participants_data[i][semester]
            else:
                if with_warnings:
                    self.stdout.write(self.style.WARNING(f"Course {course} is not in subject data"))
        self.stdout.write(self.style.SUCCESS("Participant data collected..."))

        # for each subject in the records, label which programs that subject is mandatory for
        # additionally label which semester that subject is (preffered to be) taken, and whether it is a summer or a winter subject
        for subject in subject_data:
            subject_primary_data = subject_data[subject]
            if subject in subjects_by_program_data:
                subject_mandatory_data = subjects_by_program_data[subject]
                subject_primary_data['mandatory'] = True
                subject_primary_data['mandatoryFor'] = subject_mandatory_data['programs']
            else:
                subject_primary_data['mandatory'] = False
                subject_primary_data['mandatoryFor'] = []
            

            subject_primary_data['semester'] = subject_mandatory_data['semester']
            season = 'W' if int(subject_mandatory_data['semester']) % 2 != 0 else 'S'
            subject_primary_data['season'] = season

            subject_primary_data['electiveFor'] = []
            # check if a subject is elective only for those programs where it is not mandatory
            # NOTE: some subjects like 'Математика 1' are mandatory for some programs, but cannot be chosen by others
            # so assuming that a subject can be chosen by all programs where it isn't elective would be wrong, although intuitive
            for program in sorted(set(ALL_PROGRAMS) - set(subject_primary_data['mandatoryFor'])):
                if subject in elective_data[program][season]:
                    subject_primary_data['electiveFor'].append(program)
        
        self.stdout.write(self.style.SUCCESS("Mandatory and elective data collected..."))

        for entry in professors_data:
            course, professors, assistants = entry.values()
            if professors.startswith("("):
                subject_data[course]["professors"] = [] 
                subject_data[course]["assistants"] = []
                if with_flags:
                    subject_data[course]['flag'] = professors
                    self.stdout.write(self.style.WARNING(f"Course {course} has flag {professors}"))
            else:
                if course in subject_data:
                    subject_data[course]["professors"] = professors.split("\n") if professors != "" else []
                    subject_data[course]["assistants"] = assistants.split("\n") if assistants != "" else []
                else:
                    if with_warnings:
                        self.stdout.write(self.style.WARNING(f"Course {course} is not in subject data"))
        self.stdout.write(self.style.SUCCESS("Staff data collected..."))


        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(subject_data, f, ensure_ascii=False, indent=4)
            self.stdout.write(self.style.SUCCESS(f"Data successfully stored in {output_path}."))