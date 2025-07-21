from subjects.models import Subject
from pathlib import Path
import json
from django.db.models import Q
import os
from subjects.consts import BIAS_STUDENT_HAS_ONE, BIAS_SUBJECT_HAS_ONE, WEIGHTS, NUMBER_OF_SUGGESTIONS

base_dir = Path(__file__).resolve().parent

VOCAB_FILE_PATH = base_dir / 'management' / 'data' / 'vocabulary.json'
TAG_GRAPH_PATH = base_dir / 'management' / 'data' / 'tag_graph.json'
SUBJECTS_VECTOR_PATH = base_dir / 'management' / 'data' / 'subjects_vector.json'
if not os.path.exists(VOCAB_FILE_PATH) or not os.path.exists(TAG_GRAPH_PATH) or not os.path.exists(SUBJECTS_VECTOR_PATH):
    raise FileNotFoundError("required data files are missing. ensure 'vocabulary.json', 'tag_graph.json', and 'subjects_vector.json' are present in the 'management/data' directory.")

with open(VOCAB_FILE_PATH, 'r', encoding='utf-8') as f:
    VOCABULARY = json.load(f)

with open(SUBJECTS_VECTOR_PATH, 'r', encoding='utf-8') as f:
    SUBJECTS_VECTOR = json.load(f)

with open(TAG_GRAPH_PATH, 'r', encoding='utf-8') as f:
    TAG_GRAPH = json.load(f)

def get_recommendations_cache_key(student, season, not_activated):
    passed_subjects_hash = hash(tuple(sorted(student.passed_subjects.values_list('id', flat=True))))
    cache_key = (f"student_{student.id}_season_{season}_not_activated_{not_activated}_effort_{student.study_effort}"
                 f"_year_{student.current_year}_passed_{passed_subjects_hash}")
    return cache_key

