#!/usr/bin/env python3
"""
Run the full media pipeline: process raw media and regenerate summary.
"""

import subprocess
import sys
from pathlib import Path


def main():
    bin_dir = Path(__file__).parent
    state_repo = Path.cwd()

    print("=== Running Media Pipeline ===\n")

    print("Step 1: Processing raw media...")
    result = subprocess.run(
        [sys.executable, str(bin_dir / 'process_media.py')],
        cwd=state_repo
    )
    if result.returncode != 0:
        print("Error processing media")
        sys.exit(1)

    print("\nStep 2: Regenerating summary...")
    result = subprocess.run(
        [sys.executable, str(bin_dir / 'generate_summary.py')],
        cwd=state_repo
    )
    if result.returncode != 0:
        print("Error generating summary")
        sys.exit(1)

    print("\n=== Pipeline Complete ===")


if __name__ == '__main__':
    main()
