"""
generate_summary_page.py - Create a static summary page with og-image

Creates:
- docs/summaries/YYYY-MM-DD/index.html - Static summary page
- docs/summary-og-images/YYYY-MM-DD.jpg - Custom og-image collage

Usage: python-main scripts/generate_summary_page.py 2026-01-22
"""

import sys
import json
import shutil
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent
MEDIA_DIR = PROJECT_ROOT / "docs" / "media"
SUMMARIES_DIR = PROJECT_ROOT / "docs" / "summaries"
OG_IMAGES_DIR = PROJECT_ROOT / "docs" / "summary-og-images"
SUMMARY_JSON = PROJECT_ROOT / "docs" / "data" / "incidents-summary.json"


def find_incidents_for_date(target_date):
    with open(SUMMARY_JSON) as f:
        data = json.load(f)

    incidents = data.get("incidents", data)

    matching = []
    for inc in incidents:
        created = (inc.get("created") or "")[:10]
        updated = (inc.get("lastUpdated") or "")[:10]
        if created == target_date or updated == target_date:
            inc["is_new"] = created == target_date
            inc["is_updated"] = updated == target_date and created != target_date
            slug = inc.get("filePath", "").replace("incidents/", "").replace(".md", "")
            slug = slug.split("/")[-1]
            inc["slug"] = slug
            if not slug.startswith("_"):
                matching.append(inc)

    return matching


def find_og_image_for_incident(incident):
    slug = incident.get("slug", "")
    for ext in [".jpg", ".png"]:
        for pattern in [f"{slug}-og-*{ext}", f"{slug}{ext}"]:
            matches = list(MEDIA_DIR.glob(pattern))
            if matches:
                return matches[0]
    return None


def copy_og_image(image_paths, output_path):
    if not image_paths:
        return False

    shutil.copy(image_paths[0], output_path)
    return True


def format_date_display(date_str):
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    return dt.strftime("%B %d, %Y")


def format_date_short(date_str):
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    return dt.strftime("%b %d")


def generate_html(target_date, incidents):
    date_display = format_date_display(target_date)
    date_short = format_date_short(target_date)

    new_incidents = [i for i in incidents if i.get("is_new")]
    updated_incidents = [i for i in incidents if i.get("is_updated")]

    incident_list_html = ""

    if new_incidents:
        incident_list_html += "<h3>New</h3><ul>"
        for inc in new_incidents:
            incident_list_html += f'<li><a href="/entry/{inc["slug"]}">{inc["title"]}</a></li>'
        incident_list_html += "</ul>"

    if updated_incidents:
        incident_list_html += "<h3>Updated</h3><ul>"
        for inc in updated_incidents:
            incident_list_html += f'<li><a href="/entry/{inc["slug"]}">{inc["title"]}</a></li>'
        incident_list_html += "</ul>"

    description = f"Incidents added or updated on {date_display} documenting ICE/CBP civil rights incidents in Minnesota."

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Summary: {date_short} | MN ICE Witness</title>
    <meta name="description" content="{description}">

    <!-- Open Graph / Social Media -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://mn-ice-witness.org/summaries/{target_date}/">
    <meta property="og:title" content="Summary: {date_short} | MN ICE Witness">
    <meta property="og:description" content="{description}">
    <meta property="og:image" content="https://mn-ice-witness.org/summary-og-images/{target_date}.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Summary: {date_short} | MN ICE Witness">
    <meta name="twitter:description" content="{description}">
    <meta name="twitter:image" content="https://mn-ice-witness.org/summary-og-images/{target_date}.jpg">

    <link rel="stylesheet" href="/css/style.css">
    <link rel="icon" type="image/x-icon" href="/assets/favicon.ico">
</head>
<body>
    <header>
        <h1><a href="/">MN ICE Witness</a></h1>
    </header>
    <main class="summary-page">
        <h2>Summary: {date_display}</h2>
        <p>{description}</p>
        {incident_list_html}
        <p><a href="/">&larr; Back to all incidents</a></p>
    </main>
</body>
</html>
'''
    return html


def generate_summary(target_date):
    print(f"Generating summary for {target_date}...")

    incidents = find_incidents_for_date(target_date)
    print(f"  Found {len(incidents)} incidents")

    if not incidents:
        print(f"  No incidents found for {target_date}")
        return

    image_paths = []
    for inc in incidents:
        img = find_og_image_for_incident(inc)
        if img:
            image_paths.append(img)
    print(f"  Found {len(image_paths)} images")

    og_output = OG_IMAGES_DIR / f"{target_date}.jpg"
    if copy_og_image(image_paths, og_output):
        print(f"  Copied og-image: {og_output}")
    else:
        print(f"  No og-image available")

    summary_dir = SUMMARIES_DIR / target_date
    summary_dir.mkdir(parents=True, exist_ok=True)

    html = generate_html(target_date, incidents)
    html_output = summary_dir / "index.html"
    html_output.write_text(html)
    print(f"  Generated: {html_output}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python-main scripts/generate_summary_page.py YYYY-MM-DD [YYYY-MM-DD ...]")
        sys.exit(1)

    for date in sys.argv[1:]:
        generate_summary(date)
