from django.db import models


class Exercise(models.Model):

    DIFFICULTY_BEGINNER = "Beginner"
    DIFFICULTY_INTERMEDIATE = "Intermediate"
    DIFFICULTY_ADVANCED = "Advanced"

    DIFFICULTY_CHOICES = [
        (
            DIFFICULTY_BEGINNER,
            "Beginner"
        ),
        (
            DIFFICULTY_INTERMEDIATE,
            "Intermediate"
        ),
        (
            DIFFICULTY_ADVANCED,
            "Advanced"
        ),
    ]


    name = models.CharField(
        max_length=150,
        db_index=True
    )


    muscle_group = models.CharField(
        max_length=100,
        db_index=True
    )


    equipment = models.CharField(
        max_length=100,
        blank=True
    )


    difficulty = models.CharField(
        max_length=20,
        choices=DIFFICULTY_CHOICES,
        default=DIFFICULTY_BEGINNER,
        db_index=True
    )


    description = models.TextField(
        blank=True
    )


    created_at = models.DateTimeField(
        auto_now_add=True
    )


    class Meta:

        ordering = [
            "name"
        ]

        indexes = [
            models.Index(
                fields=[
                    "muscle_group",
                    "difficulty"
                ]
            ),
        ]


    def __str__(self):
        return self.name