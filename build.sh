#!/bin/bash
set -e

echo "=== Build script started ==="
echo "Current working directory: $(pwd)"
echo "Contents of current directory: $(ls -la)"

# Проверяем наличие директории StudyCore
if [ ! -d "StudyCore" ]; then
    echo "ERROR: StudyCore directory not found!"
    exit 1
fi

# Проверяем наличие директории frontend
if [ ! -d "StudyCore/frontend" ]; then
    echo "ERROR: StudyCore/frontend directory not found!"
    exit 1
fi

echo "=== Building frontend ==="
cd StudyCore/frontend
echo "Changed to frontend directory: $(pwd)"

# Проверяем наличие package.json
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found!"
    exit 1
fi

# Устанавливаем зависимости
npm ci
echo "Dependencies installed"

# Собираем проект
npm run build
echo "Build completed"

# Проверяем, что dist создался
if [ ! -d "dist" ]; then
    echo "ERROR: dist folder not found after build!"
    exit 1
fi

echo "Contents of dist folder:"
ls -la dist/

# Возвращаемся в корень
cd ../..

echo "=== Copying frontend dist to root ==="
cp -r StudyCore/frontend/dist .

echo "=== Verifying dist copy ==="
if [ ! -d "dist" ]; then
    echo "ERROR: dist folder not copied to root!"
    exit 1
fi

echo "Contents of root dist folder:"
ls -la dist/

echo "=== Installing backend dependencies ==="
pip install -r StudyCore/backend/requirements.txt

echo "=== Build script finished successfully ==="

