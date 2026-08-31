from rest_framework import serializers

from .models import (
    DietPlan,
    FavoriteRecipe,
    Recipe,
    WeightGoal,
    WeightLog,
)


# =========================================================
# WEIGHT LOG SERIALIZER
# =========================================================

class WeightLogSerializer(serializers.ModelSerializer):

    class Meta:
        model = WeightLog

        fields = [
            "id",
            "weight",
            "date",
            "note",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]


    def validate_weight(self, value):

        if value < 20 or value > 500:

            raise serializers.ValidationError(
                "Weight must be between 20 and 500 kg."
            )

        return value


    def validate_note(self, value):

        if value is None:
         return""

        return value.strip()


# =========================================================
# WEIGHT GOAL SERIALIZER
# =========================================================

class WeightGoalSerializer(serializers.ModelSerializer):

    class Meta:
        model = WeightGoal

        fields = [
            "target_weight",
            "start_weight",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "created_at",
            "updated_at",
        ]


    def validate_target_weight(self, value):

        if value < 20 or value > 500:

            raise serializers.ValidationError(
                "Target weight must be between 20 and 500 kg."
            )

        return value


    def validate_start_weight(self, value):

        if value is not None:

            if value < 20 or value > 500:

                raise serializers.ValidationError(
                    "Start weight must be between 20 and 500 kg."
                )

        return value


# =========================================================
# DIET PLAN SERIALIZER
# =========================================================

class DietPlanSerializer(serializers.ModelSerializer):

    class Meta:
        model = DietPlan

        fields = [
            "id",
            "name",
            "goal",
            "description",
            "daily_calories",
            "protein_g",
            "carbs_g",
            "fat_g",
            "duration_weeks",
            "is_active",
        ]

        read_only_fields = [
            "id",
        ]


# =========================================================
# RECIPE SERIALIZER
# =========================================================

class RecipeSerializer(serializers.ModelSerializer):

    is_favorited = serializers.SerializerMethodField()


    class Meta:
        model = Recipe

        fields = [
            "id",
            "name",
            "category",
            "description",
            "ingredients",
            "instructions",
            "calories",
            "protein_g",
            "prep_time_min",
            "is_vegetarian",
            "is_vegan",
            "image_url",
            "is_favorited",
        ]

        read_only_fields = [
            "id",
            "is_favorited",
        ]


    def get_is_favorited(self, obj):

        request = self.context.get(
            "request"
        )


        if (
            not request
            or not request.user.is_authenticated
        ):

            return False


        # -------------------------------------------------
        # If favorites were prefetched in the ViewSet,
        # use them instead of hitting the DB again.
        # -------------------------------------------------

        prefetched = (
            getattr(
                obj,
                "_prefetched_objects_cache",
                {}
            )
            .get("favorited_by")
        )


        if prefetched is not None:

            return any(
                favorite.user_id
                == request.user.id

                for favorite
                in prefetched
            )


        # Fallback query
        return FavoriteRecipe.objects.filter(
            user=request.user,
            recipe=obj
        ).exists()