import json

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
    ("Mathematics", "Physics"),
    ("Web Development", "Databases"),
    ("Databases", "AI / ML"),
    ("Data Science", "AI / ML"),
    ("Cybersecurity", "Systems Infrastructure"),
    ("Computer Architecture", "Systems Infrastructure"),
    ("Game Development", "Embedded Systems"),
    ("Cloud Engineering & DevOps", "Networking"),
    ("Computer Science", "Mathematics"),
    ("Computer Science", "Physics"),
    ("Computer Architecture", "Networking"),
    ("Computer Architecture", "Computer Science"),
    ("UI/UX & Digital Media", "Multimedia"),
    ("Societal Skills", "Education"),
    ("Web Development", "Cloud Engineering & DevOps"),
    ("Game Development", "Mathematics"),
    ("Game Development", "Physics"),
    ("Web Development", "UI/UX & Digital Media"),
    ("Cybersecurity", "Networking"),
    ("Cybersecurity", "Computer Architecture"),
    ("AI / ML", "Mathematics"),
    ("Data Science", "Mathematics")
]

def add(tag1, tag2):
    tag_graph[tag1].append(tag2)
    tag_graph[tag2].append(tag1)

tag_graph = {}
for tag in TAGS:
    tag_graph[tag] = []

for edge in EDGES:
    add(edge[0], edge[1])

tag_to_col_index = {}

for i, tag in enumerate(TAGS):
    tag_to_col_index[tag] = i

final_tag_graph = {}

for key in tag_graph.keys():
    key_index = tag_to_col_index[key]
    
    for i, val in enumerate(tag_graph[key]):
        tag_graph[key][i] = tag_to_col_index[val]
    
    final_tag_graph[key_index] = tag_graph[key]



with open("tag_graph.json", "w") as f:
    json.dump(final_tag_graph, f)










