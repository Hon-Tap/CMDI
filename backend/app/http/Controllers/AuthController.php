<?php
// backend/app/http/Controllers/AuthController.php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;

class AuthController
{
    public function register(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['email']) || empty($data['password'])) {
            $this->json(false, 'Email and password are required');
        }

        $user = User::create([
            'email'    => $data['email'],
            'password' => password_hash($data['password'], PASSWORD_DEFAULT),
        ]);

        $this->json(true, 'Registration successful', $user);
    }

    public function login(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        $user = User::findByEmail($data['email'] ?? '');

        if (!$user || !password_verify($data['password'] ?? '', $user['password'])) {
            $this->json(false, 'Invalid credentials');
        }

        $this->json(true, 'Login successful', $user);
    }

    public function logout(): void
    {
        $this->json(true, 'Logged out successfully');
    }

    private function json(bool $success, string $message, $data = null): void
    {
        http_response_code($success ? 200 : 400);
        echo json_encode([
            'success' => $success,
            'message' => $message,
            'data'    => $data,
        ]);
        exit;
    }
}
