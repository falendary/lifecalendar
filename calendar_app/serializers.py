from rest_framework import serializers

from .models import Category, Event


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "color"]


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "id", "type", "name", "text", "color", "categories",
            "date", "date_from", "date_to", "date_type",
        ]
