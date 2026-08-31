from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from rest_framework_simplejwt.views import TokenRefreshView

from users.views import (
    RegisterView,
    VerifyRegistrationOTPView,
    ProfileView,
    CustomTokenObtainPairView,
    RequestOTPView,
    VerifyOTPView,
)


# =========================================================
# API ROOT
# =========================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def api_root(request):

    return Response({

        "message": "Welcome to ForgeTrack API",
        "version": "1.0",
        "status": "online",

        "endpoints": {

            "auth": {

                # Registration + email verification
                "register": (
                    "/api/auth/register/"
                ),

                "verify_registration": (
                    "/api/auth/register/verify/"
                ),

                # Login / JWT
                "login": (
                    "/api/auth/login/"
                ),

                "refresh": (
                    "/api/auth/refresh/"
                ),

                # Profile
                "profile": (
                    "/api/auth/profile/"
                ),

                # Forgot password
                "request_otp": (
                    "/api/auth/request-otp/"
                ),

                "verify_otp": (
                    "/api/auth/verify-otp/"
                ),
            },

            "exercises": (
                "/api/exercises/"
            ),

            "workouts": (
                "/api/workouts/"
            ),

            "weight": (
                "/api/weight/"
            ),

            "weight_goal": (
                "/api/weight-goal/"
            ),

            "diets": (
                "/api/diets/"
            ),

            "recipes": (
                "/api/recipes/"
            ),

            "goals": (
                "/api/goals/"
            ),

            "admin": (
                "/admin/"
            ),
        },
    })


# =========================================================
# URL PATTERNS
# =========================================================

urlpatterns = [

    # -----------------------------------------------------
    # API HOME
    # -----------------------------------------------------

    path(
        "",
        api_root,
        name="api-root"
    ),


    # -----------------------------------------------------
    # DJANGO ADMIN
    # -----------------------------------------------------

    path(
        "admin/",
        admin.site.urls
    ),


    # =====================================================
    # AUTHENTICATION
    # =====================================================


    # -----------------------------------------------------
    # REGISTER
    #
    # Step 1:
    # Validate registration information
    # and send verification OTP.
    # -----------------------------------------------------

    path(
        "api/auth/register/",
        RegisterView.as_view(),
        name="register"
    ),


    # -----------------------------------------------------
    # VERIFY REGISTRATION OTP
    #
    # Step 2:
    # Verify OTP and create the actual user.
    # -----------------------------------------------------

    path(
        "api/auth/register/verify/",
        VerifyRegistrationOTPView.as_view(),
        name="verify-registration"
    ),


    # -----------------------------------------------------
    # JWT LOGIN
    # -----------------------------------------------------

    path(
        "api/auth/login/",
        CustomTokenObtainPairView.as_view(),
        name="login"
    ),


    # -----------------------------------------------------
    # JWT REFRESH
    # -----------------------------------------------------

    path(
        "api/auth/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh"
    ),


    # -----------------------------------------------------
    # USER PROFILE
    # -----------------------------------------------------

    path(
        "api/auth/profile/",
        ProfileView.as_view(),
        name="profile"
    ),


    # =====================================================
    # FORGOT PASSWORD
    # =====================================================


    # -----------------------------------------------------
    # REQUEST PASSWORD RESET OTP
    # -----------------------------------------------------

    path(
        "api/auth/request-otp/",
        RequestOTPView.as_view(),
        name="request-otp"
    ),


    # -----------------------------------------------------
    # VERIFY OTP + CHANGE PASSWORD
    # -----------------------------------------------------

    path(
        "api/auth/verify-otp/",
        VerifyOTPView.as_view(),
        name="verify-otp"
    ),


    # =====================================================
    # EXERCISES
    # =====================================================

    path(
        "api/",
        include("exercises.urls")
    ),


    # =====================================================
    # WORKOUTS
    # =====================================================

    path(
        "api/",
        include("workouts.urls")
    ),


    # =====================================================
    # NUTRITION / WEIGHT / DIETS / RECIPES
    # =====================================================

    path(
        "api/",
        include("nutrition.urls")
    ),


    # =====================================================
    # GOALS
    # =====================================================

    path(
        "api/",
        include("goals.urls")
    ),
]


# =========================================================
# DEVELOPMENT MEDIA FILES
# =========================================================

if settings.DEBUG:

    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )