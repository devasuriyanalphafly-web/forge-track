from rest_framework import (
    filters,
    permissions,
    status,
    viewsets,
)

from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    DietPlan,
    FavoriteRecipe,
    Recipe,
    WeightGoal,
    WeightLog,
)

from .serializers import (
    DietPlanSerializer,
    RecipeSerializer,
    WeightGoalSerializer,
    WeightLogSerializer,
)


# =========================================================
# WEIGHT LOGS
# =========================================================

class WeightLogViewSet(viewsets.ModelViewSet):

    serializer_class = WeightLogSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]


    def get_queryset(self):

        return WeightLog.objects.filter(
            user=self.request.user
        )


    def perform_create(
        self,
        serializer
    ):

        serializer.save(
            user=self.request.user
        )


    # -----------------------------------------------------
    # /api/weight/progress/
    # -----------------------------------------------------

    @action(
        detail=False,
        methods=["get"]
    )
    def progress(self, request):

        logs = (
            self.get_queryset()
            .order_by(
                "date",
                "created_at"
            )
        )


        # =================================================
        # GET SAVED WEIGHT GOAL
        # =================================================

        try:

            goal = request.user.weight_goal

        except WeightGoal.DoesNotExist:

            goal = None


        # =================================================
        # NO WEIGHT LOGS YET
        # =================================================

        if not logs.exists():

            goal_data = None


            if goal is not None:

                target = float(
                    goal.target_weight
                )


                goal_start = (
                    float(goal.start_weight)
                    if goal.start_weight is not None
                    else None
                )


                if goal_start is not None:

                    if target < goal_start:

                        direction = "loss"

                    elif target > goal_start:

                        direction = "gain"

                    else:

                        direction = "maintain"

                else:

                    direction = "maintain"


                remaining = (
                    round(
                        abs(
                            target
                            - goal_start
                        ),
                        1
                    )
                    if goal_start is not None
                    else None
                )


                goal_data = {

                    "target_weight":
                        target,

                    "start_weight":
                        goal_start,

                    "remaining_kg":
                        remaining,

                    "progress_percent":
                        0,

                    "direction":
                        direction,
                }


            return Response({

                "start_weight":
                    None,

                "current_weight":
                    None,

                "change_kg":
                    0,

                "total_entries":
                    0,

                "goal_direction":
                    "same",

                "goal":
                    goal_data,
            })


        # =================================================
        # WEIGHT LOG DATA
        # =================================================

        first_log = logs.first()

        latest_log = logs.last()


        start_weight = float(
            first_log.weight
        )


        current_weight = float(
            latest_log.weight
        )


        change = (
            current_weight
            - start_weight
        )


        # =================================================
        # WEIGHT GOAL PROGRESS
        # =================================================

        goal_data = None


        if goal is not None:

            target = float(
                goal.target_weight
            )


            # Use saved starting weight if available.
            # Otherwise use first weight log.
            if goal.start_weight is not None:

                goal_start = float(
                    goal.start_weight
                )

            else:

                goal_start = start_weight


            total_distance = abs(
                target
                - goal_start
            )


            remaining = abs(
                target
                - current_weight
            )


            # ---------------------------------------------
            # Calculate progress percentage
            # ---------------------------------------------

            if total_distance == 0:

                progress_percent = 100

            else:

                progress_percent = round(
                    (
                        (
                            total_distance
                            - remaining
                        )
                        / total_distance
                    )
                    * 100,
                    1
                )


            # Prevent values below 0 or above 100
            progress_percent = max(
                0,
                min(
                    100,
                    progress_percent
                )
            )


            # ---------------------------------------------
            # Determine goal direction
            # ---------------------------------------------

            if target < goal_start:

                direction = "loss"

            elif target > goal_start:

                direction = "gain"

            else:

                direction = "maintain"


            goal_data = {

                "target_weight":
                    target,

                "start_weight":
                    goal_start,

                "remaining_kg":
                    round(
                        remaining,
                        1
                    ),

                "progress_percent":
                    progress_percent,

                "direction":
                    direction,
            }


        # =================================================
        # GENERAL WEIGHT TREND
        # =================================================

        if change < 0:

            goal_direction = "loss"

        elif change > 0:

            goal_direction = "gain"

        else:

            goal_direction = "same"


        # =================================================
        # RESPONSE
        # =================================================

        return Response({

            "start_weight":
                start_weight,

            "current_weight":
                current_weight,

            "change_kg":
                round(
                    change,
                    1
                ),

            "total_entries":
                logs.count(),

            "goal_direction":
                goal_direction,

            "goal":
                goal_data,
        })


