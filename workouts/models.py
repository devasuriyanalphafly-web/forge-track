from django.conf import settings
from django.db import models

from exercises.models import Exercise


class Workout(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="workouts",
    )

    name = models.CharField(
        max_length=150
    )

    date = models.DateField(
        db_index=True
    )

    notes = models.TextField(
        blank=True
    )

    duration_minutes = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = [
            "-date",
            "-created_at",
        ]

        indexes = [
            models.Index(
                fields=[
                    "user",
                    "date",
                ]
            ),
        ]

    def __str__(self):
        return f"{self.name} - {self.date}"


class WorkoutExercise(models.Model):
    workout = models.ForeignKey(
        Workout,
        on_delete=models.CASCADE,
        related_name="exercises",
    )

    exercise = models.ForeignKey(
        Exercise,
        on_delete=models.PROTECT
    )

    order = models.PositiveIntegerField(
        default=1
    )

    notes = models.CharField(
        max_length=255,
        blank=True
    )

    class Meta:
        ordering = [
            "order",
            "id",
        ]

    def __str__(self):
        return (
            f"{self.workout.name} - "
            f"{self.exercise.name}"
        )


class Set(models.Model):
    workout_exercise = models.ForeignKey(
        WorkoutExercise,
        on_delete=models.CASCADE,
        related_name="sets",
    )

    set_number = models.PositiveIntegerField()

    reps = models.PositiveIntegerField()

    weight = models.FloatField(
        help_text="Weight in kg"
    )

    rpe = models.FloatField(
        null=True,
        blank=True,
        help_text="Rate of Perceived Exertion 1-10"
    )

    class Meta:
        ordering = [
            "set_number",
            "id",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "workout_exercise",
                    "set_number",
                ],
                name=(
                    "unique_set_number_per_"
                    "workout_exercise"
                ),
            ),
        ]

    def __str__(self):
        return (
            f"Set {self.set_number}: "
            f"{self.reps} reps x "
            f"{self.weight} kg"
        )