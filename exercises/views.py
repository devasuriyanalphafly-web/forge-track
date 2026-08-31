from rest_framework import (
    filters,
    permissions,
    viewsets,
)

from rest_framework.pagination import (
    PageNumberPagination,
)

from .models import Exercise
from .serializers import ExerciseSerializer


class StandardResultsSetPagination(
    PageNumberPagination
):
    page_size = 50

    page_size_query_param = "page_size"

    max_page_size = 100


class ExerciseViewSet(
    viewsets.ModelViewSet
):
    serializer_class = ExerciseSerializer

    pagination_class = (
        StandardResultsSetPagination
    )

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "name",
        "muscle_group",
        "equipment",
        "description",
    ]

    ordering_fields = [
        "name",
        "difficulty",
        "muscle_group",
        "created_at",
    ]

    ordering = [
        "name"
    ]


    def get_queryset(self):
        queryset = Exercise.objects.all()

        muscle = (
            self.request
            .query_params
            .get("muscle_group")
        )

        difficulty = (
            self.request
            .query_params
            .get("difficulty")
        )

        equipment = (
            self.request
            .query_params
            .get("equipment")
        )


        if muscle:
            queryset = queryset.filter(
                muscle_group__iexact=
                muscle.strip()
            )


        if difficulty:
            queryset = queryset.filter(
                difficulty__iexact=
                difficulty.strip()
            )


        if equipment:
            queryset = queryset.filter(
                equipment__icontains=
                equipment.strip()
            )


        return queryset


    def get_permissions(self):

        # Anyone can browse the exercise library
        if self.action in [
            "list",
            "retrieve",
        ]:

            permission_classes = [
                permissions.AllowAny
            ]

        # Only admins can modify master exercises
        else:

            permission_classes = [
                permissions.IsAdminUser
            ]


        return [
            permission()
            for permission
            in permission_classes
        ]