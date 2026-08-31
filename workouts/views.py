from rest_framework import permissions, viewsets

from .models import Workout
from .serializers import WorkoutSerializer


class WorkoutViewSet(viewsets.ModelViewSet):

    serializer_class = WorkoutSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]


    def get_queryset(self):

        return (
            Workout.objects
            .filter(
                user=self.request.user
            )
            .prefetch_related(
                "exercises__sets",
                "exercises__exercise"
            )
        )


    def perform_create(
        self,
        serializer
    ):

        serializer.save(
            user=self.request.user
        )