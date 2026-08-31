from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.utils import timezone

from rest_framework import status
from rest_framework.test import APITestCase

from .models import PasswordResetOTP
from .models import User, RegistrationOTP


User = get_user_model()


class AuthenticationTests(APITestCase):

    def setUp(self):
        self.email = "testuser@forgetrack.com"
        self.username = "testuser"
        self.password = "StrongTestPassword123!"

        self.user = User.objects.create_user(
            username=self.username,
            email=self.email,
            password=self.password,
        )


    # =====================================================
    # LOGIN
    # =====================================================

    def test_user_can_login(self):

        response = self.client.post(
            "/api/auth/login/",
            {
                "email": self.email,
                "password": self.password,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "access",
            response.data,
        )

        self.assertIn(
            "refresh",
            response.data,
        )


    def test_login_with_wrong_password_fails(self):

        response = self.client.post(
            "/api/auth/login/",
            {
                "email": self.email,
                "password": "WrongPassword123!",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )


    # =====================================================
    # PROFILE
    # =====================================================

    def test_profile_requires_authentication(self):

        response = self.client.get(
            "/api/auth/profile/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )


    def test_authenticated_user_can_view_profile(self):

        login_response = self.client.post(
            "/api/auth/login/",
            {
                "email": self.email,
                "password": self.password,
            },
            format="json",
        )

        access_token = (
            login_response.data["access"]
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=(
                f"Bearer {access_token}"
            )
        )

        response = self.client.get(
            "/api/auth/profile/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["email"],
            self.email,
        )


    # =====================================================
    # TOKEN REFRESH
    # =====================================================

    def test_refresh_token_returns_new_access_token(self):

        login_response = self.client.post(
            "/api/auth/login/",
            {
                "email": self.email,
                "password": self.password,
            },
            format="json",
        )

        refresh_token = (
            login_response.data["refresh"]
        )

        response = self.client.post(
            "/api/auth/refresh/",
            {
                "refresh": refresh_token,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "access",
            response.data,
        )


    # =====================================================
    # REGISTRATION
    # =====================================================

    def test_user_can_request_registration_otp(self):

        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "newuser",
                "email": "newuser@forgetrack.com",
                "password": "AnotherStrongPassword123!",
                "first_name": "New",
                "last_name": "User",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertTrue(
            RegistrationOTP.objects.filter(
                email="newuser@forgetrack.com"
            ).exists()
        )


    def test_duplicate_email_registration_fails(self):

        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "duplicate",
                "email": self.email,
                "password": "AnotherStrongPassword123!",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )


    # =====================================================
    # OTP REQUEST
    # =====================================================

    @patch("users.views.send_mail")
    def test_otp_request_creates_otp(self, mocked_send_mail):

        response = self.client.post(
            "/api/auth/request-otp/",
            {
                "email": self.email,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertTrue(
            PasswordResetOTP.objects.filter(
                email=self.email,
                is_used=False,
            ).exists()
        )

        mocked_send_mail.assert_called_once()


    # =====================================================
    # INVALID OTP
    # =====================================================

    def test_invalid_otp_fails(self):

        response = self.client.post(
            "/api/auth/verify-otp/",
            {
                "email": self.email,
                "otp": "123456",
                "new_password": "BrandNewPassword123!",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )


    # =====================================================
    # SUCCESSFUL PASSWORD RESET
    # =====================================================

    def test_valid_otp_resets_password(self):

        otp = PasswordResetOTP.objects.create(
            email=self.email,
            otp="654321",
        )

        new_password = "BrandNewPassword123!"

        response = self.client.post(
            "/api/auth/verify-otp/",
            {
                "email": self.email,
                "otp": otp.otp,
                "new_password": new_password,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.user.refresh_from_db()

        self.assertTrue(
            self.user.check_password(
                new_password
            )
        )


    # =====================================================
    # OTP CANNOT BE REUSED
    # =====================================================

    def test_used_otp_cannot_be_reused(self):

        otp = PasswordResetOTP.objects.create(
            email=self.email,
            otp="111111",
        )

        first_response = self.client.post(
            "/api/auth/verify-otp/",
            {
                "email": self.email,
                "otp": otp.otp,
                "new_password": "FirstNewPassword123!",
            },
            format="json",
        )

        self.assertEqual(
            first_response.status_code,
            status.HTTP_200_OK,
        )

        second_response = self.client.post(
            "/api/auth/verify-otp/",
            {
                "email": self.email,
                "otp": otp.otp,
                "new_password": "SecondNewPassword123!",
            },
            format="json",
        )

        self.assertEqual(
            second_response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )


    # =====================================================
    # EXPIRED OTP
    # =====================================================

    def test_expired_otp_fails(self):

        otp = PasswordResetOTP.objects.create(
            email=self.email,
            otp="222222",
        )

        PasswordResetOTP.objects.filter(
            id=otp.id
        ).update(
            created_at=(
                timezone.now()
                - timedelta(minutes=11)
            )
        )

        response = self.client.post(
            "/api/auth/verify-otp/",
            {
                "email": self.email,
                "otp": otp.otp,
                "new_password": "ExpiredPassword123!",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )