<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use PDO;
use Exception;

class ContactController {
    private $db;

    public function __construct() {
        $host = $_ENV['DB_HOST'] ?? '127.0.0.1';
        $db   = $_ENV['DB_NAME'] ?? 'cmdi_db';
        $dsn  = "pgsql:host=$host;port=5432;dbname=$db;";
        $this->db = new PDO($dsn, $_ENV['DB_USER'], $_ENV['DB_PASS'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
    }

    public function store(): void {
        try {
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);

            if ($data === null) {
                json(['error' => 'Invalid JSON data provided.'], 400);
            }

            if (empty($data['full_name']) || empty($data['email']) || empty($data['message'])) {
                json(['error' => 'Please fill in all required fields (Name, Email, Message).'], 400);
            }

            $sql = "INSERT INTO contacts (full_name, email, subject, message) VALUES (?, ?, ?, ?)";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                $data['full_name'],
                $data['email'],
                $data['subject'] ?? 'General Inquiry',
                $data['message']
            ]);

            json(['success' => true, 'message' => 'Your message has been sent successfully!']);
        } catch (Exception $e) {
            json(['error' => 'Failed to send message: ' . $e->getMessage()], 500);
        }
    }
}