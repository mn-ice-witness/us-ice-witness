#!/usr/bin/env python3
"""
Configuration loader for ICE Witness.

Loads configuration from:
- ~/.ice-witness.config (user-level: Python executable path)
- ./ice-witness.config (project-level: contact email, state info)

All scripts should use this module to get configuration values.
"""

from pathlib import Path
import sys

try:
    import yaml
except ImportError:
    print("ERROR: PyYAML is required but not installed.")
    print()
    print("Install it with:")
    print("  python3 -m pip install pyyaml")
    print()
    print("See https://docs.ice-witness.org/setup for full setup instructions.")
    sys.exit(1)


DOCS_URL = "https://docs.ice-witness.org"


def get_user_config_path():
    return Path.home() / ".ice-witness.config"


def get_project_config_path(project_root):
    return Path(project_root) / "ice-witness.config"


def load_user_config():
    """
    Load user-level configuration from ~/.ice-witness.config

    Required fields:
    - python_exe: Path to Python executable with required packages

    Returns dict or exits with error if config is missing/invalid.
    """
    config_path = get_user_config_path()

    if not config_path.exists():
        print(f"ERROR: User config file not found: {config_path}")
        print()
        print("Create ~/.ice-witness.config with your Python path:")
        print()
        print("  python_exe: /path/to/your/python3")
        print()
        print(f"See {DOCS_URL}/setup for setup instructions.")
        sys.exit(1)

    with open(config_path) as f:
        config = yaml.safe_load(f)

    if not config:
        print(f"ERROR: Config file is empty: {config_path}")
        print(f"See {DOCS_URL}/setup for setup instructions.")
        sys.exit(1)

    if "python_exe" not in config:
        print(f"ERROR: 'python_exe' not set in {config_path}")
        print()
        print("Add this line to your config:")
        print("  python_exe: /path/to/your/python3")
        print()
        print(f"See {DOCS_URL}/setup for setup instructions.")
        sys.exit(1)

    python_path = Path(config["python_exe"]).expanduser()
    if not python_path.exists():
        print(f"ERROR: Python executable not found: {python_path}")
        print()
        print(f"Update 'python_exe' in {config_path}")
        print(f"See {DOCS_URL}/setup for setup instructions.")
        sys.exit(1)

    config["python_exe"] = str(python_path)
    return config


def load_project_config(project_root):
    """
    Load project-level configuration from ice-witness.config

    Required fields:
    - contact_email: Email for the footer/contact
    - state_code: Two-letter state code (e.g., CO, AL, ME)
    - state_name: Full state name (e.g., Colorado)

    Returns dict or exits with error if config is missing/invalid.
    """
    config_path = get_project_config_path(project_root)

    if not config_path.exists():
        print(f"ERROR: Project config file not found: {config_path}")
        print()
        print("Create ice-witness.config in your state repo root:")
        print()
        print("  state_code: CO")
        print("  state_name: Colorado")
        print("  contact_email: tips@ice-witness.org")
        print()
        print(f"See {DOCS_URL}/setup for setup instructions.")
        sys.exit(1)

    with open(config_path) as f:
        config = yaml.safe_load(f)

    if not config:
        print(f"ERROR: Config file is empty: {config_path}")
        print(f"See {DOCS_URL}/setup for setup instructions.")
        sys.exit(1)

    required = ["contact_email", "state_code", "state_name"]
    missing = [f for f in required if f not in config]
    if missing:
        print(f"ERROR: Missing fields in {config_path}: {', '.join(missing)}")
        print()
        print("Required fields:")
        print("  state_code: CO")
        print("  state_name: Colorado")
        print("  contact_email: tips@ice-witness.org")
        print()
        print(f"See {DOCS_URL}/setup for setup instructions.")
        sys.exit(1)

    return config


def validate_python_packages(python_exe):
    """
    Validate that required Python packages are installed.

    Required packages:
    - pyyaml: For config file parsing
    - pillow: For OG image generation

    Returns True if all packages available, exits with error otherwise.
    """
    import subprocess

    packages = [
        ("yaml", "pyyaml"),
        ("PIL", "pillow"),
    ]

    missing = []
    for import_name, pip_name in packages:
        result = subprocess.run(
            [python_exe, "-c", f"import {import_name}"],
            capture_output=True
        )
        if result.returncode != 0:
            missing.append(pip_name)

    if missing:
        print(f"ERROR: Missing Python packages: {', '.join(missing)}")
        print()
        print("Install them with:")
        for pkg in missing:
            print(f"  {python_exe} -m pip install {pkg}")
        print()
        print(f"See {DOCS_URL}/setup for setup instructions.")
        sys.exit(1)

    return True


def validate_external_tools():
    """
    Validate that required external tools are installed.

    Required tools:
    - ffmpeg: For media processing
    - ffprobe: For media info extraction

    Returns True if all tools available, exits with error otherwise.
    """
    import shutil

    tools = ["ffmpeg", "ffprobe"]
    missing = [t for t in tools if not shutil.which(t)]

    if missing:
        print(f"ERROR: Missing required tools: {', '.join(missing)}")
        print()
        print("Install ffmpeg:")
        print("  macOS:   brew install ffmpeg")
        print("  Ubuntu:  sudo apt install ffmpeg")
        print("  Windows: https://ffmpeg.org/download.html")
        print()
        print(f"See {DOCS_URL}/setup for setup instructions.")
        sys.exit(1)

    return True


def check_us_ice_witness_repo(project_root):
    """
    Validate that the us-ice-witness-repo symlink exists and points to valid repo.

    Returns path to us-ice-witness-repo directory or exits with error.
    """
    us_ice_witness = Path(project_root) / "us-ice-witness-repo"

    if not us_ice_witness.exists():
        print("ERROR: us-ice-witness-repo symlink not found")
        print()
        print("Create the symlink in your state repo:")
        print("  ln -s ../GIT_US_ICE_WITNESS us-ice-witness-repo")
        print()
        print(f"See {DOCS_URL}/setup for setup instructions.")
        sys.exit(1)

    bin_dir = us_ice_witness / "bin"
    if not bin_dir.exists():
        print("ERROR: us-ice-witness-repo/bin not found")
        print()
        print("The us-ice-witness-repo symlink may be pointing to the wrong location.")
        print("It should point to the GIT_US_ICE_WITNESS repository.")
        print()
        print(f"See {DOCS_URL}/setup for setup instructions.")
        sys.exit(1)

    return us_ice_witness


def full_validation(project_root):
    """
    Run all validations. Call this at the start of any script.

    Returns dict with:
    - user_config: User-level config
    - project_config: Project-level config
    - python_exe: Validated Python executable path
    - us_ice_witness: Path to us-ice-witness-repo repo
    """
    user_config = load_user_config()
    project_config = load_project_config(project_root)

    python_exe = user_config["python_exe"]
    validate_python_packages(python_exe)
    validate_external_tools()

    us_ice_witness = check_us_ice_witness_repo(project_root)

    return {
        "user_config": user_config,
        "project_config": project_config,
        "python_exe": python_exe,
        "us_ice_witness": us_ice_witness,
    }
