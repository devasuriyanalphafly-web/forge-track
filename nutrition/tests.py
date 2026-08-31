from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from .models import (
    DietPlan,
    FavoriteRecipe,
    Recipe,
    WeightGoal,
    WeightLog,
)


User = get_user_model()


class NutritionAPITests(APITestCase):

    def setUp(self):

        self.user1 = User.objects.create_user(
            username="nutritionuser1",
            email="nutrition1@forgetrack.com",
            password="StrongPassword123!",
        )

        self.user2 = User.objects.create_user(
            username="nutritionuser2",
            email="nutrition2@forgetrack.com",
            password="StrongPassword123!",
        )

        self.diet = DietPlan.objects.create(
            name="Fat Loss Plan",
            goal="weight_loss",
            description="High protein calorie deficit",
            daily_calories=2000,
            protein_g=150,
            carbs_g=200,
            fat_g=60,
            duration_weeks=8,
            is_active=True,
        )

        self.inactive_diet = DietPlan.objects.create(
            name="Hidden Plan",
            goal="maintenance",
            description="Inactive plan",
            daily_calories=2200,
            protein_g=120,
            carbs_g=250,
            fat_g=70,
            is_active=False,
        )

        self.recipe = Recipe.objects.create(
            name="Protein Oats",
            category="breakfast",
            description="High protein breakfast",
            ingredients="Oats\nMilk\nProtein powder",
            instructions="Mix and cook",
            calories=450,
            protein_g=35,
            prep_time_min=10,
            is_vegetarian=True,
            is_vegan=False,
        )

        self.vegan_recipe = Recipe.objects.create(
            name="Vegan Smoothie",
            category="smoothie",
            description="Plant based smoothie",
            ingredients="Banana\nSoy milk",
            instructions="Blend everything",
            calories=300,
            protein_g=20,
            prep_time_min=5,
            is_vegetarian=True,
            is_vegan=True,
        )


    # =====================================================
    # WEIGHT AUTHENTICATION
    # =====================================================

    def test_weight_logs_require_authentication(self):

        response = self.client.get(
            "/api/weight/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )


    # =====================================================
    # CREATE WEIGHT LOG
    # =====================================================

    def test_user_can_create_weight_log(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.post(
            "/api/weight/",
            {
                "weight": 75.5,
                "date": "2026-08-25",
                "note": "Morning weight",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            WeightLog.objects.filter(
                user=self.user1,
                weight=75.5,
            ).exists()
        )


    # =====================================================
    # WEIGHT VALIDATION
    # =====================================================

    def test_invalid_low_weight_fails(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.post(
            "/api/weight/",
            {
                "weight": 10,
                "date": "2026-08-25",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )


    def test_invalid_high_weight_fails(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.post(
            "/api/weight/",
            {
                "weight": 600,
                "date": "2026-08-25",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )


    # =====================================================
    # USER ISOLATION
    # =====================================================

    def test_user_only_sees_own_weight_logs(self):

        WeightLog.objects.create(
            user=self.user1,
            weight=75,
            date="2026-08-20",
        )

        WeightLog.objects.create(
            user=self.user2,
            weight=90,
            date="2026-08-20",
        )

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.get(
            "/api/weight/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        data = (
            response.data["results"]
            if isinstance(response.data, dict)
            and "results" in response.data
            else response.data
        )

        self.assertEqual(
            len(data),
            1,
        )

        self.assertEqual(
            float(data[0]["weight"]),
            75.0,
        )


    # =====================================================
    # WEIGHT PROGRESS
    # =====================================================

    def test_weight_progress_calculation(self):

        WeightLog.objects.create(
            user=self.user1,
            weight=80,
            date="2026-08-01",
        )

        WeightLog.objects.create(
            user=self.user1,
            weight=75,
            date="2026-08-20",
        )

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.get(
            "/api/weight/progress/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["start_weight"],
            80.0,
        )

        self.assertEqual(
            response.data["current_weight"],
            75.0,
        )

        self.assertEqual(
            response.data["change_kg"],
            -5.0,
        )

        self.assertEqual(
            response.data["goal_direction"],
            "loss",
        )


    # =====================================================
    # WEIGHT GOAL
    # =====================================================

    def test_user_can_create_weight_goal(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.post(
            "/api/weight-goal/",
            {
                "target_weight": 70,
                "start_weight": 80,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            WeightGoal.objects.filter(
                user=self.user1,
                target_weight=70,
            ).exists()
        )


    def test_post_updates_existing_weight_goal(self):

        WeightGoal.objects.create(
            user=self.user1,
            target_weight=70,
            start_weight=80,
        )

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.post(
            "/api/weight-goal/",
            {
                "target_weight": 68,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        goal = WeightGoal.objects.get(
            user=self.user1
        )

        self.assertEqual(
            float(goal.target_weight),
            68.0,
        )


    # =====================================================
    # DIETS
    # =====================================================

    def test_diets_are_public(self):

        response = self.client.get(
            "/api/diets/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )


    def test_inactive_diets_are_hidden(self):

        response = self.client.get(
            "/api/diets/"
        )

        data = (
            response.data["results"]
            if isinstance(response.data, dict)
            and "results" in response.data
            else response.data
        )

        names = [
            item["name"]
            for item in data
        ]

        self.assertIn(
            "Fat Loss Plan",
            names,
        )

        self.assertNotIn(
            "Hidden Plan",
            names,
        )


    def test_diet_goal_filter_works(self):

        response = self.client.get(
            "/api/diets/?goal=weight_loss"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        data = (
            response.data["results"]
            if isinstance(response.data, dict)
            and "results" in response.data
            else response.data
        )

        self.assertTrue(
            all(
                item["goal"] == "weight_loss"
                for item in data
            )
        )


    # =====================================================
    # RECIPES
    # =====================================================

    def test_recipes_are_public(self):

        response = self.client.get(
            "/api/recipes/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )


    def test_recipe_category_filter_works(self):

        response = self.client.get(
            "/api/recipes/?category=smoothie"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        data = (
            response.data["results"]
            if isinstance(response.data, dict)
            and "results" in response.data
            else response.data
        )

        self.assertTrue(
            all(
                item["category"] == "smoothie"
                for item in data
            )
        )


    def test_vegan_filter_works(self):

        response = self.client.get(
            "/api/recipes/?vegan=true"
        )

        data = (
            response.data["results"]
            if isinstance(response.data, dict)
            and "results" in response.data
            else response.data
        )

        self.assertTrue(
            all(
                item["is_vegan"]
                for item in data
            )
        )


    # =====================================================
    # FAVORITES
    # =====================================================

    def test_favorite_requires_authentication(self):

        response = self.client.post(
            f"/api/recipes/{self.recipe.id}/favorite/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )


    def test_user_can_favorite_recipe(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.post(
            f"/api/recipes/{self.recipe.id}/favorite/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertTrue(
            FavoriteRecipe.objects.filter(
                user=self.user1,
                recipe=self.recipe,
            ).exists()
        )

        self.assertTrue(
            response.data["is_favorited"]
        )


    def test_second_favorite_request_removes_favorite(self):

        FavoriteRecipe.objects.create(
            user=self.user1,
            recipe=self.recipe,
        )

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.post(
            f"/api/recipes/{self.recipe.id}/favorite/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertFalse(
            FavoriteRecipe.objects.filter(
                user=self.user1,
                recipe=self.recipe,
            ).exists()
        )

        self.assertFalse(
            response.data["is_favorited"]
        )


    def test_favorites_endpoint_only_returns_user_favorites(self):

        FavoriteRecipe.objects.create(
            user=self.user1,
            recipe=self.recipe,
        )

        FavoriteRecipe.objects.create(
            user=self.user2,
            recipe=self.vegan_recipe,
        )

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.get(
            "/api/recipes/favorites/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        data = (
            response.data["results"]
            if isinstance(response.data, dict)
            and "results" in response.data
            else response.data
        )

        ids = [
            item["id"]
            for item in data
        ]

        self.assertIn(
            self.recipe.id,
            ids,
        )

        self.assertNotIn(
            self.vegan_recipe.id,
            ids,
        )