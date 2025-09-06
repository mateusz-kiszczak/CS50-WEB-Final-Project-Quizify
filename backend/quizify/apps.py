from django.apps import AppConfig


class QuizifyConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'quizify'

    # Import signals
    def ready(self):
        import quizify.signals