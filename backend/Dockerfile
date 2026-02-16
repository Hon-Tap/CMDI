FROM php:8.2-apache

# Apache: rewrite + .htaccess
RUN a2enmod rewrite \
  && sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# System deps + PHP extensions
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpq-dev \
  && docker-php-ext-install zip pdo_pgsql \
  && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy *backend folder contents* into Apache root
COPY . /var/www/html

# Hard fail build if key files are missing
RUN test -f /var/www/html/index.php \
 && test -f /var/www/html/healthz.php

# Install PHP deps
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

EXPOSE 80
# ...
WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader

COPY . .
# ...
