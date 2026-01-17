#!/bin/bash
set -e

echo "=== Building frontend ==="
cd StudyCore/frontend
npm ci
npm run build

echo "=== Checking if dist was created ==="
if [ ! -d "dist" ]; then
    echo "ERROR: dist folder not found after build!"
    exit 1
fi

echo "=== Contents of dist folder ==="
ls -la dist/

cd ../..

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

echo "=== Build complete ==="
