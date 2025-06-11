import requests
from bs4 import BeautifulSoup
import json
from django.core.management.base import BaseCommand
from pathlib import Path

class Command(BaseCommand):
    help = "Scrape elective subjects for all study tracks from FINKI page"

    def handle(self, *args, **options):
        base_dir = Path(__file__).resolve().parent.parent
        output_file_path = base_dir / 'data' / 'elective.json'
        
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

        response = requests.get(base_url)
        soup = BeautifulSoup(response.content, 'html.parser')

        program_links = [f"/program/{program}/mk" for program in programs]

        for program_link in program_links:
            program_url = base_url + program_link
            program_response = requests.get(program_url)
            program_soup = BeautifulSoup(program_response.content, 'html.parser')
            
            program_name = program_link.split("/")[2]

            self.stdout.write(f"Scraping {program_name}...")
            
            semesters_dict = {}
            table_index = 1
            
            tables = program_soup.find_all('table')

            selected_tables = tables[8:]
            semesters_dict['S'] = []
            semesters_dict['W'] = []
            
            for table in selected_tables:
                subjects = {}
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
                            if subject_text == "Автоматизирање на процеси во  машинско учење": subject_text = "Автоматизирање на процеси во машинско учење"
                            subjects[subject_text] = {}
                            subjects[subject_text]["subject"] = subject_text
                    else:
                        try:
                            semester = int(td.text)
                            subjects[subject_text]["semester"] = semester
                            print(f"{subject_text} se slusa vo {semester} semestar")
                        except ValueError:
                            pass
                    
                if subjects:
                    semester = 'S' if is_summer else 'W'
                    if not semesters_dict[semester]: semesters_dict[semester] = {}
                    semesters_dict[semester].update(subjects)

                self.stdout.write(f"{round(table_index/5 * 100)}% scraped...")
                table_index += 1

            if semesters_dict:
                if program_name == 'SIIS23':
                    del semesters_dict['W']['Веројатност и статистика']  
                programs_dict[program_name] = semesters_dict
            
            self.stdout.write(self.style.SUCCESS(f"{program_name} finished scraping."))

        with open(output_file_path, 'w', encoding='utf-8') as f:
            json.dump(programs_dict, f, ensure_ascii=False, indent=4)
            self.stdout.write(self.style.SUCCESS(f"Scraping complete. Data saved to {output_file_path}"))

