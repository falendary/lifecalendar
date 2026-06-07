import json

from django.contrib import admin, messages
from django.shortcuts import redirect, render
from django.urls import path
from django.utils.html import format_html

from .importer import import_data
from .models import (
    Category,
    DayNote,
    Event,
    Goal,
    GoalYear,
    Settings,
)


def color_swatch(color):
    if not color:
        return "—"
    return format_html(
        '<span style="display:inline-block;width:14px;height:14px;border:1px solid '
        '#999;border-radius:3px;background:{};vertical-align:middle"></span> {}',
        color,
        color,
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "swatch")
    search_fields = ("name",)

    @admin.display(description="Color")
    def swatch(self, obj):
        return color_swatch(obj.color)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "important", "type", "date", "date_from", "date_to", "swatch", "created_at")
    list_display_links = ("name",)
    list_editable = ("important",)
    list_filter = ("important", "type", "date_type", "categories")
    search_fields = ("name", "text")
    filter_horizontal = ("categories",)
    date_hierarchy = "date"
    readonly_fields = ("created_at", "modified_at")
    ordering = ("-id",)

    @admin.display(description="Color")
    def swatch(self, obj):
        return color_swatch(obj.color)


@admin.register(DayNote)
class DayNoteAdmin(admin.ModelAdmin):
    list_display = ("date",)
    date_hierarchy = "date"


class GoalYearInline(admin.TabularInline):
    model = GoalYear
    extra = 1


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "achieved_on", "modified_at")
    list_filter = ("status",)
    search_fields = ("title", "description")
    readonly_fields = ("created_at", "modified_at")
    inlines = [GoalYearInline]


@admin.register(Settings)
class SettingsAdmin(admin.ModelAdmin):
    """Singleton config + the JSON import tool."""

    change_list_template = "admin/calendar_app/settings_changelist.html"

    def get_urls(self):
        urls = super().get_urls()
        custom = [
            path(
                "import-json/",
                self.admin_site.admin_view(self.import_json_view),
                name="calendar_app_import_json",
            ),
        ]
        return custom + urls

    def has_add_permission(self, request):
        return not Settings.objects.exists()

    def import_json_view(self, request):
        context = {
            **self.admin_site.each_context(request),
            "title": "Import life-calendar JSON",
            "opts": self.model._meta,
        }

        if request.method == "POST":
            upload = request.FILES.get("json_file")
            if upload:
                raw = upload.read().decode("utf-8")
            else:
                raw = request.POST.get("json_text", "")

            dry_run = bool(request.POST.get("dry_run"))

            try:
                payload = json.loads(raw)
            except (json.JSONDecodeError, ValueError) as exc:
                messages.error(request, f"Invalid JSON: {exc}")
                return render(request, "admin/calendar_app/import_json.html", context)

            try:
                summary = import_data(payload, dry_run=dry_run)
            except Exception as exc:  # surface import errors to the admin user
                messages.error(request, f"Import failed: {exc}")
                return render(request, "admin/calendar_app/import_json.html", context)

            prefix = "Dry run — nothing saved. " if dry_run else ""
            messages.success(request, f"{prefix}Imported → {summary}")
            if dry_run:
                return render(request, "admin/calendar_app/import_json.html", context)
            return redirect("admin:calendar_app_settings_changelist")

        return render(request, "admin/calendar_app/import_json.html", context)
