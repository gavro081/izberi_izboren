# subject
CREATE_SUBJECT = """
    CREATE TABLE IF NOT EXISTS subject (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        abstract TEXT DEFAULT NULL
);
"""
# TODO: scrape and insert abstract
FILL_SUBJECT = """
    INSERT INTO subject (
        name, code        
        ) VALUES %s
"""

# subject_info
CREATE_SUBJECT_INFO = """
    CREATE TABLE IF NOT EXISTS subject_data (
        id SERIAL PRIMARY KEY,
        subject_id INTEGER UNIQUE NOT NULL REFERENCES subject(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        level INTEGER NOT NULL,
        short TEXT,
        prerequisite TEXT,
        activated BOOLEAN NOT NULL,
        participants INT[],
        mandatory BOOLEAN NOT NULL,
        mandatory_for TEXT[],
        semester INTEGER NOT NULL,
        season TEXT NOT NULL,
        elective_for TEXT[],
        professors TEXT[],
        assistants TEXT[]
);
"""
# TODO:
# it is repetitive and unnecessary to store the name and code in subject_data,
# because they can be retrieved with a join, but for now it can stay like this
INSERT_SUBJECT_INFO =  """
    INSERT INTO subject_data (
        subject_id, name, code, level, short, prerequisite, activated, participants, 
        mandatory, mandatory_for, semester, season, elective_for, professors, assistants 
        ) VALUES %s
"""

