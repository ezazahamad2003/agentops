# Production Dockerfile for GCP Cloud Run with Full Backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd -m -u 1000 agentops && \
    chown -R agentops:agentops /app

USER agentops

# Cloud Run will set PORT automatically (defaults to 8080)
ENV PORT=8080
EXPOSE 8080

# Run with uvicorn, reading PORT from environment
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
