import json
import psycopg2
from psycopg2.extras import execute_values
import getpass

# TODO: CHANGE THIS!!!
password = getpass.getpass("enter supabase password: ")

conn = psycopg2.connect(f"postgresql://postgres.abbuypyehozzdatmefnp:{password}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres")
cur = conn.cursor()
print("connected to DB successfully")

with open("./data/subject_details.json", "r", encoding='utf-8') as f:
    json_data = json.load(f)

cur.execute("""
        CREATE TABLE IF NOT EXISTS subjectdata (
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
    """)

data_tuples = [
    (
        item["subject"],
        item["code"],
        item["level"],
        item.get("short"),
        item.get("prerequisite"),
        item["activated"],
        item.get("2024/2025"),
        item.get("2023/2024"),
        item.get("2022/2023"),
        item["mandatory"],
        item.get("mandatoryFor", []),
        item["semester"],
        item["season"],
        item.get("electiveFor", []),
        item.get("professors", []),
        item.get("assistants", [])
    )
    for item in json_data.values()
]

execute_values(
    cur,
    """
    INSERT INTO SubjectData (
        name, code, level, short, prerequisite, activated, e_2024_2025, e_2023_2024,
        e_2022_2023, mandatory, mandatoryFor, semester, season, electiveFor, professors,
        assistants 
        ) VALUES %s
    """,
    data_tuples
)

conn.commit()
cur.close()
conn.close()