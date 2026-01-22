<?php
declare(strict_types=1);

namespace App;

// 1. Import all necessary controllers
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
$method = $_SERVER['REQUEST_METHOD'];
$path   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = ($path !== '/') ? rtrim($path, '/') : '/';

/*
|--------------------------------------------------------------------------
| Route Definitions
|--------------------------------------------------------------------------
*/
$routes = [
    'GET' => [
        '/api/health'     => fn() => json(['status' => 'ok', 'time' => date('c')]),
        '/api/news'       => [NewsController::class, 'index'],
        '/api/volunteers' => [VolunteerController::class, 'index'],
        '/api/programs'   => [ProgramController::class, 'index'],
        '/api/projects'   => [ProjectController::class, 'index'],
    ],
    
    'POST' => [
        // Auth
        '/api/auth/login'    => [AuthController::class, 'login'],
        '/api/auth/register' => [AuthController::class, 'register'],
        
        // Form Submissions
        '/api/news'          => [NewsController::class, 'store'],
        '/api/volunteers'    => [VolunteerController::class, 'store'],
        '/api/contact'       => [ContactController::class, 'store'],
        '/api/partners'      => [PartnerController::class, 'store'], // New Partner Endpoint
    ]
];

/*
|--------------------------------------------------------------------------
| Dispatcher (The "Engine")
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
        
        if (class_exists($class)) {
            $controller = new $class();
            if (method_exists($controller, $action)) {
                $controller->{$action}();
                exit;
            } else {
                json(['error' => "Method '$action' not found in $class"], 500);
            }
        } else {
            json(['error' => "Controller class '$class' not found"], 500);
        }
    }
}

json([
    'error' => 'Endpoint not found',
    'debug' => [
        'requested_method' => $method,
        'requested_uri'    => $uri
    ]
], 404);