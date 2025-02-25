<?php
/**
 * SuiteCRM API Proxy
 * 
 * Main entry point for the modular API proxy
 */

// Load configuration
$config = require_once(__DIR__ . '/config-file.php');

// Set error reporting based on config
if ($config['api']['debug']) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Set up CORS headers
header('Access-Control-Allow-Origin: ' . $config['api']['allow_origin']);
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle OPTIONS request (for CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load core components
require_once(__DIR__ . '/core/database.php');
require_once(__DIR__ . '/core/auth.php');
require_once(__DIR__ . '/core/response.php');
require_once(__DIR__ . '/utils/validation.php');

try {
    // Initialize database connection
    $db = Database::getInstance($config);

    // Parse request path
    $request_uri = $_SERVER['REQUEST_URI'];
    $base_path = '/custom-api/api-proxy.php';
    $api_path = str_replace($base_path, '', $request_uri);

    // Remove query string if any
    if (($pos = strpos($api_path, '?')) !== false) {
        $api_path = substr($api_path, 0, $pos);
    }

    // Remove leading and trailing slashes
    $api_path = trim($api_path, '/');

    // Split path into segments
    $path_segments = empty($api_path) ? [] : explode('/', $api_path);

    // Determine the module and action
    $module = isset($path_segments[0]) ? $path_segments[0] : '';
    $action = isset($path_segments[1]) ? $path_segments[1] : '';
    $id = isset($path_segments[2]) ? $path_segments[2] : '';

    // Authenticate the request (except for public endpoints)
    $public_endpoints = [
        'contacts' => true  // Make contacts endpoint public for form submissions
    ];

    if (!isset($public_endpoints[$module])) {
        $auth = new Auth($db, $config);
        $token_data = $auth->authenticate();
    }

    // Route to appropriate module handler
    switch ($module) {
        case 'contacts':
            require_once(__DIR__ . '/modules/contacts/routes.php');
            $handler = new ContactsRoutes($db, $config);
            break;

        case 'meetings':
            require_once(__DIR__ . '/modules/meetings/routes.php');
            $handler = new MeetingsRoutes($db, $config);
            break;

        case 'accounts':
            require_once(__DIR__ . '/modules/accounts/routes.php');
            $handler = new AccountsRoutes($db, $config);
            break;

        case 'graphql':
            require_once(__DIR__ . '/modules/graphql/handler.php');
            $handler = new GraphQLHandler($db, $config);
            break;

        default:
            if (empty($module)) {
                // Return API information
                Response::success([
                    'name' => 'Custom API Proxy',
                    'version' => $config['api']['version'],
                    'modules' => ['contacts', 'meetings', 'accounts', 'graphql']
                ]);
            } else {
                Response::error("Unknown module: $module", 404);
            }
            break;
    }

    // Handle the request based on HTTP method and action
    if (isset($handler)) {
        $method = $_SERVER['REQUEST_METHOD'];

        switch ($method) {
            case 'GET':
                if (empty($action)) {
                    $handler->list();
                } else if ($action === 'search') {
                    $handler->search();
                } else {
                    $handler->get($action);
                }
                break;

            case 'POST':
                $data = json_decode(file_get_contents('php://input'), true);
                if ($action) {
                    $handler->$action($data);
                } else {
                    $handler->create($data);
                }
                break;

            case 'PUT':
                $data = json_decode(file_get_contents('php://input'), true);
                $handler->update($action, $data);
                break;

            case 'DELETE':
                $handler->delete($action);
                break;

            default:
                Response::error("Method not allowed", 405);
                break;
        }
    }

} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    $code = $e->getCode() ?: 500;
    Response::error($e->getMessage(), $code);
} finally {
    // Close database connection if it exists
    if (isset($db)) {
        $db->close();
    }
}