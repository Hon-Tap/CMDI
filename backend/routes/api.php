<?php
declare(strict_types=1);

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
| Request Normalization
|--------------------------------------------------------------------------
*/
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path   = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

// Normalize trailing slashes
$uri = rtrim($path, '/');
if ($uri === '') $uri = '/';

// IMPORTANT: treat /index.php same as /
if ($uri === '/index.php') $uri = '/';

/*
|--------------------------------------------------------------------------
| Route Definitions
|--------------------------------------------------------------------------
*/
$routes = [
  'GET' => [
    '/'            => fn() => json(['status' => 'ok', 'time' => date('c')]),
    '/api/health'  => fn() => json(['status' => 'ok', 'time' => date('c')]),

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
if (isset($routes[$method][$uri])) {
  $handler = $routes[$method][$uri];

  if (is_callable($handler)) {
    $handler();
    exit;
  }

  if (is_array($handler)) {
    [$class, $action] = $handler;

    if (!class_exists($class)) {
      json(['error' => "Controller class '$class' not found"], 500);
    }

    $controller = new $class();

    if (!method_exists($controller, $action)) {
      json(['error' => "Method '$action' not found in $class"], 500);
    }

    $controller->{$action}();
    exit;
  }
}

json([
  'error' => 'Endpoint not found',
  'debug' => [
    'requested_method' => $method,
    'requested_uri'    => $uri,
  ],
], 404);
