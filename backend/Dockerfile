FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Collect static files for WhiteNoise
RUN python manage.py collectstatic --noinput --settings=config.settings.production || true

EXPOSE 8000

# Start command is defined in railway.json for Railway deployments
# For local Docker: docker run -p 8000:8000 -e PORT=8000 image gunicorn --bind 0.0.0.0:8000 config.wsgi:application
