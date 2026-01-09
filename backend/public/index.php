<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/vendor/autoload.php';

/*
|--------------------------------------------------------------------------
| Load .env
|--------------------------------------------------------------------------
*/
$envPath = dirname(__DIR__) . '/.env';

if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#')) {
            continue;
        }
        [$key, $value] = array_map('trim', explode('=', $line, 2));
        $_ENV[$key] = $value;
        putenv("$key=$value");
    }
}

/*
|--------------------------------------------------------------------------
| CORS (dev-safe)
|--------------------------------------------------------------------------
*/
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/*
|--------------------------------------------------------------------------
| Request context
|--------------------------------------------------------------------------
*/
$method = $_SERVER['REQUEST_METHOD'];
$uri = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/') ?: '/';

/*
|--------------------------------------------------------------------------
| Load API Routes
|--------------------------------------------------------------------------
*/
require_once dirname(__DIR__) . '/routes/api.php';

/*
|--------------------------------------------------------------------------
| Fallback
|--------------------------------------------------------------------------
*/
http_response_code(404);
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'status'  => 'error',
    'message' => 'Endpoint not found'
]);
