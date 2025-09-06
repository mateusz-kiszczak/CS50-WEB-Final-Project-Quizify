# quiz_app/views.py
import json
import re
import os

from django.db import transaction
from django.db.models import Count, Max, F, Q, Avg
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.paginator import Paginator
from django.utils import timezone

# A simple way to get a dict from a model instance
from django.forms.models import model_to_dict 
from django.shortcuts import get_object_or_404

from math import ceil

from .models import Quiz, Question, Answer, Profile, Tag, QuizRating, QuizScore, Comment
from .filters import BAD_WORDS, RESTRICTED_WORDS
from quizify.utils import resize_and_rename_image, quiz_image_rename


#
# HELPER FUNCTIONS
#

# Convert Django user object to dict
def user_to_dict(user):
    if not user.is_authenticated:
        return None
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'avatar_url': user.profile.avatar.url if user.profile.avatar else None
    }


# Checks if username contains lowercase letters and digits only.
def validate_username(username):
    if not re.fullmatch(r'^[a-z0-9]+$', username):
        raise ValidationError("Username must contain lowercase letters and digits only.")
    
    if username.lower() in RESTRICTED_WORDS:
        raise ValidationError("This username is reserved and cannot be used.")

    for word in BAD_WORDS:
        if word in username.lower():
            raise ValidationError("Username contains inappropriate language.")

    
# Validate password
def validate_password(password, email_local_part=None):
    errors = []

    if len(password) < 8:
        errors.append("Password must be at least 8 characters long.")

    if not any(char.isupper() for char in password):
        errors.append("Password must contain at least 1 uppecase letter.")

    if not any(char.isdigit() for char in password):
        errors.append("Password must contains at least one digit.")

    allowed_special_chars = "!@#$%^&*"

    if not any(char in allowed_special_chars for char in password):
        errors.append(f"Password must contains at least one special character from the list: {' '.join(allowed_special_chars)}")
    
    if email_local_part and password == email_local_part:
        errors.append("Password can NOT be the same as your email.")

    # Display errors
    if errors:
        raise ValidationError(errors)


@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'message': 'CSRF cookie set for testing'})


def username_check_view(request):
    if request.method == 'GET':
        username = request.GET.get('username', '').strip().lower()
        exists = User.objects.filter(username=username).exists()

        return JsonResponse({'available': not exists})

    return JsonResponse({'error': 'Something went wrong while checking username availability.'}, status=500)
    

# Check if username alredy exists
def email_check_view(request):
    if request.method == 'GET':
        email = request.GET.get('email', '').strip().lower()
        exists = User.objects.filter(email=email).exists()

        return JsonResponse({'available': not exists})
    
    return JsonResponse({'error': 'Something went wrong while checking email availability.'}, status=500)
    

#
# REQUEST FUNCTIONS
#

#
# USER
#

def register_view(request):
    if request.method == 'POST':
        try:     
            # Get and sanitaze data.
            username = request.POST.get('username', '').strip()
            email = request.POST.get('email', '').strip()
            password = request.POST.get('password', '').strip()
            first_name = request.POST.get('first_name', '').strip()
            last_name = request.POST.get('last_name', '').strip()
            country = request.POST.get('country', '').strip()
            city = request.POST.get('city', '').strip()
            avatar = request.FILES.get('avatar')

            # Check if all required fields have data.
            required_fields = [username, email, password, first_name, last_name, country, city]

            if not all(required_fields):
                return JsonResponse({'error': 'All required fields must be filled out.'}, status=400)

            # Check if username and email are unique.
            if User.objects.filter(username=username).exists():
                return JsonResponse({'error': 'This username is already taken.'}, status=400)

            if User.objects.filter(email=email).exists():
                return JsonResponse({'error': 'This email is already registered.'}, status=400)

            # Username can contains lowercases and digits only.
            validate_username(username)

            # Password validation
            validate_password(password, email_local_part=email.split('@')[0])

            # Create new User
            user = User.objects.create_user(
                username=username,
                password=password,
                email=email,
                first_name=first_name,
                last_name=last_name,
            )

            # Create new Profile
            Profile.objects.create(
                user=user,
                first_name=first_name,
                last_name=last_name,
                country=country,
                city=city,
                avatar=avatar,
            )

            return JsonResponse({'message': 'User registered successfully'})
        
        except ValidationError as val_err:
            return JsonResponse({'error': val_err.messages}, status=400)

        except Exception as e:
            return JsonResponse({'error': e})
    
    return JsonResponse({'error': 'Something went wrong during registration.'}, status=500)


def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        identifier = data.get('identifier')
        password = data.get('password')
        user = None

         # Username or email check
        if '@' in identifier:
            try:
                user = User.objects.get(email__iexact=identifier)
            except User.DoesNotExist:
                pass
        else:
            try:
                user = User.objects.get(username__iexact=identifier)
            except User.DoesNotExist:
                pass

        if user:
            authenticated_user = authenticate(username=user.username, password=password)

            if authenticated_user:
                login(request, authenticated_user)

                # Update last login time.
                authenticated_user.profile.last_login_time = timezone.now()
                authenticated_user.profile.save(skip_avatar_processing=True)
                
                # Send profile information in 'user'
                return JsonResponse({'message': 'Login succesful.', 'user': user_to_dict(authenticated_user)})
            else:
                return JsonResponse({'error': 'Invalid credentials.'}, status=400)
            
        return JsonResponse({'error': 'Only POST requests are allowed.'}, status=405)
    
    return JsonResponse({ "error": "Invalid request method." }, status=405)


