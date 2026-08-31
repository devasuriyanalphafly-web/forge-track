from django.contrib.auth import get_user_model
from django.contrib.auth import password_validation

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


User = get_user_model()


# =========================================================
# USER / PROFILE
# =========================================================

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "profile_picture",
            "date_of_birth",
            "height",
            "weight",
            "fitness_goal",
        ]

        read_only_fields = [
            "id",
            "email",
        ]

    def validate_height(self, value):

        if value is not None and not 50 <= value <= 300:
            raise serializers.ValidationError(
                "Height must be between 50 and 300 cm."
            )

        return value

    def validate_weight(self, value):

        if value is not None and not 20 <= value <= 500:
            raise serializers.ValidationError(
                "Weight must be between 20 and 500 kg."
            )

        return value


# =========================================================
# REGISTER
# =========================================================

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False
    )

    class Meta:
        model = User

        fields = [
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
        ]

    def validate_username(self, value):

        value = value.strip()

        if User.objects.filter(
            username__iexact=value
        ).exists():
            raise serializers.ValidationError(
                "This username is already taken."
            )

        return value

    def validate_email(self, value):

        value = value.strip().lower()

        if User.objects.filter(
            email__iexact=value
        ).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def validate_password(self, value):

        password_validation.validate_password(
            value
        )

        return value

    def create(self, validated_data):

        return User.objects.create_user(
            **validated_data
        )


# =========================================================
# REGISTRATION OTP REQUEST
# =========================================================

class RegistrationOTPRequestSerializer(
    RegisterSerializer
):
    """
    Uses the same validation rules as normal registration.

    The view will validate these details and send an OTP.
    The actual User will NOT be created at this stage.
    """

    pass


# =========================================================
# REGISTRATION OTP VERIFY
# =========================================================

class RegistrationOTPVerifySerializer(
    serializers.Serializer
):

    email = serializers.EmailField()

    otp = serializers.RegexField(
        regex=r"^\d{6}$",
        error_messages={
            "invalid": "OTP must contain exactly 6 digits."
        }
    )

    def validate_email(self, value):

        return value.strip().lower()


# =========================================================
# JWT LOGIN
# =========================================================

class CustomTokenObtainPairSerializer(
    TokenObtainPairSerializer
):

    @classmethod
    def get_token(cls, user):

        token = super().get_token(user)

        token["username"] = user.username
        token["email"] = user.email

        return token


# =========================================================
# PASSWORD RESET - REQUEST OTP
# =========================================================

class RequestOTPSerializer(
    serializers.Serializer
):

    email = serializers.EmailField()

    def validate_email(self, value):

        return value.strip().lower()


# =========================================================
# PASSWORD RESET - VERIFY OTP
# =========================================================

class VerifyOTPSerializer(
    serializers.Serializer
):

    email = serializers.EmailField()

    otp = serializers.RegexField(
        regex=r"^\d{6}$",
        error_messages={
            "invalid": "OTP must contain exactly 6 digits."
        }
    )

    new_password = serializers.CharField(
        min_length=8,
        write_only=True,
        trim_whitespace=False
    )

    def validate_email(self, value):

        return value.strip().lower()

    def validate_new_password(
        self,
        value
    ):

        password_validation.validate_password(
            value
        )

        return value