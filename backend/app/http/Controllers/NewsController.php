<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use PDO;
use Exception;

class NewsController {
    private $db;

    public function __construct() {
        try {
            $host = $_ENV['DB_HOST'] ?? '127.0.0.1';
            $db   = $_ENV['DB_NAME'] ?? 'cmdi_db';
            $user = $_ENV['DB_USER'] ?? 'postgres';
            $pass = $_ENV['DB_PASS'] ?? '';
            $port = $_ENV['DB_PORT'] ?? '5432';

            $dsn = "pgsql:host=$host;port=$port;dbname=$db;";
            $this->db = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
        } catch (Exception $e) {
            json(['error' => 'Database connection failed: ' . $e->getMessage()], 500);
        }
    }

    public function index(): void {
        try {
            $stmt = $this->db->query("SELECT * FROM news ORDER BY created_at DESC");
            $news = $stmt->fetchAll();
            json($news);
        } catch (Exception $e) {
            json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(): void {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                json(['error' => 'Invalid JSON input'], 400);
            }

            $sql = "INSERT INTO news (title, content, image_url) VALUES (?, ?, ?)";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                $data['title'] ?? 'Untitled',
                $data['content'] ?? '',
                $data['image_url'] ?? null
            ]);
            
            json(['success' => true, 'message' => 'News article created']);
        } catch (Exception $e) {
            json(['error' => $e->getMessage()], 500);
        }
    }
}