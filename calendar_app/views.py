from datetime import date, timedelta
from itertools import groupby

from django.conf import settings as dj_settings
from django.contrib import messages
from django.shortcuts import get_object_or_404, redirect, render

from . import services
from .forms import EventForm, JournalForm
from .models import (
    Category,
    DateType,
    DayNote,
    Event,
    EventType,
    FeedType,
    RenderType,
    Settings,
)


def _int(value, default=None):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def effective_color(event):
    """An event's display color: its own, else its first category's."""
    if event.color:
        return event.color
    cats = list(event.categories.all())
    return cats[0].color if cats and cats[0].color else "#9fc5e8"


def decorate_squares(squares):
    """Attach display data to each grid square: event-color bars, a date-grouped
    tree (popover), and a faint tint for background ("status") events."""
    for sq in squares:
        ordered = sorted(sq.events, key=lambda pair: pair[1])
        normal = [(e, d) for (e, d) in ordered if not e.background]
        bg = [(e, d) for (e, d) in ordered if e.background]
        sq.items = [{"color": effective_color(e)} for (e, _) in normal]
        sq.bar_pct = round(100 / len(sq.items), 4) if sq.items else 0
        sq.bg_color = effective_color(bg[0][0]) if bg else ""
        sq.day_groups = [
            {
                "date": d,
                "events": [
                    {"name": e.name, "color": effective_color(e),
                     "important": e.important, "background": e.background}
                    for (e, _) in pairs
                ],
            }
            for d, pairs in groupby(ordered, key=lambda pair: pair[1])
        ]
        sq.has_important = any(e.important for (e, _) in normal)


def calendar_view(request):
    """The life-calendar grid: ISO-week squares grouped by year/month/season."""
    cfg = Settings.load()
    if not cfg.birthday:
        return render(request, "calendar_app/no_birthday.html", {"settings": cfg})

    render_type = request.GET.get("render") or cfg.render_type
    if render_type not in RenderType.values:
        render_type = RenderType.SEASONS

    years = dj_settings.LIFE_CALENDAR_YEARS

    # Apply event filters (search + category) up front; the grid and the
    # sidebar feed both reflect the same filtered set.
    q = (request.GET.get("q") or "").strip()
    category_id = _int(request.GET.get("category"))
    events = list(Event.objects.prefetch_related("categories").all())
    if q:
        events = [e for e in events if q.lower() in e.name.lower()]
    if category_id:
        events = [e for e in events if any(c.id == category_id for c in e.categories.all())]

    all_squares = services.build_grid(cfg.birthday, events, years)
    total = len(all_squares)
    lived = sum(1 for s in all_squares if s.lived)

    # Day counts + sleep "dead weight" (≈8h/day) for the progress bar.
    # The bar reads:  [past sleep][lived awake][available awake][future sleep]
    today = date.today()
    end_date = date(cfg.birthday.year + years, cfg.birthday.month, min(cfg.birthday.day, 28))
    total_days = (end_date - cfg.birthday).days
    lived_days = max(0, min((today - cfg.birthday).days, total_days))
    remaining_days = total_days - lived_days
    sleep_frac = dj_settings.SLEEP_HOURS_PER_DAY / 24

    def _pct(days):
        return round(days / total_days * 100, 3) if total_days else 0

    past_sleep_pct = _pct(lived_days * sleep_frac)
    lived_awake_pct = _pct(lived_days * (1 - sleep_frac))
    future_awake_pct = _pct(remaining_days * (1 - sleep_frac))
    future_sleep_pct = _pct(remaining_days * sleep_frac)

    sleep_days = round(total_days * sleep_frac)        # lifetime sleep
    available_days = round(remaining_days * (1 - sleep_frac))  # future awake
    lived_awake_days = round(lived_days * (1 - sleep_frac))

    # Year-range filtering (defaults to the saved filter, else the whole grid).
    year_from = _int(request.GET.get("year_from"), cfg.year_from) or all_squares[0].iso_year
    year_to = _int(request.GET.get("year_to"), cfg.year_to) or all_squares[-1].iso_year
    squares = [s for s in all_squares if year_from <= s.iso_year <= year_to]

    decorate_squares(squares)
    groups = services.group_squares(squares, render_type)

    # Sidebar feed: same year-range filter as the grid, grouped by month,
    # most recent first.
    feed = [
        e for e in events
        if e.anchor_date and year_from <= e.anchor_date.year <= year_to
    ]
    feed.sort(key=lambda e: e.anchor_date, reverse=True)
    sidebar_months = [
        {
            "label": date(y, m, 1).strftime("%B %Y"),
            "events": [
                {"event": e, "color": effective_color(e), "date": e.anchor_date}
                for e in group
            ],
        }
        for (y, m), group in groupby(feed[:200], key=lambda e: (e.anchor_date.year, e.anchor_date.month))
    ]

    context = {
        "settings": cfg,
        "groups": groups,
        "render_type": render_type,
        "render_types": RenderType.choices,
        "categories": Category.objects.all(),
        "total_weeks": total,
        "lived_weeks": lived,
        "remaining_weeks": total - lived,
        "lived_pct": round(lived / total * 100, 1) if total else 0,
        "total_days": total_days,
        "lived_days": lived_days,
        "remaining_days": remaining_days,
        "sleep_days": sleep_days,
        "available_days": available_days,
        "lived_awake_days": lived_awake_days,
        "past_sleep_pct": past_sleep_pct,
        "lived_awake_pct": lived_awake_pct,
        "future_awake_pct": future_awake_pct,
        "future_sleep_pct": future_sleep_pct,
        "year_from": year_from,
        "year_to": year_to,
        "q": q,
        "selected_category": category_id,
        "sidebar_months": sidebar_months,
        "today": today,
        "event_type_choices": EventType.choices,
        "date_type_choices": DateType.choices,
    }
    return render(request, "calendar_app/calendar.html", context)


