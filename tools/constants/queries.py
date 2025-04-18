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
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        level INTEGER NOT NULL,
        short TEXT,
        prerequisite TEXT,
        activated BOOLEAN NOT NULL,
        e_2024_2025 INTEGER,
        e_2023_2024 INTEGER,
        e_2022_2023 INTEGER,
        mandatory BOOLEAN NOT NULL,
        mandatoryFor TEXT[],
        semester INTEGER NOT NULL,
        season TEXT NOT NULL,
        electiveFor TEXT[],
        professors TEXT[],
        assistants TEXT[]
);
"""

INSERT_SUBJECT_INFO =  """
    INSERT INTO subject_data (
        name, code, level, short, prerequisite, activated, e_2024_2025, e_2023_2024,
        e_2022_2023, mandatory, mandatoryFor, semester, season, electiveFor, professors,
        assistants 
        ) VALUES %s
"""

