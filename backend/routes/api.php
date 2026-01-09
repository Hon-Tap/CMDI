<?php
declare(strict_types=1);

use App\Http\Controllers\AuthController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\VolunteerController;

/*
|--------------------------------------------------------------------------
| JSON Response Helper
|--------------------------------------------------------------------------
*/
if (!function_exists('json')) {
    function json(mixed $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }
}

/*
|--------------------------------------------------------------------------
| Request Context
|--------------------------------------------------------------------------
*/
$method = $_SERVER['REQUEST_METHOD'];
$uri    = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/') ?: '/';

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/
$routes = [

    // ─────────────────────────────────────────────
    // Health
    // ─────────────────────────────────────────────
    ['GET', '/api/health', fn () => json([
        'status' => 'ok',
        'time'   => date('c'),
        'env'    => $_ENV['APP_ENV'] ?? 'unknown'
    ])],

    // ─────────────────────────────────────────────
    // Auth
    // ─────────────────────────────────────────────
    ['POST', '/api/auth/login', [AuthController::class, 'login']],

    // ─────────────────────────────────────────────
    // News
    // ─────────────────────────────────────────────
    ['GET',  '/api/news',  [NewsController::class, 'index']],
    ['POST', '/api/news',  [NewsController::class, 'store']],

    // ─────────────────────────────────────────────
    // Programs
    // ─────────────────────────────────────────────
    ['GET',  '/api/programs', [ProgramController::class, 'index']],
    ['POST', '/api/programs', [ProgramController::class, 'store']],

    // ─────────────────────────────────────────────
    // Projects
    // ─────────────────────────────────────────────
    ['GET',    '/api/projects',        [ProjectController::class, 'index']],
    ['GET',    '/api/projects/show',   [ProjectController::class, 'show']],
    ['POST',   '/api/projects',        [ProjectController::class, 'store']],
    ['PUT',    '/api/projects',        [ProjectController::class, 'update']],
    ['DELETE', '/api/projects',        [ProjectController::class, 'destroy']],

    // ─────────────────────────────────────────────
    // Volunteers
    // ─────────────────────────────────────────────
    ['POST', '/api/volunteers', [VolunteerController::class, 'store']],
];

/*
|--------------------------------------------------------------------------
| Dispatcher
|--------------------------------------------------------------------------
*/
foreach ($routes as [$httpMethod, $path, $handler]) {
    if ($method !== $httpMethod) {
        continue;
    }

    if ($uri !== $path) {
        continue;
    }

    // Closure route
    if (is_callable($handler)) {
        $handler();
    }

    // Controller route
    if (is_array($handler)) {
        [$class, $action] = $handler;

        if (!class_exists($class)) {
            json(['error' => 'Controller not found'], 500);
        }

        if (!method_exists($class, $action)) {
            json(['error' => 'Action not found'], 500);
        }

        (new $class())->{$action}();
    }

    exit;
}

/*
|--------------------------------------------------------------------------
| Fallback – No route matched
|--------------------------------------------------------------------------
*/
json([
    'status'  => 'error',
    'message' => 'Endpoint not found',
    'path'    => $uri,
    'method'  => $method
], 404);
