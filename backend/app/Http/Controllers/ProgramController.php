<?php

namespace App\Http\Controllers;

use PDO;
use PDOException;

class ProgramController
{
    public function index(): void
    {
        // Use variables from your .env or fall back to defaults
        $host = getenv('DB_HOST') ?: "localhost";
        $port = getenv('DB_PORT') ?: "5432";
        $db   = getenv('DB_NAME') ?: "cmdi_db";
        $user = getenv('DB_USER') ?: "postgres";
        $pass = getenv('DB_PASS') ?: "your_password"; // CHANGE THIS to your actual password

        try {
            $dsn = "pgsql:host=$host;port=$port;dbname=$db;";
            $pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);

            $stmt = $pdo->query("SELECT * FROM programs ORDER BY id ASC");
            $programs = $stmt->fetchAll();

            // Always wrap in a 'data' key for the frontend
            json([
                'status' => 'success',
                'count'  => count($programs),
                'data'   => $programs
            ]);

        } catch (PDOException $e) {
            json([
                'status' => 'error',
                'message' => 'Database connection failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(): void
    {
        json(['message' => 'Store method not implemented'], 501);
    }
}
