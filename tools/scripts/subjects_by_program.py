import json

file_path = '../data/mandatory.json'
try:
    with open(file_path, 'r', encoding='utf-8') as f:
        mandatory_data = json.load(f)
except FileNotFoundError:
    print(f"Error: Could not find file at {file_path}")
    exit(1)

subject_data = {}

for program_name, semesters in mandatory_data.items():
    for semester, subjects in semesters.items():
        try:
            semester_num = int(semester)
        except ValueError:
            print(f"Warning: Semester {semester} could not be converted to integer and is being skipped.")
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


with open('subjects_by_program.json', 'w', encoding='utf-8') as f:
    json.dump(subject_data, f, ensure_ascii=False, indent=4)

print("Processing complete. Data saved to subjects_by_program.json")