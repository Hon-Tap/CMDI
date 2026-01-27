FROM php:8.2-apache

# Enable Apache rewrite + allow .htaccess overrides
RUN a2enmod rewrite \
  && sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# System deps + PHP extensions (zip + PostgreSQL PDO)
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpq-dev \
  && docker-php-ext-install zip pdo_pgsql \
  && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy backend into Apache web root (monorepo-safe)
COPY backend/ ./

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

EXPOSE 80
