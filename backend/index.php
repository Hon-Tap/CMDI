<?php
declare(strict_types=1);

// 1. Disable error display in production (logs only)
ini_set('display_errors', '0');
error_reporting(E_ALL);

// 2. Autoload Composer
$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (file_exists($autoloadPath)) {
    require_once $autoloadPath;
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Autoload file missing']);
    exit;
}

// 3. Load .env manually
$envPath = __DIR__ . '/.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#')) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            [$key, $value] = array_map('trim', $parts);
            $_ENV[$key] = $value;
            putenv("$key=$value");
        }
    }
}

// 4. CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 5. Global helper function for JSON responses
if (!function_exists('json')) {
    function json($data, int $status = 200): void {
        http_response_code($status);
        echo json_encode($data);
        exit;
    }
}

// 6. Include Router File
$routerPath = __DIR__ . '/routes/api.php';
if (file_exists($routerPath)) {
    require_once $routerPath;
} else {
    json(['error' => 'Router file missing'], 500);
}
