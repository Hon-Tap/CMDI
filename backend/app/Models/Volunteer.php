<?php

declare(strict_types=1);

namespace App\Models;

use PDO;
use PDOException;

class Volunteer extends Database
{
    /**
     * Return newest first.
     */
    public static function all(): array
    {
        return self::connect()
            ->query('SELECT * FROM volunteers ORDER BY created_at DESC')
            ->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Minimal query builder helpers used by the controller:
     * - Volunteer::where('email', $email)->first()
     * - Volunteer::orderBy('created_at','desc')->get()
     *
     * This keeps your controller code unchanged.
     */
    private static array $where = [];
    private static ?array $orderBy = null;

    public static function where(string $column, mixed $value): self
    {
        self::$where[] = [$column, $value];
        return new self();
    }

    public static function orderBy(string $column, string $direction = 'asc'): self
    {
        $dir = strtolower($direction) === 'desc' ? 'DESC' : 'ASC';
        self::$orderBy = [$column, $dir];
        return new self();
    }

    public function first(): ?array
    {
        $rows = $this->get(1);
        return $rows[0] ?? null;
    }

    public function get(?int $limit = null): array
    {
        $pdo = self::connect();

        $sql = 'SELECT * FROM volunteers';
        $params = [];

        if (self::$where) {
            $clauses = [];
            foreach (self::$where as $i => [$col, $val]) {
                // basic safe identifier guard (columns you actually use)
                if (!in_array($col, ['id', 'first_name', 'last_name', 'email', 'phone', 'primary_skill', 'reason', 'created_at', 'updated_at'], true)) {
                    throw new \RuntimeException("Invalid where column: {$col}");
                }
                $key = ":w{$i}";
                $clauses[] = "{$col} = {$key}";
                $params["w{$i}"] = $val;
            }
            $sql .= ' WHERE ' . implode(' AND ', $clauses);
        }

        if (self::$orderBy) {
            [$col, $dir] = self::$orderBy;
            if (!in_array($col, ['id', 'first_name', 'last_name', 'email', 'phone', 'primary_skill', 'reason', 'created_at', 'updated_at'], true)) {
                throw new \RuntimeException("Invalid orderBy column: {$col}");
            }
            $sql .= " ORDER BY {$col} {$dir}";
        } else {
            $sql .= ' ORDER BY created_at DESC';
        }

        if (is_int($limit) && $limit > 0) {
            $sql .= ' LIMIT ' . (int)$limit;
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        // Reset per-request state (important)
        self::$where = [];
        self::$orderBy = null;

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Insert a volunteer row matching your controller + DB columns.
     * Returns the inserted row (RETURNING *).
     */
    public static function create(array $data): array
    {
        $pdo = self::connect();

        // Expecting controller keys:
        // first_name, last_name, email, phone (nullable), primary_skill, reason
        $stmt = $pdo->prepare(
            'INSERT INTO volunteers (first_name, last_name, email, phone, primary_skill, reason)
             VALUES (:first_name, :last_name, :email, :phone, :primary_skill, :reason)
             RETURNING *'
        );

        $stmt->execute([
            'first_name'    => $data['first_name'] ?? null,
            'last_name'     => $data['last_name'] ?? null,
            'email'         => $data['email'] ?? null,
            'phone'         => $data['phone'] ?? null,
            'primary_skill' => $data['primary_skill'] ?? null,
            'reason'        => $data['reason'] ?? null,
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return is_array($row) ? $row : [];
    }
}
