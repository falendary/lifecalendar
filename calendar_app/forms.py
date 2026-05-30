from django import forms

from .models import DayNote, Event


class EventForm(forms.ModelForm):
    class Meta:
        model = Event
        fields = [
            "name", "type", "date", "date_from", "date_to", "date_type",
            "text", "color", "important", "categories",
        ]


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
