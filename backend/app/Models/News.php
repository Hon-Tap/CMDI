<?php
// backend/app/Models/News.php

declare(strict_types=1);

namespace App\Models;

class News extends Database
{
    public static function all(): array
    {
        return self::connect()
            ->query('SELECT * FROM news ORDER BY created_at DESC')
            ->fetchAll();
    }

    public static function find(int $id): ?array
    {
        $stmt = self::connect()->prepare('SELECT * FROM news WHERE id = :id');
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() ?: null;
    }
}
