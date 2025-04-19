import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # this gets you to /tools
SUBJECT_DETAILS_PATH = os.path.join(BASE_DIR, 'data', 'subject_details.json')

# subject
with open(SUBJECT_DETAILS_PATH, "r", encoding='utf-8') as f:
    json_subject_details = json.load(f)

SUBJECT = [
(
    item["subject"],
    item["code"] if "," not in item["code"] else item["code"].split(",")[1].strip(),
    # item["abstract"], TODO :)
)
for item in json_subject_details.values()       
]

# subject_info

# be aware, using index + 1 is valid only for fresh starts
SUBJECT_INFO = [
(
    index + 1,
    item["subject"],
    item["code"],
    item["level"],
    item.get("short"),
    item.get("prerequisite"),
    item["activated"],
    item.get("participants", [0,0,0]),
    item["mandatory"],
    item.get("mandatoryFor", []),
    item["semester"],
    item["season"],
    item.get("electiveFor", []),
    item.get("professors", []),
    item.get("assistants", [])
)
for index, item in enumerate(json_subject_details.values())
]