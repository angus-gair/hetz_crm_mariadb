<?php
/**
 * SuiteCRM API Proxy - Updated with Security Measures
 * 
 * This update adds security features to the public contacts endpoint
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
require_once(__DIR__ . '/core/database-file.php');
require_once(__DIR__ . '/core/auth-file.php');
require_once(__DIR__ . '/core/response-file.php');
require_once(__DIR__ . '/utils/validation-file.php');
require_once(__DIR__ . '/utils/security-utility.php'); // Add security utility

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

    // Initialize security utility
    $security = new Security($db, $config);

    // Apply rate limiting and spam detection for contacts POST (contact form submissions)
    if ($module === 'contacts' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        // Get client IP
        $clientIp = $security->getClientIp();
        
        // Check rate limit (5 submissions per hour)
        $rateLimit = $config['security']['rate_limit'] ?? 5;
        $ratePeriod = $config['security']['rate_period'] ?? 3600; // 1 hour in seconds
        
        if (!$security->checkRateLimit($clientIp, 'contact_submission', $rateLimit, $ratePeriod)) {
            Response::error("Rate limit exceeded. Please try again later.", 429);
            exit;
        }
        
        // Check for spam in POST data
        $data = json_decode(file_get_contents('php://input'), true);
        if ($security->isSpam($data)) {
            // Log potential spam attempt
            error_log("Potential spam submission blocked from IP: $clientIp");
            Response::error("Your submission could not be processed. Please contact us directly if you continue to experience issues.", 403);
            exit;
        }
    }

    // Authenticate the request (except for public endpoints)
    $public_endpoints = [
        'contacts' => true  // Keep contacts endpoint public
    ];

    if (!isset($public_endpoints[$module])) {
        $auth = new Auth($db, $config);
        $token_data = $auth->authenticate();
    }

    // Route to appropriate module handler
    switch ($module) {
        case 'contacts':
            require_once(__DIR__ . '/modules/contacts/contacts-routes.php');
            $handler = new ContactsRoutes($db, $config);
            break;

        case 'meetings':
            require_once(__DIR__ . '/modules/meetings/meetings-routes.php');
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
    
    // Cleanup old rate limit records periodically (1% chance on each request)
    if (isset($security) && mt_rand(1, 100) === 1) {
        $security->cleanupRateLimits(7); // Clean records older than 7 days
    }
}
