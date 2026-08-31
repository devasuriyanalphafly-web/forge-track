from rest_framework import serializers

from .models import Goal


class GoalSerializer(serializers.ModelSerializer):

    class Meta:
        model = Goal

        fields = [
            "id",
            "title",
            "description",
            "is_completed",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


    # =====================================================
    # TITLE VALIDATION
    # =====================================================

    def validate_title(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Goal title cannot be empty."
            )

        if len(value) < 2:
            raise serializers.ValidationError(
                "Goal title must contain at least 2 characters."
            )

        if len(value) > 200:
            raise serializers.ValidationError(
                "Goal title cannot exceed 200 characters."
            )

        return value


    # =====================================================
    # DESCRIPTION VALIDATION
    # =====================================================

    def validate_description(self, value):

        if not value:
            return ""

        return value.strip()