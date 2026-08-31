from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.db import transaction

from rest_framework import (
    generics,
    permissions,
    status,
    throttling,
)

from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
)

from .models import (
    PasswordResetOTP,
    RegistrationOTP,
)

from .serializers import (
    CustomTokenObtainPairSerializer,
    RegistrationOTPRequestSerializer,
    RegistrationOTPVerifySerializer,
    RequestOTPSerializer,
    UserSerializer,
    VerifyOTPSerializer,
)


User = get_user_model()


# =========================================================
# CUSTOM THROTTLES
# =========================================================

class LoginThrottle(
    throttling.AnonRateThrottle
):
    scope = "login"


class RegisterThrottle(
    throttling.AnonRateThrottle
):
    scope = "register"


class OTPRequestThrottle(
    throttling.AnonRateThrottle
):
    scope = "otp_request"


class OTPVerifyThrottle(
    throttling.AnonRateThrottle
):
    scope = "otp_verify"


# =========================================================
# REGISTER - SEND VERIFICATION OTP
# =========================================================

class RegisterView(APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    throttle_classes = [
        RegisterThrottle
    ]

    def post(self, request):

        # -------------------------------------------------
        # Validate registration details
        # -------------------------------------------------

        serializer = (
            RegistrationOTPRequestSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        email = (
            data["email"]
            .strip()
            .lower()
        )

        username = (
            data["username"]
            .strip()
        )

        first_name = (
            data.get(
                "first_name",
                ""
            ).strip()
        )

        last_name = (
            data.get(
                "last_name",
                ""
            ).strip()
        )

        raw_password = data["password"]


        # -------------------------------------------------
        # Safety check
        # -------------------------------------------------

        if User.objects.filter(
            email__iexact=email
        ).exists():

            return Response(
                {
                    "email": [
                        (
                            "An account with this "
                            "email already exists."
                        )
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        if User.objects.filter(
            username__iexact=username
        ).exists():

            return Response(
                {
                    "username": [
                        "This username is already taken."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        # -------------------------------------------------
        # Invalidate old registration OTPs
        # -------------------------------------------------

        RegistrationOTP.objects.filter(
            email__iexact=email,
            is_used=False
        ).update(
            is_used=True
        )


        # -------------------------------------------------
        # Generate OTP
        # -------------------------------------------------

        otp = (
            RegistrationOTP
            .generate_otp()
        )


        # -------------------------------------------------
        # Store temporary registration
        #
        # IMPORTANT:
        # Password is HASHED before saving.
        # Raw password is NOT stored.
        # -------------------------------------------------

        RegistrationOTP.objects.create(

            email=email,

            username=username,

            first_name=first_name,

            last_name=last_name,

            password=make_password(
                raw_password
            ),

            otp=otp,
        )


        # -------------------------------------------------
        # Show OTP in Django terminal during development
        # -------------------------------------------------

        if settings.DEBUG:

            print()
            print(
                "========================================"
            )

            print(
                "FORGETRACK REGISTRATION OTP"
            )

            print(
                f"Email: {email}"
            )

            print(
                f"OTP: {otp}"
            )

            print(
                "Expires in: 10 minutes"
            )

            print(
                "========================================"
            )

            print()


        # -------------------------------------------------
        # Send OTP email
        # -------------------------------------------------

        try:

            send_mail(

                subject=(
                    "ForgeTrack - Verify Your Email"
                ),

                message=(
                    "Welcome to ForgeTrack!\n\n"
                    "Your email verification OTP is "
                    f"{otp}.\n\n"
                    "This OTP will expire in "
                    "10 minutes.\n\n"
                    "Enter this OTP in ForgeTrack "
                    "to complete your registration.\n\n"
                    "If you did not request this "
                    "account, you can ignore "
                    "this email."
                ),

                from_email=getattr(
                    settings,
                    "DEFAULT_FROM_EMAIL",
                    "noreply@forgetrack.local"
                ),

                recipient_list=[
                    email
                ],

                fail_silently=False,
            )


        except Exception:

            # Remove pending registration if email
            # could not be sent.

            RegistrationOTP.objects.filter(
                email__iexact=email,
                otp=otp,
                is_used=False
            ).update(
                is_used=True
            )

            return Response(
                {
                    "detail": (
                        "Unable to send verification "
                        "OTP. Please try again."
                    )
                },
                status=(
                    status
                    .HTTP_500_INTERNAL_SERVER_ERROR
                )
            )


        # -------------------------------------------------
        # Success
        # -------------------------------------------------

        return Response(
            {
                "detail": (
                    "Verification OTP sent "
                    "to your email."
                ),

                "email": email,
            },
            status=status.HTTP_200_OK
        )


# =========================================================
# VERIFY REGISTRATION OTP
# =========================================================

class VerifyRegistrationOTPView(
    APIView
):

    permission_classes = [
        permissions.AllowAny
    ]

    throttle_classes = [
        OTPVerifyThrottle
    ]


    @transaction.atomic
    def post(self, request):

        # -------------------------------------------------
        # Validate input
        # -------------------------------------------------

        serializer = (
            RegistrationOTPVerifySerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        email = (
            serializer
            .validated_data["email"]
            .strip()
            .lower()
        )

        otp = (
            serializer
            .validated_data["otp"]
        )


        # -------------------------------------------------
        # Lock pending registration
        # -------------------------------------------------

        registration = (

            RegistrationOTP.objects

            .select_for_update()

            .filter(
                email__iexact=email,
                otp=otp,
                is_used=False
            )

            .order_by(
                "-created_at"
            )

            .first()
        )


        # -------------------------------------------------
        # Invalid / expired OTP
        # -------------------------------------------------

        if (
            not registration
            or not registration.is_valid()
        ):

            return Response(
                {
                    "detail": (
                        "Invalid or expired OTP."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        # -------------------------------------------------
        # Check email again
        # -------------------------------------------------

        if User.objects.filter(
            email__iexact=registration.email
        ).exists():

            registration.is_used = True

            registration.save(
                update_fields=[
                    "is_used"
                ]
            )

            return Response(
                {
                    "detail": (
                        "An account with this email "
                        "already exists."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        # -------------------------------------------------
        # Check username again
        # -------------------------------------------------

        if User.objects.filter(
            username__iexact=registration.username
        ).exists():

            registration.is_used = True

            registration.save(
                update_fields=[
                    "is_used"
                ]
            )

            return Response(
                {
                    "detail": (
                        "This username is already "
                        "taken. Please register again "
                        "with another username."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        # -------------------------------------------------
        # Create real user
        #
        # registration.password is already HASHED.
        # -------------------------------------------------

        user = User.objects.create(

            username=registration.username,

            email=(
                registration.email
                .strip()
                .lower()
            ),

            first_name=registration.first_name,

            last_name=registration.last_name,

            password=registration.password,

            is_active=True,
        )


        # -------------------------------------------------
        # Mark registration OTP used
        # -------------------------------------------------

        RegistrationOTP.objects.filter(
            email__iexact=email,
            is_used=False
        ).update(
            is_used=True
        )


        # -------------------------------------------------
        # Success
        # -------------------------------------------------

        return Response(
            {
                "detail": (
                    "Email verified successfully. "
                    "Your ForgeTrack account "
                    "has been created."
                ),

                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
            },
            status=status.HTTP_201_CREATED
        )


# =========================================================
# USER PROFILE
# =========================================================

class ProfileView(
    generics.RetrieveUpdateAPIView
):

    serializer_class = UserSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_object(self):

        return self.request.user


# =========================================================
# JWT LOGIN
# =========================================================

class CustomTokenObtainPairView(
    TokenObtainPairView
):

    permission_classes = [
        permissions.AllowAny
    ]

    throttle_classes = [
        LoginThrottle
    ]

    serializer_class = (
        CustomTokenObtainPairSerializer
    )


# =========================================================
# REQUEST PASSWORD RESET OTP
# =========================================================

class RequestOTPView(APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    throttle_classes = [
        OTPRequestThrottle
    ]


    def post(self, request):

        serializer = RequestOTPSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        email = (
            serializer
            .validated_data["email"]
            .strip()
            .lower()
        )


        # -------------------------------------------------
        # Find user
        # -------------------------------------------------

        try:

            user = User.objects.get(
                email__iexact=email
            )

        except User.DoesNotExist:

            return Response(
                {
                    "detail": (
                        "No account found with "
                        "this email address."
                    )
                },
                status=status.HTTP_404_NOT_FOUND
            )


        # -------------------------------------------------
        # Invalidate previous unused OTPs
        # -------------------------------------------------

        PasswordResetOTP.objects.filter(
            email__iexact=user.email,
            is_used=False
        ).update(
            is_used=True
        )


        # -------------------------------------------------
        # Generate OTP
        # -------------------------------------------------

        otp = (
            PasswordResetOTP
            .generate_otp()
        )


        PasswordResetOTP.objects.create(
            email=user.email,
            otp=otp
        )


        # -------------------------------------------------
        # Development terminal OTP
        # -------------------------------------------------

        if settings.DEBUG:

            print()
            print(
                "========================================"
            )

            print(
                "FORGETRACK PASSWORD RESET OTP"
            )

            print(
                f"Email: {user.email}"
            )

            print(
                f"OTP: {otp}"
            )

            print(
                "Expires in: 10 minutes"
            )

            print(
                "========================================"
            )

            print()


        # -------------------------------------------------
        # Email OTP
        # -------------------------------------------------

        try:

            send_mail(

                subject=(
                    "ForgeTrack - Password Reset OTP"
                ),

                message=(
                    "Your ForgeTrack password "
                    "reset OTP is "
                    f"{otp}.\n\n"
                    "This OTP expires in "
                    "10 minutes.\n\n"
                    "If you did not request "
                    "a password reset, "
                    "you can ignore this message."
                ),

                from_email=getattr(
                    settings,
                    "DEFAULT_FROM_EMAIL",
                    "noreply@forgetrack.local"
                ),

                recipient_list=[
                    user.email
                ],

                fail_silently=False
            )


        except Exception:

            PasswordResetOTP.objects.filter(
                email__iexact=user.email,
                otp=otp,
                is_used=False
            ).update(
                is_used=True
            )

            return Response(
                {
                    "detail": (
                        "Unable to send OTP. "
                        "Please try again."
                    )
                },
                status=(
                    status
                    .HTTP_500_INTERNAL_SERVER_ERROR
                )
            )


        return Response(
            {
                "detail": (
                    "Password reset OTP "
                    "sent successfully."
                )
            },
            status=status.HTTP_200_OK
        )


# =========================================================
# VERIFY PASSWORD RESET OTP
# =========================================================

class VerifyOTPView(APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    throttle_classes = [
        OTPVerifyThrottle
    ]


    @transaction.atomic
    def post(self, request):

        serializer = VerifyOTPSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )


        email = (
            serializer
            .validated_data["email"]
            .strip()
            .lower()
        )

        otp = (
            serializer
            .validated_data["otp"]
        )

        new_password = (
            serializer
            .validated_data["new_password"]
        )


        # -------------------------------------------------
        # Lock OTP
        # -------------------------------------------------

        otp_object = (

            PasswordResetOTP.objects

            .select_for_update()

            .filter(
                email__iexact=email,
                otp=otp,
                is_used=False
            )

            .order_by(
                "-created_at"
            )

            .first()
        )


        # -------------------------------------------------
        # Invalid / expired
        # -------------------------------------------------

        if (
            not otp_object
            or not otp_object.is_valid()
        ):

            return Response(
                {
                    "detail": (
                        "Invalid or expired OTP."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        # -------------------------------------------------
        # Find user
        # -------------------------------------------------

        try:

            user = User.objects.get(
                email__iexact=email
            )

        except User.DoesNotExist:

            return Response(
                {
                    "detail": (
                        "Invalid or expired OTP."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        # -------------------------------------------------
        # Reset password
        # -------------------------------------------------

        user.set_password(
            new_password
        )

        user.save(
            update_fields=[
                "password"
            ]
        )


        # -------------------------------------------------
        # Mark OTPs used
        # -------------------------------------------------

        PasswordResetOTP.objects.filter(
            email__iexact=email,
            is_used=False
        ).update(
            is_used=True
        )


        return Response(
            {
                "detail": (
                    "Password reset successful. "
                    "You can now sign in."
                )
            },
            status=status.HTTP_200_OK
        )