<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Volunteer;

class VolunteerController
{
    /**
     * Safe length helper (works even if mbstring is missing)
     */
    private function slen(string $s): int
    {
        return function_exists('mb_strlen') ? mb_strlen($s) : strlen($s);
    }

    /**
     * GET /api/volunteers
     * - Default: returns newest first in { success, data, count }
     * - Optional: /api/volunteers?count=1 returns only { success, count }
     */
    public function index(): void
    {
        try {
            $countOnly = isset($_GET['count']) && in_array((string) $_GET['count'], ['1', 'true'], true);

            if ($countOnly) {
                // If your ORM supports count(), use it.
                // $count = Volunteer::count();

                $all = Volunteer::all();
                $count = is_countable($all) ? count($all) : 0;

                json(['success' => true, 'count' => $count]);
                return;
            }

            // Prefer newest first
            // Assumes ORM supports orderBy()->get()
            $rows = Volunteer::orderBy('created_at', 'desc')->get();

            json([
                'success' => true,
                'data' => $rows,
                'count' => is_countable($rows) ? count($rows) : null,
            ]);
        } catch (\Throwable $e) {
            error_log('VOLUNTEER INDEX ERROR: ' . $e->getMessage());
            error_log($e->getTraceAsString());

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
            $raw  = (string) file_get_contents('php://input');
            $data = json_decode($raw, true);

            if (!is_array($data)) {
                json(['success' => false, 'message' => 'Invalid JSON payload'], 400);
                return;
            }

            // Normalize inputs (DB columns are text, created_at is DB-managed)
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
                return;
            }

            // Basic validation
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                json(['success' => false, 'message' => 'Invalid email address'], 400);
                return;
            }

            // Guard sizes (practical limits; DB is text)
            if ($this->slen($firstName) > 120 || $this->slen($lastName) > 120) {
                json(['success' => false, 'message' => 'Name is too long'], 400);
                return;
            }

            if ($this->slen($email) > 190) {
                json(['success' => false, 'message' => 'Email is too long'], 400);
                return;
            }

            if ($phone !== '' && $this->slen($phone) > 60) {
                json(['success' => false, 'message' => 'Phone is too long'], 400);
                return;
            }

            if ($this->slen($skill) > 120) {
                json(['success' => false, 'message' => 'Primary skill is too long'], 400);
                return;
            }

            // Align with your frontend (REASON_MAX = 800)
            if ($this->slen($reason) > 800) {
                json(['success' => false, 'message' => 'Reason is too long (max 800 characters)'], 400);
                return;
            }

            // Prevent duplicates by email
            $existing = Volunteer::where('email', $email)->first();
            if ($existing) {
                json([
                    'success' => false,
                    'message' => 'A volunteer application with this email already exists.',
                ], 409);
                return;
            }

            $row = Volunteer::create([
                'first_name'    => $firstName,
                'last_name'     => $lastName,
                'email'         => $email,
                'phone'         => ($phone === '' ? null : $phone),
                'primary_skill' => $skill,
                'reason'        => $reason,
            ]);

            json([
                'success' => true,
                'message' => 'Volunteer registered',
                'data' => $row,
            ], 201);

        } catch (\Throwable $e) {
            error_log('VOLUNTEER STORE ERROR: ' . $e->getMessage());
            error_log($e->getTraceAsString());

            json([
                'success' => false,
                'message' => 'Submission failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
