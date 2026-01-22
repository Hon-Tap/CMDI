<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Volunteer;

class VolunteerController {
    
    public function index(): void {
        // Using your Model pattern
        $volunteers = Volunteer::all(); 
        json(['success' => true, 'data' => $volunteers]);
    }

    public function store(): void {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['email']) || empty($data['firstName'])) {
            json(['success' => false, 'message' => 'Required fields missing'], 400);
        }

        $result = Volunteer::create([
            'first_name'    => $data['firstName'],
            'last_name'     => $data['lastName'],
            'email'         => $data['email'],
            'primary_skill' => $data['skill'],
            'reason'        => $data['reason']
        ]);

        json(['success' => true, 'message' => 'Volunteer registered', 'data' => $result]);
    }
}