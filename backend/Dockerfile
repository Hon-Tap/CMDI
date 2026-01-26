FROM php:8.2-apache

# Enable Apache rewrite (handy for routing)
RUN a2enmod rewrite

# Install system deps + PHP zip extension (Composer commonly needs it)
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev \
  && docker-php-ext-install zip \
  && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

EXPOSE 80
