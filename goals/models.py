from django.conf import settings
from django.db import models


class Goal(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="goals",
    )

    title = models.CharField(
        max_length=200
    )

    description = models.TextField(
        blank=True
    )

    is_completed = models.BooleanField(
        default=False,
        db_index=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )


    class Meta:

        ordering = [
            "is_completed",
            "-created_at",
        ]

        indexes = [
            models.Index(
                fields=[
                    "user",
                    "is_completed",
                ]
            ),
        ]


    def __str__(self):
        return self.title