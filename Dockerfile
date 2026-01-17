# Multi-stage Dockerfile for Fly.io deployment

# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app

# Copy frontend package files
COPY StudyCore/frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY StudyCore/frontend/ ./

# Build React app
RUN npm run build

# Stage 2: Python Flask backend
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY StudyCore/backend/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy backend source
COPY StudyCore/backend/ ./

# Copy built frontend from previous stage
COPY --from=frontend-build /app/dist ./frontend/dist/

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Start with gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:8080", "backend.app:app"]
