from subjects.models import Subject
from pathlib import Path
import json
from django.core.management.base import BaseCommand
from numpy import average

def get_eligible_subjects(student):
    passed_ids = set(student.passed_subjects.values_list('id', flat=True))

    total_credits = student.total_credits
    level_credits = student.level_credits
    study_track = student.study_track

    all_subjects = (Subject.objects
        .exclude(id__in=passed_ids)
        .select_related('subject_info')
    )

    if level_credits[0] >= 6:
        all_subjects = all_subjects.exclude(subject_info__level=1)
    if level_credits[1] >= 36:
        all_subjects = all_subjects.exclude(subject_info__level=2)

    valid_subjects = []
    for subject in all_subjects:
        subject_info_ = subject.subject_info
        prereqs = subject_info_.prerequisite or {}
        if prereqs.get('credits') and total_credits < prereqs['credits']:
            continue
        if prereqs.get('subjects') and not any(subj_id in passed_ids for subj_id in prereqs['subjects']):
            continue
        if study_track not in subject_info_.elective_for:
            continue
        valid_subjects.append(subject)

    return valid_subjects

def student_vector(student):
    base_dir = Path(__file__).resolve().parent
    vocab_file_path = base_dir / 'management' / 'data' / 'vocabulary.json'
    try:
        with open(vocab_file_path, 'r', encoding='utf-8') as f:
            vocabulary = json.load(f)
    except FileNotFoundError:
        print("file not found")
        exit(1)

    student_vector = {}
    student_vector['index'] = student.index
    print(student.professors)
    for key in vocabulary:
        print(key)
        if key == "assistants": continue
        student_values = getattr(student, key, [])

        student_vector[key] = []
        words = vocabulary[key]
        for word in words:
            student_vector[key].append(0 if word not in student_values else 1)

    student_vector['study_effort'] = student.study_effort / 5
    student_vector['current_year'] = student.current_year

    return student_vector
    