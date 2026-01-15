#!/bin/bash
set -e

echo "=== Building frontend ==="
cd StudyCore/frontend
npm ci
npm run build
cd ../..

echo "=== Copying frontend dist to backend ==="
cp -r StudyCore/frontend/dist StudyCore/backend/

echo "=== Installing backend dependencies ==="
pip install -r StudyCore/backend/requirements.txt

echo "=== Build complete ==="
