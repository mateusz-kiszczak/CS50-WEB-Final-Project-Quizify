from django.urls import path
from . import views

urlpatterns = [
    path('csrf/', views.get_csrf_token, name='get-csrf-token'),
    path('username-check/', views.username_check_view, name='username-check'),
    path('email-check/', views.email_check_view, name='email-check'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('user/', views.current_user_view, name='current_user'),
    
    path('quizzes/get-popular/', views.list_popular_quizzes_view, name='list_popular_quizzes'),
    path('quizzes/get-all/<int:page>', views.list_all_quizzes_view, name='list_all_quizzes'),

    path('quiz/create/', views.create_quiz_view, name='create_quiz'),
    path('quiz/<int:quiz_id>', views.get_quiz, name='get_quiz'),
    path('quiz/<int:quiz_id>/rating/', views.get_quiz_rating, name='get_quiz_rating'),
    path('quiz/<int:quiz_id>/rate-quiz/', views.rate_quiz, name='rate_quiz'),
    path('quiz/<int:quiz_id>/score-quiz/', views.add_quiz_score, name='add_quiz_score'),
    path('quiz/<int:quiz_id>/increase-quiz-times-completed/', views.increase_quiz_times_completed_view, name='increase_quiz_times_completed'),
    path('quiz/<int:quiz_id>/add-comment/', views.add_quiz_comment, name='add_quiz_comment'),
    path('quiz/<int:quiz_id>/get-comments/', views.list_quiz_comments, name='list_quiz_comments'),
    path('quiz/<int:quiz_id>/get-score/', views.get_quiz_score_view, name='get_quiz_score'),

    path('dashboard/taken-quizzes/<int:page>', views.taken_quizzes_view, name='taken_quizzes'),
    path('dashboard/your-quizzes/<int:page>', views.your_quizzes_view, name='your_quizzes'),
    path('dashboard/delete-quiz/<int:quiz_id>', views.delete_quiz_view, name='delete_quiz'),
    path('dashboard/edit-quiz/<int:quiz_id>', views.edit_quiz_view, name='edit_quiz'),
    path('dashboard/edit-quiz/<int:quiz_id>/upload-image/', views.upload_quiz_image_view, name='upload_quiz_image'),
    path('dashboard/edit-quiz/<int:quiz_id>/delete-image/', views.delete_quiz_image_view, name='delete_quiz_image'),
    path('dashboard/edit-quiz/delete-question/<int:question_id>', views.delete_question_view, name='delete_question'),
    path('dashboard/edit-quiz/<int:quiz_id>/add-question/', views.add_question_to_quiz_view, name='add_question_to_quiz'),
    path('dashboard/user/update-password/', views.update_password_view, name="update_password"),
    path('dashboard/user/update-user/', views.update_user_view, name="update_user"),
    path('dashboard/user/update-avatar/', views.update_avatar_view, name="update_avatar"),
    path('dashboard/user/get-user-details/', views.get_user_details_view, name="get_user_details"),
    path('dashboard/user/delete-user/', views.delete_user_view, name="delete_user"),
]