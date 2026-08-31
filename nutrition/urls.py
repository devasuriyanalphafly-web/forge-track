from rest_framework.routers import DefaultRouter

from .views import (
    DietPlanViewSet,
    RecipeViewSet,
    WeightGoalViewSet,
    WeightLogViewSet,
)


router = DefaultRouter()


router.register(
    r"weight",
    WeightLogViewSet,
    basename="weight"
)


router.register(
    r"weight-goal",
    WeightGoalViewSet,
    basename="weight-goal"
)


router.register(
    r"diets",
    DietPlanViewSet,
    basename="diet"
)


router.register(
    r"recipes",
    RecipeViewSet,
    basename="recipe"
)


urlpatterns = router.urls