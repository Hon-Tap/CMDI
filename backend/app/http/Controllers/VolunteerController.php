<?php
// backend/app/http/Controllers/VolunteerController.php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Volunteer;

class VolunteerController
{
    public function index(): void
    {
        $this->json(true, 'Volunteers fetched', Volunteer::all());
    }

    public function store(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->json(true, 'Volunteer registered', Volunteer::create($data));
    }

    private function json(bool $success, string $message, $data = null): void
    {
        echo json_encode(compact('success', 'message', 'data'));
        exit;
    }
}
