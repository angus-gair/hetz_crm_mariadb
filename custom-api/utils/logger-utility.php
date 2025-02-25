<?php
/**
 * Logger Utility
 * 
 * Provides standardized logging functionality for the API
 */

class Logger {
    // Log levels
    const EMERGENCY = 'emergency';
    const ALERT     = 'alert';
    const CRITICAL  = 'critical';
    const ERROR     = 'error';
    const WARNING   = 'warning';
    const NOTICE    = 'notice';
    const INFO      = 'info';
    const DEBUG     = 'debug';
    
    // Log level priorities (lower number = higher priority)
    private static $levelPriorities = [
        self::EMERGENCY => 0,
        self::ALERT     => 1,
        self::CRITICAL  => 2,
        self::ERROR     => 3,
        self::WARNING   => 4,
        self::NOTICE    => 5,
        self::INFO      => 6,
        self::DEBUG     => 7
    ];
    
    // Logger instance (for singleton pattern)
    private static $instance = null;
    
    // Logger configuration
    private $config;
    
    // Current minimum log level
    private $minLevel;
    
    // File handle for log file
    private $fileHandle = null;
    
    /**
     * Private constructor (use getInstance() instead)
     */
    private function __construct($config) {
        $this->config = $config;
        
        // Set minimum log level
        $this->minLevel = $config['log_level'] ?? self::INFO;
        
        // Create log directory if it doesn't exist
        $logDir = $config['log_path'] ?? dirname(__FILE__) . '/../logs';
        if (!file_exists($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        // Default log file name with date
        $logFile = $logDir . '/api_' . date('Y-m-d') . '.log';
        
        // Custom log file if specified
        if (isset($config['log_file'])) {
            $logFile = $logDir . '/' . $config['log_file'];
        }
        
        // Open log file for appending
        $this->fileHandle = fopen($logFile, 'a');
        
        // Set error handler if configured
        if (isset($config['capture_errors']) && $config['capture_errors']) {
            $this->registerErrorHandler();
        }
    }
    
    /**
     * Destructor to close file handle
     */
    public function __destruct() {
        if ($this->fileHandle) {
            fclose($this->fileHandle);
        }
    }
    
    /**
     * Get logger instance (singleton pattern)
     */
    public static function getInstance($config = null) {
        if (self::$instance === null) {
            if ($config === null) {
                // Use default config if none provided
                $configFile = dirname(__FILE__) . '/../config.php';
                if (file_exists($configFile)) {
                    $fullConfig = include $configFile;
                    $config = $fullConfig['logging'] ?? [
                        'log_level' => self::INFO,
                        'log_path' => dirname(__FILE__) . '/../logs',
                        'capture_errors' => true
                    ];
                } else {
                    // Fallback config
                    $config = [
                        'log_level' => self::INFO,
                        'log_path' => dirname(__FILE__) . '/../logs',
                        'capture_errors' => true
                    ];
                }
            }
            
            self::$instance = new self($config);
        }
        
        return self::$instance;
    }
    
    /**
     * Log an emergency message
     */
    public static function emergency($message, array $context = []) {
        self::getInstance()->log(self::EMERGENCY, $message, $context);
    }
    
    /**
     * Log an alert message
     */
    public static function alert($message, array $context = []) {
        self::getInstance()->log(self::ALERT, $message, $context);
    }
    
    /**
     * Log a critical message
     */
    public static function critical($message, array $context = []) {
        self::getInstance()->log(self::CRITICAL, $message, $context);
    }
    
    /**
     * Log an error message
     */
    public static function error($message, array $context = []) {
        self::getInstance()->log(self::ERROR, $message, $context);
    }
    
    /**
     * Log a warning message
     */
    public static function warning($message, array $context = []) {
        self::getInstance()->log(self::WARNING, $message, $context);
    }
    
    /**
     * Log a notice message
     */
    public static function notice($message, array $context = []) {
        self::getInstance()->log(self::NOTICE, $message, $context);
    }
    
    /**
     * Log an info message
     */
    public static function info($message, array $context = []) {
        self::getInstance()->log(self::INFO, $message, $context);
    }
    
    /**
     * Log a debug message
     */
    public static function debug($message, array $context = []) {
        self::getInstance()->log(self::DEBUG, $message, $context);
    }
    
    /**
     * Log an API request
     */
    public static function logRequest($method, $path, $params = [], $headers = []) {
        // Remove sensitive information from headers
        $sanitizedHeaders = $headers;
        if (isset($sanitizedHeaders['Authorization'])) {
            $sanitizedHeaders['Authorization'] = 'Bearer [REDACTED]';
        }
        
        $context = [
            'method' => $method,
            'path' => $path,
            'params' => $params,
            'headers' => $sanitizedHeaders,
            'ip' => self::getClientIp()
        ];
        
        self::info("API Request: $method $path", $context);
    }
    
    /**
     * Log an API response
     */
    public static function logResponse($statusCode, $responseBody, $executionTime = null) {
        $context = [
            'status_code' => $statusCode,
            'execution_time' => $executionTime
        ];
        
        // For large responses, just log a summary
        if (is_array($responseBody) && count($responseBody) > 10) {
            $context['response_summary'] = '[Large response with ' . count($responseBody) . ' items]';
        } else {
            $context['response'] = $responseBody;
        }
        
        self::info("API Response: $statusCode", $context);
    }
    
    /**
     * Log an exception
     */
    public static function logException($exception, $context = []) {
        $context = array_merge($context, [
            'exception' => get_class($exception),
            'message' => $exception->getMessage(),
            'code' => $exception->getCode(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString()
        ]);
        
        self::error('Exception: ' . $exception->getMessage(), $context);
    }
    
    /**
     * Log a database query
     */
    public static function logQuery($query, $params = [], $executionTime = null) {
        $context = [
            'query' => $query,
            'params' => $params
        ];
        
        if ($executionTime !== null) {
            $context['execution_time'] = $executionTime;
        }
        
        self::debug('Database Query', $context);
    }
    
    /**
     * Log a message
     */
    public function log($level, $message, array $context = []) {
        // Check if this level should be logged
        if (!$this->shouldLog($level)) {
            return;
        }
        
        // Build log entry
        $entry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'level' => $level,
            'message' => $this->interpolate($message, $context),
            'context' => $context
        ];
        
        // Format log entry
        $formatted = $this->formatLogEntry($entry);
        
        // Write to log file
        if ($this->fileHandle) {
            fwrite($this->fileHandle, $formatted . PHP_EOL);
        }
    }
    
    /**
     * Check if the given level should be logged
     */
    private function shouldLog($level) {
        if (!isset(self::$levelPriorities[$level])) {
            return false;
        }
        
        return self::$levelPriorities[$level] <= self::$levelPriorities[$this->minLevel];
    }
    
    /**
     * Format a log entry
     */
    private function formatLogEntry($entry) {
        $levelPadded = str_pad(strtoupper($entry['level']), 9, ' ');
        
        $formatted = "[{$entry['timestamp']}] {$levelPadded}: {$entry['message']}";
        
        // Add context if specified and not empty
        if (!empty($entry['context']) && (!isset($this->config['log_context']) || $this->config['log_context'])) {
            $contextJson = json_encode($entry['context'], JSON_UNESCAPED_SLASHES);
            $formatted .= " | Context: {$contextJson}";
        }
        
        return $formatted;
    }
    
    /**
     * Interpolate message with context variables
     */
    private function interpolate($message, array $context = []) {
        // Build replacement array
        $replace = [];
        foreach ($context as $key => $val) {
            // Skip non-scalar values
            if (!is_scalar($val) && !is_null($val)) {
                continue;
            }
            
            $replace['{' . $key . '}'] = $val;
        }
        
        // Interpolate replacement values into the message
        return strtr($message, $replace);
    }
    
    /**
     * Register error handler to capture PHP errors
     */
    private function registerErrorHandler() {
        set_error_handler(function($code, $message, $file, $line) {
            // Convert PHP error code to log level
            $levelMap = [
                E_ERROR             => self::ERROR,
                E_WARNING           => self::WARNING,
                E_PARSE             => self::CRITICAL,
                E_NOTICE            => self::NOTICE,
                E_CORE_ERROR        => self::ERROR,
                E_CORE_WARNING      => self::WARNING,
                E_COMPILE_ERROR     => self::ERROR,
                E_COMPILE_WARNING   => self::WARNING,
                E_USER_ERROR        => self::ERROR,
                E_USER_WARNING      => self::WARNING,
                E_USER_NOTICE       => self::NOTICE,
                E_STRICT            => self::NOTICE,
                E_RECOVERABLE_ERROR => self::ERROR,
                E_DEPRECATED        => self::NOTICE,
                E_USER_DEPRECATED   => self::NOTICE
            ];
            
            $level = $levelMap[$code] ?? self::ERROR;
            
            $this->log($level, "PHP Error: {$message}", [
                'code' => $code,
                'file' => $file,
                'line' => $line
            ]);
            
            // Let PHP handle the error as it normally would
            return false;
        });
        
        // Also register exception handler
        set_exception_handler(function($exception) {
            $this->logException($exception);
        });
    }
    
    /**
     * Get client IP address
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
     * Create an instance with custom configuration
     */
    public static function configure($config) {
        self::$instance = new self($config);
        return self::$instance;
    }
}
