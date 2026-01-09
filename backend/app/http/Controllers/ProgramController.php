<?php
// backend/app/http/Controllers/ProgramController.php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Program;

class ProgramController
{
    public function index(): void
    {
        $this->json(true, 'Programs fetched', Program::all());
    }

    public function show(int $id): void
    {
        $this->json(true, 'Program fetched', Program::find($id));
    }

    private function json(bool $success, string $message, $data = null): void
    {
        echo json_encode(compact('success', 'message', 'data'));
        exit;
    }
}
