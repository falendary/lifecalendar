from rest_framework import viewsets

from .models import Category, Event
from .serializers import (
    CategorySerializer,
    EventSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.prefetch_related("categories").all()
    serializer_class = EventSerializer
    filterset_fields = ["type"]
