<?php
/**
 * There are two main approaches to resolve the authentication inconsistency:
 * 
 * Option 1: Keep contacts as a public endpoint (current setup)
 * - Removes need for token in React form
 * - Implement additional security measures
 * 
 * Option 2: Make contacts require authentication
 * - More secure
 * - Requires proper token management
 * 
 * Below are the implementations for both options:
 */

/**
 * OPTION 1: Keep contacts as public but improve security
 * 
 * In api-proxy.php - Add rate limiting and basic spam protection
 */

// After loading core components, add:
require_once(__DIR__ . '/utils/security.php'); // Create this file if it doesn't exist

// Then add this before processing the contacts module:
if ($module === 'contacts' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    // Apply rate limiting based on IP
    $security = new Security($db, $config);
    $security->checkRateLimit($_SERVER['REMOTE_ADDR'], 'contact_submission', 5, 3600); // 5 submissions per hour
    
    // Basic spam check
    $data = json_decode(file_get_contents('php://input'), true);
    if ($security->isSpam($data)) {
        Response::error("Submission blocked due to spam detection", 403);
    }
}

/**
 * Create utils/security.php:
 */
class Security {
    private $db;
    private $config;
    
    public function __construct($db, $config) {
        $this->db = $db;
        $this->config = $config;
    }
    
    // Check rate limit for an IP address
    public function checkRateLimit($ip, $action, $limit, $period) {
        $count = $this->getRateCount($ip, $action, $period);
        
        if ($count >= $limit) {
            Response::error("Rate limit exceeded. Please try again later.", 429);
            exit;
        }
        
        // Log this attempt
        $this->logRateLimit($ip, $action);
    }
    
    // Get current count
    private function getRateCount($ip, $action, $period) {
        $query = "SELECT COUNT(*) as count FROM rate_limits 
                 WHERE ip = ? AND action = ? AND timestamp > DATE_SUB(NOW(), INTERVAL ? SECOND)";
        
        $result = $this->db->executeQuery($query, "ssi", [$ip, $action, $period]);
        $row = $this->db->fetchOne($result);
        
        return $row ? (int)$row['count'] : 0;
    }
    
    // Log rate limit attempt
    private function logRateLimit($ip, $action) {
        $query = "INSERT INTO rate_limits (ip, action, timestamp) VALUES (?, ?, NOW())";
        $this->db->executeQuery($query, "ss", [$ip, $action]);
    }
    
    // Basic spam detection
    public function isSpam($data) {
        // Look for spam indicators
        $spamIndicators = [
            // Check for too many URLs in message
            (substr_count(($data['description'] ?? ''), 'http') > 3),
            
            // Check for typical spam phrases
            (preg_match('/(viagra|casino|pharmacy|diet|weight loss)/i', ($data['description'] ?? ''))),
            
            // Check for blank name but filled message (bot behavior)
            (empty($data['first_name']) && empty($data['last_name']) && !empty($data['description']))
        ];
        
        return in_array(true, $spamIndicators);
    }
}

/**
 * OPTION 2: Make contacts require authentication
 * 
 * In api-proxy.php - Remove contacts from public endpoints
 */

// CHANGE FROM:
$public_endpoints = [
    'contacts' => true  // Make contacts endpoint public for form submissions
];

// CHANGE TO:
$public_endpoints = [
    // No public endpoints
];

/**
 * With Option 2, your React form must include a valid token.
 * As recommended in your data flows.md, the best approach is a server-side proxy:
 */

// Create a new endpoint on your website backend (e.g., /api/submit-contact)
// That endpoint will:
// 1. Validate the form submission
// 2. Add the token from a secure environment variable
// 3. Forward the request to SuiteCRM API
// 4. Return the response to the React form

// Sample implementation in Node.js:
/*
app.post('/api/submit-contact', (req, res) => {
  const token = process.env.CRM_API_TOKEN; // Stored securely
  
  axios.post('https://crm-domain.com/custom-api/api-proxy.php/contacts', 
    req.body, 
    { headers: { Authorization: `Bearer ${token}` } }
  )
  .then(response => res.json(response.data))
  .catch(error => res.status(500).json({ error: 'Failed to create contact' }));
});
*/

// Then update your React form to use this proxy endpoint instead:
/*
const response = await axios.post('/api/submit-contact', formData);
*/
