from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import api, views

router = DefaultRouter()
router.register("categories", api.CategoryViewSet)
router.register("events", api.EventViewSet)

urlpatterns = [
    path("", views.calendar_view, name="calendar"),
    path("years/", views.years_view, name="years_view"),
    path("weeks/", views.birdview, name="birdview"),
    path("month/", views.month_view, name="month_view"),
    path("month/<int:year>/<int:month>/", views.month_view, name="month_view"),
    path("week/<int:year>/<int:week>/", views.week_detail, name="week_detail"),
    path("day/<int:year>/<int:month>/<int:day>/", views.day_detail, name="day_detail"),
    path("events/", views.event_list, name="event_list"),
    path("events/add/", views.event_create, name="event_create"),
    path("events/<int:pk>/edit/", views.event_edit, name="event_edit"),
    path("journal/add/", views.journal_create, name="journal_create"),
    path("categories/", views.category_list, name="category_list"),
    path("journal/", views.journal_list, name="journal_list"),
    path("api/", include(router.urls)),
]
