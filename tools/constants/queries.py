# subject
CREATE_SUBJECT = """
    CREATE TABLE IF NOT EXISTS subject (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        abstract TEXT NOT NULL
);
"""
FILL_SUBJECT = """
    INSERT INTO subject (
        name, code, abstract        
        ) VALUES %s
"""

# subject_info
CREATE_SUBJECT_INFO = """
    CREATE TABLE IF NOT EXISTS subject_info (
        subject_id INTEGER PRIMARY KEY REFERENCES subject(id) ON DELETE CASCADE,
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
INSERT_SUBJECT_INFO =  """
    INSERT INTO subject_info(
        subject_id, level, short, prerequisite, activated, participants, 
        mandatory, mandatory_for, semester, season, elective_for, professors, assistants 
        ) VALUES %s
"""

