#!/bin/bash
# Install git hooks for a state data repository
# Run this from the state repo root after creating the us-ice-witness symlink

set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOKS_DIR="$REPO_ROOT/.git/hooks"
US_HOOKS="$REPO_ROOT/us-ice-witness/hooks"

if [ ! -d "$US_HOOKS" ]; then
    echo "Error: us-ice-witness/hooks not found."
    echo "Make sure you have the us-ice-witness symlink set up correctly."
    exit 1
fi

echo "Installing git hooks from us-ice-witness..."

# Install pre-commit hook
if [ -f "$HOOKS_DIR/pre-commit" ]; then
    echo "Backing up existing pre-commit hook..."
    mv "$HOOKS_DIR/pre-commit" "$HOOKS_DIR/pre-commit.backup"
fi

cp "$US_HOOKS/pre-commit" "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"

echo "✓ Installed pre-commit hook"
echo ""
echo "Hooks installed successfully. The pre-commit hook will:"
echo "  - Validate incident frontmatter schema"
echo "  - Auto-generate incidents-summary.json"
