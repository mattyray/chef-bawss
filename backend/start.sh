#!/bin/bash
set -e

echo "=== Starting Chef Bawss Backend ==="
echo "PORT: $PORT"
echo "DJANGO_SETTINGS_MODULE: $DJANGO_SETTINGS_MODULE"

echo "Running migrations..."
python manage.py migrate --noinput

echo "Starting gunicorn on port ${PORT:-8000}..."
exec gunicorn --bind 0.0.0.0:${PORT:-8000} --workers 2 --log-level info --access-logfile - --error-logfile - config.wsgi:application
