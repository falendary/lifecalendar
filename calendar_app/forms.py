from django import forms

from .models import DayNote, Event, EventType, Goal


class EventForm(forms.ModelForm):
    class Meta:
        model = Event
        fields = [
            "name", "type", "date", "date_from", "date_to", "date_type",
            "exclude_weekends", "background", "text", "color", "important", "categories",
        ]

    def clean(self):
        """Keep only the date fields relevant to the chosen type, so a hidden
        input from another type can't leak a stray value (e.g. a Period event
        must not carry a single `date`)."""
        cleaned = super().clean()
        etype = cleaned.get("type")
        if etype == EventType.SINGLE:
            cleaned["date_from"] = cleaned["date_to"] = cleaned["date_type"] = None
        elif etype == EventType.PERIOD:
            cleaned["date"] = cleaned["date_type"] = None
        elif etype == EventType.RECURRING:
            cleaned["date"] = None
        # "Exclude weekends" only applies to period events.
        if etype != EventType.PERIOD:
            cleaned["exclude_weekends"] = False
        # "Background" status is for periods / recurring, not single events.
        if etype == EventType.SINGLE:
            cleaned["background"] = False
        return cleaned


class JournalForm(forms.ModelForm):
    """Upserts a note by date (one note per day)."""

    class Meta:
        model = DayNote
        fields = ["date", "text"]

    def validate_unique(self):
        # We upsert by date in save(), so skip the unique-date check.
        pass

    def save(self, commit=True):
        note, _ = DayNote.objects.update_or_create(
            date=self.cleaned_data["date"],
            defaults={"text": self.cleaned_data.get("text", "")},
        )
        return note


class GoalForm(forms.ModelForm):
    class Meta:
        model = Goal
        fields = ["title", "description", "status", "color", "achieved_on"]


def parse_years(raw):
    """Parse a comma/space-separated year string into a sorted list of ints,
    e.g. "2026, 2027" -> [2026, 2027]. Ignores junk and out-of-range values."""
    years = set()
    for chunk in (raw or "").replace(",", " ").split():
        try:
            y = int(chunk)
        except ValueError:
            continue
        if 1900 <= y <= 2200:
            years.add(y)
    return sorted(years)
