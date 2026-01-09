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
            'message' => 'Projects fetched',
            'data'    => Project::all()
        ]);
    }

    public function show(): void
    {
        $id = (int)($_GET['id'] ?? 0);

        if ($id <= 0) {
            json(['success' => false, 'message' => 'Invalid project id'], 400);
        }

        $project = Project::find($id);

        if (!$project) {
            json(['success' => false, 'message' => 'Project not found'], 404);
        }

        json([
            'success' => true,
            'data'    => $project
        ]);
    }

    public function store(): void
    {
        $payload = json_decode(file_get_contents('php://input'), true);

        if (!$payload || empty($payload['title'])) {
            json(['success' => false, 'message' => 'Title is required'], 422);
        }

        $project = Project::create($payload);

        json([
            'success' => true,
            'message' => 'Project created',
            'data'    => $project
        ], 201);
    }

    public function update(): void
    {
        $id = (int)($_GET['id'] ?? 0);
        $payload = json_decode(file_get_contents('php://input'), true);

        if ($id <= 0 || !$payload) {
            json(['success' => false, 'message' => 'Invalid request'], 400);
        }

        $updated = Project::update($id, $payload);

        if (!$updated) {
            json(['success' => false, 'message' => 'Project not found'], 404);
        }

        json([
            'success' => true,
            'message' => 'Project updated',
            'data'    => $updated
        ]);
    }

    public function destroy(): void
    {
        $id = (int)($_GET['id'] ?? 0);

        if ($id <= 0) {
            json(['success' => false, 'message' => 'Invalid project id'], 400);
        }

        if (!Project::delete($id)) {
            json(['success' => false, 'message' => 'Project not found'], 404);
        }

        json([
            'success' => true,
            'message' => 'Project deleted'
        ]);
    }
}
