<?php
// backend/app/Models/Program.php

declare(strict_types=1);

namespace App\Models;

class Program extends Database
{
    public static function all(): array
    {
        return self::connect()
            ->query('SELECT * FROM programs ORDER BY created_at DESC')
            ->fetchAll();
    }

    public static function find(int $id): ?array
    {
        $stmt = self::connect()->prepare('SELECT * FROM programs WHERE id = :id');
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() ?: null;
    }
}
