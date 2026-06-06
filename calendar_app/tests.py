import json
from datetime import date
from pathlib import Path

from django.conf import settings as dj_settings
from django.test import TestCase

from . import services
from .importer import import_data
from .models import (
    Category,
    DateType,
    DayNote,
    Event,
    EventType,
    Settings,
)


class CalendarLogicTests(TestCase):
    def test_iso_week_start_is_monday(self):
        # 2020-11-14 is a Saturday; its ISO week starts Monday 2020-11-09.
        self.assertEqual(services.iso_week_start(date(2020, 11, 14)), date(2020, 11, 9))

    def test_generate_weeks_marks_lived_and_current(self):
        birthday = date(1990, 1, 1)
        today = date(2000, 1, 1)
        squares = services.generate_weeks(birthday, 90, today=today)
        self.assertGreater(len(squares), 90 * 52)
        self.assertTrue(squares[0].lived)
        self.assertTrue(any(s.is_current for s in squares))
        # Nothing past today is lived.
        self.assertFalse(squares[-1].lived)

    def test_single_event_occurs_only_on_its_date(self):
        e = Event(type=EventType.SINGLE, name="x", date=date(2020, 5, 1))
        self.assertTrue(services.event_occurs_on(e, date(2020, 5, 1)))
        self.assertFalse(services.event_occurs_on(e, date(2020, 5, 2)))

    def test_yearly_recurrence_expands_per_year(self):
        e = Event(
            type=EventType.RECURRING,
            name="birthday",
            date_from=date(2000, 7, 26),
            date_to=date(2003, 7, 26),
            date_type=DateType.YEARLY,
        )
        dates = services.expand_event_dates(e)
        self.assertEqual(dates, [date(y, 7, 26) for y in range(2000, 2004)])

    def test_period_excludes_weekends(self):
        # Mon 2026-06-01 .. Sun 2026-06-07
        e = Event(
            type=EventType.PERIOD, name="work",
            date_from=date(2026, 6, 1), date_to=date(2026, 6, 7),
            exclude_weekends=True,
        )
        days = services.expand_event_dates(e)
        self.assertEqual(len(days), 5)  # Mon–Fri
        self.assertTrue(services.event_occurs_on(e, date(2026, 6, 5)))   # Fri
        self.assertFalse(services.event_occurs_on(e, date(2026, 6, 6)))  # Sat
        self.assertFalse(services.event_occurs_on(e, date(2026, 6, 7)))  # Sun
        # Without the flag, all 7 days are included.
        e.exclude_weekends = False
        self.assertEqual(len(services.expand_event_dates(e)), 7)

    def test_weekly_recurrence_one_per_week(self):
        e = Event(
            type=EventType.RECURRING,
            name="weekly",
            date_from=date(2021, 1, 1),
            date_to=date(2021, 1, 31),
            date_type=DateType.WEEKLY,
        )
        dates = services.expand_event_dates(e)
        weeks = {d.isocalendar()[:2] for d in dates}
        self.assertEqual(len(weeks), len(dates))


class ImportTests(TestCase):
    def setUp(self):
        path = Path(dj_settings.BASE_DIR) / "example.json"
        self.payload = json.loads(path.read_text(encoding="utf-8"))

    def test_import_example_json(self):
        summary = import_data(self.payload)
        self.assertEqual(Category.objects.count(), 20)
        # 1 top-level event + 3 single events under days{}
        self.assertEqual(Event.objects.count(), 4)
        self.assertEqual(Settings.load().birthday, date(1996, 7, 26))
        self.assertEqual(summary["categories"], 20)

    def test_import_is_idempotent(self):
        import_data(self.payload)
        import_data(self.payload)
        self.assertEqual(Category.objects.count(), 20)
        self.assertEqual(Event.objects.count(), 4)

    def test_dry_run_saves_nothing(self):
        import_data(self.payload, dry_run=True)
        self.assertEqual(Category.objects.count(), 0)
        self.assertEqual(Event.objects.count(), 0)


class ImportantFlagTests(TestCase):
    def test_special_category_flags_event_important(self):
        payload = {
            "categories": [
                {"id": "spec", "name": "Особое событие", "color": "#e69138"},
                {"id": "other", "name": "Работа", "color": "#b6d7a8"},
            ],
            "events": [
                {"id": "a", "type": 1, "name": "Graduated", "date": "2018-06-01",
                 "categories": ["spec"]},
                {"id": "b", "type": 1, "name": "Tuesday", "date": "2018-06-02",
                 "categories": ["other"]},
                {"id": "c", "type": 1, "name": "Flagged", "date": "2018-06-03",
                 "categories": [], "important": True},
            ],
        }
        import_data(payload)
        self.assertTrue(Event.objects.get(legacy_id="a").important)
        self.assertFalse(Event.objects.get(legacy_id="b").important)
        self.assertTrue(Event.objects.get(legacy_id="c").important)


class DayNoteImportTests(TestCase):
    def _payload(self):
        return {
            "days": {
                "2020-12-24": {
                    "date": "2020-12-24T00:00:00.000Z",
                    "notes": "Посмотрел фильм Платформа. Очень мрачное кино.",
                    "events": [
                        {
                            "id": "8896bfb24c701c145be69621c811864d",
                            "type": 1,
                            "name": "Посмотрел фильм Платформа",
                            "date": "2020-12-24T00:00:00.000Z",
                            "categories": [],
                        }
                    ],
                },
                "2021-01-01": {"date": "2021-01-01T00:00:00.000Z", "notes": "", "events": []},
            }
        }

    def test_notes_imported_as_day_notes(self):
        summary = import_data(self._payload())
        self.assertEqual(DayNote.objects.count(), 1)  # empty note skipped
        self.assertEqual(summary["day_notes"], 1)
        note = DayNote.objects.get(date=date(2020, 12, 24))
        self.assertIn("Платформа", note.text)
        self.assertEqual(Event.objects.count(), 1)

    def test_notes_import_is_idempotent(self):
        import_data(self._payload())
        import_data(self._payload())
        self.assertEqual(DayNote.objects.count(), 1)
