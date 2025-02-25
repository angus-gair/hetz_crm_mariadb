<?php
/**
 * Database Connection Handler
 * 
 * Manages database connections for the API
 */

class Database {
    private static $instance = null;
    private $connection;
    
    /**
     * Private constructor to prevent direct creation
     */
    private function __construct($config) {
        $this->connection = new mysqli(
            $config['db']['host'], 
            $config['db']['user'], 
            $config['db']['pass'], 
            $config['db']['name']
        );
        
        if ($this->connection->connect_error) {
            throw new Exception("Database connection failed: " . $this->connection->connect_error);
        }
        
        // Set character set
        $this->connection->set_charset('utf8mb4');
    }
    
    /**
     * Get database instance (singleton pattern)
     */
    public static function getInstance($config) {
        if (self::$instance === null) {
            self::$instance = new self($config);
        }
        
        return self::$instance;
    }
    
    /**
     * Get the mysqli connection
     */
    public function getConnection() {
        return $this->connection;
    }
    
    /**
     * Execute a query with prepared statement
     * 
     * @param string $query The SQL query with placeholders
     * @param string $types The types of parameters (i=integer, d=double, s=string, b=blob)
     * @param array $params The parameters to bind
     * @return mysqli_result|bool The result of the query
     */
    public function executeQuery($query, $types = '', $params = []) {
        $stmt = $this->connection->prepare($query);
        
        if (!$stmt) {
            throw new Exception("Query preparation failed: " . $this->connection->error);
        }
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        return $result;
    }
    
    /**
     * Fetch all rows from a result
     */
    public function fetchAll($result) {
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    
    /**
     * Fetch a single row from a result
     */
    public function fetchOne($result) {
        return $result->fetch_assoc();
    }
    
    /**
     * Close the database connection
     */
    public function close() {
        if ($this->connection) {
            $this->connection->close();
        }
    }
    
    /**
     * Escape a string to prevent SQL injection
     */
    public function escape($str) {
        return $this->connection->real_escape_string($str);
    }
    
    /**
     * Get the last insert ID
     */
    public function getLastInsertId() {
        return $this->connection->insert_id;
    }
}
