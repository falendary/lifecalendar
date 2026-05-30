"""Import a legacy life-calendar JSON blob (see example.json) into the models.

Idempotent: every record is upserted by its original ``legacy_id`` so importing
the same file twice does not create duplicates. Runs in a single transaction;
pass ``dry_run=True`` to roll back and just get the would-be counts.
"""
from datetime import date

from django.db import transaction

from .models import (
    Category,
    DayNote,
    Event,
    EventType,
    Settings,
)

# Events in this category are treated as major events / achievements on import.
IMPORTANT_CATEGORY_NAME = "Особое событие"


def parse_date(value):
    """Parse '2021-08-20' or '1941-05-16T00:00:00.000Z' into a date (or None)."""
    if not value:
        return None
    return date.fromisoformat(str(value)[:10])


def _to_int(value, default=None):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


class ImportSummary(dict):
    def __str__(self):
        return ", ".join(f"{k}: {v}" for k, v in self.items())


def import_data(payload: dict, dry_run: bool = False) -> ImportSummary:
    """Import a parsed JSON payload. Returns a summary of created/updated counts."""
    summary = ImportSummary(
        categories=0, events=0, day_notes=0
    )

    with transaction.atomic():
        # --- Categories (import first; events reference them) ---
        cat_by_legacy = {}
        for raw in payload.get("categories", []):
            legacy_id = raw.get("id")
            cat, _ = Category.objects.update_or_create(
                legacy_id=legacy_id,
                defaults={"name": raw.get("name", ""), "color": raw.get("color", "")},
            )
            cat_by_legacy[legacy_id] = cat
            summary["categories"] += 1

        def import_event(raw, *, force_single=False):
            event_type = EventType.SINGLE if force_single else _to_int(raw.get("type"), EventType.SINGLE)
            cats = [cat_by_legacy[c] for c in raw.get("categories", []) if c in cat_by_legacy]
            # Importance comes from an explicit flag or the "Особое событие" category.
            important = bool(raw.get("important")) or any(
                c.name == IMPORTANT_CATEGORY_NAME for c in cats
            )
            defaults = {
                "type": event_type,
                "name": raw.get("name", ""),
                "text": raw.get("text", ""),
                "color": raw.get("color", ""),
                "important": important,
                "date": None,
                "date_from": None,
                "date_to": None,
                "date_type": None,
            }
            if event_type == EventType.SINGLE:
                defaults["date"] = parse_date(raw.get("date"))
            else:
                defaults["date_from"] = parse_date(raw.get("date_from"))
                defaults["date_to"] = parse_date(raw.get("date_to"))
                defaults["date_type"] = _to_int(raw.get("date_type"))
            event, _ = Event.objects.update_or_create(
                legacy_id=raw.get("id"), defaults=defaults
            )
            event.categories.set(cats)
            summary["events"] += 1

        # --- Top-level events (periods / recurring / single) ---
        for raw in payload.get("events", []):
            import_event(raw)

        # --- Single events + journal notes stored under days{} ---
        for day_key, day in payload.get("days", {}).items():
            for raw in day.get("events", []):
                import_event(raw, force_single=True)
            notes = (day.get("notes") or "").strip()
            if notes:
                day_date = parse_date(day.get("date")) or parse_date(day_key)
                if day_date:
                    DayNote.objects.update_or_create(
                        date=day_date, defaults={"text": notes}
                    )
                    summary["day_notes"] += 1

        # --- Settings (singleton) ---
        settings = Settings.load()
        if "birthday" in payload:
            settings.birthday = parse_date(payload.get("birthday"))
        if payload.get("renderType"):
            settings.render_type = payload["renderType"]
        if payload.get("eventsFeedType"):
            settings.events_feed_type = payload["eventsFeedType"]
        filters = payload.get("filters", {})
        if filters.get("year_from") is not None:
            settings.year_from = filters["year_from"]
        if filters.get("year_to") is not None:
            settings.year_to = filters["year_to"]
        if filters.get("eventSearchString"):
            settings.search_string = filters["eventSearchString"]
        settings.save()

        if dry_run:
            transaction.set_rollback(True)

    return summary
