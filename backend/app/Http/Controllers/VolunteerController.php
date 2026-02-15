<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Volunteer;
use Exception;

class VolunteerController
{
    /**
     * GET /api/volunteers
     * Returns recent volunteer applications (ordered) and an optional count
     */
    public function index(): void
    {
        try {
            // If your frontend just needs the count, you can later add:
            // /api/volunteers?count=1 to return only {count: N}
            $countOnly = isset($_GET['count']) && ($_GET['count'] === '1' || $_GET['count'] === 'true');

            if ($countOnly) {
                // If your ORM supports count() directly, use it:
                // $count = Volunteer::count();
                // Otherwise fallback to counting the array.
                $all = Volunteer::all();
                json(['success' => true, 'count' => is_countable($all) ? count($all) : 0]);
            }

            // Prefer newest first (matches UI expectation)
            // If your ORM supports it; otherwise this still runs fine if ignored.
            $rows = Volunteer::orderBy('created_at', 'desc')->get();

            json([
                'success' => true,
                'data' => $rows,
                'count' => is_countable($rows) ? count($rows) : null,
            ]);
        } catch (Exception $e) {
            json([
                'success' => false,
                'message' => 'Failed to load volunteers.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/volunteers
     * Body: { first_name, last_name, email, phone?, primary_skill, reason }
     */
    public function store(): void
    {
        try {
            $raw = file_get_contents('php://input');
            $data = json_decode((string)$raw, true);

            if (!is_array($data)) {
                json(['success' => false, 'message' => 'Invalid JSON payload'], 400);
            }

            $firstName = trim((string)($data['first_name'] ?? ''));
            $lastName  = trim((string)($data['last_name'] ?? ''));
            $email     = strtolower(trim((string)($data['email'] ?? '')));
            $phone     = trim((string)($data['phone'] ?? ''));
            $skill     = trim((string)($data['primary_skill'] ?? ''));
            $reason    = trim((string)($data['reason'] ?? ''));

            // Required fields
            if ($firstName === '' || $lastName === '' || $email === '' || $skill === '' || $reason === '') {
                json([
                    'success' => false,
                    'message' => 'Required fields missing: first_name, last_name, email, primary_skill, reason',
                ], 400);
            }

            // Basic validation
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                json(['success' => false, 'message' => 'Invalid email address'], 400);
            }

            // Guard sizes (avoid storing garbage / extremely long payloads)
            if (mb_strlen($firstName) > 120 || mb_strlen($lastName) > 120) {
                json(['success' => false, 'message' => 'Name is too long'], 400);
            }
            if (mb_strlen($email) > 190) {
                json(['success' => false, 'message' => 'Email is too long'], 400);
            }
            if (mb_strlen($phone) > 60) {
                json(['success' => false, 'message' => 'Phone is too long'], 400);
            }
            if (mb_strlen($skill) > 120) {
                json(['success' => false, 'message' => 'Primary skill is too long'], 400);
            }
            if (mb_strlen($reason) > 2000) {
                json(['success' => false, 'message' => 'Reason is too long (max 2000 characters)'], 400);
            }

            // Optional: prevent duplicates by email (recommended)
            // If your ORM has where()->first():
            $existing = Volunteer::where('email', $email)->first();
            if ($existing) {
                json([
                    'success' => false,
                    'message' => 'A volunteer application with this email already exists.',
                ], 409);
            }

            $row = Volunteer::create([
                'first_name'    => $firstName,
                'last_name'     => $lastName,
                'email'         => $email,
                'phone'         => $phone, // empty string allowed
                'primary_skill' => $skill,
                'reason'        => $reason,
            ]);

            json([
                'success' => true,
                'message' => 'Volunteer registered',
                'data' => $row,
            ], 201);
        } catch (Exception $e) {
            json([
                'success' => false,
                'message' => 'Submission failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