def event_create(request):
    if request.method == "POST":
        form = EventForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Event added.")
        else:
            messages.error(request, f"Could not add event: {form.errors.as_text()}")
    return redirect(request.POST.get("next") or "calendar")


def event_edit(request, pk):
    event = get_object_or_404(Event.objects.prefetch_related("categories"), pk=pk)
    next_url = request.POST.get("next") or request.GET.get("next") or ""

    if request.method == "POST":
        if request.POST.get("delete"):
            event.delete()
            messages.success(request, "Event deleted.")
            return redirect(next_url or "event_list")
        form = EventForm(request.POST, instance=event)
        if form.is_valid():
            form.save()
            messages.success(request, "Event updated.")
            return redirect(next_url or "event_list")
        messages.error(request, f"Could not save: {form.errors.as_text()}")

    context = {
        "event": event,
        "selected_categories": {c.id for c in event.categories.all()},
        "categories": Category.objects.all(),
        "event_type_choices": EventType.choices,
        "date_type_choices": DateType.choices,
        "next": next_url,
    }
    # ?partial=1 → just the form fragment, for loading into the edit drawer.
    if request.GET.get("partial"):
        return render(request, "calendar_app/_event_edit_form.html", context)
    return render(request, "calendar_app/event_form.html", context)


def journal_create(request):
    if request.method == "POST":
        form = JournalForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Journal note saved.")
        else:
            messages.error(request, f"Could not save note: {form.errors.as_text()}")
    return redirect(request.POST.get("next") or "calendar")


