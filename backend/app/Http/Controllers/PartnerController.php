<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use PDO;
use Exception;

class PartnerController {
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
            $data = json_decode(file_get_contents('php://input'), true);

            // Validation for partnership-specific fields
            if (empty($data['org_name']) || empty($data['contact_person']) || empty($data['email']) || empty($data['proposal_summary'])) {
                json(['error' => 'Please provide the Organization Name, Contact Person, Email, and a Brief Proposal.'], 400);
            }

            $sql = "INSERT INTO partners (org_name, contact_person, email, partnership_type, proposal_summary) 
                    VALUES (?, ?, ?, ?, ?)";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                $data['org_name'],
                $data['contact_person'],
                $data['email'],
                $data['partnership_type'] ?? 'Not Specified',
                $data['proposal_summary']
            ]);

            json(['success' => true, 'message' => 'Thank you! Your partnership proposal has been submitted successfully.']);
        } catch (Exception $e) {
            json(['error' => 'Submission failed: ' . $e->getMessage()], 500);
        }
    }
}
