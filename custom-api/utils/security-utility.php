<?php
/**
 * Security Utility
 * 
 * Provides security features like rate limiting and spam detection
 */

class Security {
    private $db;
    private $config;
    
    /**
     * Constructor
     */
    public function __construct($db, $config) {
        $this->db = $db;
        $this->config = $config;
    }
    
    /**
     * Check rate limit for an IP address
     * 
     * @param string $ip IP address
     * @param string $action The action being rate limited
     * @param int $limit Maximum number of attempts
     * @param int $period Time period in seconds
     * @return bool Whether the request is allowed
     */
    public function checkRateLimit($ip, $action, $limit, $period) {
        // Create rate_limits table if it doesn't exist
        $this->ensureRateLimitTable();
        
        // Get current count for this IP and action
        $count = $this->getRateCount($ip, $action, $period);
        
        if ($count >= $limit) {
            // Log the rate limit hit
            error_log("Rate limit exceeded: IP=$ip, Action=$action, Count=$count, Limit=$limit");
            
            // Return false indicating the request should be blocked
            return false;
        }
        
        // Log this attempt
        $this->logRateLimit($ip, $action);
        
        // Return true indicating the request is allowed
        return true;
    }
    
    /**
     * Create rate_limits table if it doesn't exist
     */
    private function ensureRateLimitTable() {
        $query = "CREATE TABLE IF NOT EXISTS rate_limits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ip VARCHAR(45) NOT NULL,
            action VARCHAR(50) NOT NULL,
            timestamp DATETIME NOT NULL,
            INDEX (ip, action, timestamp)
        )";
        
        $this->db->executeQuery($query);
    }
    
    /**
     * Get current count of attempts
     * 
     * @param string $ip IP address
     * @param string $action The action being monitored
     * @param int $period Time period in seconds
     * @return int Count of attempts
     */
    private function getRateCount($ip, $action, $period) {
        $query = "SELECT COUNT(*) as count FROM rate_limits 
                 WHERE ip = ? AND action = ? AND timestamp > DATE_SUB(NOW(), INTERVAL ? SECOND)";
        
        $result = $this->db->executeQuery($query, "ssi", [$ip, $action, $period]);
        $row = $this->db->fetchOne($result);
        
        return $row ? (int)$row['count'] : 0;
    }
    
    /**
     * Log a rate limit attempt
     * 
     * @param string $ip IP address
     * @param string $action The action being logged
     */
    private function logRateLimit($ip, $action) {
        $query = "INSERT INTO rate_limits (ip, action, timestamp) VALUES (?, ?, NOW())";
        $this->db->executeQuery($query, "ss", [$ip, $action]);
    }
    
    /**
     * Clean up old rate limit records
     * 
     * @param int $olderThan Records older than this many days
     */
    public function cleanupRateLimits($olderThan = 7) {
        $query = "DELETE FROM rate_limits WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)";
        $this->db->executeQuery($query, "i", [$olderThan]);
    }
    
    /**
     * Check if a submission appears to be spam
     * 
     * @param array $data The form data to check
     * @return bool Whether the submission appears to be spam
     */
    public function isSpam($data) {
        // Skip if no data provided
        if (empty($data)) {
            return true;
        }
        
        // Look for spam indicators
        $spamIndicators = [
            // Check for too many URLs in message
            (isset($data['description']) && substr_count($data['description'], 'http') > 3),
            
            // Check for typical spam phrases
            (isset($data['description']) && preg_match('/(viagra|casino|pharmacy|diet|weight loss|sex|porn)/i', $data['description'])),
            
            // Check for blank name but filled message (bot behavior)
            (empty($data['first_name']) && empty($data['last_name']) && !empty($data['description'])),
            
            // Check for typical spam content patterns
            (isset($data['description']) && preg_match('/\b(SEO|make money|work from home|earn \$)\b/i', $data['description'])),
            
            // Check for excessive capitalization
            (isset($data['description']) && 
             strlen($data['description']) > 20 && 
             (preg_match_all('/[A-Z]/', $data['description']) / strlen($data['description'])) > 0.3)
        ];
        
        // If any indicator is true, consider it spam
        return in_array(true, $spamIndicators);
    }
    
    /**
     * Get the client's IP address
     * 
     * @return string IP address
     */
    public function getClientIp() {
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
     * Check if a request has a valid CSRF token
     * 
     * @param string $token The token to validate
     * @return bool Whether the token is valid
     */
    public function validateCsrfToken($token) {
        // Simple implementation - in a real app you'd validate against a stored token
        // This is a placeholder for demonstration
        return !empty($token);
    }
}