def birdview(request):
    """The classic "life in weeks" bird's-eye: every week as a tiny square,
    one year per row, colors retained and clickable."""
    cfg = Settings.load()
    if not cfg.birthday:
        return render(request, "calendar_app/no_birthday.html", {"settings": cfg})

    # Toggling a category persists the choice in Settings, then redirects clean.
    toggle = request.GET.get("toggle")
    if toggle and toggle.isdigit():
        cid = int(toggle)
        if cfg.excluded_categories.filter(id=cid).exists():
            cfg.excluded_categories.remove(cid)
        elif Category.objects.filter(id=cid).exists():
            cfg.excluded_categories.add(cid)
        return redirect("birdview")
    if request.GET.get("clear"):
        cfg.excluded_categories.clear()
        return redirect("birdview")

    excluded = set(cfg.excluded_categories.values_list("id", flat=True))

    events = list(Event.objects.prefetch_related("categories").all())

    def hidden(e):
        cids = [c.id for c in e.categories.all()]
        # hide only when every one of the event's categories is excluded
        return bool(cids) and all(cid in excluded for cid in cids)

    visible = [e for e in events if not hidden(e)]
    squares = services.build_grid(cfg.birthday, visible, dj_settings.LIFE_CALENDAR_YEARS)
    total = len(squares)
    lived = sum(1 for s in squares if s.lived)
    decorate_squares(squares)
    groups = services.group_squares(squares, "years")

    # Toggle chips: each flips its category in the saved Settings.
    toggles = [
        {"name": c.name, "color": c.color, "excluded": c.id in excluded,
         "url": "?toggle=%d" % c.id}
        for c in Category.objects.all()
    ]

    context = {
        "settings": cfg,
        "groups": groups,
        "total_weeks": total,
        "lived_weeks": lived,
        "lived_pct": round(lived / total * 100, 1) if total else 0,
        "category_toggles": toggles,
        "has_excluded": bool(excluded),
    }
    return render(request, "calendar_app/birdview.html", context)


def years_view(request):
    """One square per year of life, surfacing only important events (achievements)."""
    cfg = Settings.load()
    if not cfg.birthday:
        return render(request, "calendar_app/no_birthday.html", {"settings": cfg})

    start_year = cfg.birthday.year
    end_year = start_year + dj_settings.LIFE_CALENDAR_YEARS
    today = date.today()

    important = Event.objects.filter(important=True).prefetch_related("categories")
    by_year: dict = {}
    for e in important:
        d = e.anchor_date
        if d:
            by_year.setdefault(d.year, []).append((e, d))

    cells = []
    achievements = []  # (year, [items]) for the chronological list below the grid
    total = 0
    for y in range(start_year, end_year + 1):
        ordered = sorted(by_year.get(y, []), key=lambda pair: pair[1])
        items = [
            {"name": e.name, "color": effective_color(e), "date": d} for (e, d) in ordered
        ]
        total += len(items)
        cells.append(
            {
                "year": y,
                "age": y - start_year,
                "lived": y < today.year,
                "current": y == today.year,
                "items": items,
            }
        )
        if items:
            achievements.append({"year": y, "age": y - start_year, "items": items})

    context = {
        "settings": cfg,
        "cells": cells,
        "achievements": achievements,
        "total_important": total,
    }
    return render(request, "calendar_app/years.html", context)


def week_detail(request, year, week):
    """A whole ISO week (Mon–Sun): each day's events and journal note."""
    monday = date.fromisocalendar(year, week, 1)
    days = [monday + timedelta(days=i) for i in range(7)]
    all_events = list(Event.objects.prefetch_related("categories").all())
    notes = {n.date: n for n in DayNote.objects.filter(date__in=days)}

    rows = []
    for d in days:
        events = [e for e in all_events if services.event_occurs_on(e, d)]
        rows.append({"date": d, "events": events, "note": notes.get(d)})

    context = {
        "year": year,
        "week": week,
        "monday": monday,
        "sunday": days[-1],
        "rows": rows,
    }
    return render(request, "calendar_app/week_detail.html", context)


