# Setup

## 1. Clone Your State Repository

```bash
mkdir -p ~/workspace/us-ice-witness-repo
cd ~/workspace/us-ice-witness-repo
git clone https://github.com/mn-ice-witness/co-ice-witness.git GIT_CO_ICE_WITNESS
cd GIT_CO_ICE_WITNESS
```

## 2. Get the Shared Codebase

The shared `us-ice-witness-repo` codebase must be accessible as `us-ice-witness-repo/` in your state repo.

**Option A: Clone nearby + symlink** (recommended for multiple state repos)

```bash
cd ~/workspace/us-ice-witness-repo
git clone https://github.com/mn-ice-witness/us-ice-witness-repo.git GIT_US_ICE_WITNESS

cd GIT_CO_ICE_WITNESS
ln -s ../GIT_US_ICE_WITNESS us-ice-witness-repo
```

**Option B: Clone directly into state repo**

```bash
cd GIT_CO_ICE_WITNESS
git clone https://github.com/mn-ice-witness/us-ice-witness-repo.git us-ice-witness-repo
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

```
~/workspace/us-ice-witness-repo/
├── GIT_US_ICE_WITNESS/           # Shared code
│   ├── bin/                      # Scripts
│   ├── hooks/                    # Git hooks
│   └── dev-docs/                 # Reference docs
│
└── GIT_CO_ICE_WITNESS/           # Your state data
    ├── us-ice-witness-repo/           # Symlink to shared code
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
cd ~/workspace/us-ice-witness-repo/GIT_US_ICE_WITNESS
git pull
```

---

## Troubleshooting

**"us-ice-witness-repo/bin not found"**
```bash
rm -f us-ice-witness-repo
ln -s ../GIT_US_ICE_WITNESS us-ice-witness-repo
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
