from rest_framework import (
    filters,
    permissions,
    viewsets,
)

from .models import Goal
from .serializers import GoalSerializer


class GoalViewSet(
    viewsets.ModelViewSet
):

    serializer_class = GoalSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "title",
        "description",
    ]

    ordering_fields = [
        "created_at",
        "updated_at",
        "title",
        "is_completed",
    ]


    def get_queryset(self):

        queryset = Goal.objects.filter(
            user=self.request.user
        )

        completed = (
            self.request
            .query_params
            .get("completed")
        )


        if completed in [
            "true",
            "1",
        ]:

            queryset = queryset.filter(
                is_completed=True
            )


        elif completed in [
            "false",
            "0",
        ]:

            queryset = queryset.filter(
                is_completed=False
            )


        return queryset


    def perform_create(
        self,
        serializer
    ):

        serializer.save(
            user=self.request.user
        )