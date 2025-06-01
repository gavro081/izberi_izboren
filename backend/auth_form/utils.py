from subjects.models import Subject


def check_prerequisites(has_extracurricular, passed_subjects):
    """
    Checks if all prerequisite requirements are fulfilled based on passed subjects and extracurricular credits.
    """
    
    invalid_subjects = []

    # Track valid subjects as we go
    valid_subject_ids = set(id for id in passed_subjects)
    for subject_id in passed_subjects:
        prereqs = Subject.objects.get(id=subject_id).subject_info.prerequisite
        if 'subjects' in prereqs:
            if not any(prereq in valid_subject_ids for prereq in prereqs['subjects']):
                invalid_subjects.append(subject_id)
                valid_subject_ids.discard(subject_id)
    
    total_credits = len(valid_subject_ids) * 6
    
    pv = Subject.objects.get(name="Професионални вештини").id
    sport = Subject.objects.get(name="Спорт и здравје").id

    if pv in valid_subject_ids or sport in valid_subject_ids:
        total_credits -= 6
    if has_extracurricular:
        total_credits += 6
    
    for subject_id in passed_subjects:
        prereqs = Subject.objects.get(id=subject_id).subject_info.prerequisite
        if 'credits' in prereqs:
            if total_credits < prereqs['credits']:
                invalid_subjects.append(subject_id)
                valid_subject_ids.discard(subject_id)
                total_credits -= 6
    return (True, []) if len(invalid_subjects) == 0 else (False, invalid_subjects)

b = Subject.objects.get(name="Вештачка интелигенција").id
a = Subject.objects.get(name="Бизнис и менаџмент").id
check_prerequisites(False, [a,b])