def month_view(request, year=None, month=None):
    """A classic month grid. Period events render as bars spanning their days;
    single/recurring events are per-day rows; background periods are a faint tint."""
    import calendar as _cal

    today = date.today()
    year = year or today.year
    month = month or today.month

    weeks = _cal.Calendar(firstweekday=0).monthdatescalendar(year, month)
    win_start, win_end = weeks[0][0], weeks[-1][-1]

    all_events = list(Event.objects.prefetch_related("categories"))
    day_events: dict = {}   # date -> single/recurring events (rows)
    bg_color: dict = {}     # date -> faint background tint
    period_events = []      # non-background periods (drawn as bars)
    for e in all_events:
        if e.background:
            for d in services.occurrences_in_window(e, win_start, win_end):
                bg_color.setdefault(d, effective_color(e))
        elif e.type == EventType.PERIOD:
            if e.date_from and e.date_to and e.date_from <= win_end and e.date_to >= win_start:
                period_events.append(e)
        else:
            for d in services.occurrences_in_window(e, win_start, win_end):
                day_events.setdefault(d, []).append(e)

    noted = set(
        DayNote.objects.filter(date__range=(win_start, win_end)).values_list("date", flat=True)
    )

    weeks_ctx = []
    for week in weeks:
        wstart, wend = week[0], week[-1]

        # Period bars: contiguous runs of occurring days within this week.
        segments = []
        for e in period_events:
            cols = [i for i, d in enumerate(week) if services.event_occurs_on(e, d)]
            if not cols:
                continue
            run = [cols[0]]
            runs = []
            for c in cols[1:]:
                if c == run[-1] + 1:
                    run.append(c)
                else:
                    runs.append(run)
                    run = [c]
            runs.append(run)
            for r in runs:
                segments.append({
                    "id": e.id, "name": e.name, "color": effective_color(e),
                    "start1": r[0] + 1, "span": len(r),
                    "open_l": e.date_from < wstart, "open_r": e.date_to > wend,
                })
        # Lane packing (greedy).
        segments.sort(key=lambda s: (s["start1"], -s["span"]))
        lane_end = []
        for s in segments:
            for i, end in enumerate(lane_end):
                if s["start1"] > end:
                    lane_end[i] = s["start1"] + s["span"] - 1
                    s["lane1"] = i + 1
                    break
            else:
                s["lane1"] = len(lane_end) + 1
                lane_end.append(s["start1"] + s["span"] - 1)

        days = []
        for d in week:
            evs = sorted(day_events.get(d, []), key=lambda e: e.name)
            days.append({
                "date": d,
                "in_month": d.month == month,
                "is_today": d == today,
                "events": [{"id": e.id, "name": e.name, "color": effective_color(e), "important": e.important} for e in evs],
                "bg_color": bg_color.get(d, ""),
                "has_note": d in noted,
            })
        weeks_ctx.append({"days": days, "bars": segments, "lanes": len(lane_end)})

    first = date(year, month, 1)
    prev_m = first - timedelta(days=1)
    next_m = (first + timedelta(days=31)).replace(day=1)

    context = {
        "weeks": weeks_ctx,
        "weekday_names": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "label": first.strftime("%B %Y"),
        "year": year, "month": month,
        "prev": prev_m, "next": next_m,
        "is_current": (year == today.year and month == today.month),
        # for the shared Add Event drawer
        "categories": Category.objects.all(),
        "today": today,
        "event_type_choices": EventType.choices,
        "date_type_choices": DateType.choices,
    }
    return render(request, "calendar_app/month.html", context)


def day_detail(request, year, month, day):
    target = date(year, month, day)
    events = [
        e
        for e in Event.objects.prefetch_related("categories").all()
        if services.event_occurs_on(e, target)
    ]
    note = DayNote.objects.filter(date=target).first()
    context = {
        "date": target,
        "events": events,
        "note": note,
    }
    return render(request, "calendar_app/day_detail.html", context)


def event_list(request):
    cfg = Settings.load()
    feed_type = request.GET.get("feed") or cfg.events_feed_type
    q = (request.GET.get("q") or "").strip()

    events = Event.objects.prefetch_related("categories")
    if q:
        events = events.filter(name__icontains=q)
    events = list(events)
    # Latest events on top.
    events.sort(key=lambda e: (e.anchor_date or date.min), reverse=True)

    context = {
        "events": events,
        "feed_type": feed_type,
        "feed_types": FeedType.choices,
        "q": q,
    }
    return render(request, "calendar_app/event_list.html", context)


def category_list(request):
    categories = Category.objects.all()
    context = {
        "categories": [(c, c.events.count()) for c in categories],
    }
    return render(request, "calendar_app/category_list.html", context)


def journal_list(request):
    q = (request.GET.get("q") or "").strip()
    notes = DayNote.objects.all()
    if q:
        notes = notes.filter(text__icontains=q)
    return render(request, "calendar_app/journal_list.html", {"notes": notes, "q": q})
