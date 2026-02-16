<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Volunteer;

class VolunteerController
{
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
                // If your ORM supports count(), you can switch to: $count = Volunteer::count();
                $all   = Volunteer::all();
                $count = is_countable($all) ? count($all) : 0;

                json(['success' => true, 'count' => $count]);
                return;
            }

            // Prefer newest first (assumes ORM supports orderBy()->get())
            $rows = Volunteer::orderBy('created_at', 'desc')->get();

            json([
                'success' => true,
                'data'    => $rows,
                'count'   => is_countable($rows) ? count($rows) : null,
            ]);
        } catch (\Throwable $e) {
            error_log('VOLUNTEER INDEX ERROR: ' . $e->getMessage());
            error_log($e->getTraceAsString());

            json([
                'success' => false,
                'message' => 'Failed to load volunteers.',
                'error'   => $e->getMessage(),
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

            // Safe length helper (works even if mbstring is missing)
            $len = function (string $s): int {
                return function_exists('mb_strlen') ? mb_strlen($s) : strlen($s);
            };

            // Normalize inputs
            $firstName = trim((string) ($data['first_name'] ?? ''));
            $lastName  = trim((string) ($data['last_name'] ?? ''));
            $email     = strtolower(trim((string) ($data['email'] ?? '')));
            $phone     = trim((string) ($data['phone'] ?? ''));
            $skill     = trim((string) ($data['primary_skill'] ?? ''));
            $reason    = trim((string) ($data['reason'] ?? ''));

            // Required fields (matches your controller + frontend expectations)
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

            // Guard sizes
            if ($len($firstName) > 120 || $len($lastName) > 120) {
                json(['success' => false, 'message' => 'Name is too long'], 400);
                return;
            }

            if ($len($email) > 190) {
                json(['success' => false, 'message' => 'Email is too long'], 400);
                return;
            }

            if ($phone !== '' && $len($phone) > 60) {
                json(['success' => false, 'message' => 'Phone is too long'], 400);
                return;
            }

            if ($len($skill) > 120) {
                json(['success' => false, 'message' => 'Primary skill is too long'], 400);
                return;
            }

            // Align with frontend REASON_MAX = 800
            if ($len($reason) > 800) {
                json(['success' => false, 'message' => 'Reason is too long (max 800 characters)'], 400);
                return;
            }

            // NOTE:
            // - If you added a UNIQUE index on volunteers.email (recommended), the DB is the source of truth for duplicates.
            // - If your ORM supports where()->first(), you can keep a friendly 409 message, but it can also be removed.
            if (method_exists(Volunteer::class, 'where')) {
                $existing = Volunteer::where('email', $email)->first();
                if ($existing) {
                    json([
                        'success' => false,
                        'message' => 'A volunteer application with this email already exists.',
                    ], 409);
                    return;
                }
            }

            // Create row
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
                'data'    => $row,
            ], 201);
        } catch (\Throwable $e) {
            error_log('VOLUNTEER STORE ERROR: ' . $e->getMessage());
            error_log($e->getTraceAsString());

            json([
                'success' => false,
                'message' => 'Submission failed.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
