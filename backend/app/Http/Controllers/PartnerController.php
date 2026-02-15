<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use PDO;
use Exception;

class PartnerController
{
    private PDO $db;

    public function __construct()
    {
        $dsn = $_ENV['DATABASE_URL'] ?? null;

        if ($dsn) {
            // Support URLs like:
            // postgres://user:pass@host:5432/dbname?sslmode=require
            if (str_starts_with($dsn, 'postgres://') || str_starts_with($dsn, 'postgresql://')) {
                $parts = parse_url($dsn);

                $host = $parts['host'] ?? '127.0.0.1';
                $port = (int)($parts['port'] ?? 5432);
                $user = $parts['user'] ?? '';
                $pass = $parts['pass'] ?? '';
                $db   = isset($parts['path']) ? ltrim($parts['path'], '/') : '';

                // Parse query string options (sslmode, etc.)
                $query = [];
                if (!empty($parts['query'])) {
                    parse_str($parts['query'], $query);
                }

                $pdoDsn = "pgsql:host={$host};port={$port};dbname={$db};";

                // If sslmode is present, pass it through in DSN
                // (common values: require, prefer, disable)
                if (isset($query['sslmode']) && is_string($query['sslmode']) && $query['sslmode'] !== '') {
                    $pdoDsn .= "sslmode={$query['sslmode']};";
                }

                $this->db = new PDO($pdoDsn, $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                ]);
                return;
            }

            // Or if DATABASE_URL is already a pgsql DSN
            $this->db = new PDO($dsn, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            ]);
            return;
        }

        // Fallback old-style envs
        $host = $_ENV['DB_HOST'] ?? '127.0.0.1';
        $db   = $_ENV['DB_NAME'] ?? 'cmdi_db';
        $user = $_ENV['DB_USER'] ?? '';
        $pass = $_ENV['DB_PASS'] ?? '';
        $port = (int)($_ENV['DB_PORT'] ?? 5432);

        $pdoDsn = "pgsql:host={$host};port={$port};dbname={$db};";
        $this->db = new PDO($pdoDsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ]);
    }

    public function store(): void
    {
        try {
            $raw = file_get_contents('php://input') ?: '';
            $data = json_decode($raw, true);

            if (!is_array($data)) {
                json(['error' => 'Invalid JSON payload'], 400);
                return;
            }

            // Frontend keys:
            // organization_name, organization_type, contact_name, contact_title,
            // email, phone, country, website, focus_areas (array),
            // partnership_interest, proposed_support, consent (boolean)

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

            // Basic required fields
            if (
                $organizationName === '' ||
                $organizationType === '' ||
                $contactName === '' ||
                $email === '' ||
                $interest === '' ||
                $support === ''
            ) {
                json(['error' => 'Missing required fields.'], 400);
                return;
            }

            if (!$consent) {
                json(['error' => 'Consent is required.'], 400);
                return;
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                json(['error' => 'Invalid email address.'], 400);
                return;
            }

            if (!is_array($focusAreasRaw) || count($focusAreasRaw) < 1) {
                json(['error' => 'Please select at least one focus area.'], 400);
                return;
            }

            // sanitize focus areas into string[]
            $focusAreas = array_values(array_filter(array_map(
                fn($v) => trim((string)$v),
                $focusAreasRaw
            ), fn($v) => $v !== ''));

            if (count($focusAreas) < 1) {
                json(['error' => 'Please select at least one focus area.'], 400);
                return;
            }

            // Normalize website (optional)
            // If user types "cmdi-ss.org", store "https://cmdi-ss.org"
            if ($website !== '' && !preg_match('#^https?://#i', $website)) {
                $website = 'https://' . $website;
            }

            // Convert array to a Postgres array literal safely.
            // Postgres array literal rules: {"a","b","c"} with internal quotes escaped.
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

            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            json([
                'success' => true,
                'message' => 'Thank you! Your partnership request has been submitted.',
                'data' => $row ?: null,
            ], 201);
            return;

        } catch (Exception $e) {
            json(['error' => 'Submission failed: ' . $e->getMessage()], 500);
            return;
        }
    }
}
