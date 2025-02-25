<?php
/**
 * Contact Search Module
 * 
 * Handles searching contacts with various filters
 */

class ContactSearch {
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
     * Execute the contact search
     * 
     * @param array $params Search parameters
     * @return array Search results with pagination
     */
    public function execute($params) {
        // Initialize variables
        $page = isset($params['page']) ? (int)$params['page'] : 1;
        $limit = isset($params['limit']) ? (int)$params['limit'] : 20;
        $offset = ($page - 1) * $limit;
        $search = isset($params['q']) ? trim($params['q']) : '';
        $orderBy = isset($params['orderBy']) ? $params['orderBy'] : 'date_modified';
        $orderDir = isset($params['orderDir']) && strtolower($params['orderDir']) === 'asc' ? 'ASC' : 'DESC';
        
        // Validate and sanitize order by field
        $validOrderFields = ['first_name', 'last_name', 'date_entered', 'date_modified'];
        if (!in_array($orderBy, $validOrderFields)) {
            $orderBy = 'date_modified';
        }
        
        // Security check for limits
        if ($limit > 100) {
            $limit = 100;
        }
        
        // Build base query
        $query = "SELECT c.id, c.first_name, c.last_name, c.email1, c.phone_mobile, 
                        c.title, c.lead_source, c.date_entered, c.date_modified 
                 FROM contacts c
                 WHERE c.deleted = 0";
        
        // Add search conditions
        $queryParams = [];
        $queryTypes = "";
        
        if (!empty($search)) {
            $query .= " AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.email1 LIKE ? OR c.phone_mobile LIKE ?)";
            $searchParam = "%{$search}%";
            $queryParams = array_merge($queryParams, [$searchParam, $searchParam, $searchParam, $searchParam]);
            $queryTypes .= "ssss";
        }
        
        // Add optional filters
        if (isset($params['lead_source']) && !empty($params['lead_source'])) {
            $query .= " AND c.lead_source = ?";
            $queryParams[] = $params['lead_source'];
            $queryTypes .= "s";
        }
        
        if (isset($params['created_after']) && !empty($params['created_after'])) {
            $query .= " AND c.date_entered >= ?";
            $queryParams[] = $params['created_after'] . ' 00:00:00';
            $queryTypes .= "s";
        }
        
        if (isset($params['created_before']) && !empty($params['created_before'])) {
            $query .= " AND c.date_entered <= ?";
            $queryParams[] = $params['created_before'] . ' 23:59:59';
            $queryTypes .= "s";
        }
        
        if (isset($params['assigned_user_id']) && !empty($params['assigned_user_id'])) {
            $query .= " AND c.assigned_user_id = ?";
            $queryParams[] = $params['assigned_user_id'];
            $queryTypes .= "s";
        }
        
        // Add sorting
        $query .= " ORDER BY c.{$orderBy} {$orderDir}";
        
        // Add pagination
        $query .= " LIMIT ? OFFSET ?";
        $queryParams[] = $limit;
        $queryParams[] = $offset;
        $queryTypes .= "ii";
        
        // Execute query
        $result = $this->db->executeQuery($query, $queryTypes, $queryParams);
        $contacts = $this->db->fetchAll($result);
        
        // Get total count for pagination
        $countQuery = "SELECT COUNT(*) as total FROM contacts c WHERE c.deleted = 0";
        $countQueryParams = [];
        $countQueryTypes = "";
        
        if (!empty($search)) {
            $countQuery .= " AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.email1 LIKE ? OR c.phone_mobile LIKE ?)";
            $searchParam = "%{$search}%";
            $countQueryParams = array_merge($countQueryParams, [$searchParam, $searchParam, $searchParam, $searchParam]);
            $countQueryTypes .= "ssss";
        }
        
        // Add the same filters to count query
        if (isset($params['lead_source']) && !empty($params['lead_source'])) {
            $countQuery .= " AND c.lead_source = ?";
            $countQueryParams[] = $params['lead_source'];
            $countQueryTypes .= "s";
        }
        
        if (isset($params['created_after']) && !empty($params['created_after'])) {
            $countQuery .= " AND c.date_entered >= ?";
            $countQueryParams[] = $params['created_after'] . ' 00:00:00';
            $countQueryTypes .= "s";
        }
        
        if (isset($params['created_before']) && !empty($params['created_before'])) {
            $countQuery .= " AND c.date_entered <= ?";
            $countQueryParams[] = $params['created_before'] . ' 23:59:59';
            $countQueryTypes .= "s";
        }
        
        if (isset($params['assigned_user_id']) && !empty($params['assigned_user_id'])) {
            $countQuery .= " AND c.assigned_user_id = ?";
            $countQueryParams[] = $params['assigned_user_id'];
            $countQueryTypes .= "s";
        }
        
        $countResult = $this->db->executeQuery($countQuery, $countQueryTypes, $countQueryParams);
        $countData = $this->db->fetchOne($countResult);
        $total = (int)$countData['total'];
        
        // Return results with pagination info
        return [
            'contacts' => $contacts,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit)
            ],
            'filters' => [
                'search' => $search,
                'orderBy' => $orderBy,
                'orderDir' => $orderDir
            ]
        ];
    }
}
