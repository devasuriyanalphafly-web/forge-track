from django.contrib import admin
from .models import Workout, WorkoutExercise, Set

admin.site.register(Workout)
admin.site.register(WorkoutExercise)
admin.site.register(Set)