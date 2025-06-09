import json
from django.core.management.base import BaseCommand
from pathlib import Path

TAGS = [
    "AI / ML",
    "Cloud Engineering & DevOps",
    "Computer Architecture",
    "Computer Science",
    "Cybersecurity",
    "Data Science",
    "Databases",
    "Education",
    "Embedded Systems",
    "Game Development",
    "Mathematics",
    "Multimedia",
    "Networking",
    "Physics",
    "Societal Skills",
    "Software Engineering",
    "Systems Infrastructure",
    "UI/UX & Digital Media",
    "Web Development"
]

EDGES = [
    ("Mathematics", "Physics", 1),
    ("Physics", "Mathematics", 1),
    ("Web Development", "Databases", 2),
    ("Databases", "Web Development", 2),
    ("Databases", "AI / ML", 1.5),
    ("AI / ML", "Databases", 1.5),
    ("Data Science", "AI / ML", 3),
    ("AI / ML", "Data Science", 3),
    ("Cybersecurity", "Systems Infrastructure", 1),
    ("Systems Infrastructure", "Cybersecurity", 1),
    ("Computer Architecture", "Systems Infrastructure", 1.5),
    ("Systems Infrastructure", "Computer Architecture", 1),
    ("Game Development", "Embedded Systems", 1),
    ("Embedded Systems", "Game Development", 1),
    ("Cloud Engineering & DevOps", "Networking", 0.75),
    ("Networking", "Cloud Engineering & DevOps", 1.5),
    ("Computer Science", "Mathematics", 1),
    ("Mathematics", "Computer Science", 2),
    ("Computer Science", "Physics", 0.33),
    ("Physics", "Computer Science", 0.5),
    ("Computer Architecture", "Networking", 2),
    ("Networking", "Computer Architecture", 1),
    ("Computer Architecture", "Computer Science", 1),
    ("Computer Science", "Computer Architecture", 0.5),
    ("UI/UX & Digital Media", "Multimedia", 1),
    ("Multimedia", "UI/UX & Digital Media", 1),
    ("Societal Skills", "Education", 1),
    ("Education", "Societal Skills", 1),
    ("Web Development", "Cloud Engineering & DevOps", 1.5),
    ("Cloud Engineering & DevOps", "Web Development", 1.5),
    ("Game Development", "Mathematics", 2),
    ("Mathematics", "Game Development", 2),
    ("Game Development", "Physics", 2),
    ("Physics", "Game Development", 2),
    ("Web Development", "UI/UX & Digital Media", 2),
    ("UI/UX & Digital Media", "Web Development", 2),
    ("Cybersecurity", "Networking", 2),
    ("Networking", "Cybersecurity", 2),
    ("Cybersecurity", "Computer Architecture", 1),
    ("Computer Architecture", "Cybersecurity", 1),
    ("AI / ML", "Mathematics", 3),
    ("Mathematics", "AI / ML", 3),
    ("Data Science", "Mathematics", 3),
    ("Mathematics", "Data Science", 3)
]

def add(tag_graph, tag1, tag2, weight):
    tag_graph[tag1].append((tag2, weight))


class Command(BaseCommand):
    help = "Create a directed, weighted graph of dependencies between all tags present in the vocabulary."
    
    def handle(self, *args, **options):
        base_dir = Path(__file__).resolve().parent.parent
        output_file_path = base_dir / 'data' / 'tag_graph.json'
        tag_graph = {}
        for tag in TAGS:
            tag_graph[tag] = []

        for edge in EDGES:
            add(tag_graph, edge[0], edge[1], edge[2])

        tag_to_col_index = {}

        for i, tag in enumerate(TAGS):
            tag_to_col_index[tag] = i

        final_tag_graph = {}

        for key in tag_graph.keys():
            key_index = tag_to_col_index[key]
            
            for i, val in enumerate(tag_graph[key]):
                n, w = val
                tag_graph[key][i] = (tag_to_col_index[n], w)
            
            final_tag_graph[key_index] = tag_graph[key]

        with open(output_file_path, "w") as f:
            json.dump(final_tag_graph, f)
            self.stdout.write(self.style.SUCCESS(f"Finished scraping. Data successfully stored in {output_file_path}"))










