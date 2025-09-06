from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Quiz, Question, Answer, Profile, Tag, QuizRating, QuizScore, Comment



# Register your models here.
class QuizAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Quiz._meta.fields]

class QuestionAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Question._meta.fields]

class AnswerAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Answer._meta.fields]

class QuizRatingAdmin(admin.ModelAdmin):
    list_display = [field.name for field in QuizRating._meta.fields]

class QuizScoreAdmin(admin.ModelAdmin):
    list_display = [field.name for field in QuizScore._meta.fields]

class ProfileAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Profile._meta.fields]

class CommentAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Comment._meta.fields]

class TagAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Tag._meta.fields]



admin.site.register(Quiz, QuizAdmin)
admin.site.register(Question, QuestionAdmin)
admin.site.register(Answer, AnswerAdmin)
admin.site.register(QuizRating, QuizRatingAdmin)
admin.site.register(QuizScore, QuizScoreAdmin)
admin.site.register(Profile, ProfileAdmin)
admin.site.register(Comment, CommentAdmin)
admin.site.register(Tag, TagAdmin)