@login_required
def logout_view(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'message': 'Logout successful!'})
    return JsonResponse({'error': 'Only POST requests are allowed.'}, status=405)


@login_required
def current_user_view(request):
    return JsonResponse({'user': user_to_dict(request.user)})


#
# QUIZZES
#

def list_popular_quizzes_view(request):
    if request.method == 'GET':
        quizzes = Quiz.objects.order_by('-created_at')[:9]
        quizzes_data = []

        for quiz in quizzes:
            quiz_data = model_to_dict(quiz, fields=['id', 'title',  'description'])
            quiz_data['quiz_image_url'] = quiz.quiz_image.url if quiz.quiz_image else None

            # Average rating rounded to ceil.
            avg_rating = quiz.quiz_ratings.aggregate(avg=Avg('rating'))['avg']
            quiz_data['avg_rating'] = ceil(avg_rating) if avg_rating is not None else None

            quizzes_data.append(quiz_data)

        return JsonResponse({'quizzes': quizzes_data})
    
    return JsonResponse({ "error": "Invalid request method." }, status=405)


def list_all_quizzes_view(request, page):
    search_query = request.GET.get('search', '')
    years_query = request.GET.getlist('years')
    categories_query = request.GET.getlist('categories')
    sort_query = request.GET.get('sort', 'newest')

    # Filter quizzes result
    if search_query:
        quizzes = Quiz.objects.filter(
            Q(title__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(tags__tag__icontains=search_query)
        ).distinct()
    else:
        quizzes = Quiz.objects.all()

    # Add average rating
    quizzes = quizzes.annotate(avg_rating=Avg('quiz_ratings__rating'))

    # Sort quizzes
    if sort_query == 'oldest':
        quizzes = quizzes.order_by('created_at')
    elif sort_query == 'title_asc':
        quizzes = quizzes.order_by('title')
    elif sort_query == 'title_desc':
        quizzes = quizzes.order_by('-title')
    elif sort_query == 'rating':
        quizzes = quizzes.annotate(avg_rating=Avg('quiz_ratings__rating')).order_by('-avg_rating', '-times_completed')
    else:
        quizzes = quizzes.order_by('-created_at')


    # Get all existing years and categories for filtering.
    valid_categories = Quiz.objects.values_list('category', flat=True).distinct()
    valid_years = [date.year for date in Quiz.objects.dates('created_at', 'year')]

    filtered_years = [int(y) for y in years_query if y.isdigit() and int(y) in valid_years]
    if filtered_years:
        quizzes = quizzes.filter(created_at__year__in=filtered_years)

    filtered_categories = [c for c in categories_query if c in valid_categories]
    if filtered_categories:
        quizzes = quizzes.filter(category__in=filtered_categories)



    # Paginate results - 12 per page
    paginator = Paginator(quizzes, 12)

    # Chack if page exists 
    if page > paginator.num_pages or page < 1:
        return JsonResponse({ 'error': 'Page out of range.' }, status=404)

    page_obj = paginator.get_page(page)

    quizzes_data = []

    for quiz in page_obj:
        quiz_data = model_to_dict(quiz, fields=['id', 'title',  'description'])
        quiz_data['avg_rating'] = ceil(quiz.avg_rating) if quiz.avg_rating is not None else None
        quiz_data['quiz_image_url'] = quiz.quiz_image.url if quiz.quiz_image else None

        quizzes_data.append(quiz_data)

    response = {
        'quizzes': quizzes_data,
        'years': valid_years,
        'categories': list(valid_categories),
        'pagination': {
            'page': page_obj.number,
            'total_pages': paginator.num_pages,
            'total_items': paginator.count,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous()
        }
    }

    return JsonResponse(response)

#
# QUIZ
#

@login_required
def create_quiz_view(request):
    if request.method == 'POST':
        # Use transaction.atomic() for database integrity and back changes if any step fails.
        with transaction.atomic():
            try:
                # 1. Quiz Data
                title = request.POST.get('title')
                description = request.POST.get('description')
                quiz_time_limit = request.POST.get('quiz_time_limit')
                random_questions_order = request.POST.get('random_questions_order') == 'true'
                random_answers_order = request.POST.get('random_answers_order') == 'true'
                category = request.POST.get('category')
                quiz_image = request.FILES.get('quiz_image')
                # Comma-separated string of tags
                tags_str = request.POST.get('tags', '') 

                if not title:
                    return JsonResponse({'error': 'Quiz title is required.'}, status=400)
                if not category:
                    return JsonResponse({'error': 'Quiz category is required.'}, status=400)
                
                quiz = Quiz.objects.create(
                   title=title,
                   description=description,
                   created_by=request.user,
                   quiz_time_limit=int(quiz_time_limit) if quiz_time_limit else 0,
                   random_questions_order=random_questions_order,
                   random_answers_order=random_answers_order,
                   category=category,
                   quiz_image=quiz_image,
                )

                # 2. Questions and Answers Data
                questions_json = request.POST.get('questions_json')

                if not questions_json:
                     return JsonResponse({'error': 'Questions data is required.'}, status=400)
                
                questions_data = json.loads(questions_json)

                for i, q_data in enumerate(questions_data):
                    question_text = q_data.get('text')
                    question_type = q_data.get('type', 'single')
                    question_time_limit = q_data.get('question_time_limit')
                    answers_data = q_data.get('answers', []) 

                    if not question_text:
                            raise ValueError(f"Question {i+1} text is required.")
                    
                    if not question_type:
                            raise ValueError(f"Question {i+1} type is required.")
                    
                    # Get question image.
                    question_image_key = f'question_image_{i}'
                    question_image = request.FILES.get(question_image_key)
                
                    question = Question.objects.create(
                        quiz=quiz,
                        text=question_text,
                        type=question_type,
                        question_time_limit=int(question_time_limit) if question_time_limit else 0,
                        question_image=question_image,
                    )

                    if not answers_data:
                        raise ValueError(f"Question {i+1} must have at least one answer.")
                    
                    has_correct_answer = False

                    for a_data in answers_data:
                        answer_text = a_data.get('text')
                        is_correct = a_data.get('is_correct', False)

                        if not answer_text:
                            raise ValueError(f"Answer text for question {i+1} is required.")
                        
                        if is_correct:
                            has_correct_answer = True

                        Answer.objects.create(
                            question=question,
                            text=answer_text,
                            is_correct=is_correct
                        )

                    if not has_correct_answer and question_type in ['single', 'multiple']:
                        raise ValueError(f"Question {i+1} must have at least one correct answer.")
                    
                # 3. Tags
                if tags_str:
                    tag_names = [tag.strip() for tag in tags_str.split(',') if tag.strip()]
                    tags_to_add = []

                    for tag_name in tag_names:
                        tag, created = Tag.objects.get_or_create(tag=tag_name)
                        tags_to_add.append(tag)

                    quiz.tags.set(tags_to_add)

                # Re-fetch quiz to get the updated image URL after renaming/resizing and make sure the response contains the correct image URL.
                quiz.refresh_from_db()

                # 4. Response Data

                quiz_data = model_to_dict(quiz, fields=[
                    'id', 'title', 'description', 'created_at', 'updated_at',
                    'quiz_time_limit', 'times_completed', 'random_questions_order',
                    'random_answers_order', 'category'
                ])
                quiz_data['created_by'] = user_to_dict(quiz.created_by)
                quiz_data['quiz_image_url'] = quiz.quiz_image.url if quiz.quiz_image else None

                questions_list = []
                for q in quiz.questions.all():
                    # Re-fetch question to get the updated image URL
                    q.refresh_from_db()
                    q_dict = model_to_dict(q, fields=['id', 'type', 'text', 'question_time_limit'])
                    q_dict['question_image_url'] = q.question_image.url if q.question_image else None
                    q_dict['answers'] = [
                        model_to_dict(a, fields=['id', 'text', 'is_correct']) for a in q.answers.all()
                    ]
                    questions_list.append(q_dict)
                quiz_data['questions'] = questions_list

                quiz_data['tags'] = [tag.tag for tag in quiz.tags.all()]

                return JsonResponse({'message': 'Quiz created successfully!', 'quiz': quiz_data}, status=201)

            except ValueError as ve:
                return JsonResponse({'error': str(ve)}, status=400)
            
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON format for questions_json.'}, status=400)
            
            except Exception as e:
                print(f"Error during quiz creation: {e}")
                return JsonResponse({'error': f'An unexpected error occurred: {e}'}, status=500)
            
    return JsonResponse({'error': 'Only POST requests are allowed.'}, status=405)


def get_quiz(request, quiz_id):
    # Fetch quiz and related questions and answers.
    quiz = get_object_or_404(Quiz.objects.prefetch_related('questions__answers', 'tags', 'quiz_ratings'), pk=quiz_id)

    # Make quiz data.
    quiz_data = {
        'id': quiz.id,
        'title': quiz.title,
        'description': quiz.description,
        'category': quiz.category,
        'created_by': quiz.created_by.username if quiz.created_by else None,
        'created_at': quiz.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        'updated_at': quiz.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
        'quiz_time_limit': quiz.quiz_time_limit,
        'times_completed': quiz.times_completed,
        'random_questions_order': quiz.random_questions_order,
        'random_answers_order': quiz.random_answers_order,
        'quiz_image_url': quiz.quiz_image.url if quiz.quiz_image else None,
        'tags': [tag.tag for tag in quiz.tags.all().order_by('tag')],
        'average_rating': round(quiz.quiz_ratings.aggregate(avg=Avg('rating'))['avg'] or 0, 2) if quiz.quiz_ratings else None,
    }

    # Add questions and answers.
    questions_data = []

    for question in quiz.questions.all():
        questions_data.append({
            'id': question.id,
            'text': question.text,
            'type': question.type,
            'question_time_limit': question.question_time_limit,
            'question_image_url': question.question_image.url if question.question_image else None,
            'answers': [
                {
                    'id': answer.id,
                    'text': answer.text,
                    'is_correct': answer.is_correct
                }
                for answer in question.answers.all()
            ]
        })

    quiz_data['questions'] = questions_data

    return JsonResponse({'quiz': quiz_data})


def get_quiz_rating(request, quiz_id):
    quiz = Quiz.objects.filter(pk=quiz_id).annotate(avg_rating=Avg('quiz_ratings__rating')).first()

    if not quiz:
        return JsonResponse({'error': 'Quiz not found'}, status=404)
    
    avg_rating = quiz.avg_rating or 0
    rounded_rating = ceil(avg_rating)

    return JsonResponse({ 'quiz_rating': rounded_rating })


@login_required
def rate_quiz(request, quiz_id):
    user = request.user
    data = json.loads(request.body)
    rating_value = int(data.get('rating', 5))


    # Check if user is authenticated.
    if not user.is_authenticated:
        return JsonResponse({'error': 'Authentication required.'}, status=401)

    # Check if quiz is already rated by this user.
    already_rated = QuizRating.objects.filter(quiz_id=quiz_id, user=user).exists()

    if already_rated:
        return JsonResponse({'error': 'You have already rated this quiz.'}, status=400)
    
    # Save new rating
    QuizRating.objects.create(quiz_id=quiz_id, user=user, rating=rating_value)

    return JsonResponse({'success': 'Rating submitted.'})


@login_required
def add_quiz_comment(request, quiz_id):
    if request.method == 'POST': 
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON.'}, status=400)

        user = request.user
        text = data.get('comment', '').strip()

        # Check if user is authenticated.
        if not user.is_authenticated:
            return JsonResponse({'error': 'Authentication required.'}, status=401)

        if not text:
            return JsonResponse({'status': 'error', 'message': 'Comment cannot be empty.'})
        
        # Filter text for profane words.
        for word in BAD_WORDS:
            if word in text.lower():
                raise ValidationError("Comment contains inappropriate language.")
        
        if text:
            quiz = get_object_or_404(Quiz, id=quiz_id)

            Comment.objects.create(
                quiz=quiz,
                user=user,
                text=text
            )

            return JsonResponse({ 'status': 'success' })
        
        return JsonResponse({
            'status': 'error',
            'message': 'Invalid comment'
        })
    
    return JsonResponse({ "error": "Invalid request method." }, status=405)


def list_quiz_comments(request, quiz_id):
    comments = Comment.objects.filter(quiz_id=quiz_id).select_related('user').order_by('-created_at')

    comments_data = [
        {
            'id': comment.id,
            'user': comment.user.username,
            'text': comment.text,
            'date': comment.created_at.strftime('%Y/%m/%d'),
            'time': comment.created_at.strftime('%H:%M')
        }
        for comment in comments
    ]

    return JsonResponse({'comments': comments_data})


def add_quiz_score(request, quiz_id):
    if request.method == 'POST':
        user = request.user
        data = json.loads(request.body)
        total_questions = int(data.get('total_questions'))
        total_correct_answers = int(data.get('total_correct_answers'))

        # Save new score.
        QuizScore.objects.create(
            quiz_id = quiz_id,
            user = user if user else None,
            total_questions = total_questions,
            total_correct_answers = total_correct_answers
        )

        return JsonResponse({'success': 'Quiz score added successfully.'})
    
    return JsonResponse({ "error": "Invalid request method." }, status=405)
    

def increase_quiz_times_completed_view(request, quiz_id):
    if request.method == 'PATCH':
        
        Quiz.objects.filter(id=quiz_id).update(times_completed=F('times_completed') + 1)

        return JsonResponse({'success': 'Quiz times completed updated.'}) 
    
    return JsonResponse({ "error": "Invalid request method." }, status=405)
    

def get_quiz_score_view(request, quiz_id):
    quiz_scores = QuizScore.objects.filter(quiz_id=quiz_id)

    if not quiz_scores.exists():
        return JsonResponse({
            'quiz_score': {
                'quiz_highest_score': None,
                'avg_score': 0,
            }
        })

    total_questions = quiz_scores.first().total_questions

    # Highest score (%)
    highest_score_obj = quiz_scores.order_by('-total_correct_answers').first()
    highest_score = round((highest_score_obj.total_correct_answers / total_questions) * 100)

    # Average correct answers (%)
    avg_correct = quiz_scores.aggregate(avg=Avg('total_correct_answers'))['avg'] or 0
    avg_score = ceil((avg_correct / total_questions) * 100)

    return JsonResponse({
        'quiz_score': {
            'highest_score': highest_score,
            'avg_score': avg_score,
        }
    })


#
# USER DASHBOARD
#

@login_required
def taken_quizzes_view(request, page):
    years_query = request.GET.getlist('years')
    categories_query = request.GET.getlist('categories')
    sort_query = request.GET.get('sort', 'newest')

    user = request.user
    quiz_scores = QuizScore.objects.filter(user=user)

    # If quiz score for user does not exists, means user did not take any quizzes yet.
    if not quiz_scores.exists():
        return JsonResponse({
            'user_quiz_scores': {
                'quizzes_taken': 0,
                'total_attempts': 0,
                'quizzes': []
            }
        })
    
    # Filter by year
    valid_years = [date.year for date in QuizScore.objects.dates('scored_at', 'year')]
    filtered_years = [int(y) for y in years_query if y.isdigit() and int(y) in valid_years]

    if filtered_years:
        quiz_scores = quiz_scores.filter(scored_at__year__in=filtered_years)

    # Filter by category
    valid_categories = Quiz.objects.values_list('category', flat=True).distinct()
    filtered_categories = [c for c in categories_query if c in valid_categories]

    if filtered_categories:
        quiz_scores = quiz_scores.filter(quiz__category__in=filtered_categories)

    # Aggregate per quiz
    quiz_stats = quiz_scores.values('quiz').annotate(
        quiz_title=Max('quiz__title'),
        last_taken=Max('scored_at'),
        times_taken=Count('id'),
        avg_correct=Avg('total_correct_answers'),
        best_score=Max('total_correct_answers'),
        total_questions=Max('total_questions')
    )

    # Sorting
    if sort_query == 'title_asc':
        quiz_stats = quiz_stats.order_by('quiz_title')
    elif sort_query == 'title_desc':
        quiz_stats = quiz_stats.order_by('-quiz_title')
    elif sort_query == 'best_score':
        quiz_stats = quiz_stats.order_by('best_score')
    elif sort_query == 'avg_score':
        quiz_stats = quiz_stats.order_by('avg_correct')
    else:
        quiz_stats = quiz_stats.order_by('-last_taken')

    # Pagination
    paginator = Paginator(quiz_stats, 5)
    if page > paginator.num_pages or page < 1:
        return JsonResponse({ 'error': 'Page out of range.' }, status=404)

    page_obj = paginator.get_page(page)

    quizzes_data = []

    for item in page_obj:
        total_questions = item['total_questions'] or 1
        avg_score = ceil((item['avg_correct'] / total_questions) * 100) if item['avg_correct'] is not None else 0
        best_score = round((item['best_score'] / total_questions) * 100) if item['best_score'] is not None else 0

        quizzes_data.append({
            'id': item['quiz'],
            'title': item['quiz_title'],
            'last_taken': item['last_taken'].strftime('%Y/%m/%d'),
            'times_taken': item['times_taken'],
            'avg_score': avg_score,
            'best_score': best_score
        })

    return JsonResponse({
        'user_quiz_scores': {
            'quizzes_taken': quiz_stats.count(),
            'total_attempts': quiz_scores.count(),
            'quizzes': quizzes_data
        },
        'filters': {
            'years': valid_years,
            'categories': list(valid_categories)
        },
        'pagination': {
            'page': page_obj.number,
            'total_pages': paginator.num_pages,
            'items_per_page': paginator.per_page,
            'total_items': paginator.count,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous()
        }
    })

@login_required
def your_quizzes_view(request, page):
    years_query = request.GET.getlist('years')
    categories_query = request.GET.getlist('categories')
    sort_query = request.GET.get('sort', 'newest')

    user = request.user
    user_quizzes = Quiz.objects.filter(created_by=user)

    if not user_quizzes.exists():
        return JsonResponse({
            'your_quizzes': {
                'quizzes_created': 0,
                'total_attempts': 0,
                'average_rating': 0,
                'quizzes': []
            }
        })

    # Filter by year (based on scores)
    valid_years = [date.year for date in QuizScore.objects.dates('scored_at', 'year')]
    filtered_years = [int(y) for y in years_query if y.isdigit() and int(y) in valid_years]

    if filtered_years:
        user_quizzes = user_quizzes.filter(quiz_scores__scored_at__year__in=filtered_years)

    # Filter by category
    valid_categories = Quiz.objects.values_list('category', flat=True).distinct()
    filtered_categories = [c for c in categories_query if c in valid_categories]

    if filtered_categories:
        user_quizzes = user_quizzes.filter(category__in=filtered_categories)

    # Annotate with stats
    quiz_stats = user_quizzes.annotate(
        times_taken=Count('quiz_scores'),
        last_taken=Max('quiz_scores__scored_at'),
        avg_correct=Avg('quiz_scores__total_correct_answers'),
        best_score=Max('quiz_scores__total_correct_answers'),
        total_questions=Max('quiz_scores__total_questions'),
        avg_rating=Avg('quiz_ratings__rating'),
    )

    # Sorting
    if sort_query == 'oldest':
        quiz_stats = quiz_stats.order_by('created_at')
    elif sort_query == 'title_asc':
        quiz_stats = quiz_stats.order_by('title')
    elif sort_query == 'title_desc':
        quiz_stats = quiz_stats.order_by('-title')
    elif sort_query == 'rating':
        quiz_stats = quiz_stats.annotate(avg_rating=Avg('quiz_ratings__rating')).order_by('-avg_rating', '-times_completed')
    elif sort_query == 'popular':
        quiz_stats = quiz_stats.order_by('-times_taken')
    else:
        quiz_stats = quiz_stats.order_by('-created_at')

    # Pagination
    paginator = Paginator(quiz_stats, 5)
    if page > paginator.num_pages or page < 1:
        return JsonResponse({ 'error': 'Page out of range.' }, status=404)

    page_obj = paginator.get_page(page)

    quizzes_data = []
    for quiz in page_obj:
        total_questions = quiz.total_questions or 1
        avg_score = ceil((quiz.avg_correct / total_questions) * 100) if quiz.avg_correct is not None else 0
        best_score = round((quiz.best_score / total_questions) * 100) if quiz.best_score is not None else 0

        quizzes_data.append({
            'id': quiz.id,
            'title': quiz.title,
            'last_taken': quiz.last_taken.strftime('%Y/%m/%d') if quiz.last_taken else None,
            'rating': round(quiz.avg_rating or 0, 2),
            'times_taken': quiz.times_taken,
            'avg_score': avg_score,
            'best_score': best_score
        })

    return JsonResponse({
        'your_quizzes': {
            'quizzes_created': user_quizzes.count(),
            'total_attempts': QuizScore.objects.filter(quiz__in=user_quizzes).count(),
            'average_rating': round(
                QuizRating.objects.filter(quiz__in=user_quizzes).aggregate(avg=Avg('rating'))['avg'] or 0, 2
            ),
            'quizzes': quizzes_data
        },
        'filters': {
            'years': valid_years,
            'categories': list(valid_categories)
        },
        'pagination': {
            'page': page_obj.number,
            'total_pages': paginator.num_pages,
            'items_per_page': paginator.per_page,
            'total_items': paginator.count,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous()
        }
    })


@login_required
def delete_quiz_view(request, quiz_id):
    if request.method == 'DELETE':
        try:
            quiz = get_object_or_404(Quiz, id=quiz_id)

            # Make sure logged in user is quiz creator
            if quiz.created_by != request.user:
                return JsonResponse({'error': 'You do not have permission to delete this quiz.'}, status=403)
            
            quiz.delete()

            return JsonResponse({'success': 'Quiz deleted successfully!'}, status=204)
        
        except Quiz.DoesNotExist:
            return JsonResponse({'error': 'Quiz not found.'}, status=404)
        except Exception as e:
            print(f"Error during quiz deletion: {e}")
            return JsonResponse({'error': f'An unexpected error occurred: {e}'}, status=500)
        
    return JsonResponse({'error': 'Only DELETE requests are allowed.'}, status=405)


@login_required
def edit_quiz_view(request, quiz_id):
    if request.method == 'PATCH':
        user = request.user
        data = json.loads(request.body)
        form_name = data.get('form_name')
        new_value = data.get('new_value')

        quiz = Quiz.objects.filter(id=quiz_id, created_by=user).first()

        if not quiz:
            return JsonResponse({ "error": "Quiz not found." }, status=404)

        # Update quiz title.
        if form_name == 'title':
            if quiz.title.strip().lower() == new_value.strip().lower():
                return JsonResponse({ "error": "New title is identical to existing one." }, status=400)
            
            quiz.title = new_value
            quiz.save()
        
            return JsonResponse({'success': 'Quiz title updated successfully.'}) 
        
        # Update quiz description.
        if form_name == 'description':
            if quiz.description.strip().lower() == new_value.strip().lower():
                return JsonResponse({ "error": "New description is identical to existing one." }, status=400)
            
            quiz.description = new_value
            quiz.save()
        
            return JsonResponse({'success': 'Quiz description updated successfully.'}) 
        
        # Update quiz tags.
        if form_name == 'tags':
            if not isinstance(new_value, list):
                return JsonResponse({ "error": "Tags must be a list of strings." }, status=400)

            new_tags_set = set(tag.strip().lower() for tag in new_value if tag.strip())
            current_tags_set = set(tag.tag.lower() for tag in quiz.tags.all())

            # Tags to add.
            tags_to_add = new_tags_set - current_tags_set

            # Tags to remove.
            tags_to_remove = current_tags_set - new_tags_set

            # Add new tags, if not yet existing.
            for tag_name in tags_to_add:
                tag_obj, created = Tag.objects.get_or_create(tag=tag_name)
                quiz.tags.add(tag_obj)

            # Remove old tag connections.
            for tag_name in tags_to_remove:
                tag_obj = Tag.objects.filter(tag__iexact=tag_name).first()
                if tag_obj:
                    quiz.tags.remove(tag_obj)

            return JsonResponse({ 'success': 'Tags updated successfully.' })
        
        # Update quiz options.
        if form_name == 'options':
            def parse_bool(val):
                if isinstance(val, bool):
                    return val
                return str(val).strip().lower() in ['true', '1', 'yes']

            new_random_questions_order = parse_bool(data.get('random_questions_order'))
            new_random_answers_order = parse_bool(data.get('random_answers_order'))

            new_quiz_time_limit = data.get('quiz_time_limit')

            updated_fields = []

            if quiz.random_questions_order != new_random_questions_order:
                quiz.random_questions_order = new_random_questions_order
                updated_fields.append('random_questions_order')

            if quiz.random_answers_order != new_random_answers_order:
                quiz.random_answers_order = new_random_answers_order
                updated_fields.append('random_answers_order')

            if new_quiz_time_limit is not None:
                try:
                    new_quiz_time_limit = int(new_quiz_time_limit)

                    if 0 <= new_quiz_time_limit < 18000:
                        has_question_time_limits = quiz.questions.filter(question_time_limit__gt=0).exists()

                        if quiz.quiz_time_limit != new_quiz_time_limit and not has_question_time_limits:
                            quiz.quiz_time_limit = new_quiz_time_limit
                            updated_fields.append('quiz_time_limit')
                except ValueError:
                    pass 

            if updated_fields:
                quiz.save()
                return JsonResponse({'success': 'Quiz options updated.'}, status=200)

            return JsonResponse({'error': 'Provided quiz options are the same like before.'})
        
    return JsonResponse({ "error": 'Problem with updating quiz data.' })


@login_required
def delete_quiz_image_view(request, quiz_id):
    if request.method == 'DELETE':
        user = request.user
        quiz = Quiz.objects.filter(id=quiz_id, created_by=user).first()

        if not quiz:
            return JsonResponse({ "error": "Quiz not found." }, status=404)

        if quiz.quiz_image:
            image_path = quiz.quiz_image.path
            # Remove file reference from model.
            quiz.quiz_image.delete(save=False)
            if os.path.exists(image_path):
                # Remove image file.
                os.remove(image_path) 

            quiz.save(update_fields=['quiz_image'])

            return JsonResponse({ 'success': 'Quiz image deleted successfully.' })

        return JsonResponse({ "error": "No image to delete." }, status=400)

    return JsonResponse({ "error": "Invalid request method." }, status=405)


@login_required
def upload_quiz_image_view(request, quiz_id):
    if request.method == 'POST':
        user = request.user
        quiz = Quiz.objects.filter(id=quiz_id, created_by=user).first()

        if not quiz:
            return JsonResponse({ "error": "Quiz not found." }, status=404)

        quiz_image_file = request.FILES.get('quiz_image')
        if not quiz_image_file:
            return JsonResponse({ "error": "No image file provided." }, status=400)

        quiz.quiz_image = quiz_image_file
        quiz.save(update_fields=['quiz_image'])

        resize_and_rename_image(quiz, "quiz_image", (1200, 600), quiz_image_rename)

        return JsonResponse({ 'success': 'New quiz image uploaded successfully.' })

    return JsonResponse({ "error": "Invalid request method." }, status=405)


@login_required
def delete_question_view(request, question_id):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Only DELETE requests allowed.'}, status=405)

    print(question_id)

    question = get_object_or_404(Question, id=question_id)

    # Delete image file if exists.
    if question.question_image:
        image_path = question.question_image.path
        if os.path.isfile(image_path):
            os.remove(image_path)

    # Delete the question.
    question.delete()

    return JsonResponse({'success': f'Question {question_id} deleted successfully.'}, status=200)


@login_required
def add_question_to_quiz_view(request, quiz_id):
    if request.method == 'POST':
        with transaction.atomic():
            try:
                # 1. Fetch Quiz
                try:
                    quiz = Quiz.objects.get(id=quiz_id, created_by=request.user)
                except Quiz.DoesNotExist:
                    return JsonResponse({'error': 'Quiz not found or access denied.'}, status=404)

                # 2. Question Data
                question_json = request.POST.get('question_json')
                if not question_json:
                    return JsonResponse({'error': 'Question data is required.'}, status=400)

                q_data = json.loads(question_json)
                question_text = q_data.get('text')
                question_type = q_data.get('type', 'single')
                question_time_limit = q_data.get('question_time_limit')
                answers_data = q_data.get('answers', [])

                if not question_text:
                    raise ValueError("Question text is required.")
                if not question_type:
                    raise ValueError("Question type is required.")
                if not answers_data:
                    raise ValueError("At least one answer is required.")

                # Question image
                question_image = request.FILES.get('question_image')

                question = Question.objects.create(
                    quiz=quiz,
                    text=question_text,
                    type=question_type,
                    question_time_limit=int(question_time_limit) if question_time_limit else 0,
                    question_image=question_image,
                )

                has_correct_answer = False
                for a_data in answers_data:
                    answer_text = a_data.get('text')
                    is_correct = a_data.get('is_correct', False)

                    if not answer_text:
                        raise ValueError("Answer text is required.")
                    if is_correct:
                        has_correct_answer = True

                    Answer.objects.create(
                        question=question,
                        text=answer_text,
                        is_correct=is_correct
                    )

                if not has_correct_answer and question_type in ['single', 'multiple']:
                    raise ValueError("At least one correct answer is required.")

                # 3. Response
                question.refresh_from_db()
                q_dict = model_to_dict(question, fields=['id', 'type', 'text', 'question_time_limit'])
                q_dict['question_image_url'] = question.question_image.url if question.question_image else None
                q_dict['answers'] = [
                    model_to_dict(a, fields=['id', 'text', 'is_correct']) for a in question.answers.all()
                ]

                return JsonResponse({'success': 'Question added successfully!', 'question': q_dict}, status=201)

            except ValueError as ve:
                return JsonResponse({'error': str(ve)}, status=400)
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON format for question_json.'}, status=400)
            except Exception as e:
                print(f"Error during question addition: {e}")
                return JsonResponse({'error': f'An unexpected error occurred: {e}'}, status=500)

    return JsonResponse({'error': 'Only POST requests are allowed.'}, status=405)

@login_required
def update_password_view(request):
    if request.method == 'PATCH':
        try:
            data = json.loads(request.body)
            current_password = data.get('current_password')
            new_password = data.get('new_password')
            repeat_password = data.get('repeat_password')

            user = request.user

            # Check current password
            if not user.check_password(current_password):
                return JsonResponse({'error': 'Current password is incorrect.'}, status=400)

            # Check new passwords match
            if new_password != repeat_password:
                return JsonResponse({'error': 'New passwords do not match.'}, status=400)

            # Validate new password
            try:
                validate_password(new_password, user=user)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=400)

            # 4. Update password
            user.set_password(new_password)
            user.save()

            return JsonResponse({'success': 'Password updated successfully.'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format.'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'Unexpected error: {str(e)}'}, status=500)
        
    return JsonResponse({ "error": "Invalid request method." }, status=405)


@login_required
def get_user_details_view(request):
    user = request.user
    profile = user.profile

    user_data = {
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'country': profile.country,
        'city': profile.city,
        'last_login_time': profile.last_login_time.strftime('%Y/%m/%d - %H:%M:%S') if profile.last_login_time else None,
        'date_joined': user.date_joined.strftime('%Y/%m/%d') if user.date_joined else None,
    }

    return JsonResponse({'user': user_data}, status=200)


@login_required
def update_user_view(request):
    if request.method != 'PATCH':
        return JsonResponse({'error': 'Only PATCH requests are allowed.'}, status=405)

    try:
        data = json.loads(request.body)
        user = request.user
        profile = user.profile

        # Extract and sanitize fields
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        country = data.get('country', '').strip()
        city = data.get('city', '').strip()

        updated_fields = []

        # Username update
        if username and username != user.username:
            if User.objects.filter(username=username).exclude(id=user.id).exists():
                return JsonResponse({'error': 'This username is already taken.'}, status=400)
            validate_username(username)
            user.username = username
            updated_fields.append('username')

        # Email update
        if email and email != user.email:
            if User.objects.filter(email=email).exclude(id=user.id).exists():
                return JsonResponse({'error': 'This email is already registered.'}, status=400)
            user.email = email
            updated_fields.append('email')

        # First and last name
        if first_name and first_name != user.first_name:
            user.first_name = first_name
            profile.first_name = first_name
            updated_fields.append('first_name')

        if last_name and last_name != user.last_name:
            user.last_name = last_name
            profile.last_name = last_name
            updated_fields.append('last_name')

        # Country and city
        if country and country != profile.country:
            profile.country = country
            updated_fields.append('country')

        if city and city != profile.city:
            profile.city = city
            updated_fields.append('city')

        if updated_fields:
            user.save()
            profile.save(skip_avatar_processing=True)
            return JsonResponse({'success': 'User data updated.', 'updated_fields': updated_fields}, status=200)

        return JsonResponse({'error': 'No changes detected.'}, status=400)

    except ValidationError as ve:
        return JsonResponse({'error': ve.messages}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Unexpected error: {str(e)}'}, status=500)
    

@login_required
def update_avatar_view(request):
    if request.method == 'POST':
        user = request.user
        profile = user.profile
        avatar_file = request.FILES.get('avatar')

        if not avatar_file:
            return JsonResponse({'error': 'No avatar file provided.'}, status=400)

        profile.avatar = avatar_file
        profile.save(skip_avatar_processing=False)  # Let your custom processing run

        return JsonResponse({
            'success': 'Avatar updated successfully.'}, status=200)
    
    return JsonResponse({ "error": "Invalid request method." }, status=405)


@login_required
def delete_user_view(request):
    data = json.loads(request.body)
    password = data.get('password')
    user = request.user

    authenticated_user = authenticate(username=user.username, password=password)

    if not authenticated_user:
        return JsonResponse({'error': 'Password does not match.'}, status=400)
    else:
        try:
            username = user.username
            user.delete()
    
            return JsonResponse({'success': f'User "{username}" and profile deleted successfully.'},    status=200)
        except Exception as e:
            return JsonResponse({'error': f'Failed to delete user: {str(e)}'}, status=500)
