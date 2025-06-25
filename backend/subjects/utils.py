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
    determines and returns a list of subjects that a student is eligible to enroll in.
    args:
        student: the student instance for whom eligible subjects are being determined.
        season (int, optional): the season to filter subjects by.
            - 0: summer
            - 1: winter
            - 2: all (default)
    returns:
        list: a list of Subject instances that the student is eligible to enroll in.

    eligibility criteria:
        - excludes subjects the student has already passed.
        - filters subjects by the specified season.
        - applies additional filters based on the student's study effort:
            1. only easy subjects from years up to and including the student's current year.
            2. easy and non-easy subjects from years up to and including the student's current year.
            3. easy and non-easy subjects from the student's current year only.
            4. easy and non-easy subjects from the student's current year and above.
            5. only non-easy subjects from the student's current year and above.
        - excludes subjects from levels where the student has already fulfilled the credit limit (L1: 6 credits, L2: 36 credits).
        - further filters subjects to ensure the student meets all prerequisites (credits and required subjects).
        - only includes subjects that are elective for the student's study track.
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

def get_student_vector(student):
    """
    generates a vector representation of a student based on a predefined vocabulary.

    this function loads a vocabulary from a JSON file and constructs a dictionary
    representing the student's attributes as binary vectors, indicating the presence (1)
    or absence (0) of specific words for each attribute. It also normalizes
    the student's study effort and includes the current year.

    args:
        student: an object representing a student
    returns:
        dict: a dictionary containing binary vectors for each vocabulary key, normalized study effort, and current year.
    raises:
        FileNotFoundError: If the vocabulary JSON file is not found.
    """
    base_dir = Path(__file__).resolve().parent
    vocab_file_path = base_dir / 'management' / 'data' / 'vocabulary.json'
    with open(vocab_file_path, 'r', encoding='utf-8') as f:
        vocabulary = json.load(f)

    student_vector = {}
    for key in vocabulary:
        student_values = getattr(student, key, [])

        student_vector[key] = []
        words = vocabulary[key]
        for word in words:
            student_vector[key].append(1 if word in student_values else 0)

    student_vector['study_effort'] = student.study_effort / 5
    student_vector['current_year'] = student.current_year

    return student_vector


def map_to_subjects_vector(subjects):
    """
    map a list of subject objects to their corresponding vector representations.

    args:
        subjects (list): a list of subject objects.
    returns:
        dict: a dictionary mapping subject names to their vector representations, as loaded from 'subjects_vector.json'.
    raises:
        FileNotFoundError: If the subjects vector JSON file is not found.
    """
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
    """
    calculates a similarity score between a student's tag vector and a subject's tag vector,
    using a tag graph to account for relationships between tags.
    the score is computed as follows:
    - for each tag, if both student and subject have the tag (value 1), this is a full match, and the score is incremented.
    - if both tags are zeroes, ignore them.
    - if the tags differ but one of them is 1, this is a partial match. the tag graph is used to find neighboring tags and 
        adjust the score based on the presence of related tags and their respective weights. 
        biases are used to ensure that a partial match will never result in a full increment, i.e., it will never be as valuable as a full match.
    - the score is normalized by the total number of tags where either the student or subject has the tag.

    args:
            student_vector (dict): a dictionary containing a 'tags' key with a list of binary values representing the student's tags.
            subject_vector (dict): a dictionary containing a 'tags' key with a list of binary values representing the subject's tags.
    returns:
            float: the normalized similarity score between the student and subject tag vectors.
    raises:
        FileNotFoundError: if the tag graph JSON file is not found.
    """
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
                # full match
                score += 1
        else:
            # partial match
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
    """
    calculates and returns a dictionary of scores for each eligible subject based on a student's preferences.

    args:
        student_vector (dict): a dictionary representing the student's preferences and attributes. 
        eligible_subjects (dict): a dictionary where each key is a subject name and each value is a dictionary 
    returns:
        dict: A dictionary where each key is a subject name and each value is a dictionary containing scores for each preference key
    notes:
        - the "tags" score is calculated separately and then normalized by the maximum tag score across all subjects.
        - all other preference scores are calculated as the ratio of matching 1's between student and subject vectors.
    """
    subjects_tag_scores = {}
    max_tag_score = 0
    for subject in eligible_subjects:
        subjects_tag_scores[subject] = {}
        subject_vector = eligible_subjects[subject]
        for key in student_vector:
            if key in ["index", "study_effort", "current_year"]: continue
            if key == "tags":
                tag_score = score_tags(student_vector, subject_vector)
                subjects_tag_scores[subject][key] = tag_score
                max_tag_score = max(tag_score, max_tag_score)
                continue

            student_values = student_vector[key]
            subject_values = subject_vector[key]
            tot_count = 0
            match_count = 0

            for i in range(len(student_values)):
                if subject_values[i] == 1:
                    tot_count += 1
                    if student_values[i] == 1:
                        match_count += 1
            
            score = match_count / tot_count if tot_count != 0 else 0
            subjects_tag_scores[subject][key] = score
        
        study_effort = student_vector["study_effort"]
        
        if (study_effort == 0.4 and subject_vector['isEasy']) or (study_effort == 0.8 and not subject_vector['isEasy']):
            subjects_tag_scores[subject]['effort'] = 1
        else:
            subjects_tag_scores[subject]['effort'] = 0
            
        subjects_tag_scores[subject]['activated'] = subject_vector['activated']

        subjects_tag_scores[subject]['participant_score'] = subject_vector['participants']
    
    if max_tag_score != 0:
        for subject in eligible_subjects:
            subjects_tag_scores[subject]['tags'] /= max_tag_score 

    return subjects_tag_scores

def get_recommendations(subjects_tag_scores):
    """
    generates a list of recommended subjects based on weighted scores.

    args:
        filtered_subjects_vector (dict): a dictionary where each key is a subject and each value is another dictionary
            mapping feature keys to their corresponding scores for that subject.
    returns:
        list: a list of top N subject names recommended based on their normalized scores. if all scores are zero, returns empty list.
    """
    subject_scores = {}
    for subject in subjects_tag_scores:
        keys = subjects_tag_scores[subject]
        score = 0
        for key in keys:
            score += WEIGHTS[key] * keys[key]
        subject_scores[subject] = score
    
    top_subjects = list(dict(sorted(subject_scores.items(), key=lambda item: item[1], reverse=True)))[:NUMBER_OF_SUGGESTIONS]
    return top_subjects