<?php
declare(strict_types=1);

namespace App\Models;

use PDO;
use App\Database\Database;

final class Project
{
    private static function db(): PDO
    {
        $pdo = Database::connection();

        // Ensure PDO throws exceptions (if your Database class already does this, harmless)
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        return $pdo;
    }

    /**
     * Fetch all projects (optionally filter by status/category).
     * Returns: array<array<string,mixed>>
     */
    public static function all(?string $status = null, ?string $category = null): array
    {
        $sql = "
            SELECT
                id,
                title,
                description,
                image_url,
                status,
                location,
                category,
                created_at,
                updated_at
            FROM projects
        ";

        $where = [];
        $params = [];

        if ($status !== null && trim($status) !== '') {
            $where[] = "status = :status";
            $params[':status'] = trim($status);
        }

        if ($category !== null && trim($category) !== '') {
            $where[] = "category = :category";
            $params[':category'] = trim($category);
        }

        if (!empty($where)) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }

        // ✅ This is the key fix: created_at exists now, so order by it
        $sql .= " ORDER BY created_at DESC, id DESC";

        $stmt = self::db()->prepare($sql);
        $stmt->execute($params);

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $rows ?: [];
    }

    /**
     * Find a single project by id.
     */
    public static function find(int $id): ?array
    {
        $sql = "
            SELECT
                id,
                title,
                description,
                image_url,
                status,
                location,
                category,
                created_at,
                updated_at
            FROM projects
            WHERE id = :id
            LIMIT 1
        ";

        $stmt = self::db()->prepare($sql);
        $stmt->execute([':id' => $id]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    /**
     * Create a new project. Returns new id.
     * $data keys: title, description, image_url, status, location, category
     */
    public static function create(array $data): int
    {
        $title = trim((string)($data['title'] ?? ''));
        if ($title === '') {
            throw new \InvalidArgumentException('Title is required.');
        }

        $sql = "
            INSERT INTO projects (title, description, image_url, status, location, category, created_at, updated_at)
            VALUES (:title, :description, :image_url, :status, :location, :category, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id
        ";

        $stmt = self::db()->prepare($sql);
        $stmt->execute([
            ':title'       => $title,
            ':description' => (string)($data['description'] ?? ''),
            ':image_url'   => (string)($data['image_url'] ?? ''),
            ':status'      => (string)($data['status'] ?? 'Ongoing'),
            ':location'    => (string)($data['location'] ?? ''),
            ':category'    => (string)($data['category'] ?? ''),
        ]);

        return (int)$stmt->fetchColumn();
    }

    /**
     * Update an existing project. Returns true if any row updated.
     */
    public static function update(int $id, array $data): bool
    {
        // Build dynamic updates safely
        $fields = [
            'title'       => 'title',
            'description' => 'description',
            'image_url'   => 'image_url',
            'status'      => 'status',
            'location'    => 'location',
            'category'    => 'category',
        ];

        $setParts = [];
        $params = [':id' => $id];

        foreach ($fields as $key => $col) {
            if (array_key_exists($key, $data)) {
                $setParts[] = "{$col} = :{$key}";
                $params[":{$key}"] = is_string($data[$key]) ? trim($data[$key]) : (string)$data[$key];
            }
        }

        if (empty($setParts)) {
            return false; // nothing to update
        }

        // ✅ keep updated_at fresh
        $setParts[] = "updated_at = CURRENT_TIMESTAMP";

        $sql = "UPDATE projects SET " . implode(", ", $setParts) . " WHERE id = :id";

        $stmt = self::db()->prepare($sql);
        $stmt->execute($params);

        return $stmt->rowCount() > 0;
    }

    /**
     * Delete a project by id. Returns true if deleted.
     */
    public static function delete(int $id): bool
    {
        $stmt = self::db()->prepare("DELETE FROM projects WHERE id = :id");
        $stmt->execute([':id' => $id]);

        return $stmt->rowCount() > 0;
    }
}
