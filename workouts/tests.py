from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from exercises.models import Exercise

from .models import (
    Workout,
    WorkoutExercise,
    Set,
)


User = get_user_model()


class WorkoutAPITests(APITestCase):

    def setUp(self):

        self.user1 = User.objects.create_user(
            username="workoutuser1",
            email="workoutuser1@forgetrack.com",
            password="StrongPassword123!",
        )

        self.user2 = User.objects.create_user(
            username="workoutuser2",
            email="workoutuser2@forgetrack.com",
            password="StrongPassword123!",
        )

        self.exercise = Exercise.objects.create(
            name="Bench Press",
            muscle_group="Chest",
            equipment="Barbell",
            difficulty="Intermediate",
        )

        self.other_exercise = Exercise.objects.create(
            name="Squat",
            muscle_group="Legs",
            equipment="Barbell",
            difficulty="Intermediate",
        )

        self.workout1 = Workout.objects.create(
            user=self.user1,
            name="Push Day",
            date="2026-08-20",
            duration_minutes=60,
        )

        self.workout_exercise = WorkoutExercise.objects.create(
            workout=self.workout1,
            exercise=self.exercise,
            order=1,
        )

        Set.objects.create(
            workout_exercise=self.workout_exercise,
            set_number=1,
            reps=10,
            weight=50,
            rpe=8,
        )

        Set.objects.create(
            workout_exercise=self.workout_exercise,
            set_number=2,
            reps=8,
            weight=60,
            rpe=9,
        )

        self.workout2 = Workout.objects.create(
            user=self.user2,
            name="Other User Workout",
            date="2026-08-21",
        )

        self.base_url = "/api/workouts/"


    # =====================================================
    # AUTHENTICATION
    # =====================================================

    def test_workouts_require_authentication(self):

        response = self.client.get(
            self.base_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )


    # =====================================================
    # USER ISOLATION
    # =====================================================

    def test_user_only_sees_own_workouts(self):

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
            self.workout1.id,
            ids,
        )

        self.assertNotIn(
            self.workout2.id,
            ids,
        )


    def test_user_cannot_access_another_users_workout(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.get(
            f"{self.base_url}{self.workout2.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )


    # =====================================================
    # CREATE WORKOUT
    # =====================================================

    def test_user_can_create_workout_with_nested_sets(self):

        self.client.force_authenticate(
            user=self.user1
        )

        payload = {
            "name": "Leg Day",
            "date": "2026-08-22",
            "notes": "Heavy session",
            "duration_minutes": 75,

            "exercises": [
                {
                    "exercise": self.other_exercise.id,

                    "sets": [
                        {
                            "reps": 10,
                            "weight": 80,
                            "rpe": 8,
                        },
                        {
                            "reps": 8,
                            "weight": 90,
                            "rpe": 9,
                        },
                    ],
                }
            ],
        }

        response = self.client.post(
            self.base_url,
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        workout = Workout.objects.get(
            id=response.data["id"]
        )

        self.assertEqual(
            workout.user,
            self.user1,
        )

        self.assertEqual(
            workout.exercises.count(),
            1,
        )

        workout_exercise = (
            workout.exercises.first()
        )

        self.assertEqual(
            workout_exercise.sets.count(),
            2,
        )


    # =====================================================
    # METRICS
    # =====================================================

    def test_workout_metrics_are_correct(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.get(
            f"{self.base_url}{self.workout1.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        # 10x50 + 8x60 = 980
        self.assertEqual(
            response.data["total_volume"],
            980,
        )

        self.assertEqual(
            response.data["total_sets"],
            2,
        )

        self.assertEqual(
            response.data["total_reps"],
            18,
        )


    # =====================================================
    # VALIDATION
    # =====================================================

    def test_negative_weight_fails(self):

        self.client.force_authenticate(
            user=self.user1
        )

        payload = {
            "name": "Bad Workout",
            "date": "2026-08-22",

            "exercises": [
                {
                    "exercise": self.exercise.id,

                    "sets": [
                        {
                            "reps": 10,
                            "weight": -20,
                        }
                    ],
                }
            ],
        }

        response = self.client.post(
            self.base_url,
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )


    def test_zero_reps_fails(self):

        self.client.force_authenticate(
            user=self.user1
        )

        payload = {
            "name": "Bad Workout",
            "date": "2026-08-22",

            "exercises": [
                {
                    "exercise": self.exercise.id,

                    "sets": [
                        {
                            "reps": 0,
                            "weight": 50,
                        }
                    ],
                }
            ],
        }

        response = self.client.post(
            self.base_url,
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )


    def test_invalid_rpe_fails(self):

        self.client.force_authenticate(
            user=self.user1
        )

        payload = {
            "name": "Bad RPE Workout",
            "date": "2026-08-22",

            "exercises": [
                {
                    "exercise": self.exercise.id,

                    "sets": [
                        {
                            "reps": 10,
                            "weight": 50,
                            "rpe": 11,
                        }
                    ],
                }
            ],
        }

        response = self.client.post(
            self.base_url,
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )


    def test_invalid_duration_fails(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.post(
            self.base_url,
            {
                "name": "Too Long Workout",
                "date": "2026-08-22",
                "duration_minutes": 1500,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )


    # =====================================================
    # UPDATE
    # =====================================================

    def test_user_can_update_workout_name_without_losing_sets(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.patch(
            f"{self.base_url}{self.workout1.id}/",
            {
                "name": "Updated Push Day",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.workout1.refresh_from_db()

        self.assertEqual(
            self.workout1.name,
            "Updated Push Day",
        )

        self.assertEqual(
            self.workout1.exercises.count(),
            1,
        )

        self.assertEqual(
            self.workout1.exercises.first().sets.count(),
            2,
        )


    def test_nested_workout_update_replaces_exercises(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.patch(
            f"{self.base_url}{self.workout1.id}/",
            {
                "exercises": [
                    {
                        "exercise": self.other_exercise.id,

                        "sets": [
                            {
                                "reps": 5,
                                "weight": 100,
                            }
                        ],
                    }
                ]
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.workout1.refresh_from_db()

        self.assertEqual(
            self.workout1.exercises.count(),
            1,
        )

        updated_exercise = (
            self.workout1.exercises.first()
        )

        self.assertEqual(
            updated_exercise.exercise,
            self.other_exercise,
        )

        self.assertEqual(
            updated_exercise.sets.count(),
            1,
        )


    # =====================================================
    # DELETE
    # =====================================================

    def test_user_can_delete_own_workout(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.delete(
            f"{self.base_url}{self.workout1.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            Workout.objects.filter(
                id=self.workout1.id
            ).exists()
        )


    def test_user_cannot_delete_another_users_workout(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.delete(
            f"{self.base_url}{self.workout2.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertTrue(
            Workout.objects.filter(
                id=self.workout2.id
            ).exists()
        )