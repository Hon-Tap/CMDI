<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Volunteer;

class VolunteerController
{
    public function index(): void
    {
        json(['success' => true, 'data' => Volunteer::all()]);
    }

    public function store(): void
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);

        if (!is_array($data)) {
            json(['success' => false, 'message' => 'Invalid JSON payload'], 400);
        }

        // Expecting frontend keys:
        // first_name, last_name, email, phone, primary_skill, reason
        $firstName = trim((string)($data['first_name'] ?? ''));
        $lastName  = trim((string)($data['last_name'] ?? ''));
        $email     = trim((string)($data['email'] ?? ''));
        $phone     = trim((string)($data['phone'] ?? ''));
        $skill     = trim((string)($data['primary_skill'] ?? ''));
        $reason    = trim((string)($data['reason'] ?? ''));

        if ($email === '' || $firstName === '' || $lastName === '' || $skill === '' || $reason === '') {
            json([
                'success' => false,
                'message' => 'Required fields missing: first_name, last_name, email, primary_skill, reason'
            ], 400);
        }

        // Create record
        $result = Volunteer::create([
            'first_name'    => $firstName,
            'last_name'     => $lastName,
            'email'         => $email,
            'phone'         => $phone,          // keep empty string allowed
            'primary_skill' => $skill,
            'reason'        => $reason,
        ]);

        json(['success' => true, 'message' => 'Volunteer registered', 'data' => $result], 201);
    }
}
