## guide

### Data

- `abstracts.json` - JSON containing short descriptions for each subject
- `courses.json` - array containing the names of all subjects.
- `elective.json` - JSON containing arrays of all eligible summer and winter subjects for all programs.
- `formatted_prereqs.json` - JSON containing subject prerequisites as JSON objects, instead of strings.
- `information.json` - array with the code, name, level and link for all subjects.
- `mandatory.json` - JSON containing arrays of all mandatory subjects for all programs, organized by semester.
- `participants.json` - array listing all courses with their number of participants.
- `prerequisites.json` - array of subject prerequisites (as strings).
- `professors.json` - array of all subjects with their respective professors and assistants.
- `subjects_by_program.json` - JSON listing all subjects and the programs for which they are mandatory.

### Scrapers

- `abstract.py` - scrapes the FINKI website for short descriptions for each subject
- `elective.py` - scrapes the FINKI website for all elective subjects per program and writes the results to `data/elective.json`.
- `mandatory.py` - scrapes the FINKI site for all mandatory subjects per program and writes the results to `data/mandatory.json`.

### Scripts

- `format_prereqs.py` - reads data from prerequisites.json, and writes the formatted output to `data/formatted_prereqs.json`
- `subjects_by_program.py` - reads data from mandatory.json, and writes the relevant information to `data/subjects_by_program.json`.
- `subject_details.py` - aggregates data from multiple JSON files, and writes the combined information in `backend/subjects/management/commands/subject_details.json`. Modify this script to modify the initial data that is used to populate the db.
