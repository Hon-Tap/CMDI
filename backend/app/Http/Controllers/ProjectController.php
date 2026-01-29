<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Project;

final class ProjectController
{
    public function index(): void
    {
        json([
            'success' => true,
            'data'    => Project::all()
        ]);
    }

    public function store(): void
    {
        $payload = json_decode(file_get_contents('php://input'), true);

        if (!$payload || empty($payload['title'])) {
            json(['success' => false, 'message' => 'Title is required'], 422);
        }

        $project = Project::create($payload);
        json(['success' => true, 'data' => $project], 201);
    }

    // Reuse the common logic for update and delete
    public function destroy(): void
    {
        $id = (int)($_GET['id'] ?? 0);
        if ($id <= 0 || !Project::delete($id)) {
            json(['success' => false, 'message' => 'Project not found'], 404);
        }
        json(['success' => true, 'message' => 'Project deleted']);
    }
}
