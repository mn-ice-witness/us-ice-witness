# State Repo Setup Helper Template

**Copy this file to `SETUP-HELPER.md` in each state repo.**

The setup helper must be in each state repo because users won't have the us-ice-witness-repo symlink yet when they first clone.

---

Copy everything below this line to create the state's SETUP-HELPER.md:

---

# State Repo Setup Helper

**For AI Agents:** When a user says "Help me setup my state repo project", follow this guide step by step. Be verbose, explain what you're doing, and ask for help if anything fails.

---

## Step 1: Get the Shared Codebase (us-ice-witness-repo)

The shared codebase contains scripts, hooks, and documentation. It needs to be accessible as `us-ice-witness-repo/` inside this state repo.

First, check if it already exists:

```bash
ls -la us-ice-witness-repo/bin/config.py
```

**If it exists and works**, skip to Step 2.

**If it doesn't exist**, ask the user which approach they prefer:

> "I need to set up the shared us-ice-witness-repo codebase. There are two options:"
>
> **Option A: Clone nearby + symlink (Recommended)**
> - Good if you manage multiple state repos - they can share one copy
> - Creates `../GIT_US_ICE_WITNESS` and symlinks to it
>
> **Option B: Clone directly into this repo**
> - Simpler if you only manage one state
> - Creates `us-ice-witness-repo/` folder directly here
>
> "Which would you prefer?"

### If user chooses Option A (symlink):

```bash
# Check if already cloned nearby
ls -la ../GIT_US_ICE_WITNESS
```

If not found, clone it:
```bash
git clone https://github.com/mn-ice-witness/us-ice-witness-repo.git ../GIT_US_ICE_WITNESS
```

Then create the symlink:
```bash
ln -s ../GIT_US_ICE_WITNESS us-ice-witness-repo
```

### If user chooses Option B (direct clone):

```bash
git clone https://github.com/mn-ice-witness/us-ice-witness-repo.git us-ice-witness-repo
```

### Verify it worked:

```bash
ls us-ice-witness-repo/bin/config.py
```

If this fails, something went wrong. Check the clone/symlink and try again.

Tell the user: "✓ us-ice-witness-repo is set up correctly."

> **Note:** Git submodules may be used in the future to automate this. For now, the process is manual.

---

## Step 3: Find Python Installation

Search for available Python installations:

```bash
which python3
which python3.11
which python3.12
ls /opt/homebrew/bin/python3* 2>/dev/null
ls /usr/local/bin/python3* 2>/dev/null
```

**Present options to the user:**

> "I found the following Python installations:"
> - `/opt/homebrew/bin/python3.12` (version 3.12.x) ← Recommended
> - `/usr/bin/python3` (version 3.x.x)
> - [list others found]
>
> "Which Python would you like to use? I recommend the newest version (3.11+)."

**If no Python is found**, tell the user:
> "I couldn't find Python 3. Please install it:"
> - macOS: `brew install python@3.12`
> - Ubuntu: `sudo apt install python3`
>
> "Then tell me the path to your Python executable."

**Once the user chooses**, verify it works:
```bash
/chosen/path/python3 --version
```

Tell the user: "✓ Using Python at [path]: [version]"

---

## Step 4: Install Python Packages

Test if required packages are installed:

```bash
/chosen/python3 -c "import yaml; print('✓ pyyaml installed')"
/chosen/python3 -c "from PIL import Image; print('✓ pillow installed')"
```

**If any package is missing**, install them:

```bash
/chosen/python3 -m pip install pyyaml pillow
```

If pip fails, tell the user:
> "Package installation failed. Please run manually:"
> `/chosen/python3 -m pip install pyyaml pillow`

---

## Step 5: Check ffmpeg (Optional)

```bash
which ffmpeg
which ffprobe
```

**If not found**, tell the user:
> "ffmpeg is not installed. This is only needed if you'll add media (videos/images)."
>
> "To install:"
> - macOS: `brew install ffmpeg`
> - Ubuntu: `sudo apt install ffmpeg`
>
> "You can skip this for now and install later if needed."

If found: "✓ ffmpeg is installed."

---

## Step 6: Create User Config File

Check if `~/.ice-witness.config` exists:

```bash
cat ~/.ice-witness.config 2>/dev/null
```

**If it doesn't exist**, create it using the Python path from Step 3:

```bash
cat > ~/.ice-witness.config << 'EOF'
python_exe: /chosen/path/python3
EOF
```

Tell the user:
> "I created ~/.ice-witness.config with your Python path."
> "This file tells the scripts which Python to use."

---

## Step 7: Create Project Config File

Check if `ice-witness.config` exists:

```bash
cat ice-witness.config 2>/dev/null
```

**If it doesn't exist**, ask the user:
> "I need to create the project config. Please confirm your state info:"
> - State code (2 letters, e.g., CO):
> - State name (e.g., Colorado):
> - Contact email (default: tips@ice-witness.org):

Then create the file:

```bash
cat > ice-witness.config << 'EOF'
state_code: CO
state_name: Colorado
contact_email: tips@ice-witness.org
EOF
```

Tell the user:
> "I created ice-witness.config with your state information."

---

## Step 8: Install Git Hooks

```bash
./us-ice-witness-repo/hooks/install-hooks.sh
```

Tell the user:
> "I installed the git hooks. When you commit, the system will:"
> - Validate incident data
> - Auto-generate incidents-summary.json
> - Catch errors before they reach the site

---

## Step 9: Create Required Directories

```bash
mkdir -p docs/incidents
mkdir -p docs/media
mkdir -p docs/data
mkdir -p raw_media
```

Tell the user: "✓ Created required directories."

---

## Step 10: Test Everything

Run the summary generator:

```bash
./us-ice-witness-repo/bin/run generate_summary.py
```

**If it succeeds:**
> "✓ Setup complete! Everything is working."
>
> "You can now:"
> - Add incidents: Tell me 'Add this incident: [news URL]'
> - Process media: Put files in raw_media/ and tell me to process them
> - Commit changes: The hooks will validate automatically
>
> "**IMPORTANT:** Now read `us-ice-witness-repo/CONTEXT.md` for all the rules on adding incidents and media."

**If it fails**, read the error and help fix it.

---

## Quick Reference

| Task | Command |
|------|---------|
| Add incident | "Add this incident: [URL]" |
| Process media | "Process the media in raw_media" |
| Generate summary | `./us-ice-witness-repo/bin/run generate_summary.py` |
| Run media pipeline | `./us-ice-witness-repo/bin/run process_media.py` |

## Troubleshooting

### "us-ice-witness-repo/bin not found"
Symlink is broken:
```bash
rm -f us-ice-witness-repo
ln -s ../GIT_US_ICE_WITNESS us-ice-witness-repo
```

### "No module named yaml"
```bash
python3 -m pip install pyyaml pillow
```

### Pre-commit hook not running
```bash
./us-ice-witness-repo/hooks/install-hooks.sh
```

For more help: https://docs.ice-witness.org/setup
