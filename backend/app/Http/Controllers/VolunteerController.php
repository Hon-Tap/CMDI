<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Volunteer;

class VolunteerController {
    
    public function index(): void {
        json(['success' => true, 'data' => Volunteer::all()]);
    }

    public function store(): void {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['email']) || empty($data['firstName'])) {
            json(['success' => false, 'message' => 'Required fields (Email, First Name) missing'], 400);
        }

        $result = Volunteer::create([
            'first_name'    => $data['firstName'],
            'last_name'     => $data['lastName'] ?? '',
            'email'         => $data['email'],
            'primary_skill' => $data['skill'] ?? 'General',
            'reason'        => $data['reason'] ?? ''
        ]);

        json(['success' => true, 'message' => 'Volunteer registered', 'data' => $result], 201);
    }
}
