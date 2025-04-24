import requests
from bs4 import BeautifulSoup
import json

programs_dict = {}

base_url = "https://www.finki.ukim.mk"
programs = [
    "SIIS23",
    "IMB23",
    "PIT23",
    "IE23",
    "KI23",
    "KN23",
]

main_url = "https://www.finki.ukim.mk/"
response = requests.get(main_url)
soup = BeautifulSoup(response.content, 'html.parser')

program_links = [f"/program/{program}/mk" for program in programs]

for program_link in program_links:
    program_url = base_url + program_link
    program_response = requests.get(program_url)
    program_soup = BeautifulSoup(program_response.content, 'html.parser')
    
    program_name = program_link.split("/")[2]

    print(f"Scraping {program_name}...")
    
    semesters_dict = {}
    table_index = 1
    
    tables = program_soup.find_all('table')
    
    # ignore tables with elective subjects
    for table in tables[:8]:
        subjects = []
        for td in table.find_all('td'):
            anchor = td.find('a')
            if anchor:
                subject_text = anchor.text.strip()
                if subject_text:  # Only add non-empty subjects
                    # not my proudest moment
                    if subject_text == "F23L2S026 Маркетинг": subject_text = "Маркетинг"
                    if subject_text == "F23L1S066 Основи на сајбер безбедноста": subject_text = "Основи на сајбер безбедноста"

                    subjects.append(subject_text)
        
        if subjects:  
            semesters_dict[str(table_index)] = subjects
            print(f"Semester {table_index} scraped...")
            table_index += 1
            
    
    if semesters_dict:  
        programs_dict[program_name] = semesters_dict

    print(f"{program_name} finished scraping.")

with open('../data/mandatory.json', 'w', encoding='utf-8') as f:
    json.dump(programs_dict, f, ensure_ascii=False, indent=4)

print("Scraping complete. Data saved to mandatory.json")
