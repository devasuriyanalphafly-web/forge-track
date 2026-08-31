from rest_framework import serializers

from exercises.models import Exercise

from .models import (
    Workout,
    WorkoutExercise,
    Set,
)


# =========================================================
# SET SERIALIZER
# =========================================================

class SetSerializer(serializers.ModelSerializer):

    set_number = serializers.IntegerField(
        required=False,
        min_value=1
    )

    class Meta:
        model = Set

        fields = [
            "id",
            "set_number",
            "reps",
            "weight",
            "rpe",
        ]

        read_only_fields = [
            "id",
        ]


    def validate_reps(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Reps must be greater than 0."
            )

        if value > 1000:
            raise serializers.ValidationError(
                "Reps value is too high."
            )

        return value


    def validate_weight(self, value):

        if value < 0:
            raise serializers.ValidationError(
                "Weight cannot be negative."
            )

        if value > 2000:
            raise serializers.ValidationError(
                "Weight value is too high."
            )

        return value


    def validate_rpe(self, value):

        if value is not None:

            if value < 1 or value > 10:
                raise serializers.ValidationError(
                    "RPE must be between 1 and 10."
                )

        return value


# =========================================================
# WORKOUT EXERCISE SERIALIZER
# =========================================================

class WorkoutExerciseSerializer(
    serializers.ModelSerializer
):

    sets = SetSerializer(
        many=True,
        required=False
    )

    exercise_name = serializers.CharField(
        source="exercise.name",
        read_only=True
    )

    muscle_group = serializers.CharField(
        source="exercise.muscle_group",
        read_only=True
    )


    class Meta:
        model = WorkoutExercise

        fields = [
            "id",
            "exercise",
            "exercise_name",
            "muscle_group",
            "order",
            "notes",
            "sets",
        ]

        read_only_fields = [
            "id",
            "exercise_name",
            "muscle_group",
        ]


    def validate_exercise(self, value):

        if not Exercise.objects.filter(
            pk=value.pk
        ).exists():

            raise serializers.ValidationError(
                "Exercise does not exist."
            )

        return value


# =========================================================
# WORKOUT SERIALIZER
# =========================================================

class WorkoutSerializer(
    serializers.ModelSerializer
):

    exercises = WorkoutExerciseSerializer(
        many=True,
        required=False
    )

    total_volume = serializers.SerializerMethodField()

    total_sets = serializers.SerializerMethodField()

    total_reps = serializers.SerializerMethodField()


    class Meta:
        model = Workout

        fields = [
            "id",
            "name",
            "date",
            "notes",
            "duration_minutes",
            "exercises",
            "total_volume",
            "total_sets",
            "total_reps",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "total_volume",
            "total_sets",
            "total_reps",
            "created_at",
        ]


    # =====================================================
    # VALIDATION
    # =====================================================

    def validate_name(self, value):

        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "Workout name is too short."
            )

        return value


    def validate_duration_minutes(
        self,
        value
    ):

        if value is not None:

            if value <= 0:
                raise serializers.ValidationError(
                    "Duration must be greater than 0."
                )

            if value > 1440:
                raise serializers.ValidationError(
                    "Duration cannot exceed 1440 minutes."
                )

        return value


    # =====================================================
    # CREATE WORKOUT
    # =====================================================

    def create(self, validated_data):

        exercises_data = validated_data.pop(
            "exercises",
            []
        )

        workout = Workout.objects.create(
            **validated_data
        )

        self._save_exercises(
            workout,
            exercises_data
        )

        return workout


    # =====================================================
    # UPDATE WORKOUT
    # =====================================================

    def update(
        self,
        instance,
        validated_data
    ):

        exercises_data = validated_data.pop(
            "exercises",
            None
        )


        # Update normal Workout fields
        for attr, value in validated_data.items():

            setattr(
                instance,
                attr,
                value
            )


        instance.save()


        # If exercises were included in PATCH/PUT,
        # replace the existing nested exercise data.
        #
        # If exercises were NOT supplied, leave them alone.
        if exercises_data is not None:

            instance.exercises.all().delete()

            self._save_exercises(
                instance,
                exercises_data
            )


        return instance


    # =====================================================
    # CREATE NESTED EXERCISES + SETS
    # =====================================================

    def _save_exercises(
        self,
        workout,
        exercises_data
    ):

        for index, exercise_data in enumerate(
            exercises_data,
            start=1
        ):

            sets_data = exercise_data.pop(
                "sets",
                []
            )


            # If frontend doesn't provide an order,
            # automatically assign one.
            if not exercise_data.get("order"):

                exercise_data["order"] = index


            workout_exercise = (
                WorkoutExercise.objects.create(
                    workout=workout,
                    **exercise_data
                )
            )


            for set_index, set_data in enumerate(
                sets_data,
                start=1
            ):

                # Automatically generate set number
                # if frontend doesn't provide one.
                if not set_data.get(
                    "set_number"
                ):

                    set_data[
                        "set_number"
                    ] = set_index


                Set.objects.create(
                    workout_exercise=
                        workout_exercise,

                    **set_data
                )


    # =====================================================
    # TOTAL VOLUME
    #
    # Example:
    # 10 reps × 50 kg = 500 kg volume
    # =====================================================

    def get_total_volume(
        self,
        obj
    ):

        total = 0

        for workout_exercise in (
            obj.exercises.all()
        ):

            for workout_set in (
                workout_exercise.sets.all()
            ):

                total += (
                    workout_set.reps
                    * workout_set.weight
                )

        return round(
            total,
            2
        )


    # =====================================================
    # TOTAL SETS
    # =====================================================

    def get_total_sets(
        self,
        obj
    ):

        return sum(
            workout_exercise.sets.count()
            for workout_exercise
            in obj.exercises.all()
        )


    # =====================================================
    # TOTAL REPS
    # =====================================================

    def get_total_reps(
        self,
        obj
    ):

        return sum(
            workout_set.reps

            for workout_exercise
            in obj.exercises.all()

            for workout_set
            in workout_exercise.sets.all()
        )