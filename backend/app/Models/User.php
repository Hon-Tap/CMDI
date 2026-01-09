<?php
// backend/app/Models/User.php

declare(strict_types=1);

namespace App\Models;

class User extends Database
{
    public static function create(array $data): array
    {
        $pdo = self::connect();

        $stmt = $pdo->prepare(
            'INSERT INTO users (email, password) VALUES (:email, :password) RETURNING id, email'
        );
        $stmt->execute([
            'email'    => $data['email'],
            'password' => $data['password'],
        ]);

        return $stmt->fetch();
    }

    public static function findByEmail(string $email): ?array
    {
        $pdo = self::connect();

        $stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);

        return $stmt->fetch() ?: null;
    }
}
