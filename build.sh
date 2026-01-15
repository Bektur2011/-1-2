#!/bin/bash
set -e

echo "=== Building frontend ==="
cd StudyCore/frontend
npm ci
npm run build
cd ../..

echo "=== Installing backend dependencies ==="
pip install -r StudyCore/backend/requirements.txt

echo "=== Build complete ==="
