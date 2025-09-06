# AI Service Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
	gcc \
	&& rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && \
	chown -R appuser:appuser /app
USER root

# Expose port
EXPOSE 3131

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
	CMD python -c "import requests; requests.get('http://localhost:3131/health')"

# Start the application
CMD ["python", "main_v2.py"]
