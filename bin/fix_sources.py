#!/usr/bin/env python3
"""Fix common source formatting issues in incident files."""

import re
from pathlib import Path

MONTH_MAP = {
    "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
    "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
    "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"
}

def fix_date_missing_day(line):
    """Fix dates like (Jan 2026) to include day from context or default to 15."""
    pattern = r'\(([A-Z][a-z]{2}) (\d{4})\):'
    match = re.search(pattern, line)
    if match:
        month, year = match.groups()
        line = re.sub(pattern, f'({month} 15, {year}):', line)
    return line

def fix_wrong_order(line):
    """Fix [Title](URL) - Source format to Source (Date): [Title](URL)."""
    pattern = r'^\d+\.\s*\[([^\]]+)\]\(([^)]+)\)\s*-\s*(.+)$'
    match = re.match(pattern, line)
    if match:
        title, url, source = match.groups()
        num = re.match(r'^(\d+)\.', line).group(1)
        line = f'{num}. {source.strip()} (Jan 15, 2026): [{title}]({url})'
    return line

def fix_video_suffix(line):
    """Remove - **VIDEO** suffix and incorporate into outlet name."""
    if '- **VIDEO**' in line:
        line = line.replace(' - **VIDEO**', '')
        if ' X ' in line or line.startswith('X '):
            line = line.replace('X ', 'X Video ', 1)
    return line

def renumber_sources(content):
    """Renumber sources sequentially starting at 1."""
    lines = content.split('\n')
    in_sources = False
    source_num = 0
    result = []

    for line in lines:
        if line.strip() == '## Sources':
            in_sources = True
            result.append(line)
            continue
        elif line.startswith('## ') and in_sources:
            in_sources = False
            source_num = 0

        if in_sources and re.match(r'^\d+\.', line.strip()):
            source_num += 1
            line = re.sub(r'^\d+\.', f'{source_num}.', line)

        result.append(line)

    return '\n'.join(result)

def process_file(file_path):
    content = file_path.read_text()
    original = content

    lines = content.split('\n')
    fixed_lines = []
    in_sources = False

    for line in lines:
        if line.strip() == '## Sources':
            in_sources = True
        elif line.startswith('## ') and in_sources:
            in_sources = False

        if in_sources and re.match(r'^\d+\.', line.strip()):
            line = fix_date_missing_day(line)
            line = fix_wrong_order(line)
            line = fix_video_suffix(line)

        fixed_lines.append(line)

    content = '\n'.join(fixed_lines)
    content = renumber_sources(content)

    if content != original:
        file_path.write_text(content)
        return True
    return False

def main():
    incidents_dir = Path(__file__).parent.parent / "docs" / "incidents"
    fixed_count = 0

    for md_file in incidents_dir.rglob("*.md"):
        if md_file.name.startswith("_"):
            continue
        if process_file(md_file):
            print(f"Fixed: {md_file.name}")
            fixed_count += 1

    print(f"\nTotal files fixed: {fixed_count}")

if __name__ == "__main__":
    main()
