<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use PDO;
use Throwable;

class PartnerController
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

                $query = [];
                if (!empty($parts['query'])) {
                    parse_str($parts['query'], $query);
                }

                $pdoDsn = "pgsql:host={$host};port={$port};dbname={$db};";
                if (isset($query['sslmode']) && is_string($query['sslmode']) && $query['sslmode'] !== '') {
                    $pdoDsn .= "sslmode={$query['sslmode']};";
                }

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

            $organizationName = trim((string)($data['organization_name'] ?? ''));
            $organizationType = trim((string)($data['organization_type'] ?? ''));
            $contactName      = trim((string)($data['contact_name'] ?? ''));
            $contactTitle     = trim((string)($data['contact_title'] ?? ''));
            $email            = trim((string)($data['email'] ?? ''));
            $phone            = trim((string)($data['phone'] ?? ''));
            $country          = trim((string)($data['country'] ?? 'South Sudan'));
            $website          = trim((string)($data['website'] ?? ''));
            $focusAreasRaw    = $data['focus_areas'] ?? [];
            $interest         = trim((string)($data['partnership_interest'] ?? ''));
            $support          = trim((string)($data['proposed_support'] ?? ''));
            $consent          = (bool)($data['consent'] ?? false);

            if ($organizationName === '' || $organizationType === '' || $contactName === '' || $email === '' || $interest === '' || $support === '') {
                json(['success' => false, 'message' => 'Missing required fields.'], 400);
                return;
            }

            if (!$consent) {
                json(['success' => false, 'message' => 'Consent is required.'], 400);
                return;
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                json(['success' => false, 'message' => 'Invalid email address.'], 400);
                return;
            }

            if (!is_array($focusAreasRaw) || count($focusAreasRaw) < 1) {
                json(['success' => false, 'message' => 'Please select at least one focus area.'], 400);
                return;
            }

            $focusAreas = array_values(array_filter(array_map(
                fn($v) => trim((string)$v),
                $focusAreasRaw
            ), fn($v) => $v !== ''));

            if (count($focusAreas) < 1) {
                json(['success' => false, 'message' => 'Please select at least one focus area.'], 400);
                return;
            }

            if ($website !== '' && !preg_match('#^https?://#i', $website)) {
                $website = 'https://' . $website;
            }

            // Convert array to safe Postgres text[] literal: {"a","b"}
            $pgArray = '{' . implode(',', array_map(function (string $s): string {
                $s = str_replace(['\\', '"'], ['\\\\', '\\"'], $s);
                return '"' . $s . '"';
            }, $focusAreas)) . '}';

            $sql = "
                INSERT INTO partner_requests (
                    organization_name,
                    organization_type,
                    contact_name,
                    contact_title,
                    email,
                    phone,
                    country,
                    website,
                    focus_areas,
                    partnership_interest,
                    proposed_support,
                    consent
                )
                VALUES (
                    :organization_name,
                    :organization_type,
                    :contact_name,
                    :contact_title,
                    :email,
                    :phone,
                    :country,
                    :website,
                    :focus_areas::text[],
                    :partnership_interest,
                    :proposed_support,
                    :consent
                )
                RETURNING id, created_at
            ";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':organization_name'    => $organizationName,
                ':organization_type'    => $organizationType,
                ':contact_name'         => $contactName,
                ':contact_title'        => $contactTitle,
                ':email'                => $email,
                ':phone'                => $phone,
                ':country'              => $country,
                ':website'              => $website,
                ':focus_areas'          => $pgArray,
                ':partnership_interest' => $interest,
                ':proposed_support'     => $support,
                ':consent'              => $consent,
            ]);

            $row = $stmt->fetch();

            // Email notify (best-effort)
            $to = (string) getenv('MAIL_TO_INFO');
            if ($to === '') $to = (string) getenv('SMTP_USER');

            $focusList = implode(', ', $focusAreas);

            $mailSubject = 'CMDI: New Partnership Request';
            $body =
                "New partnership request received\n\n" .
                "Organization: {$organizationName}\n" .
                "Type: {$organizationType}\n" .
                "Contact: {$contactName}" . ($contactTitle !== '' ? " ({$contactTitle})" : "") . "\n" .
                "Email: {$email}\n" .
                "Phone: " . ($phone !== '' ? $phone : '-') . "\n" .
                "Country: {$country}\n" .
                "Website: " . ($website !== '' ? $website : '-') . "\n" .
                "Focus areas: {$focusList}\n\n" .
                "Partnership interest:\n{$interest}\n\n" .
                "Proposed support:\n{$support}\n\n" .
                "Consent: " . ($consent ? 'true' : 'false') . "\n\n" .
                "----\nSent from cmdi-ss.org";

            $this->notify($to, $mailSubject, $body, $email, $contactName);

            json([
                'success' => true,
                'message' => 'Thank you! Your partnership request has been submitted.',
                'data' => $row ?: null,
            ], 201);
        } catch (Throwable $e) {
            error_log('PARTNER STORE ERROR: ' . $e->getMessage());
            json(['success' => false, 'message' => 'Submission failed.', 'error' => $e->getMessage()], 500);
        }
    }
}
