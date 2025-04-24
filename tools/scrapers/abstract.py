from types import NoneType
from bs4 import BeautifulSoup
import os
import requests
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INFORMATION_PATH = os.path.join(BASE_DIR, 'data', 'information.json')

with open(INFORMATION_PATH, 'r', encoding='utf-8') as f:
    subject_information = json.load(f)
    subject_links = [s['link'] for s in subject_information]
    subject_names = [s['course'] for s in subject_information]

abstracts = {}

for link, name in zip(subject_links, subject_names):
    response = requests.get(link)
    program_soup = BeautifulSoup(response.content, 'html.parser')

    print(f"Scraping {name}...")
    try:
        abstract = (
            program_soup.find('table')
            .find_all('tr')[8]
            .find_all('p')[2]
            .find('span')
            .text.strip())
    except (AttributeError, IndexError):
        abstract = ""
        
    print(abstract)
    abstracts[name] = abstract

with open("../data/abstracts.json", "w", encoding='utf-8') as f:
    json.dump(abstracts, f, ensure_ascii=False, indent=4)
