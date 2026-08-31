from rest_framework import serializers

from .models import Exercise


class ExerciseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Exercise

        fields = [
            "id",
            "name",
            "muscle_group",
            "equipment",
            "difficulty",
            "description",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]


    def validate_name(self, value):

        value = value.strip()

        if len(value) < 2:

            raise serializers.ValidationError(
                "Exercise name is too short."
            )

        return value


    def validate_muscle_group(self, value):

        value = value.strip()

        if len(value) < 2:

            raise serializers.ValidationError(
                "Muscle group is too short."
            )

        return value


    def validate_equipment(self, value):

        return value.strip()


    def validate_description(self, value):

        return value.strip()