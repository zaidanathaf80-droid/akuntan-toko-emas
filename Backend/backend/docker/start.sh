#!/bin/bash
set -e

echo "=== Starting LuckyAndPower Backend ==="

# Set Apache port to match Koyeb's PORT env var
PORT=${PORT:-8000}
sed -i "s/Listen 80/Listen $PORT/" /etc/apache2/ports.conf
sed -i "s/*:8000/*:$PORT/" /etc/apache2/sites-available/000-default.conf

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Cache config
echo "Caching config..."
php artisan config:cache
php artisan route:cache

echo "=== Starting Apache on port $PORT ==="
apache2-foreground