def get_eligible_subjects(student, season = 2, not_activated = 0):
    """
    determines and returns a list of subjects that a student is eligible to enroll in.
    args:
        student: the student instance for whom eligible subjects are being determined.
        season (int, optional): the season to filter subjects by.
            - 0: summer
            - 1: winter
            - 2: all (default)
        not_activated (int, optional): whether to exclude subjects that are not activated.
            - 0: exclude not activated subjects (default)
            - 1: include not activated subjects
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
        .filter(subject_info__elective_for__contains=[study_track])
    )

    if not_activated == 0:
        all_subjects = all_subjects.filter(subject_info__activated=True)

    if season == 0:
        all_subjects = all_subjects.exclude(subject_info__season='W')
    elif season == 1:
        all_subjects = all_subjects.exclude(subject_info__season='S')

    if study_effort < 3:
        all_subjects = all_subjects.exclude(subject_info__semester__gt=current_year * 2)
        if study_effort == 1:
            all_subjects = all_subjects.filter(subject_info__is_easy=True)
    elif study_effort == 3:
        eligible_semesters = [current_year * 2, current_year * 2 - 1]
        all_subjects = all_subjects.filter(
            subject_info__semester__in=eligible_semesters
        )
    else:
        all_subjects = all_subjects.filter(subject_info__semester__gte=(current_year * 2 - 1))
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
        required_subjects = prereqs.get('subjects')
        if required_subjects and not passed_ids.intersection(required_subjects): 
            continue
        valid_subjects.append(subject)

    return valid_subjects

def get_student_vector(student):
    """
    generates a vector representation of a student based on a predefined vocabulary.

    reads form the vocabulary and constructs a dictionary representing the
    student's attributes as binary vectors, indicating the presence (1)
    or absence (0) of specific words for each attribute. it also normalizes
    the student's study effort and includes the current year.

    args:
        student: an object representing a student
    returns:
        dict: a dictionary containing binary vectors for each vocabulary key, normalized study effort,
        and current year.
    """

    student_vector = {}
    for key in VOCABULARY:
        student_values = getattr(student, key, [])

        student_vector[key] = []
        words = VOCABULARY[key]
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
        dict: a dictionary mapping subject names to their vector representations from SUBJECTS_VECTOR .
    """
    filtered_subject_vectors = {}
    for subject in subjects:
        vector = SUBJECTS_VECTOR.get(subject.name)
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
    """
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
            neighbors = TAG_GRAPH[str(i)]
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

def get_explanation_message(criterion, score, student_vector):
    """Generates a human-readable explanation for a single matching criterion."""

    study_effort = student_vector.get('study_effort', 0)
    # Thresholds to decide if a match is significant enough to be an "explanation"
    thresholds = {
        'tags': 0.7, 'evaluation': 0.5, 'technologies': 0.5,
        'professors': 0.5, 'assistants': 0.5, 'participant_score': 0.5,
        'effort': 0 # no threshold for effort, as it is binary
    }

    if score < thresholds.get(criterion, 1.0):
        return None

    if criterion == "effort":
        if round(study_effort * 5) not in (2, 4):  # only show for effort==2 or 4
            return None
        return "Се совпаѓа со твојот вложен труд" if score == 1 else "Не се совпаѓа со твојот вложен труд"
    
    messages = {
        'tags': f"Супер совпаѓање со твоите полиња на интерес ({score:.1%})",
        'evaluation': f"Се совпаѓа со твоите посакувани методи на евалуација ({score:.1%})",
        'technologies': f"Се совпаѓа со технологиите кои ги сакаш ({score:.1%})",
        'professors': f"Го предаваат професори кои ги сакаш ({score:.1%})",
        'assistants': f"Има асистенти кои ги сакаш ({score:.1%})",
        'participant_score': f"Одбран од многу студенти",
    }
    return messages.get(criterion)

# def get_detailed_tag_matches(student_vector, subject_vector):
#     """Identifies the specific tags that matched between the student and subject."""

#     student_tags_indices = {i for i, val in enumerate(student_vector['tags']) if val == 1}
#     subject_tags_indices = {i for i, val in enumerate(subject_vector['tags']) if val == 1}
    
#     matching_indices = student_tags_indices.intersection(subject_tags_indices)
    
#     # Map indices back to tag names from the vocabulary
#     all_tags = VOCABULARY.get('tags', [])
#     matching_tags = [all_tags[i] for i in matching_indices if i < len(all_tags)]
    
#     return matching_tags


def get_recommendations_with_details(subjects_tag_scores, student_vector):
    """
    Generates a sorted list of recommended subjects with detailed explanations.

    Args:
        subjects_tag_scores (dict): Scores for each subject across different criteria.

    Returns:
        list: A list of dictionaries, each containing detailed info for a recommended subject.
    """
    detailed_results = []

    for subject_name, individual_scores in subjects_tag_scores.items():
        total_score = 0
        weighted_scores = {}
        explanations = []

        for criterion, score in individual_scores.items():
            weight = WEIGHTS.get(criterion, 0)
            weighted_score = weight * score
            total_score += weighted_score
            weighted_scores[criterion] = weighted_score
            
            message = get_explanation_message(criterion, score, student_vector)
            if message:
                explanations.append(message)

            # Sort explanations by their match percentage, it extracts the percentage from the message (e.g. Something (72.8%)) and sorts them in descending order
            explanations.sort(key=lambda msg: -(float(msg.split('(')[-1].replace('%)', '')) if '(' in msg and '%' in msg else float('-inf')))
        # primary_reason_criterion = max(weighted_scores, key=weighted_scores.get)
        # primary_reason_score = individual_scores[primary_reason_criterion]
        # primary_reason = get_explanation_message(primary_reason_criterion, primary_reason_score)
        # if not primary_reason:
        #     primary_reason = f"Добро совпаѓање поради {primary_reason_criterion.replace('_', ' ')}"

        # matching_tags = get_detailed_tag_matches(student_vector, eligible_subjects_dict[subject_name])

        detailed_results.append({
            'subject_name': subject_name,
            'total_score': total_score,
            # 'primary_reason': primary_reason,
            'explanations': explanations,
            'detailed_scores': individual_scores,
            # 'matching_tags': matching_tags,
            'match_percentage': min(total_score * 100, 100)
        })


    max_score = max([res['total_score'] for res in detailed_results]) or 1
    for res in detailed_results:
        res['match_percentage'] = round((res['total_score'] / max_score) * 100, 1)

    detailed_results.sort(key=lambda x: x['total_score'], reverse=True)
    return detailed_results[:NUMBER_OF_SUGGESTIONS]
    