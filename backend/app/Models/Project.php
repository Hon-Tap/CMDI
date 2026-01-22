<?php
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

    public static function create(array $data): array
    {
        $pdo = self::connect();
        $stmt = $pdo->prepare(
            'INSERT INTO projects (title, description, status, location, image_url) 
             VALUES (:title, :description, :status, :location, :image_url) 
             RETURNING *'
        );
        $stmt->execute([
            'title'       => $data['title'],
            'description' => $data['description'] ?? null,
            'status'      => $data['status'] ?? 'Ongoing',
            'location'    => $data['location'] ?? null,
            'image_url'   => $data['image_url'] ?? null,
        ]);
        return $stmt->fetch();
    }

    public static function update(int $id, array $data): ?array
    {
        $pdo = self::connect();
        $stmt = $pdo->prepare(
            'UPDATE projects 
             SET title = :title, description = :description, status = :status, 
                 location = :location, image_url = :image_url 
             WHERE id = :id 
             RETURNING *'
        );
        $stmt->execute([
            'id'          => $id,
            'title'       => $data['title'],
            'description' => $data['description'] ?? null,
            'status'      => $data['status'] ?? 'Ongoing',
            'location'    => $data['location'] ?? null,
            'image_url'   => $data['image_url'] ?? null,
        ]);
        return $stmt->fetch() ?: null;
    }

    public static function delete(int $id): bool
    {
        $stmt = self::connect()->prepare('DELETE FROM projects WHERE id = :id');
        return $stmt->execute(['id' => $id]);
    }
}