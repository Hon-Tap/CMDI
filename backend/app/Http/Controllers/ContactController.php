<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use PDO;
use Throwable;

class ContactController
{
    private PDO $db;

    public function __construct()
    {
        $dsn = $_ENV['DATABASE_URL'] ?? null;

        if ($dsn) {
            if (str_starts_with($dsn, 'postgres://') || str_starts_with($dsn, 'postgresql://')) {
                $parts = parse_url($dsn);

                $host = $parts['host'] ?? '127.0.0.1';
                $port = (int)($parts['port'] ?? 5432);
                $user = $parts['user'] ?? '';
                $pass = $parts['pass'] ?? '';
                $db   = isset($parts['path']) ? ltrim($parts['path'], '/') : '';

                $pdoDsn = "pgsql:host={$host};port={$port};dbname={$db};";
                $this->db = new PDO($pdoDsn, $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]);
                return;
            }

            $this->db = new PDO($dsn, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            return;
        }

        $host = $_ENV['DB_HOST'] ?? '127.0.0.1';
        $db   = $_ENV['DB_NAME'] ?? 'cmdi_db';
        $user = $_ENV['DB_USER'] ?? '';
        $pass = $_ENV['DB_PASS'] ?? '';
        $port = (int)($_ENV['DB_PORT'] ?? 5432);

        $pdoDsn = "pgsql:host={$host};port={$port};dbname={$db};";
        $this->db = new PDO($pdoDsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }

    private function notify(string $to, string $subject, string $body, ?string $replyToEmail = null, ?string $replyToName = null): void
    {
        try {
            $host = (string) getenv('SMTP_HOST');
            $user = (string) getenv('SMTP_USER');
            $pass = (string) getenv('SMTP_PASS');
            $port = (int) (getenv('SMTP_PORT') ?: 587);

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
            $mail->Sender     = $user;

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

    public function store(): void
    {
        try {
            $raw  = (string) (file_get_contents('php://input') ?: '');
            $data = json_decode($raw, true);

            if (!is_array($data)) {
                json(['success' => false, 'message' => 'Invalid JSON payload'], 400);
                return;
            }

            $fullName = trim((string)($data['full_name'] ?? ''));
            $email    = trim((string)($data['email'] ?? ''));
            $subject  = trim((string)($data['subject'] ?? 'General Inquiry'));
            $message  = trim((string)($data['message'] ?? ''));

            if ($fullName === '' || $email === '' || $message === '') {
                json(['success' => false, 'message' => 'Please fill in all required fields (full_name, email, message).'], 400);
                return;
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                json(['success' => false, 'message' => 'Invalid email address.'], 400);
                return;
            }

            $sql = "
                INSERT INTO contacts (full_name, email, subject, message)
                VALUES (:full_name, :email, :subject, :message)
                RETURNING id, created_at
            ";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':full_name' => $fullName,
                ':email'     => $email,
                ':subject'   => $subject,
                ':message'   => $message,
            ]);

            $row = $stmt->fetch();

            // Email notify (best-effort)
            $to = (string) getenv('MAIL_TO_INFO');
            if ($to === '') $to = (string) getenv('SMTP_USER');

            $mailSubject = 'CMDI: New Contact Message';
            $body =
                "New contact message received\n\n" .
                "From: {$fullName}\n" .
                "Email: {$email}\n" .
                "Subject: {$subject}\n\n" .
                "Message:\n{$message}\n\n" .
                "----\nSent from cmdi-ss.org";

            $this->notify($to, $mailSubject, $body, $email, $fullName);

            json([
                'success' => true,
                'message' => 'Your message has been sent successfully!',
                'data' => $row ?: null,
            ], 201);
        } catch (Throwable $e) {
            error_log('CONTACT STORE ERROR: ' . $e->getMessage());
            json(['success' => false, 'message' => 'Failed to send message.', 'error' => $e->getMessage()], 500);
        }
    }
}
