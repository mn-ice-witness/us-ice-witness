# Setup

## 1. Clone Your State Repo

```bash
mkdir -p ~/workspace/us-ice-witness
cd ~/workspace/us-ice-witness

# Clone your state repo (example: Colorado)
git clone https://github.com/mn-ice-witness/co-ice-witness.git GIT_CO_ICE_WITNESS
```

## 2. Clone the Main Codebase

```bash
git clone https://github.com/mn-ice-witness/us-ice-witness.git GIT_US_ICE_WITNESS
```

## 3. Create the Symlink

```bash
cd GIT_CO_ICE_WITNESS
ln -s ../GIT_US_ICE_WITNESS us-ice-witness
```

## Final Structure

```
~/workspace/us-ice-witness/
├── GIT_US_ICE_WITNESS/      # Main codebase (shared)
└── GIT_CO_ICE_WITNESS/      # Your state data
    ├── us-ice-witness/      # Symlink → ../GIT_US_ICE_WITNESS
    ├── docs/
    │   ├── incidents/       # Your incident files
    │   └── media/           # Your media files
    └── raw_media/           # Unprocessed media
```

## Deploy

Push to `main` and your site updates automatically:

```bash
git add .
git commit -m "Add new incident"
git push
```
