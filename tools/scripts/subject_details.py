import json

information_file_path = '../data/information.json' # code, subject name, level
# prerequisites_file_path = '../data/prerequisites.json' # short name, prereq, semester
participants_file_path = '../data/participants.json' # participant counts
subjects_by_program_file_path = '../data/subjects_by_program.json' # which subjects are mandatory and in which semester
professors_file_path = '../data/professors.json' # teaching staff for each subject'
elective_file_path = '../data/elective.json' # which elective subjects can a certain program choose from
abstract_file_path = '../data/abstracts.json' # short descriptions for all subjects
formatted_prereqs_file_path = '../data/formatted_prereqs.json' # prerequisites for each subject

try:
    with open(information_file_path, 'r', encoding='utf-8') as f:
        information_data = json.load(f)
    # with open(prerequisites_file_path, 'r', encoding='utf-8') as f:
    #     prerequisites_data = json.load(f)
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
    print(f"Error: Could not find file: {e.filename}")
    exit(1)

ALL_PROGRAMS = ["SIIS23", "IMB23", "PIT23", "IE23", "KI23", "KN23"]

subject_data = {} # the holy grail, everything goes here

for entry in information_data:
    code, course, level, _ = entry.values()
    try:
        semester = int(level)
    except ValueError:
        print(f"Warning: Semester {level} could not be converted to integer and is being skipped")
        continue

    subject_data[course] = {
        "subject": course,
        "code": code,
        "level": level,
        "abstract": abstract_data[course]
    }

# for entry in prerequisites_data:
#     code, course, prerequisite, _ = entry.values()
#     if course in subject_data:
#         subject_data[course]['short'] = code
#         subject_data[course]['prerequisite'] = prerequisite
#     else:
#         print(f"Error: Course {course} is not in subject data")

for course in formatted_prereq_data:
    code, prereqs = formatted_prereq_data[course].values()
    if course in subject_data:
        subject_data[course]["short"] = code
        subject_data[course]["prerequisite"] = prereqs
    else:
        print(f"Error: Course {course} is not in subject data")

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
            print(f"Error: Course {course} has a value that is not an integer")
        
        # gets last 3 semesters, adjust for less/more
        subject_data[course]["participants"] = [participants_data[i][semester] for semester in semesters[:3]]
        # for semester in semesters[:3]: 
            # subject_data[course][semester] = participants_data[i][semester]
    else:
        print(f"Error: Course {course} is not in subject data")

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

for entry in professors_data:
    course, professors, assistants = entry.values()
    if professors.startswith("("):
        subject_data[course]["professors"] = [] 
        subject_data[course]["assistants"] = []
        subject_data[course]['flag'] = professors
        print(f"Course {course} has flag {professors}")
    else:
        if course in subject_data:
            subject_data[course]["professors"] = professors.split("\n") if professors != "" else []
            subject_data[course]["assistants"] = assistants.split("\n") if assistants != "" else []
        else:
            print(f"Error: Course {course} is not in subject data")



with open('../../backend/subjects/management/commands/subject_details.json', 'w', encoding='utf-8') as f:
    json.dump(subject_data, f, ensure_ascii=False, indent=4)