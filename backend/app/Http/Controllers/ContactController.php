<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use PDO;
use Exception;

class ContactController
{
    private PDO $db;

    public function __construct()
    {
        $dsn = $_ENV['DATABASE_URL'] ?? null;

        if ($dsn) {
            if (str_starts_with($dsn, 'postgres://') || str_starts_with($dsn, 'postgresql://')) {
                $parts = parse_url($dsn);

                $host = $parts['host'] ?? '127.0.0.1';
                $port = $parts['port'] ?? 5432;
                $user = $parts['user'] ?? '';
                $pass = $parts['pass'] ?? '';
                $db   = isset($parts['path']) ? ltrim($parts['path'], '/') : '';

                $pdoDsn = "pgsql:host={$host};port={$port};dbname={$db};";
                $this->db = new PDO($pdoDsn, $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                ]);
                return;
            }

            $this->db = new PDO($dsn, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            ]);
            return;
        }

        $host = $_ENV['DB_HOST'] ?? '127.0.0.1';
        $db   = $_ENV['DB_NAME'] ?? 'cmdi_db';
        $user = $_ENV['DB_USER'] ?? '';
        $pass = $_ENV['DB_PASS'] ?? '';

        $pdoDsn = "pgsql:host=$host;port=5432;dbname=$db;";
        $this->db = new PDO($pdoDsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ]);
    }

    public function store(): void
    {
        try {
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true);

            if (!is_array($data)) {
                json(['error' => 'Invalid JSON payload'], 400);
            }

            $fullName = trim((string)($data['full_name'] ?? ''));
            $email    = trim((string)($data['email'] ?? ''));
            $subject  = trim((string)($data['subject'] ?? 'General Inquiry'));
            $message  = trim((string)($data['message'] ?? ''));

            if ($fullName === '' || $email === '' || $message === '') {
                json(['error' => 'Please fill in all required fields (full_name, email, message).'], 400);
            }

            $sql = "
                INSERT INTO contacts (full_name, email, subject, message)
                VALUES (:full_name, :email, :subject, :message)
                RETURNING id, created_at
            ";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':full_name' => $fullName,
                ':email'     => $email,
                ':subject'   => $subject,
                ':message'   => $message,
            ]);

            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            json([
                'success' => true,
                'message' => 'Your message has been sent successfully!',
                'data' => $row ?: null
            ], 201);

        } catch (Exception $e) {
            json(['error' => 'Failed to send message: ' . $e->getMessage()], 500);
        }
    }
}
