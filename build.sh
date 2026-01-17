#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Script directory: $SCRIPT_DIR"

echo "=== Building frontend ==="
cd "$SCRIPT_DIR/StudyCore/frontend"
npm ci
npm run build

echo "=== Checking if dist was created ==="
if [ ! -d "dist" ]; then
    echo "ERROR: dist folder not found after build!"
    exit 1
fi

echo "=== Contents of dist folder ==="
ls -la dist/

cd "$SCRIPT_DIR"

echo "=== Copying frontend dist to root ==="
cp -r StudyCore/frontend/dist .

echo "=== Verifying dist copy ==="
if [ ! -d "dist" ]; then
    echo "ERROR: dist folder not copied to root!"
    exit 1
fi

echo "=== Contents of root dist folder ==="
ls -la dist/

echo "=== Installing backend dependencies ==="
pip install -r StudyCore/backend/requirements.txt

