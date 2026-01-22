<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;

class AuthController {
    
    public function login(): void {
        $data = json_decode(file_get_contents('php://input'), true);
        $user = User::findByEmail($data['email'] ?? '');

        if (!$user || !password_verify($data['password'] ?? '', $user['password'])) {
            json(['success' => false, 'message' => 'Invalid credentials'], 401);
        }

        // Remove password from response for security
        unset($user['password']);
        json(['success' => true, 'message' => 'Login successful', 'user' => $user]);
    }

    public function register(): void {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['email']) || empty($data['password'])) {
            json(['success' => false, 'message' => 'Email and password required'], 400);
        }

        $user = User::create([
            'email'    => $data['email'],
            'password' => password_hash($data['password'], PASSWORD_DEFAULT),
        ]);

        json(['success' => true, 'message' => 'User created', 'user' => $user]);
    }
}