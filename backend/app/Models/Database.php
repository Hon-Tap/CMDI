<?php
declare(strict_types=1);

namespace App\Models;

use PDO;
use PDOException;

abstract class Database
{
    private static ?PDO $pdo = null;

    protected static function connect(): PDO
    {
        if (self::$pdo instanceof PDO) {
            return self::$pdo;
        }

        $host = $_ENV['DB_HOST'] ?? '127.0.0.1';
        $port = $_ENV['DB_PORT'] ?? '5432';
        $db   = $_ENV['DB_NAME'] ?? 'cmdi';
        $user = $_ENV['DB_USER'] ?? 'postgres';
        $pass = $_ENV['DB_PASS'] ?? '';

        $dsn = "pgsql:host={$host};port={$port};dbname={$db}";

        try {
            self::$pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'status'  => 'error',
                'message' => 'Database connection failed',
            ]);
            exit;
        }

        return self::$pdo;
    }
}
