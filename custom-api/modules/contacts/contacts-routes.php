<?php
/**
 * Contacts Module Routes
 * 
 * Handles all contact-related API requests
 */

require_once(__DIR__ . '/create.php');
require_once(__DIR__ . '/search.php');

class ContactsRoutes {
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
     * List contacts
     */
    public function list() {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        
        // Security check for limits
        if ($limit > 100) {
            $limit = 100;
        }
        
        // Build query
        $query = "SELECT id, first_name, last_name, email1, phone_mobile, date_entered, date_modified 
                 FROM contacts 
                 WHERE deleted = 0 
                 ORDER BY date_modified DESC 
                 LIMIT ? OFFSET ?";
        
        // Execute query
        $result = $this->db->executeQuery($query, "ii", [$limit, $offset]);
        $contacts = $this->db->fetchAll($result);
        
        // Get total count
        $count_query = "SELECT COUNT(*) as total FROM contacts WHERE deleted = 0";
        $count_result = $this->db->executeQuery($count_query);
        $count_data = $this->db->fetchOne($count_result);
        
        // Return response
        Response::success([
            'contacts' => $contacts,
            'pagination' => [
                'total' => (int)$count_data['total'],
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($count_data['total'] / $limit)
            ]
        ]);
    }
    
    /**
     * Get a single contact
     */
    public function get($id) {
        // Validate ID
        if (empty($id) || !is_string($id)) {
            Response::error("Invalid contact ID", 400);
        }
        
        // Query for contact
        $query = "SELECT c.*, e.email_address 
                 FROM contacts c
                 LEFT JOIN email_addr_bean_rel rel ON rel.bean_id = c.id AND rel.deleted = 0
                 LEFT JOIN email_addresses e ON e.id = rel.email_address_id AND e.deleted = 0
                 WHERE c.id = ? AND c.deleted = 0";
        
        $result = $this->db->executeQuery($query, "s", [$id]);
        
        if ($result->num_rows === 0) {
            Response::error("Contact not found", 404);
        }
        
        $contact = $this->db->fetchOne($result);
        
        // Get related data if requested
        if (isset($_GET['include'])) {
            $includes = explode(',', $_GET['include']);
            
            if (in_array('accounts', $includes)) {
                // Get related accounts
                $this->loadSuiteCRM();
                
                $contactBean = BeanFactory::getBean('Contacts', $id);
                if ($contactBean) {
                    $accountData = [];
                    $contactBean->load_relationship('accounts');
                    $relatedAccounts = $contactBean->accounts->getBeans();
                    
                    foreach ($relatedAccounts as $account) {
                        $accountData[] = [
                            'id' => $account->id,
                            'name' => $account->name,
                            'industry' => $account->industry,
                            'phone_office' => $account->phone_office
                        ];
                    }
                    
                    $contact['accounts'] = $accountData;
                }
            }
        }
        
        Response::success(['contact' => $contact]);
    }
    
    /**
     * Create a new contact
     */
    public function create($data) {
        $contact = new ContactCreate($this->db, $this->config);
        $result = $contact->execute($data);
        
        Response::success(['contact' => $result], 201, 'Contact created successfully');
    }
    
    /**
     * Search for contacts
     */
    public function search() {
        $search = new ContactSearch($this->db, $this->config);
        $results = $search->execute($_GET);
        
        Response::success($results);
    }
    
    /**
     * Update a contact
     */
    public function update($id, $data) {
        // Validate ID
        if (empty($id) || !is_string($id)) {
            Response::error("Invalid contact ID", 400);
        }
        
        // Validate data
        $schema = [
            'first_name' => ['type' => 'string', 'max' => 100],
            'last_name' => ['type' => 'string', 'max' => 100],
            'email' => ['type' => 'email'],
            'phone_mobile' => ['type' => 'string', 'max' => 30],
            'description' => ['type' => 'string', 'allowHtml' => true],
            'title' => ['type' => 'string', 'max' => 100],
            'department' => ['type' => 'string', 'max' => 100],
            'do_not_call' => ['type' => 'boolean'],
            'assigned_user_id' => ['type' => 'string', 'max' => 36]
        ];
        
        [$isValid, $errors] = Validation::validateRequest($data, $schema);
        
        if (!$isValid) {
            Response::error("Invalid data", 400, $errors);
        }
        
        // Load SuiteCRM
        $this->loadSuiteCRM();
        
        // Check if contact exists
        $contactBean = BeanFactory::getBean('Contacts', $id);
        
        if (!$contactBean || $contactBean->deleted) {
            Response::error("Contact not found", 404);
        }
        
        // Update contact bean with new data
        if (isset($data['first_name'])) $contactBean->first_name = $data['first_name'];
        if (isset($data['last_name'])) $contactBean->last_name = $data['last_name'];
        if (isset($data['phone_mobile'])) $contactBean->phone_mobile = $data['phone_mobile'];
        if (isset($data['description'])) $contactBean->description = $data['description'];
        if (isset($data['title'])) $contactBean->title = $data['title'];
        if (isset($data['department'])) $contactBean->department = $data['department'];
        if (isset($data['do_not_call'])) $contactBean->do_not_call = $data['do_not_call'] ? 1 : 0;
        if (isset($data['assigned_user_id'])) $contactBean->assigned_user_id = $data['assigned_user_id'];
        
        // Email requires special handling for the relationship
        if (isset($data['email'])) {
            $contactBean->email1 = $data['email'];
        }
        
        // Save the changes
        $contactBean->save();
        
        Response::success(['id' => $contactBean->id], 200, 'Contact updated successfully');
    }
    
    /**
     * Delete a contact
     */
    public function delete($id) {
        // Validate ID
        if (empty($id) || !is_string($id)) {
            Response::error("Invalid contact ID", 400);
        }
        
        // Load SuiteCRM
        $this->loadSuiteCRM();
        
        // Check if contact exists
        $contactBean = BeanFactory::getBean('Contacts', $id);
        
        if (!$contactBean || $contactBean->deleted) {
            Response::error("Contact not found", 404);
        }
        
        // Mark as deleted
        $contactBean->mark_deleted($id);
        
        Response::success(null, 200, 'Contact deleted successfully');
    }
    
    /**
     * Load the SuiteCRM framework
     */
    private function loadSuiteCRM() {
        // Check if already loaded
        if (class_exists('BeanFactory', false)) {
            return;
        }
        
        // Save current directory
        $currentDir = getcwd();
        
        // Change to SuiteCRM directory
        chdir($this->config['suitecrm']['path']);
        
        // Include the entry point
        require_once($this->config['suitecrm']['entry_point']);
        
        // Restore directory
        chdir($currentDir);
    }