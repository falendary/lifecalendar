"""Data model for the life calendar.

Replaces the old client-side JSON blob (see example.json). Every entity that
came from the JSON carries a ``legacy_id`` (the original MD5 id) so the JSON
importer can upsert idempotently and keep relationships intact.
"""
from django.core.exceptions import ValidationError
from django.db import models


class RenderType(models.TextChoices):
    YEARS = "years", "Years"
    MONTHS = "months", "Months"
    SEASONS = "seasons", "Seasons"


class FeedType(models.TextChoices):
    FEED = "feed", "Feed"
    HISTORICAL = "historical", "Historical"


class Settings(models.Model):
    """Singleton holding app-wide settings (this is a single-user app)."""

    birthday = models.DateField(null=True, blank=True)
    render_type = models.CharField(
        max_length=16, choices=RenderType.choices, default=RenderType.SEASONS
    )
    events_feed_type = models.CharField(
        max_length=16, choices=FeedType.choices, default=FeedType.HISTORICAL
    )
    year_from = models.IntegerField(null=True, blank=True)
    year_to = models.IntegerField(null=True, blank=True)
    search_string = models.CharField(max_length=255, blank=True, default="")
    excluded_categories = models.ManyToManyField(
        "Category", blank=True, related_name="+",
        help_text="Categories hidden in the Life-in-weeks view.",
    )
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Settings"
        verbose_name_plural = "Settings"

    def __str__(self):
        return f"Settings (birthday={self.birthday})"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class Category(models.Model):
    legacy_id = models.CharField(max_length=64, unique=True, null=True, blank=True)
    name = models.CharField(max_length=255)
    color = models.CharField(max_length=16, blank=True, default="")

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class EventType(models.IntegerChoices):
    SINGLE = 1, "Single event"
    RECURRING = 2, "Recurring event"
    PERIOD = 3, "Period"


class DateType(models.IntegerChoices):
    """Recurrence cadence for recurring events."""

    DAILY = 1, "Daily"
    WEEKLY = 2, "Weekly"
    MONTHLY = 3, "Monthly"
    YEARLY = 4, "Yearly"


class Event(models.Model):
    legacy_id = models.CharField(max_length=64, unique=True, null=True, blank=True)
    type = models.IntegerField(choices=EventType.choices, default=EventType.SINGLE)
    name = models.CharField(max_length=255)
    text = models.TextField(blank=True, default="")
    color = models.CharField(max_length=16, blank=True, default="")
    important = models.BooleanField(
        default=False, help_text="A major event / achievement, shown in the Years view."
    )
    categories = models.ManyToManyField(Category, blank=True, related_name="events")

    # Single events use ``date``; recurring/period events use the range.
    date = models.DateField(null=True, blank=True)
    date_from = models.DateField(null=True, blank=True)
    date_to = models.DateField(null=True, blank=True)
    date_type = models.IntegerField(
        choices=DateType.choices, null=True, blank=True,
        help_text="Recurrence cadence (recurring events only).",
    )
    exclude_weekends = models.BooleanField(
        default=False, help_text="Period events: skip Saturdays and Sundays (e.g. work)."
    )
    background = models.BooleanField(
        default=False,
        help_text="Render as a subtle background status, not a prominent event (long-term periods).",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date", "date_from", "name"]

    def __str__(self):
        return self.name

    @property
    def anchor_date(self):
        """The date used for sorting/placing the event on the calendar."""
        return self.date or self.date_from

    def clean(self):
        if self.type == EventType.SINGLE:
            if not self.date:
                raise ValidationError({"date": "Single events require a date."})
        else:
            if not self.date_from or not self.date_to:
                raise ValidationError(
                    "Recurring and period events require date_from and date_to."
                )
            if self.date_to < self.date_from:
                raise ValidationError({"date_to": "date_to must be after date_from."})
        if self.type == EventType.RECURRING and not self.date_type:
            raise ValidationError({"date_type": "Recurring events require a cadence."})


class DayNote(models.Model):
    """Free-form note attached to a specific calendar day."""

    date = models.DateField(unique=True)
    text = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"Note {self.date}"
