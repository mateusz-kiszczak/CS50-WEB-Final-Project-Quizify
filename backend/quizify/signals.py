import os

from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.conf import settings

from .models import Quiz, Question, Profile

@receiver(pre_delete, sender=Quiz)
def delete_quiz_image_on_delete(sender, instance, **kwargs):
    if instance.quiz_image:
        if os.path.isfile(instance.quiz_image.path):
            os.remove(instance.quiz_image.path)

            print(f"Deleted quiz image file: {instance.quiz_image.path}")
        else:
            print(f"Quiz image file not found, skipping deletion: {instance.quiz_image.path}")

@receiver(pre_delete, sender=Question)
def delete_question_image_on_delete(sender, instance, **kwargs):
    if instance.question_image:
        if os.path.isfile(instance.question_image.path):
            os.remove(instance.question_image.path)

            print(f"Deleted question image file: {instance.question_image.path}")
        else:
            print(f"Question image file not found, skipping deletion: {instance.question_image.path}")

@receiver(pre_delete, sender=Profile)
def delete_avatar_image_on_delete(sender, instance, **kwargs):
    if instance.avatar: 
        if os.path.isfile(instance.avatar.path):
            os.remove(instance.avatar.path)

            print(f"Deleted avatar image file: {instance.avatar.path}")
        else:
            print(f"Avatar file not found, skipping deletion: {instance.avatar.path}")
