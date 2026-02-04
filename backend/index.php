<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| CMDI API Bootstrap / Entry (Polish Pass)
|--------------------------------------------------------------------------
| - /health
| - Production-safe JSON errors (no debug leaks)
| - CORS allowlist (NO wildcard)
| - Cache headers for public endpoints
| - Consistent JSON responses + exit
|--------------------------------------------------------------------------
*/

/* -----------------------------
   Small helpers (no dependencies)
----------------------------- */

function normalize_path(string $path): string {
    $path = rtrim($path, '/');
    return $path === '' ? '/' : $path;
}

function request_path(): string {
    $uri = $_SERVER['REQUEST_URI'] ?? '/';
    $path = parse_url($uri, PHP_URL_PATH) ?: '/';
    return normalize_path($path);
}

function request_method(): string {
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}

if (!function_exists('json')) {
    function json($data, int $status = 200, array $headers = []): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');

        foreach ($headers as $k => $v) {
            header($k . ': ' . $v);
        }

        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }
}

/* -----------------------------
   Load .env early (so APP_ENV is available)
----------------------------- */

$envPath = __DIR__ . '/.env';
if (is_file($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) continue;

        $parts = explode('=', $line, 2);
        if (count($parts) !== 2) continue;

        [$key, $value] = array_map('trim', $parts);
        $_ENV[$key] = $value;
        putenv("$key=$value");
    }
}

$APP_ENV = $_ENV['APP_ENV'] ?? getenv('APP_ENV') ?? 'production';
$IS_PROD = ($APP_ENV === 'production');

/* -----------------------------
   Error handling (production-safe JSON)
----------------------------- */

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

set_error_handler(function ($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) return false;
    throw new ErrorException($message, 0, $severity, $file, $line);
});

set_exception_handler(function ($e) use ($IS_PROD) {
    error_log('[API_EXCEPTION] ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());

    if ($IS_PROD) {
        json(['status' => 'error', 'message' => 'Internal Server Error'], 500);
    }

    // Non-prod still returns JSON (no HTML dumps)
    json([
        'status'  => 'error',
        'message' => $e->getMessage(),
        'where'   => basename($e->getFile()) . ':' . $e->getLine(),
    ], 500);
});

/* -----------------------------
   CORS (allowlist only)
----------------------------- */

$CORS_ALLOWLIST = [
    'https://www.cmdi-ss.org',
    'https://cmdi-ss.org',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $CORS_ALLOWLIST, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Max-Age: 600');
}

// Preflight
if (request_method() === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/* -----------------------------
   Cache headers for public GET endpoints
----------------------------- */

$CACHEABLE_GET_PATHS = [
    '/api/news',
    '/api/projects',
];

$method = request_method();
$path = request_path();

if ($method === 'GET' && in_array($path, $CACHEABLE_GET_PATHS, true)) {
    header('Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600');
}

/* -----------------------------
   Health endpoint
----------------------------- */

if ($method === 'GET' && $path === '/health') {
    json(['status' => 'ok']);
}

/* -----------------------------
   Composer autoload
----------------------------- */

$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (!is_file($autoloadPath)) {
    json([
        'status'  => 'error',
        'message' => 'Server misconfiguration: Composer autoload missing. Run composer install.',
    ], 500);
}

require_once $autoloadPath;

/* -----------------------------
   Router
----------------------------- */

$routerPath = __DIR__ . '/routes/api.php';
if (is_file($routerPath)) {
    require_once $routerPath;
    // If router didn't exit, return a clean 404
    json(['status' => 'error', 'message' => 'Not Found'], 404);
}

json(['status' => 'error', 'message' => 'Router file missing'], 500);
