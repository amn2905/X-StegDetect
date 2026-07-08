FROM python:3.10-slim

# Install system dependencies required for OpenCV, PyTorch and ReportLab compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Install python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code files
COPY backend/app ./app
COPY backend/init_models.py .

# Expose FastAPI port
EXPOSE 8000

# Execute models downloader and run uvicorn server
CMD ["sh", "-c", "python init_models.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
