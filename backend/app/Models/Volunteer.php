<?php
// backend/app/Models/Volunteer.php

declare(strict_types=1);

namespace App\Models;

class Volunteer extends Database
{
    public static function all(): array
    {
        return self::connect()
            ->query('SELECT * FROM volunteers ORDER BY created_at DESC')
            ->fetchAll();
    }

    public static function create(array $data): array
    {
        $pdo = self::connect();

        $stmt = $pdo->prepare(
            'INSERT INTO volunteers (name, email, phone) 
             VALUES (:name, :email, :phone) 
             RETURNING *'
        );

        $stmt->execute([
            'name'  => $data['name'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
        ]);

        return $stmt->fetch();
    }
}