# =========================================================
# WEIGHT GOAL
# =========================================================

class WeightGoalViewSet(
    viewsets.ModelViewSet
):

    serializer_class = (
        WeightGoalSerializer
    )

    permission_classes = [
        permissions.IsAuthenticated
    ]


    # Delete isn't necessary for current frontend.
    http_method_names = [
        "get",
        "post",
        "put",
        "patch",
        "head",
        "options",
    ]


    def get_queryset(self):

        return WeightGoal.objects.filter(
            user=self.request.user
        )


    # -----------------------------------------------------
    # POST behaves as CREATE OR UPDATE
    #
    # POST /api/weight-goal/
    #
    # If no goal exists:
    #     create goal
    #
    # If goal exists:
    #     update existing goal
    # -----------------------------------------------------

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        existing_goal = (
            self.get_queryset()
            .first()
        )


        serializer = self.get_serializer(
            existing_goal,

            data=request.data,

            partial=(
                existing_goal
                is not None
            )
        )


        serializer.is_valid(
            raise_exception=True
        )


        serializer.save(
            user=request.user
        )


        response_status = (
            status.HTTP_200_OK

            if existing_goal

            else status.HTTP_201_CREATED
        )


        return Response(
            serializer.data,
            status=response_status
        )


# =========================================================
# DIET PLANS
# =========================================================

class DietPlanViewSet(
    viewsets.ReadOnlyModelViewSet
):

    serializer_class = (
        DietPlanSerializer
    )


    # Diet plans are public/read-only.
    permission_classes = [
        permissions.AllowAny
    ]


    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]


    search_fields = [
        "name",
        "description",
    ]


    ordering_fields = [
        "name",
        "daily_calories",
        "protein_g",
        "duration_weeks",
    ]


    def get_queryset(self):

        queryset = (
            DietPlan.objects
            .filter(
                is_active=True
            )
        )


        goal = (
            self.request
            .query_params
            .get("goal")
        )


        if goal:

            queryset = queryset.filter(
                goal__iexact=
                    goal.strip()
            )


        return queryset


# =========================================================
# RECIPES
# =========================================================

class RecipeViewSet(
    viewsets.ReadOnlyModelViewSet
):

    serializer_class = (
        RecipeSerializer
    )


    permission_classes = [
        permissions.AllowAny
    ]


    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]


    search_fields = [
        "name",
        "description",
        "ingredients",
    ]


    ordering_fields = [
        "name",
        "calories",
        "protein_g",
        "prep_time_min",
    ]


    def get_queryset(self):

        queryset = (
            Recipe.objects.all()
        )


        category = (
            self.request
            .query_params
            .get("category")
        )


        vegetarian = (
            self.request
            .query_params
            .get("vegetarian")
        )


        vegan = (
            self.request
            .query_params
            .get("vegan")
        )


        if category:

            queryset = queryset.filter(
                category__iexact=
                    category.strip()
            )


        if vegetarian in [
            "true",
            "1",
        ]:

            queryset = queryset.filter(
                is_vegetarian=True
            )


        if vegan in [
            "true",
            "1",
        ]:

            queryset = queryset.filter(
                is_vegan=True
            )


        # -------------------------------------------------
        # Prefetch favorites when user is logged in.
        # -------------------------------------------------

        if self.request.user.is_authenticated:

            queryset = (
                queryset
                .prefetch_related(
                    "favorited_by"
                )
            )


        return queryset


    # =====================================================
    # FAVORITE / UNFAVORITE
    #
    # POST /api/recipes/<id>/favorite/
    # =====================================================

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[
            permissions.IsAuthenticated
        ]
    )
    def favorite(
        self,
        request,
        pk=None
    ):

        recipe = self.get_object()


        favorite_object, created = (
            FavoriteRecipe.objects
            .get_or_create(
                user=request.user,
                recipe=recipe
            )
        )


        # Already favorited:
        # clicking again removes it.
        if not created:

            favorite_object.delete()


            return Response({

                "detail":
                    "Removed from favorites",

                "is_favorited":
                    False,
            })


        return Response({

            "detail":
                "Added to favorites",

            "is_favorited":
                True,
        })


    # =====================================================
    # GET USER FAVORITES
    #
    # GET /api/recipes/favorites/
    # =====================================================

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[
            permissions.IsAuthenticated
        ]
    )
    def favorites(
        self,
        request
    ):

        recipes = (
            Recipe.objects
            .filter(
                favorited_by__user=
                    request.user
            )
            .prefetch_related(
                "favorited_by"
            )
            .distinct()
        )


        serializer = self.get_serializer(
            recipes,
            many=True
        )


        return Response(
            serializer.data
        )