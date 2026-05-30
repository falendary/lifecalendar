import json

from django.core.management.base import BaseCommand, CommandError

from calendar_app.importer import import_data


class Command(BaseCommand):
    help = "Import a legacy life-calendar JSON file into the database."

    def add_arguments(self, parser):
        parser.add_argument("path", help="Path to the JSON file (e.g. example.json)")
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Parse and report counts without committing.",
        )

    def handle(self, *args, **options):
        try:
            with open(options["path"], encoding="utf-8") as fh:
                payload = json.load(fh)
        except (OSError, json.JSONDecodeError) as exc:
            raise CommandError(f"Could not read JSON: {exc}")

        summary = import_data(payload, dry_run=options["dry_run"])
        prefix = "[dry run] " if options["dry_run"] else ""
        self.stdout.write(self.style.SUCCESS(f"{prefix}Imported -> {summary}"))
