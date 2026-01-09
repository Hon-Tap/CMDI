<?php
// backend/app/http/Controllers/NewsController.php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\News;

class NewsController
{
    public function index(): void
    {
        $this->json(true, 'News fetched', News::all());
    }

    public function show(int $id): void
    {
        $this->json(true, 'News item fetched', News::find($id));
    }

    private function json(bool $success, string $message, $data = null): void
    {
        echo json_encode(compact('success', 'message', 'data'));
        exit;
    }
}
