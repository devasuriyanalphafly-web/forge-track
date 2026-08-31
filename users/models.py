import secrets
from datetime import timedelta

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


# =========================================================
# USER
# =========================================================

class User(AbstractUser):

    email = models.EmailField(
        unique=True
    )

    profile_picture = models.ImageField(
        upload_to="profiles/",
        null=True,
        blank=True
    )

    date_of_birth = models.DateField(
        null=True,
        blank=True
    )

    height = models.FloatField(
        null=True,
        blank=True,
        help_text="Height in cm"
    )

    weight = models.FloatField(
        null=True,
        blank=True,
        help_text="Weight in kg"
    )

    fitness_goal = models.CharField(
        max_length=100,
        blank=True
    )

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = [
        "username"
    ]

    def __str__(self):
        return self.email


# =========================================================
# PASSWORD RESET OTP
# =========================================================

class PasswordResetOTP(models.Model):

    email = models.EmailField(
        db_index=True
    )

    otp = models.CharField(
        max_length=6
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True
    )

    is_used = models.BooleanField(
        default=False
    )

    class Meta:
        ordering = [
            "-created_at"
        ]

    def is_valid(self):

        return (
            not self.is_used
            and
            timezone.now() - self.created_at
            < timedelta(minutes=10)
        )

    @staticmethod
    def generate_otp():

        return (
            f"{secrets.randbelow(900000) + 100000:06d}"
        )

    def __str__(self):

        status = (
            "used"
            if self.is_used
            else "active"
        )

        return (
            f"OTP for {self.email} "
            f"({status})"
        )


# =========================================================
# REGISTRATION OTP
# =========================================================

class RegistrationOTP(models.Model):

    email = models.EmailField(
        db_index=True
    )

    otp = models.CharField(
        max_length=6
    )

    username = models.CharField(
        max_length=150
    )

    first_name = models.CharField(
        max_length=150,
        blank=True
    )

    last_name = models.CharField(
        max_length=150,
        blank=True
    )

    password = models.CharField(
        max_length=255
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True
    )

    is_used = models.BooleanField(
        default=False
    )

    class Meta:
        ordering = [
            "-created_at"
        ]

    def is_valid(self):

        return (
            not self.is_used
            and
            timezone.now() - self.created_at
            < timedelta(minutes=10)
        )

    @staticmethod
    def generate_otp():

        return (
            f"{secrets.randbelow(900000) + 100000:06d}"
        )

    def __str__(self):

        status = (
            "used"
            if self.is_used
            else "active"
        )

        return (
            f"Registration OTP for "
            f"{self.email} ({status})"
        )