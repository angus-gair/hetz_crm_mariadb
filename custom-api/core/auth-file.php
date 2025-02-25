<?php
/**
 * Authentication Handler
 * *
 * 
 * Handles OAuth2 token authentication for API requests
 */

class Auth {
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
     * Authenticate a request using OAuth2 token
     * 
     * @return array Token data including client information
     * @throws Exception If authentication fails
     */
    public function authenticate() {
        // Get authorization header
        $headers = getallheaders();
        $auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';

        // Extract the token
        $token = null;
        if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
            $token = $matches[1];
        }
        
        if (!$token) {
            throw new Exception('No authentication token provided', 401);
        }
        
        // Check if token exists and is valid
        $query = "SELECT * FROM oauth2tokens 
                 WHERE access_token = ? 
                 AND deleted = 0";
        $params = [$token];
        $types = "s";
        
        // Add expiry check if configured
        if ($this->config['security']['token_expiry_check']) {
            $query .= " AND access_token_expires > NOW()";
        }
        
        $result = $this->db->executeQuery($query, $types, $params);
        
        if (!$result || $result->num_rows == 0) {
            throw new Exception('Invalid or expired token', 401);
        }
        
        $token_data = $this->db->fetchOne($result);
        
        // Get client data
        $client_id = $token_data['client'];
        $client_query = "SELECT * FROM oauth2clients WHERE id = ? AND deleted = 0";
        $client_result = $this->db->executeQuery($client_query, "s", [$client_id]);
        
        if ($client_result && $client_result->num_rows > 0) {
            $token_data['client_data'] = $this->db->fetchOne($client_result);
        }
        
        return $token_data;
    }
    
    /**
     * Check if client has access to a specific module
     * 
     * @param string $client_id The client ID
     * @param string $module The module name
     * @return bool Whether the client has access
     */
    public function checkModuleAccess($client_id, $module) {
        $query = "SELECT COUNT(*) as count 
                 FROM oauth2clients_allowed_modules 
                 WHERE client_id = ? 
                 AND module_name = ? 
                 AND deleted = 0";
                 
        $result = $this->db->executeQuery($query, "ss", [$client_id, $module]);
        $row = $this->db->fetchOne($result);
        
        return ($row && $row['count'] > 0);
    }
}
