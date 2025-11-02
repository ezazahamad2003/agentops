# Production Dockerfile for GCP Cloud Run
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for layer caching)
COPY requirements-minimal.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements-minimal.txt

# Copy application code
COPY minimal_main.py .
COPY database/schema_minimal.sql ./database/

# Create non-root user for security
RUN useradd -m -u 1000 agentops && \
    chown -R agentops:agentops /app

USER agentops

# Cloud Run will set PORT automatically
EXPOSE 8080

# Health check (Cloud Run compatible)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8080/health', timeout=5)"

# Run with Python (uses PORT from environment)
CMD ["python", "minimal_main.py"]

