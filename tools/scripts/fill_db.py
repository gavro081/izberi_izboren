import psycopg2
import os
from psycopg2.extras import execute_values
from dotenv import load_dotenv
from pathlib import Path
import tools.constants.queries as queries
import tools.constants.values as values

# IMPORTANT:
# to run script make sure
# - you are in project root
# - that tools, constants and scripts have __init__.py files, they can be empty
# - a .env file with the db info exists in backend/.env
# run "python3 -m tools.scripts.fill_db"

env_path = Path(__file__).resolve().parent.joinpath('../../backend/.env')
load_dotenv(dotenv_path=env_path)

user = os.getenv("DB_USER")
password = os.getenv("DB_PASS")
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")
dbname = os.getenv("DB_NAME")

conn = psycopg2.connect(
    f"postgresql://{user}:{password}@{host}:{port}/{dbname}"
)
cur = conn.cursor()
print("connected to DB successfully")

cur.execute(queries.CREATE_SUBJECT)
cur.execute(queries.CREATE_SUBJECT_INFO)

execute_values(
    cur,
    queries.FILL_SUBJECT,
    values.SUBJECT
)

execute_values(
    cur,
    queries.INSERT_SUBJECT_INFO,
    values.SUBJECT_INFO
)

conn.commit()
cur.close()
conn.close()