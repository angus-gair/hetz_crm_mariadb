<?php
/**
 * Error Handler
 * 
 * Provides standardized error handling for the API
 */

// Include the logger
require_once(__DIR__ . '/../utils/logger.php');

class ErrorHandler {
    /**
     * Initialize error handling for the application
     * 
     * @param array $config Configuration options
     */
    public static function initialize($config = []) {
        // Set error reporting level based on debug mode
        $debug = $config['debug'] ?? false;
        
        if ($debug) {
            error_reporting(E_ALL);
            ini_set('display_errors', 1);
        } else {
            error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED & ~E_STRICT);
            ini_set('display_errors', 0);
        }
        
        // Register error handlers
        set_error_handler([self::class, 'handleError']);
        set_exception_handler([self::class, 'handleException']);
        register_shutdown_function([self::class, 'handleFatalError']);
    }
    
    /**
     * Handle PHP errors
     * 
     * @param int $errno Error level
     * @param string $errstr Error message
     * @param string $errfile File where error occurred
     * @param int $errline Line number where error occurred
     * @return bool Whether the error was handled
     */
    public static function handleError($errno, $errstr, $errfile, $errline) {
        // Don't handle errors that are turned off by error_reporting
        if (!(error_reporting() & $errno)) {
            return false;
        }
        
        // Map PHP error level to logger level
        $levelMap = [
            E_ERROR             => Logger::ERROR,
            E_WARNING           => Logger::WARNING,
            E_PARSE             => Logger::CRITICAL,
            E_NOTICE            => Logger::NOTICE,
            E_CORE_ERROR        => Logger::ERROR,
            E_CORE_WARNING      => Logger::WARNING,
            E_COMPILE_ERROR     => Logger::ERROR,
            E_COMPILE_WARNING   => Logger::WARNING,
            E_USER_ERROR        => Logger::ERROR,
            E_USER_WARNING      => Logger::WARNING,
            E_USER_NOTICE       => Logger::NOTICE,
            E_STRICT            => Logger::NOTICE,
            E_RECOVERABLE_ERROR => Logger::ERROR,
            E_DEPRECATED        => Logger::NOTICE,
            E_USER_DEPRECATED   => Logger::NOTICE
        ];
        
        $level = $levelMap[$errno] ?? Logger::ERROR;
        
        // Log the error
        Logger::getInstance()->log($level, "PHP Error: {$errstr}", [
            'code' => $errno,
            'file' => $errfile,
            'line' => $errline
        ]);
        
        // If it's a user error, we'll handle it as an exception
        if ($errno == E_USER_ERROR) {
            self::sendErrorResponse('Application error', 500, [
                'details' => $errstr
            ]);
            exit(1);
        }
        
        // Let PHP handle the error as it normally would
        return false;
    }
    
    /**
     * Handle uncaught exceptions
     * 
     * @param Throwable $exception The uncaught exception
     */
    public static function handleException($exception) {
        // Log the exception
        Logger::logException($exception);
        
        // Send appropriate response to client
        $code = $exception->getCode();
        $message = $exception->getMessage();
        
        // Make sure code is a valid HTTP status code, default to 500
        if ($code < 100 || $code > 599) {
            $code = 500;
        }
        
        // For database exceptions, use a generic message in production
        if ($exception instanceof PDOException || $exception instanceof mysqli_sql_exception) {
            $details = $message;
            $message = 'Database error occurred';
            
            // Hide SQL errors in production
            if (!self::isDebugMode()) {
                $details = 'An internal database error occurred. Please contact support.';
            }
            
            self::sendErrorResponse($message, $code, [
                'details' => $details
            ]);
        } else {
            self::sendErrorResponse($message, $code);
        }
        
        exit(1);
    }
    
    /**
     * Handle fatal errors
     */
    public static function handleFatalError() {
        $error = error_get_last();
        
        if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_CORE_WARNING, E_COMPILE_ERROR, E_COMPILE_WARNING])) {
            // Log the fatal error
            Logger::critical('Fatal Error: ' . $error['message'], [
                'file' => $error['file'],
                'line' => $error['line']
            ]);
            
            // Clear any output that has been generated
            if (ob_get_length()) {
                ob_clean();
            }
            
            // Send error response
            $message = 'A fatal error occurred';
            $details = self::isDebugMode() ? $error['message'] : 'The application encountered a critical error.';
            
            self::sendErrorResponse($message, 500, [
                'details' => $details,
                'file' => self::isDebugMode() ? $error['file'] : null,
                'line' => self::isDebugMode() ? $error['line'] : null
            ]);
        }
    }
    
    /**
     * Send a standardized error response
     * 
     * @param string $message Error message
     * @param int $code HTTP status code
     * @param array $extra Extra information to include in response
     */
    public static function sendErrorResponse($message, $code = 400, $extra = []) {
        http_response_code($code);
        
        // Prepare response data
        $response = [
            'success' => false,
            'error' => [
                'code' => $code,
                'message' => $message
            ]
        ];
        
        // Add extra information if in debug mode or if it's explicitly included
        if (self::isDebugMode() && !empty($extra)) {
            $response['error']['details'] = $extra;
        } else if (!empty($extra) && isset($extra['public']) && $extra['public']) {
            // Include public error details even in production
            unset($extra['public']);
            $response['error']['details'] = $extra;
        }
        
        // Send response as JSON
        header('Content-Type: application/json');
        echo json_encode($response);
    }
    
    /**
     * Create a new API Exception
     * 
     * @param string $message Error message
     * @param int $code HTTP status code
     * @return Exception
     */
    public static function createApiException($message, $code = 400) {
        return new Exception($message, $code);
    }
    
    /**
     * Check if application is in debug mode
     * 
     * @return bool Whether debug mode is enabled
     */
    private static function isDebugMode() {
        // Get application configuration
        $configFile = dirname(__FILE__) . '/../config.php';
        if (file_exists($configFile)) {
            $config = include $configFile;
            return isset($config['api']['debug']) && $config['api']['debug'];
        }
        
        return false;
    }
    
    /**
     * Log and report a security event
     * 
     * @param string $message Description of the security event
     * @param array $context Additional context about the event
     */
    public static function logSecurityEvent($message, $context = []) {
        // Add client IP and other relevant info
        $context['ip'] = self::getClientIp();
        $context['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
        
        // Log the security event with high priority
        Logger::warning('Security Event: ' . $message, $context);
    }
    
    /**
     * Get client IP address
     * 
     * @return string Client IP address
     */
    private static function getClientIp() {
        $ipAddress = '';
        
        if (isset($_SERVER['HTTP_X_FORWARDED_FOR']) && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ipAddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else if (isset($_SERVER['HTTP_CLIENT_IP']) && !empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ipAddress = $_SERVER['HTTP_CLIENT_IP'];
        } else if (isset($_SERVER['REMOTE_ADDR']) && !empty($_SERVER['REMOTE_ADDR'])) {
            $ipAddress = $_SERVER['REMOTE_ADDR'];
        }
        
        // Handle multiple IPs (e.g., from proxy)
        if (strpos($ipAddress, ',') !== false) {
            $ipArray = explode(',', $ipAddress);
            $ipAddress = trim($ipArray[0]);
        }
        
        return $ipAddress;
    }
    
    /**
     * Send a "Method Not Allowed" response
     * 
     * @param array $allowedMethods List of allowed HTTP methods
     */
    public static function methodNotAllowed($allowedMethods = ['GET', 'POST', 'PUT', 'DELETE']) {
        header('Allow: ' . implode(', ', $allowedMethods));
        self::sendErrorResponse('Method not allowed', 405, [
            'allowed_methods' => $allowedMethods
        ]);
        exit;
    }
    
    /**
     * Send a "Not Found" response
     * 
     * @param string $message Custom message (optional)
     */
    public static function notFound($message = 'Resource not found') {
        self::sendErrorResponse($message, 404);
        exit;
    }
    
    /**
     * Send an "Unauthorized" response
     * 
     * @param string $message Custom message (optional)
     */
    public static function unauthorized($message = 'Authentication required') {
        header('WWW-Authenticate: Bearer');
        self::sendErrorResponse($message, 401);
        exit;
    }
    
    /**
     * Send a "Forbidden" response
     * 
     * @param string $message Custom message (optional)
     */
    public static function forbidden($message = 'Access denied') {
        self::sendErrorResponse($message, 403);
        exit;
    }
    
    /**
     * Send a "Too Many Requests" response
     * 
     * @param int $retryAfter Seconds until retry is allowed
     * @param string $message Custom message (optional)
     */
    public static function tooManyRequests($retryAfter = 60, $message = 'Rate limit exceeded') {
        header('Retry-After: ' . $retryAfter);
        self::sendErrorResponse($message, 429, [
            'retry_after' => $retryAfter
        ]);
        exit;
    }
    
    /**
     * Send a validation error response
     * 
     * @param array $errors Validation errors by field
     * @param string $message General error message
     */
    public static function validationFailed($errors, $message = 'Validation failed') {
        self::sendErrorResponse($message, 422, [
            'errors' => $errors,
            'public' => true
        ]);
        exit;
    }
    
    /**
     * Send a "Service Unavailable" response
     * 
     * @param string $message Custom message (optional)
     * @param int $retryAfter Seconds until retry is allowed (optional)
     */
    public static function serviceUnavailable($message = 'Service temporarily unavailable', $retryAfter = null) {
        if ($retryAfter !== null) {
            header('Retry-After: ' . $retryAfter);
        }
        
        self::sendErrorResponse($message, 503);
        exit;
    }
}
