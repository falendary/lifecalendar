"""Calendar computation — the Python port of the old dataHelper.js logic.

The life calendar is a grid of ISO-week squares spanning ``years`` from the
birthday. Squares are derived (never stored); events are matched onto them by
ISO (year, week). Recurring events are expanded into their occurrences first.
"""
from dataclasses import dataclass, field
from datetime import date, timedelta

from .models import DateType, EventType

# month number -> season (1=Winter, 2=Spring, 3=Summer, 4=Autumn)
MONTH_TO_SEASON = {12: 1, 1: 1, 2: 1, 3: 2, 4: 2, 5: 2, 6: 3, 7: 3, 8: 3, 9: 4, 10: 4, 11: 4}
SEASON_NAMES = {1: "Winter", 2: "Spring", 3: "Summer", 4: "Autumn"}
MONTH_NAMES = {
    1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June",
    7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December",
}


def iso_week_start(d: date) -> date:
    """Return the Monday of the ISO week containing ``d``."""
    return d - timedelta(days=d.isoweekday() - 1)


@dataclass
class Square:
    index: int
    start: date
    end: date
    iso_year: int
    iso_week: int
    month: int
    season: int
    lived: bool = False
    is_current: bool = False
    events: list = field(default_factory=list)

    @property
    def key(self):
        return (self.iso_year, self.iso_week)


def generate_weeks(birthday: date, years: int, today: date | None = None) -> list[Square]:
    """Generate one Square per ISO week from the birth week for ``years`` years."""
    if today is None:
        today = date.today()

    start = iso_week_start(birthday)
    # Anchor end at the same calendar day ``years`` later (clamp day for Feb 29).
    end_day = min(birthday.day, 28)
    end_date = date(birthday.year + years, birthday.month, end_day)
    current_week_start = iso_week_start(today)

    squares = []
    cur = start
    index = 0
    while cur <= end_date:
        iso_year, iso_week, _ = cur.isocalendar()
        # Use the Thursday of the week to pick the representative month/year
        # (ISO weeks belong to the year containing their Thursday).
        rep = cur + timedelta(days=3)
        squares.append(
            Square(
                index=index,
                start=cur,
                end=cur + timedelta(days=6),
                iso_year=iso_year,
                iso_week=iso_week,
                month=rep.month,
                season=MONTH_TO_SEASON[rep.month],
                lived=cur < current_week_start,
                is_current=(cur == current_week_start),
            )
        )
        cur += timedelta(days=7)
        index += 1
    return squares


def _daterange(start: date, stop: date):
    cur = start
    while cur <= stop:
        yield cur
        cur += timedelta(days=1)


def _excluded(event, d: date) -> bool:
    """Whether a day is skipped because the event excludes weekends."""
    return bool(getattr(event, "exclude_weekends", False)) and d.isoweekday() >= 6


def expand_event_dates(event) -> list[date]:
    """Return the concrete occurrence dates for an event.

    Single -> [date]; period -> every day in range; recurring -> per cadence.
    Ported from generateRegularEvents() in dataHelper.js.
    """
    if event.type == EventType.SINGLE:
        return [event.date] if event.date else []

    if not event.date_from or not event.date_to:
        return []

    if event.type == EventType.PERIOD:
        return [d for d in _daterange(event.date_from, event.date_to) if not _excluded(event, d)]

    # Recurring
    if event.date_type == DateType.DAILY:
        return list(_daterange(event.date_from, event.date_to))

    if event.date_type == DateType.WEEKLY:
        # One occurrence per ISO week, on the same weekday as date_from.
        seen = set()
        result = []
        for d in _daterange(event.date_from, event.date_to):
            key = d.isocalendar()[:2]
            if key not in seen:
                seen.add(key)
                result.append(d)
        return result

    if event.date_type == DateType.MONTHLY:
        return [d for d in _daterange(event.date_from, event.date_to) if d.day == event.date_from.day]

    if event.date_type == DateType.YEARLY:
        return [
            d
            for d in _daterange(event.date_from, event.date_to)
            if d.day == event.date_from.day and d.month == event.date_from.month
        ]

    return []


def occurrences_in_window(event, start: date, end: date) -> list[date]:
    """All days in [start, end] on which the event occurs (efficient for a month)."""
    if event.type == EventType.SINGLE:
        return [event.date] if event.date and start <= event.date <= end else []
    if not event.date_from or not event.date_to:
        return []
    if event.type == EventType.PERIOD:
        cur = max(event.date_from, start)
        last = min(event.date_to, end)
        out = []
        while cur <= last:
            if not _excluded(event, cur):
                out.append(cur)
            cur += timedelta(days=1)
        return out
    # recurring
    return [d for d in expand_event_dates(event) if start <= d <= end]


def event_occurs_on(event, target: date) -> bool:
    """Whether an event has an occurrence on the given day."""
    if event.type == EventType.SINGLE:
        return event.date == target
    if not event.date_from or not event.date_to:
        return False
    if event.type == EventType.PERIOD:
        return event.date_from <= target <= event.date_to and not _excluded(event, target)
    return target in set(expand_event_dates(event))


def weeks_for_event(event) -> set:
    """Set of (iso_year, iso_week) keys an event should appear on."""
    return {d.isocalendar()[:2] for d in expand_event_dates(event)}


def event_week_placements(event):
    """Yield (display_date, (iso_year, iso_week)) for each week an event touches.

    ``display_date`` is the first occurring day in that week, so each placement
    links to a concrete day (weekend-excluded days are skipped for periods).
    """
    seen = set()
    for d in expand_event_dates(event):
        key = d.isocalendar()[:2]
        if key not in seen:
            seen.add(key)
            yield d, key


def build_grid(birthday: date, events, years: int, today: date | None = None) -> list[Square]:
    """Generate the week grid and attach (event, day) placements to each square.

    Each square's ``events`` becomes a list of (event, display_date) tuples, at
    most one per event per week (the earliest occurrence in that week).
    """
    squares = generate_weeks(birthday, years, today=today)
    by_key = {sq.key: sq for sq in squares}
    # Track which events are already placed on a square to avoid duplicates
    # (e.g. a daily recurrence would otherwise appear 7× in one week).
    seen: dict = {}
    for event in events:
        for display_date, key in event_week_placements(event):
            sq = by_key.get(key)
            if sq is None:
                continue
            marker = (id(sq), event.id)
            if marker in seen:
                continue
            seen[marker] = True
            sq.events.append((event, display_date))
    return squares


def group_squares(squares: list[Square], render_type: str):
    """Group squares into rows for rendering.

    Returns a list of (label, [squares]) tuples.
    """
    groups: list = []
    current_key = object()
    bucket = None
    for sq in squares:
        if render_type == "seasons":
            key = (sq.iso_year, sq.season)
            label = f"{SEASON_NAMES[sq.season]} {sq.iso_year}"
        elif render_type == "months":
            key = (sq.iso_year, sq.month)
            label = f"{MONTH_NAMES[sq.month]} {sq.iso_year}"
        else:  # years
            key = sq.iso_year
            label = str(sq.iso_year)
        if key != current_key:
            current_key = key
            bucket = (label, [])
            groups.append(bucket)
        bucket[1].append(sq)
    return groups
