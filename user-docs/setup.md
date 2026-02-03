# Setup

## 1. Clone Your State Repository

Example using the Colorado repo:

```bash
git clone https://github.com/mn-ice-witness/<STATE>-ice-witness.git <YOUR_FOLDER>
cd <YOUR_FOLDER>
```

Replace `<STATE>` with your state code (e.g., `co`, `al`, `me`, `wa`).

## 2. Get the Shared Codebase

The shared codebase must be accessible as `us-ice-witness-repo/` inside your state repo.

**Option A: Clone nearby + symlink** (recommended for multiple state repos)

```bash
# From your state repo's parent directory
git clone https://github.com/mn-ice-witness/us-ice-witness.git us-ice-witness-shared

# From inside your state repo
ln -s ../us-ice-witness-shared us-ice-witness-repo
```

**Option B: Clone directly into state repo**

```bash
# From inside your state repo
git clone https://github.com/mn-ice-witness/us-ice-witness.git us-ice-witness-repo
```

Either approach works. The `.gitignore` excludes `us-ice-witness-repo/`.

---

## 3. Python Setup

Any Python 3.8+ works (system, Homebrew, venv).

```bash
which python3
python3 --version
```

Install required packages:

```bash
python3 -m pip install pyyaml pillow
```

---

## 4. Config Files

### ~/.ice-witness.config

Create in your home directory:

```yaml
python_exe: /opt/homebrew/bin/python3
```

Value can be a full path, command name (`python3`), or venv path.

### ice-witness.config

Create in your state repo root:

```yaml
state_code: CO
state_name: Colorado
contact_email: tips@ice-witness.org
```

---

## 5. Install Git Hooks

```bash
./us-ice-witness-repo/hooks/install-hooks.sh
```

The pre-commit hook validates incidents and regenerates `incidents-summary.json` on every commit.

---

## 6. Create About Page

```bash
cp us-ice-witness-repo/dev-docs/state-about-template.md docs/about.md
```

Edit `docs/about.md` with your state info.

---

## 7. Verify

```bash
./us-ice-witness-repo/bin/run generate_summary.py
```

If it runs without errors, you're ready.

---

## Final Structure

If using Option A (symlink):

```
<your-workspace>/
├── us-ice-witness-shared/        # Shared codebase
│   ├── bin/                      # Scripts
│   ├── hooks/                    # Git hooks
│   └── dev-docs/                 # Reference docs
│
└── <state-repo>/                 # Your state data
    ├── us-ice-witness-repo/      # Symlink → ../us-ice-witness-shared
    ├── ice-witness.config        # State config
    ├── docs/
    │   ├── about.md              # About page
    │   ├── incidents/            # Incident files
    │   ├── media/                # Processed media
    │   └── data/                 # Generated JSON
    └── raw_media/                # Unprocessed media
```

---

## Updating

Pull shared code updates periodically:

```bash
# Navigate to your shared codebase folder and pull
cd us-ice-witness-shared  # or us-ice-witness-repo if using Option B
git pull
```

---

## Troubleshooting

**"us-ice-witness-repo/bin not found"**
```bash
rm -f us-ice-witness-repo
ln -s ../us-ice-witness-shared us-ice-witness-repo
```

**"No module named 'yaml'"**
```bash
python3 -m pip install pyyaml pillow
```

**"Python executable not found"**
```bash
which python3
echo "python_exe: $(which python3)" > ~/.ice-witness.config
```
