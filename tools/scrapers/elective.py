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

    selected_tables = tables[8:]
    semesters_dict['S'] = []
    semesters_dict['W'] = []
    
    for table in selected_tables:
        subjects = []
        first_row = table.find_all('tr')[1]
        code_td = first_row.find_all('td')[0].text.strip() if first_row else ''
        if len(code_td) >= 6:
            is_summer = code_td[5].upper() == 'S'
        for td in table.find_all('td'):
            anchor = td.find('a')                
            if anchor:
                subject_text = anchor.text.strip()
                if subject_text:
                    # :)
                    if subject_text == "F23L2S026 Маркетинг": subject_text = "Маркетинг"
                    if subject_text == "F23L1S066 Основи на сајбер безбедноста": subject_text = "Основи на сајбер безбедноста"
                    subjects.append(subject_text)
        if subjects:
            semester = 'S' if is_summer else 'W'
            semesters_dict[semester] += subjects
        
        print(f"{round(table_index/5 * 100)}% scraped...")
        table_index += 1

    if semesters_dict:  
        programs_dict[program_name] = semesters_dict
    

    print(f"{program_name} finished scraping.")

with open("../data/elective.json", 'w', encoding='utf-8') as f:
    json.dump(programs_dict, f, ensure_ascii=False, indent=4)

print("Scraping complete. Data saved to elective.json")

