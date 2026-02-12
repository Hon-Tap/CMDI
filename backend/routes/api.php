<?php

declare(strict_types=1);

// 1) Autoloader
require_once __DIR__ . '/../vendor/autoload.php';

// Controllers
use App\Http\Controllers\NewsController;
use App\Http\Controllers\VolunteerController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\PartnerController;

/*
|--------------------------------------------------------------------------
| Helper: JSON response
|--------------------------------------------------------------------------
*/
if (!function_exists('json')) {
    function json(array $data, int $code = 200): void
    {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }
}

/*
|--------------------------------------------------------------------------
| CORS (allow your domains + vercel preview)
|--------------------------------------------------------------------------
*/
$allowedOrigins = [
    'https://www.cmdi-ss.org',
    'https://cmdi-ss.org',
    'https://api.cmdi-ss.org',
    // Add your vercel preview domain(s) as needed:
    'https://cmdi-git-feature-local-edit-hon-taps-projects.vercel.app',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: true');
}

// Always allow these
header('Access-Control-Allow-Methods: GET,POST,PATCH,PUT,DELETE,OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');

// Preflight
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/*
|--------------------------------------------------------------------------
| Request Normalization
|--------------------------------------------------------------------------
*/
$rawPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

// remove index.php and trailing slashes
$uri = str_replace('/index.php', '', $rawPath);
$uri = rtrim($uri, '/');
if ($uri === '') $uri = '/';

/*
|--------------------------------------------------------------------------
| Route Definitions
|--------------------------------------------------------------------------
*/
$routes = [
    'GET' => [
        '/'               => fn() => json(['status' => 'ok', 'message' => 'API Root']),
        '/api/health'     => fn() => json(['status' => 'ok', 'time' => date('c')]),

        '/api/news'       => [NewsController::class, 'index'],
        '/api/volunteers' => [VolunteerController::class, 'index'],
        '/api/programs'   => [ProgramController::class, 'index'],
        '/api/projects'   => [ProjectController::class, 'index'],
    ],
    'POST' => [
        '/api/auth/login'    => [AuthController::class, 'login'],
        '/api/auth/register' => [AuthController::class, 'register'],

        '/api/news'          => [NewsController::class, 'store'],
        '/api/volunteers'    => [VolunteerController::class, 'store'],
        '/api/contact'       => [ContactController::class, 'store'],
        '/api/partners'      => [PartnerController::class, 'store'],
    ],
];

/*
|--------------------------------------------------------------------------
| Dispatcher
|--------------------------------------------------------------------------
*/
$handler = $routes[$method][$uri] ?? null;

if ($handler === null) {
    json([
        'error' => 'Endpoint not found',
        'debug' => [
            'requested_method' => $method,
            'requested_uri'    => $uri,
            'server_uri'       => $_SERVER['REQUEST_URI'] ?? null,
        ],
    ], 404);
}

if (is_callable($handler)) {
    $handler();
    exit;
}

if (is_array($handler)) {
    [$class, $action] = $handler;

    if (!class_exists($class)) {
        json([
            'error' => "Controller class '{$class}' not found.",
            'hint'  => 'Check namespaces, file paths, and composer autoload.',
        ], 500);
    }

    $controller = new $class();

    if (!method_exists($controller, $action)) {
        json(['error' => "Method '{$action}' not found in {$class}"], 500);
    }

    $controller->{$action}();
    exit;
}

// Safety fallback
json(['error' => 'Invalid route handler'], 500);
