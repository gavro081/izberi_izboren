from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.contrib.postgres.fields import ArrayField
from auth_form.models import Student


class Subject(models.Model):
    name = models.TextField(null=False)
    code = models.TextField(null=False)
    abstract = models.TextField()

    def __str__(self):
        return f"{self.code} - {self.name}"
    
    class Meta:
        db_table = "subject"

class Subject_Info(models.Model):
    subject = models.OneToOneField(
        Subject,
        on_delete=models.CASCADE,
        primary_key=True
    )

    level = models.IntegerField(null=False)
    prerequisite = models.JSONField(blank=True, null=True)
    activated = models.BooleanField(null=False)
    participants = ArrayField(models.IntegerField(blank=True))
    mandatory = models.BooleanField(null=False)
    mandatory_for = ArrayField(models.CharField(max_length=16, blank=True))
    semester = models.IntegerField(null=False)
    season = models.TextField(null=False)
    elective_for = ArrayField(models.CharField(max_length=16, blank=True))
    professors = ArrayField(models.CharField(max_length=64, blank=True))
    assistants = ArrayField(models.CharField(max_length=64, blank=True))
    tags = ArrayField(models.CharField(max_length=64, blank=True))
    technologies = ArrayField(models.CharField(max_length=64, blank=True))
    evaluation = ArrayField(models.CharField(max_length=64, blank=True))
    is_easy = models.BooleanField(null=False)

    def __str__(self):
        return f"Subject info for {self.subject.name}"

    class Meta:
        db_table = 'subject_info'


class Review(models.Model):
    REVIEW_TYPE_CHOICES = [
        ("evaluation", "Evaluation"),
        ("other", "Other"),
    ]
    # each review is written by one student
    # one student can write many reviews
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    # each review is about one subject
    # one subject can have many reviews
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    is_confirmed = models.BooleanField(default=False, help_text="Has an admin confirmed this post is valid.")
    votes = models.ManyToManyField(
        Student, through='ReviewVote', related_name='review_votes'
    )
    review_type = models.CharField(max_length=16, choices=REVIEW_TYPE_CHOICES)

    def __str__(self):
        return f"Review #{self.id} for {self.subject.name} from {self.student.index}."

    @property
    def votes_score(self):
        upvotes = self.reviewvote_set.filter(vote_type='up').count()
        downvotes = self.reviewvote_set.filter(vote_type='down').count()
        return upvotes - downvotes


class ReviewVote(models.Model):
    VOTE_TYPES = [
        ('up', 'Upvote'),
        ('down', 'Downvote'),
    ]
    review = models.ForeignKey(Review, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    vote_type = models.CharField(max_length=4, choices=VOTE_TYPES)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['review', 'student'], name='unique_review_per_student')
        ]

class EvaluationReview(models.Model):
    review = models.OneToOneField(Review, on_delete=models.CASCADE)
    signature_condition = models.CharField(max_length=64, blank=True)

class EvaluationMethod(models.Model):
    # one evaluation review could have more evaluation methods
    # example through a project and through exams
    # method A: project: 90%, labs: 10%
    # method B: theory: 35%, practical: 35%, labs: 10%, project: 20%
    # each of these (method A - project, method A - labs, method B - project etc. is a EvaluationComponent)
    evaluation_review = models.ForeignKey(EvaluationReview, on_delete=models.CASCADE, related_name='methods')
    note = models.CharField(max_length=64, null=True, blank=True, help_text="additional info about this particular evaluation method.")

class EvaluationComponent(models.Model):
    CATEGORY_TYPE_CHOICES = [
        ("project", "Project"),
        ("theory", "Theory"),
        ("practical", "Practical"),
        ("homework", "Homework"),
        ("labs", "Labs"),
        ("presentation", "Presentation"),
        ("attendance", "Attendance"),
        # todo: check if there are more
    ]
    evaluation_method = models.ForeignKey(EvaluationMethod, on_delete=models.CASCADE, related_name='components')
    category = models.CharField(max_length=16, choices=CATEGORY_TYPE_CHOICES)
    percentage = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])

    def __str__(self):
        subject = self.evaluation_method.evaluation_review.review.subject.name
        return f"{self.percentage}% of the grade for {subject} is from {self.category}"

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['evaluation_method', 'category'], name='unique_component_per_method')
        ]

class OtherReview(models.Model):
    CATEGORY_TYPE_CHOICES = [
        ("material", "Material"),
        ("staff", "Staff"),
        ("other", "Other"),
    ]
    review = models.OneToOneField(Review, on_delete=models.CASCADE)
    content = models.TextField()
    category = models.CharField(max_length=16, choices=CATEGORY_TYPE_CHOICES)

    def __str__(self):
        return f"Review for {self.category} about {self.review.subject.name}."

