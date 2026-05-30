from datetime import date, timedelta
from itertools import groupby

from django.conf import settings as dj_settings
from django.contrib import messages
from django.shortcuts import redirect, render

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

    # Year-range filtering (defaults to the saved filter, else the whole grid).
    year_from = _int(request.GET.get("year_from"), cfg.year_from) or all_squares[0].iso_year
    year_to = _int(request.GET.get("year_to"), cfg.year_to) or all_squares[-1].iso_year
    squares = [s for s in all_squares if year_from <= s.iso_year <= year_to]

    # Build per-event color "bars" + a date-grouped tree for each square.
    for sq in squares:
        ordered = sorted(sq.events, key=lambda pair: pair[1])
        sq.items = [{"color": effective_color(e)} for (e, _) in ordered]
        sq.bar_pct = round(100 / len(sq.items), 4) if sq.items else 0
        sq.day_groups = [
            {
                "date": d,
                "events": [
                    {"name": e.name, "color": effective_color(e), "important": e.important}
                    for (e, _) in pairs
                ],
            }
            for d, pairs in groupby(ordered, key=lambda pair: pair[1])
        ]
        sq.has_important = any(e.important for (e, _) in ordered)

    groups = services.group_squares(squares, render_type)

    # Sidebar feed: filtered events, most recent first.
    feed = sorted(events, key=lambda e: (e.anchor_date or date.min), reverse=True)
    sidebar_events = [
        {"event": e, "color": effective_color(e), "date": e.anchor_date} for e in feed[:150]
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
        "year_from": year_from,
        "year_to": year_to,
        "q": q,
        "selected_category": category_id,
        "sidebar_events": sidebar_events,
        "today": date.today(),
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


def journal_create(request):
    if request.method == "POST":
        form = JournalForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Journal note saved.")
        else:
            messages.error(request, f"Could not save note: {form.errors.as_text()}")
    return redirect(request.POST.get("next") or "calendar")


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
