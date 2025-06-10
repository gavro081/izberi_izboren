from copy import deepcopy
from subjects.management.commands import subjects_vector
from subjects.models import Subject
from pathlib import Path
import json
from django.db.models import Q
import os
from subjects.consts import BIAS_STUDENT_HAS_ONE, BIAS_SUBJECT_HAS_ONE, WEIGHTS, NUMBER_OF_SUGGESTIONS

def get_eligible_subjects(student, season = 2):
    """
    season -  0 - summer, 1 - winter, 2 - all
    """
    passed_ids = set(student.passed_subjects.values_list('id', flat=True))
    total_credits = student.total_credits
    level_credits = student.level_credits
    study_track = student.study_track
    study_effort = student.study_effort
    current_year = student.current_year

    all_subjects = (Subject.objects
        .exclude(id__in=passed_ids)
        .select_related('subject_info')
    )

    if season != 2:
        if season == 0:
            all_subjects = all_subjects.exclude(subject_info__season='W')
        elif season == 1:
            all_subjects = all_subjects.exclude(subject_info__season='S')

    if study_effort < 3:
        all_subjects = all_subjects.exclude(subject_info__semester__gt=current_year * 2)
        if study_effort == 1:
            all_subjects = all_subjects.filter(subject_info__is_easy=True)
    elif study_effort == 3:
        all_subjects = all_subjects.filter(
            Q(subject_info__semester=current_year * 2) |
            Q(subject_info__semester=current_year * 2 - 1)
        )
    else:
        all_subjects = all_subjects.filter(subject_info__semester__gte=current_year * 2)
        if study_effort == 5:
            all_subjects = all_subjects.exclude(subject_info__is_easy=True)

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
        return -1

    student_vector = {}
    student_vector['index'] = student.index
    for key in vocabulary:
        student_values = getattr(student, key, [])

        student_vector[key] = []
        words = vocabulary[key]
        for word in words:
            student_vector[key].append(0 if word not in student_values else 1)

    student_vector['study_effort'] = student.study_effort / 5
    student_vector['current_year'] = student.current_year

    return student_vector


def map_to_subjects_vector(subjects):
    base_dir = Path(__file__).resolve().parent
    SUBJECTS_VECTOR_PATH = base_dir / 'management' / 'data' / 'subjects_vector.json'
    with open(SUBJECTS_VECTOR_PATH, 'r', encoding='utf-8') as f:
        subjects_vector = json.load(f)

    filtered_subject_vectors = {}
    for subject in subjects:
        vector = subjects_vector.get(subject.name)
        if vector:
            filtered_subject_vectors[subject.name] = vector
    
    return filtered_subject_vectors


def score_tags(student_vector, subject_vector):
    TAG_GRAPH_PATH = Path(__file__).resolve().parent / 'management' / 'data' / 'tag_graph.json'

    with open(TAG_GRAPH_PATH, 'r', encoding='utf-8') as f:
        tag_graph = json.load(f)

    student_tags = student_vector['tags']
    subject_tags = subject_vector['tags']
    score = 0
    tot_count = 0
    for i in range(len(student_tags)):
        if student_tags[i] == 1 or subject_tags[i] == 1: tot_count += 1
        
        if student_tags[i] == subject_tags[i]: 
            if student_tags[i] == 1:
                score += 1
        else:
            neighbors = tag_graph[str(i)]
            total_weight = sum(weight for _, weight in neighbors)
            if student_tags[i] == 1:
                for neighbor in neighbors: 
                    if subject_tags[neighbor[0]] == 1: score += neighbor[1] / total_weight * BIAS_STUDENT_HAS_ONE
            else:
                for neighbor in neighbors:
                    if student_tags[neighbor[0]] == 1: score += neighbor[1] / total_weight * BIAS_SUBJECT_HAS_ONE
    
    return score / tot_count if tot_count != 0 else 0

def score_for_preferences(student_vector, eligible_subjects):
    filtered_subjects_vector = {}
    for subject in eligible_subjects:
        filtered_subjects_vector[subject] = {}
        values = eligible_subjects[subject]
        for key in student_vector:
            if key in ["index", "study_effort", "current_year"]: continue
            if key == "tags":
                filtered_subjects_vector[subject][key] = score_tags(student_vector, values)
                continue

            student_values = student_vector[key]
            subject_values = values[key]
            tot_count = 0
            match_count = 0

            for i in range(len(student_values)):
                if student_values[i] == 1:
                    tot_count += 1
                    if subject_values[i] == 1:
                        match_count += 1
            
            score = match_count / tot_count if tot_count != 0 else 0
            filtered_subjects_vector[subject][key] = score
        
        study_effort = student_vector["study_effort"]
        
        if study_effort == 0.25 and values['isEasy'] or study_effort == 0.75 and not values['isEasy']:
            filtered_subjects_vector[subject]['effort'] = 1
        else:
            filtered_subjects_vector[subject]['effort'] = 0
            
        filtered_subjects_vector[subject]['activated'] = 1

        filtered_subjects_vector[subject]['participant_score'] = values['participants']

    return filtered_subjects_vector

def get_recommendations(filtered_subjects_vector):
    subject_scores = {}
    max_ = -1
    for subject in filtered_subjects_vector:
        keys = filtered_subjects_vector[subject]
        score = 0
        for key in keys:
            score += WEIGHTS[key] * keys[key]
        max_ = max(score, max_)
        subject_scores[subject] = score
    if max_ == 0: return filtered_subjects_vector.keys()
    for subject in subject_scores:
        subject_scores[subject] /= max_

    top_subjects = list(dict(sorted(subject_scores.items(), key=lambda item: item[1], reverse=True)))[:NUMBER_OF_SUGGESTIONS]
    return top_subjects