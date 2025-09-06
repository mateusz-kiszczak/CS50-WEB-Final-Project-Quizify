from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


# Profile
class Profile(models.Model):
    user = models.OneToOneField(User, related_name='profile', on_delete=models.CASCADE)
    first_name = models.CharField(max_length=32, null=True, blank=True)
    last_name = models.CharField(max_length=32, null=True, blank=True)
    country = models.CharField(max_length=32, null=True, blank=True)
    city = models.CharField(max_length=32, null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    last_login_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.user.username
    
    def save(self, *args, **kwargs):
        # Check for the flag to skip avatar processing.
        skip_processing = kwargs.pop("skip_avatar_processing", False)

        # Save first
        super().save(*args, **kwargs)

        if not skip_processing:
            if self.avatar and not getattr(self, "_avatar_processed", False):
                # Mark the instance so we don't process it repeatedly.
                self._avatar_processed = True
                from .utils import resize_and_rename_image, avatar_image_rename
                resize_and_rename_image(self, "avatar", (150, 150), avatar_image_rename)
                
                # Save again after processing if changes were made
                super().save(update_fields=["avatar"])

# Quiz
class Quiz(models.Model):
    title = models.CharField(max_length=256)
    description = models.TextField(max_length=1024, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quizzes', null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    quiz_time_limit = models.PositiveSmallIntegerField(null=True, blank=True)
    times_completed = models.PositiveIntegerField(default=0, null=False, blank=False)
    random_questions_order = models.BooleanField(default=False, null=False, blank=False)
    random_answers_order = models.BooleanField(default=False, null=False, blank=False)
    quiz_image = models.ImageField(upload_to='quiz_images/', null=True, blank=True)

    CATEGORY_CHOICE = [
        ('art', 'Art'),
        ('board_games', 'Board Games'),
        ('brain_teaser', 'Brain Teaser'),
        ('business', 'Business'),
        ('career', 'Career'),
        ('colors', 'Colors'),
        ('diy', 'DIY Crafts'),
        ('famous_quotes', 'Famous Quotes'),
        ('fashion', 'Fashion'),
        ('fitness', 'Fitness'),
        ('food', 'Food'),
        ('fun', 'Fun'),
        ('gadgets', 'Gadgets and Innovations'),
        ('gardening', 'Gardening'),
        ('general', 'General Knowledge'),
        ('geography', 'Geography'),
        ('grammar', 'Grammar'),
        ('health', 'Health'),
        ('history', 'History'),
        ('holidays', 'Holidays'),
        ('home', 'Home'),
        ('language', 'Language'),
        ('leadership', 'Leadership Styles'),
        ('literature', 'Literature'),
        ('logic', 'Logic'),
        ('love', 'Love Life'),
        ('math', 'Math'),
        ('movies', 'Movies'),
        ('music', 'Music'),
        ('nutritious', 'Nutritious'),
        ('other', 'Other'),
        ('parenting', 'Parenting'),
        ('personality', 'Personality'),
        ('poetry', 'Poetry'),
        ('pop', 'Pop Culture'),
        ('productivity', 'Productivity'),
        ('programming', 'Programming'),
        ('science', 'Science & Nature'),
        ('sport', 'Sport'),
        ('statistics', 'Statistics'),
        ('travel', 'Travel'),
        ('tv', 'TV'),
        ('video_games', 'Video Games'),
        ('wellness', 'Wellness and Meditation')
    ]

    category = models.CharField(max_length=32, choices=CATEGORY_CHOICE, default='other')

    def __str__(self):
        return f"{self.title} - {self.created_by.username} - {self.created_at}"
    
    def save(self, *args, **kwargs):
        skip_processing = kwargs.pop("skip_quiz_image_processing", False)
        is_new = self._state.adding
        original_quiz_image = None

        if not is_new and self.pk:
            try:
                original_quiz_image = Quiz.objects.get(pk=self.pk).quiz_image
            except:
                pass

        super().save(*args, **kwargs)

        if (self.quiz_image and
            (is_new or (original_quiz_image and original_quiz_image.name != self.quiz_image.name)) and
            not skip_processing and
            not getattr(self, "_quiz_image_processed", False)):

            self._quiz_image_processed = True

            from .utils import resize_and_rename_image, quiz_image_rename
            resize_and_rename_image(self, "quiz_image", (1200, 600), quiz_image_rename)
    

# Questions
class Question(models.Model):
    QUESTION_TYPE=[
        ('single', 'Single-Choice'),
        ('multiple', 'Multiple-Choice'),
        ('truefalse', 'True or False')
    ]

    quiz = models.ForeignKey(Quiz, related_name='questions', on_delete=models.CASCADE)
    type = models.CharField(max_length=32, choices=QUESTION_TYPE, default='single')
    text = models.CharField(max_length=1024, default='', null=False, blank=False)
    question_time_limit = models.PositiveSmallIntegerField(null=True, blank=True)
    question_image = models.ImageField(upload_to='question_images/', null=True, blank=True)

    def __str__(self):
        return self.text
    
    def save(self, *args, **kwargs):
        skip_processing = kwargs.pop("skip_question_image_processing", False)
        is_new = self._state.adding
        original_question_image = None
        if not is_new and self.pk:
            try:
                original_question_image = Question.objects.get(pk=self.pk).question_image
            except Question.DoesNotExist:
                pass

        super().save(*args, **kwargs)

        if (self.question_image and
            (is_new or (original_question_image and original_question_image.name != self.question_image.name)) and # Check for actual change in image
            not skip_processing and
            not getattr(self, "_question_image_processed", False)):

            self._question_image_processed = True

            from .utils import resize_and_rename_image, question_image_rename
            resize_and_rename_image(self, "question_image", (1200, 900), question_image_rename)



# Answers
class Answer(models.Model):
    question = models.ForeignKey(Question, related_name='answers', on_delete=models.CASCADE)
    text = models.CharField(max_length=256, default='', null=False, blank=False)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text


# Tags
class Tag(models.Model):
    tag = models.CharField(max_length=32, unique=True)
    quizzes = models.ManyToManyField(Quiz, related_name='tags')

    def __str__(self):
        return self.tag
    

# Quiz Ratings
class QuizRating(models.Model):
    quiz = models.ForeignKey(Quiz, related_name='quiz_ratings', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    rating = models.PositiveSmallIntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )

    # Make sure a user can rate a quiz only once
    class Meta:
        unique_together = ('quiz', 'user')

    def __str__(self):
        return f"{self.rating} - {self.user.username} - {self.quiz.title}"
    
    
# Quiz Score
class QuizScore(models.Model):
    quiz = models.ForeignKey(Quiz, related_name='quiz_scores', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    total_questions = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])
    total_correct_answers = models.PositiveSmallIntegerField(validators=[MinValueValidator(0)])
    scored_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quiz.title} - {self.user.username} - {self.total_correct_answers} / {self.total_questions}"
    

# Comments
class Comment(models.Model):
    quiz = models.ForeignKey(Quiz, related_name='comments', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='user_comments', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    text = models.CharField(max_length=1024)

    def __str__(self):
        return f"{self.user.username} - {self.created_at} - {self.quiz.title}"
