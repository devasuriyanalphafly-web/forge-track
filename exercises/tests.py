from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from .models import Exercise


User = get_user_model()


class ExerciseAPITests(APITestCase):

    def setUp(self):

        self.normal_user = User.objects.create_user(
            username="exerciseuser",
            email="exerciseuser@forgetrack.com",
            password="StrongPassword123!",
        )

        self.admin_user = User.objects.create_superuser(
            username="exerciseadmin",
            email="exerciseadmin@forgetrack.com",
            password="StrongPassword123!",
        )

        self.bench = Exercise.objects.create(
            name="Bench Press",
            muscle_group="Chest",
            equipment="Barbell",
            difficulty="Intermediate",
            description="Compound chest exercise",
        )

        self.squat = Exercise.objects.create(
            name="Squat",
            muscle_group="Legs",
            equipment="Barbell",
            difficulty="Advanced",
            description="Compound leg exercise",
        )

        self.pushup = Exercise.objects.create(
            name="Push Up",
            muscle_group="Chest",
            equipment="Bodyweight",
            difficulty="Beginner",
            description="Bodyweight pushing exercise",
        )

        self.base_url = "/api/exercises/"


    # =====================================================
    # PUBLIC READ ACCESS
    # =====================================================

    def test_exercise_list_is_public(self):

        response = self.client.get(
            self.base_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )


    def test_exercise_detail_is_public(self):

        response = self.client.get(
            f"{self.base_url}{self.bench.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["name"],
            "Bench Press",
        )


    # =====================================================
    # NORMAL USER CANNOT MODIFY MASTER LIBRARY
    # =====================================================

    def test_normal_user_cannot_create_exercise(self):

        self.client.force_authenticate(
            user=self.normal_user
        )

        response = self.client.post(
            self.base_url,
            {
                "name": "Deadlift",
                "muscle_group": "Back",
                "equipment": "Barbell",
                "difficulty": "Advanced",
                "description": "Compound pulling exercise",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )


    def test_normal_user_cannot_update_exercise(self):

        self.client.force_authenticate(
            user=self.normal_user
        )

        response = self.client.patch(
            f"{self.base_url}{self.bench.id}/",
            {
                "name": "Changed Name",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )


    def test_normal_user_cannot_delete_exercise(self):

        self.client.force_authenticate(
            user=self.normal_user
        )

        response = self.client.delete(
            f"{self.base_url}{self.bench.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )


    # =====================================================
    # ADMIN CRUD
    # =====================================================

    def test_admin_can_create_exercise(self):

        self.client.force_authenticate(
            user=self.admin_user
        )

        response = self.client.post(
            self.base_url,
            {
                "name": "Deadlift",
                "muscle_group": "Back",
                "equipment": "Barbell",
                "difficulty": "Advanced",
                "description": "Compound pulling exercise",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            Exercise.objects.filter(
                name="Deadlift"
            ).exists()
        )


    def test_admin_can_update_exercise(self):

        self.client.force_authenticate(
            user=self.admin_user
        )

        response = self.client.patch(
            f"{self.base_url}{self.bench.id}/",
            {
                "difficulty": "Advanced",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.bench.refresh_from_db()

        self.assertEqual(
            self.bench.difficulty,
            "Advanced",
        )


    def test_admin_can_delete_exercise(self):

        self.client.force_authenticate(
            user=self.admin_user
        )

        response = self.client.delete(
            f"{self.base_url}{self.pushup.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            Exercise.objects.filter(
                id=self.pushup.id
            ).exists()
        )


    # =====================================================
    # VALIDATION
    # =====================================================

    def test_short_exercise_name_fails(self):

        self.client.force_authenticate(
            user=self.admin_user
        )

        response = self.client.post(
            self.base_url,
            {
                "name": "A",
                "muscle_group": "Chest",
                "difficulty": "Beginner",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "name",
            response.data,
        )


    def test_short_muscle_group_fails(self):

        self.client.force_authenticate(
            user=self.admin_user
        )

        response = self.client.post(
            self.base_url,
            {
                "name": "Valid Exercise",
                "muscle_group": "A",
                "difficulty": "Beginner",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "muscle_group",
            response.data,
        )


    # =====================================================
    # FILTERING
    # =====================================================

    def test_filter_by_muscle_group(self):

        response = self.client.get(
            f"{self.base_url}?muscle_group=Chest"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        data = response.data["results"]

        self.assertTrue(
            all(
                item["muscle_group"] == "Chest"
                for item in data
            )
        )


    def test_filter_by_difficulty(self):

        response = self.client.get(
            f"{self.base_url}?difficulty=Advanced"
        )

        data = response.data["results"]

        self.assertTrue(
            all(
                item["difficulty"] == "Advanced"
                for item in data
            )
        )


    def test_filter_by_equipment(self):

        response = self.client.get(
            f"{self.base_url}?equipment=Barbell"
        )

        data = response.data["results"]

        names = [
            item["name"]
            for item in data
        ]

        self.assertIn(
            "Bench Press",
            names,
        )

        self.assertIn(
            "Squat",
            names,
        )

        self.assertNotIn(
            "Push Up",
            names,
        )


    # =====================================================
    # SEARCH
    # =====================================================

    def test_search_exercises(self):

        response = self.client.get(
            f"{self.base_url}?search=bench"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        data = response.data["results"]

        names = [
            item["name"]
            for item in data
        ]

        self.assertIn(
            "Bench Press",
            names,
        )

        self.assertNotIn(
            "Squat",
            names,
        )


    # =====================================================
    # PAGINATION
    # =====================================================

    def test_exercises_are_paginated(self):

        response = self.client.get(
            self.base_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "count",
            response.data,
        )

        self.assertIn(
            "results",
            response.data,
        )