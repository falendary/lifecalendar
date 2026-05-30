# Lifecalendar

A "life in weeks" calendar: a grid of ISO-week squares spanning ~90 years from
your birthday, with weeks lived shaded and personal events pinned to the squares.

Originally a vanilla-JS single-page app backed by a JSON file. Now rebuilt on
**Django + Django REST Framework**, with server-rendered templates, the Django
admin for data management, and a JSON importer for existing exports.

## Stack

- Django 6 (server-rendered templates)
- Django REST Framework (read/write API under `/api/`)
- Django Admin (CRUD + JSON import tool)
- SQLite

## Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Then open http://127.0.0.1:8000/ (admin at `/admin/`).

## Importing existing data

The old app stored everything in one JSON blob (see `example.json`). Two ways
to import it:

- **Admin UI:** Admin → Settings → *Import JSON* (top right). Upload or paste
  the JSON; tick *Dry run* to preview counts without saving.
- **CLI:** `python manage.py import_json example.json` (add `--dry-run` to preview).

Imports are idempotent — records are matched on their original ids, so
re-importing updates in place instead of duplicating.

## Data model (`calendar_app/models.py`)

| Model | Purpose |
|---|---|
| `Settings` | Singleton: birthday, render type, year range, feed type |
| `Category` | Name + color, linked to events |
| `Event` | Single (`type=1`), recurring (`type=2`, daily/weekly/monthly/yearly), or period (`type=3`) |
| `DayPattern` / `PatternAction` | Daily time-budget template over a date range |
| `DayNote` | Free-form note for a specific day |
| `Balance` | Financial balance snapshots |

The week grid itself is **derived** (never stored) — see
`calendar_app/services.py`, the Python port of the old `dataHelper.js` date math.

## Pages

- `/` — the life-calendar grid (group by year / month / season, filter by year
  range, category, search)
- `/events/` — event list (historical / feed)
- `/categories/`, `/patterns/`, `/balances/` — listings
- `/day/<y>/<m>/<d>/` — a single day's events, day-pattern breakdown, and note
- `/api/` — DRF browsable API (events, categories, patterns, balances)

## Tests

```bash
python manage.py test calendar_app
```
