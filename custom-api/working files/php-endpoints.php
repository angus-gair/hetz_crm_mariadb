<?php
/**
 * Health and DB Check Endpoints
 * 
 * Add these to your api-proxy.php or create separate PHP files
 */

// In api-proxy.php, add to your switch statement:
case 'db-check':
    handleDbCheck($db, $config);
    break;

case 'health':
    handleHealthCheck($config);
    break;

// Then add these functions:

/**
 * Handle database check request
 * 
 * @param Database $db Database instance
 * @param array $config Configuration array
 */
function handleDbCheck($db, $config) {
    try {
        // Test the connection with a simple query
        $result = $db->executeQuery("SELECT 1 as connection_test");
        $row = $db->fetchOne($result);
        
        if (!$row || !isset($row['connection_test']) || $row['connection_test'] != 1) {
            throw new Exception("Database query test failed");
        }
        
        // Return success response with connection details
        Response::success([
            'status' => 'connected',
            'type' => 'MySQL/MariaDB',
            'connection' => [
                'host' => $config['db']['host'],
                'port' => 3306, // Default MySQL port
                'database' => $config['db']['name'],
                'ssl' => false // Adjust based on your configuration
            ]
        ]);
    } catch (Exception $e) {
        // Log the error
        error_log("Database check error: " . $e->getMessage());
        
        // Return error response
        Response::error("Database connection error: " . $e->getMessage(), 500);
    }
}

/**
 * Handle health check request
 * 
 * @param array $config Configuration array
 */
function handleHealthCheck($config) {
    try {
        // Get system information
        $memory = [
            'memory_limit' => ini_get('memory_limit'),
            'memory_usage' => memory_get_usage(true)
        ];
        
        // Return response
        Response::success([
            'status' => 'healthy',
            'timestamp' => date('c'),
            'php_version' => PHP_VERSION,
            'uptime' => time() - $_SERVER['REQUEST_TIME'],
            'memory' => $memory,
            'api_version' => $config['api']['version']
        ]);
    } catch (Exception $e) {
        // Log the error
        error_log("Health check error: " . $e->getMessage());
        
        // Return error response
        Response::error("Health check error: " . $e->getMessage(), 500);
    }
}

// If creating separate files (health.php and db-check.php),
// include your core files and implement each handler
