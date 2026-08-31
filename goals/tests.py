from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from .models import Goal


User = get_user_model()


class GoalAPITests(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(
            username="goaluser1",
            email="goaluser1@forgetrack.com",
            password="StrongPassword123!",
        )

        self.user2 = User.objects.create_user(
            username="goaluser2",
            email="goaluser2@forgetrack.com",
            password="StrongPassword123!",
        )

        self.goal1 = Goal.objects.create(
            user=self.user1,
            title="Bench 100kg",
            description="Reach 100kg bench press",
        )

        self.goal2 = Goal.objects.create(
            user=self.user2,
            title="Run 5K",
            description="Complete a 5K run",
        )

        self.base_url = "/api/goals/"


    # =====================================================
    # AUTHENTICATION
    # =====================================================

    def test_goals_require_authentication(self):

        response = self.client.get(
            self.base_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )


    # =====================================================
    # LIST
    # =====================================================

    def test_user_only_sees_own_goals(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.get(
            self.base_url
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
            self.goal1.id,
            ids,
        )

        self.assertNotIn(
            self.goal2.id,
            ids,
        )


    # =====================================================
    # CREATE
    # =====================================================

    def test_user_can_create_goal(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.post(
            self.base_url,
            {
                "title": "Lose 5kg",
                "description": "Reach target weight",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            Goal.objects.filter(
                user=self.user1,
                title="Lose 5kg",
            ).exists()
        )


    # =====================================================
    # TITLE VALIDATION
    # =====================================================

    def test_goal_title_too_short_fails(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.post(
            self.base_url,
            {
                "title": "A",
                "description": "Too short",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "title",
            response.data,
        )


    # =====================================================
    # UPDATE
    # =====================================================

    def test_user_can_update_own_goal(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.patch(
            f"{self.base_url}{self.goal1.id}/",
            {
                "is_completed": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.goal1.refresh_from_db()

        self.assertTrue(
            self.goal1.is_completed
        )


    # =====================================================
    # USER ISOLATION
    # =====================================================

    def test_user_cannot_access_another_users_goal(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.get(
            f"{self.base_url}{self.goal2.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )


    def test_user_cannot_update_another_users_goal(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.patch(
            f"{self.base_url}{self.goal2.id}/",
            {
                "title": "Hacked goal",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.goal2.refresh_from_db()

        self.assertEqual(
            self.goal2.title,
            "Run 5K",
        )


    # =====================================================
    # DELETE
    # =====================================================

    def test_user_can_delete_own_goal(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.delete(
            f"{self.base_url}{self.goal1.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            Goal.objects.filter(
                id=self.goal1.id
            ).exists()
        )


    def test_user_cannot_delete_another_users_goal(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.delete(
            f"{self.base_url}{self.goal2.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertTrue(
            Goal.objects.filter(
                id=self.goal2.id
            ).exists()
        )


    # =====================================================
    # COMPLETED FILTER
    # =====================================================

    def test_completed_filter_works(self):

        Goal.objects.create(
            user=self.user1,
            title="Completed Goal",
            is_completed=True,
        )

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.get(
            f"{self.base_url}?completed=true"
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
                item["is_completed"]
                for item in data
            )
        )


    # =====================================================
    # DESCRIPTION CLEANING
    # =====================================================

    def test_description_is_trimmed(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.post(
            self.base_url,
            {
                "title": "New Goal",
                "description": "   Trim this description   ",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            response.data["description"],
            "Trim this description",
        )