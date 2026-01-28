"""
Audit and fix last_updated dates for all incident files.

Rules:
- last_updated = date file was first added to git (baseline)
- UNLESS there was a substantive story update (ruling, release, new details about the incident)
- Adding sources alone is NOT substantive
- Formatting/schema changes are NOT substantive
"""

import subprocess
import re
from pathlib import Path
from datetime import datetime

INCIDENTS_DIR = Path("docs/incidents")

SUBSTANTIVE_OVERRIDES = {
    "2026-01-12-garrison-gibson-battering-ram.md": "2026-01-18",
    "2026-01-13-mankato-women-sprayed.md": "2026-01-16",
    "2026-01-08-target-richfield-employees.md": "2026-01-15",
    "2026-01-14-nasra-ahmed-st-paul-citizen.md": "2026-01-17",
}


def get_file_creation_date(filepath):
    result = subprocess.run(
        [
            "git",
            "log",
            "--follow",
            "--diff-filter=A",
            "--format=%ci",
            "--",
            str(filepath),
        ],
        capture_output=True,
        text=True,
    )
    if result.stdout.strip():
        date_str = result.stdout.strip().split()[0]
        return date_str
    return None


def get_current_last_updated(filepath):
    content = filepath.read_text()
    match = re.search(r"^last_updated:\s*(\d{4}-\d{2}-\d{2})", content, re.MULTILINE)
    if match:
        return match.group(1)
    return None


def update_last_updated(filepath, new_date):
    content = filepath.read_text()
    new_content = re.sub(
        r"^(last_updated:\s*)\d{4}-\d{2}-\d{2}",
        f"\\g<1>{new_date}",
        content,
        flags=re.MULTILINE,
    )
    filepath.write_text(new_content)


def main():
    changes = []
    no_changes = []

    for md_file in sorted(INCIDENTS_DIR.rglob("*.md")):
        filename = md_file.name
        creation_date = get_file_creation_date(md_file)
        current_date = get_current_last_updated(md_file)

        correct_date = SUBSTANTIVE_OVERRIDES.get(filename, creation_date)

        if current_date != correct_date:
            changes.append(
                {
                    "file": str(md_file.relative_to(INCIDENTS_DIR)),
                    "current": current_date,
                    "correct": correct_date,
                    "reason": "substantive update"
                    if filename in SUBSTANTIVE_OVERRIDES
                    else "creation date",
                }
            )
            update_last_updated(md_file, correct_date)
        else:
            no_changes.append(str(md_file.relative_to(INCIDENTS_DIR)))

    print(f"\n=== CHANGES MADE ({len(changes)} files) ===\n")
    for c in changes:
        print(f"{c['file']}")
        print(f"  {c['current']} -> {c['correct']} ({c['reason']})")
        print()

    print(f"\n=== NO CHANGES NEEDED ({len(no_changes)} files) ===\n")
    for f in no_changes[:5]:
        print(f"  {f}")
    if len(no_changes) > 5:
        print(f"  ... and {len(no_changes) - 5} more")


if __name__ == "__main__":
    main()
