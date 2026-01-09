<?php
// backend/app/Models/Project.php

declare(strict_types=1);

namespace App\Models;

class Project extends Database
{
    public static function all(): array
    {
        return self::connect()
            ->query('SELECT * FROM projects ORDER BY created_at DESC')
            ->fetchAll();
    }

    public static function find(int $id): ?array
    {
        $stmt = self::connect()->prepare('SELECT * FROM projects WHERE id = :id');
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() ?: null;
    }
}
