<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Volunteer;
use Throwable;
use PDOException;

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
     * Best-effort SMTP notify (won't break the request if mail fails).
     * Requires PHPMailer installed (composer require phpmailer/phpmailer).
     */
    private function notify(string $to, string $subject, string $body, ?string $replyToEmail = null, ?string $replyToName = null): void
    {
        try {
            $host = (string) getenv('SMTP_HOST');
            $user = (string) getenv('SMTP_USER');
            $pass = (string) getenv('SMTP_PASS');
            $port = (int) (getenv('SMTP_PORT') ?: 587);

            // Some people paste app-password with spaces; strip them safely.
            $pass = preg_replace('/\s+/', '', $pass ?? '');

            if ($host === '' || $user === '' || $pass === '' || $to === '') {
                error_log('MAILER: missing SMTP_* or TO env');
                return;
            }

            if (!class_exists(\PHPMailer\PHPMailer\PHPMailer::class)) {
                error_log('MAILER: PHPMailer not installed');
                return;
            }

            $fromEmail = (string) (getenv('MAIL_FROM') ?: $user);
            $fromName  = (string) (getenv('MAIL_FROM_NAME') ?: 'CMDI Website');

            $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host       = $host;
            $mail->SMTPAuth   = true;
            $mail->Username   = $user;
            $mail->Password   = $pass;
            $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = $port;
            $mail->CharSet    = 'UTF-8';

            // Gmail is happiest when Sender is the authenticated mailbox
            $mail->Sender = $user;

            $mail->setFrom($fromEmail, $fromName);
            $mail->addAddress($to);

            if ($replyToEmail) {
                $mail->addReplyTo($replyToEmail, $replyToName ?: $replyToEmail);
            }

            $mail->Subject = $subject;
            $mail->isHTML(false);
            $mail->Body    = $body;
            $mail->AltBody = $body;

            $mail->send();
        } catch (Throwable $e) {
            error_log('MAILER ERROR: ' . $e->getMessage());
        }
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
                $all = Volunteer::all();
                $count = is_countable($all) ? count($all) : 0;

                json(['success' => true, 'count' => $count]);
                return;
            }

            $rows = Volunteer::orderBy('created_at', 'desc')->get();

            json([
                'success' => true,
                'data' => $rows,
                'count' => is_countable($rows) ? count($rows) : null,
            ]);
        } catch (Throwable $e) {
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

            $firstName = trim((string)($data['first_name'] ?? ''));
            $lastName  = trim((string)($data['last_name'] ?? ''));
            $email     = strtolower(trim((string)($data['email'] ?? '')));
            $phone     = trim((string)($data['phone'] ?? ''));
            $skill     = trim((string)($data['primary_skill'] ?? ''));
            $reason    = trim((string)($data['reason'] ?? ''));

            if ($firstName === '' || $lastName === '' || $email === '' || $skill === '' || $reason === '') {
                json([
                    'success' => false,
                    'message' => 'Required fields missing: first_name, last_name, email, primary_skill, reason',
                ], 400);
                return;
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                json(['success' => false, 'message' => 'Invalid email address'], 400);
                return;
            }

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

            if ($this->slen($reason) > 800) {
                json(['success' => false, 'message' => 'Reason is too long (max 800 characters)'], 400);
                return;
            }

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

            // Email notify (best-effort)
            $to = (string) getenv('MAIL_TO_VOLUNTEERS');
            if ($to === '') $to = (string) getenv('MAIL_TO_INFO');
            if ($to === '') $to = (string) getenv('SMTP_USER');

            $subject = 'CMDI: New Volunteer Application';
            $body =
                "New volunteer application received\n\n" .
                "Name: {$firstName} {$lastName}\n" .
                "Email: {$email}\n" .
                "Phone: " . ($phone !== '' ? $phone : '-') . "\n" .
                "Primary skill: {$skill}\n\n" .
                "Reason:\n{$reason}\n\n" .
                "----\nSent from cmdi-ss.org";

            $this->notify($to, $subject, $body, $email, "{$firstName} {$lastName}");

            json([
                'success' => true,
                'message' => 'Volunteer registered',
                'data' => $row,
            ], 201);
        } catch (PDOException $e) {
            // If you later add UNIQUE(email), handle duplicate gracefully.
            // Postgres unique violation SQLSTATE is 23505.
            if ((string) $e->getCode() === '23505') {
                json([
                    'success' => false,
                    'message' => 'A volunteer application with this email already exists.',
                ], 409);
                return;
            }

            error_log('VOLUNTEER STORE PDO ERROR: ' . $e->getMessage());
            json([
                'success' => false,
                'message' => 'Submission failed.',
                'error' => $e->getMessage(),
            ], 500);
        } catch (Throwable $e) {
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
