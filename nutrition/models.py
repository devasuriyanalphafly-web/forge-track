from django.conf import settings
from django.db import models


# =========================================================
# WEIGHT LOG
# =========================================================

class WeightLog(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="weight_logs",
    )

    weight = models.DecimalField(
        max_digits=5,
        decimal_places=1
    )

    date = models.DateField(
        db_index=True
    )

    note = models.CharField(
        max_length=200,
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

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "user",
                    "date",
                ],
                name=(
                    "unique_weight_log_"
                    "per_user_date"
                ),
            )
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

        return (
            f"{self.user} - "
            f"{self.weight} kg "
            f"on {self.date}"
        )


# =========================================================
# WEIGHT GOAL
# =========================================================

class WeightGoal(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="weight_goal",
    )

    target_weight = models.DecimalField(
        max_digits=5,
        decimal_places=1
    )

    start_weight = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )


    def __str__(self):

        return (
            f"{self.user} -> "
            f"{self.target_weight} kg"
        )


# =========================================================
# DIET PLAN
# =========================================================

class DietPlan(models.Model):

    GOAL_WEIGHT_LOSS = "weight_loss"
    GOAL_WEIGHT_GAIN = "weight_gain"
    GOAL_MAINTENANCE = "maintenance"


    GOAL_CHOICES = [
        (
            GOAL_WEIGHT_LOSS,
            "Weight Loss"
        ),

        (
            GOAL_WEIGHT_GAIN,
            "Weight Gain / Muscle"
        ),

        (
            GOAL_MAINTENANCE,
            "Maintenance"
        ),
    ]


    name = models.CharField(
        max_length=100
    )

    goal = models.CharField(
        max_length=20,
        choices=GOAL_CHOICES,
        db_index=True
    )

    description = models.TextField()

    daily_calories = models.PositiveIntegerField()

    protein_g = models.PositiveIntegerField()

    carbs_g = models.PositiveIntegerField()

    fat_g = models.PositiveIntegerField()

    duration_weeks = models.PositiveIntegerField(
        default=4
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True
    )


    class Meta:

        ordering = [
            "goal",
            "name",
        ]


    def __str__(self):
        return self.name


# =========================================================
# RECIPE
# =========================================================

class Recipe(models.Model):

    CATEGORY_BREAKFAST = "breakfast"
    CATEGORY_LUNCH = "lunch"
    CATEGORY_DINNER = "dinner"
    CATEGORY_SNACK = "snack"
    CATEGORY_SMOOTHIE = "smoothie"


    CATEGORY_CHOICES = [
        (
            CATEGORY_BREAKFAST,
            "Breakfast"
        ),

        (
            CATEGORY_LUNCH,
            "Lunch"
        ),

        (
            CATEGORY_DINNER,
            "Dinner"
        ),

        (
            CATEGORY_SNACK,
            "Snack"
        ),

        (
            CATEGORY_SMOOTHIE,
            "Smoothie"
        ),
    ]


    name = models.CharField(
        max_length=120,
        db_index=True
    )

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        db_index=True
    )

    description = models.TextField()

    ingredients = models.TextField(
        help_text=(
            "Enter one ingredient per line"
        )
    )

    instructions = models.TextField()

    calories = models.PositiveIntegerField()

    protein_g = models.PositiveIntegerField()

    prep_time_min = models.PositiveIntegerField(
        default=15
    )

    is_vegetarian = models.BooleanField(
        default=False
    )

    is_vegan = models.BooleanField(
        default=False
    )

    image_url = models.URLField(
        blank=True
    )


    class Meta:

        ordering = [
            "name"
        ]


    def __str__(self):
        return self.name


# =========================================================
# FAVORITE RECIPE
# =========================================================

class FavoriteRecipe(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorite_recipes",
    )

    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE,
        related_name="favorited_by",
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )


    class Meta:

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "user",
                    "recipe",
                ],
                name=(
                    "unique_favorite_recipe"
                ),
            )
        ]


    def __str__(self):

        return (
            f"{self.user} - "
            f"{self.recipe.name}"
        )