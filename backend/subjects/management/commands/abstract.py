from types import NoneType
from bs4 import BeautifulSoup
from pathlib import Path
import requests
import json
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Scrape abstracts for all subjects from FINKI page"
    
    def handle(self, *args, **options):
        base_dir = Path(__file__).resolve().parent.parent
        information_file_path = base_dir / 'data' / 'information.json'
        output_file_path = base_dir / 'data' / 'abstracts.json'
        try:
            with open(information_file_path, 'r', encoding='utf-8') as f:
                subject_information = json.load(f)
                subject_links = [s['link'] for s in subject_information]
                subject_names = [s['course'] for s in subject_information]
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"Could not find file at {information_file_path}"))
            exit(1)

        abstracts = {}

        for link, name in zip(subject_links, subject_names):
            response = requests.get(link)
            program_soup = BeautifulSoup(response.content, 'html.parser')
            self.stdout.write(f"Scraping {name}...")
            try:
                abstract = (
                    program_soup.find('table')
                    .find_all('tr')[8]
                    .find_all('p')[2]
                    .find('span')
                    .text.strip())
            except (AttributeError, IndexError):
                self.stdout.write(self.style.WARNING(f"Could't find abstract for {name}"))
                
            
            abstracts[name] = abstract
            self.stdout.write(self.style.SUCCESS(f"Scraped {name}."))
            break

        with open(output_file_path, "w", encoding='utf-8') as f:
            json.dump(abstracts, f, ensure_ascii=False, indent=4)
            self.stdout.write(self.style.SUCCESS(f"Finished scraping. Data successfully stored in {output_file_path}"))
