## guide

### Constants

- `queries.py` - contains raw SQL queries for creating and populating the initial tables in the database.
- `values.py` - reads from `subject_details.json` and stores the values so they can be used to populate the database.

### Data

- `abstracts.json` - JSON containing short descriptions for each subject
- `courses.json` - array containing the names of all subjects.
- `elective.json` - JSON containing arrays of all eligible summer and winter subjects for all programs.
- `information.json` - array with the code, name, level and link for all subjects.
- `mandatory.json` - JSON containing arrays of all mandatory subjects for all programs, organized by semester.
- `participants.json` - array listing all courses with their number of participants.
- `prerequisites.json` - array of subject prerequisites.
- `professors.json` - array of all subjects with their respective professors and assistants.
- `subject_details.json` - JSON containing all subjects and relevant information about them, aggregated from the other data files.
- `subjects_by_program.json` - JSON listing all subjects and the programs for which they are mandatory.

### Scrapers

- `abstract.py` - scrapes the FINKI website for short descriptions for each subject
- `elective.py` - scrapes the FINKI website for all elective subjects per program and writes the results to `data/elective.json`.
- `mandatory.py` - scrapes the FINKI site for all mandatory subjects per program and writes the results to `data/mandatory.json`.

### Scripts

- `fill_db.py` - connects to the database, creates tables, and populates them.
- `subjects_by_program.py` - reads data from mandatory.json, and writes the relevant information to data/subjects_by_program.json.
- `subject_details.py` - aggregates data from multiple JSON files, and writes the combined information in `data/subject_details.json`.
