# Guide

## Data

- `abstracts.json` - JSON containing short descriptions for each subject
- `additional_info.json` - JSON containing tags, technologies, evaluation techniques and whether a subject is easy or not for each subject.
- `courses.json` - array containing the names of all subjects.
- `elective.json` - JSON containing arrays of all eligible summer and winter subjects for all programs.
- `formatted_prereqs.json` - JSON containing subject prerequisites as JSON objects, instead of strings.
- `information.json` - array with the code, name, level and link for all subjects.
- `mandatory.json` - JSON containing arrays of all mandatory subjects for all programs, organized by semester.
- `participants.json` - array listing all courses with their number of participants.
- `prerequisites.json` - array of subject prerequisites (as strings).
- `professors.json` - array of all subjects with their respective professors and assistants.
- `reviews.json` - array of existing reviews used to initially fill the db.
- `subject_details.json` - JSON containing all subjects and relevant information about them, aggregated from the other data files. used for filling the db. If you want to modify some of the data before filling the database it is preferred to do so in the other files and then rerun the respective command for overwriting this file, instead of changing this file directly.
- `subjects_by_program.json` - JSON listing all subjects and the programs for which they are mandatory.
- `subjects_vector.json` - JSON representing the encoded vectors for all subjects, where 1 represents a value that is present.
- `tag_graph.json` - JSON where each key is the index of a tag and each value is its respective adjacency list. Each item in the list is the index of the neighbor and the weight of that particular edge.
- `vocabulary.json` - JSON where each key is a specific field and the value is a list of all distinct values in the db for that specific field.

## Commands

the template for running commands is:
`python3 manage.py <filename>`

> Make sure you exclude the .py extension from the filename

### Scrapers

- `abstract.py` - scrapes the FINKI website for short descriptions for each subject
- `elective.py` - scrapes the FINKI website for all elective subjects per program and writes the results to `data/elective.json`.
- `mandatory.py` - scrapes the FINKI site for all mandatory subjects per program and writes the results to `data/mandatory.json`.

### Scripts

- `fill_db.py` - reads data from subject details and reviews, then populates the db. useful for initial set up. for overwriting the existing data in the db run the command with --reset flag.
- `format_prereqs.py` - reads data from prerequisites.json, and writes the formatted output to `data/formatted_prereqs.json`
- `subject_details.py` - aggregates data from multiple JSON files, and writes the combined information in `/data/subject_details.json`.
- `subjects_by_program.py` - reads data from mandatory.json, and writes the relevant information to `data/subjects_by_program.json`.
- `subjects_vector.py` - encodes the values for each subject into vectors of 0s and 1s and writes to `data/subjects_vector.json`.
- `tag_graph.py` - creates a directed, weighted graph useful for mapping all dependencies between tags and their respective weights. writes to `data/tag_graph.json`
