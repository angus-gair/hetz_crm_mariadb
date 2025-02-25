<?php
/**
 * Contacts Module Routes
 * 
 * Handles all contact-related API requests
 */

require_once(__DIR__ . '/contact-create.php');
require_once(__DIR__ . '/contact-search.php');

class ContactsRoutes {
    private $db;
    private $config;

    public function __construct($db, $config) {
        $this->db = $db;
        $this->config = $config;
    }

    public function create($data) {
        // Log the incoming request
        error_log("Creating new contact with data: " . json_encode($data));

        // Validate required fields
        $required_fields = ['first_name', 'last_name', 'email'];
        foreach ($required_fields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                Response::error("Missing required field: $field", 400);
                return;
            }
        }

        try {
            // Create contact record
            $sql = "INSERT INTO contacts (
                first_name, 
                last_name, 
                email, 
                phone_mobile,
                description,
                lead_source,
                date_entered
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())";

            $stmt = $this->db->prepare($sql);
            $stmt->bind_param("ssssss",
                $data['first_name'],
                $data['last_name'],
                $data['email'],
                $data['phone_mobile'] ?? '',
                $data['description'] ?? '',
                $data['lead_source'] ?? 'Website'
            );

            if (!$stmt->execute()) {
                throw new Exception("Failed to create contact: " . $stmt->error);
            }

            $contact_id = $stmt->insert_id;

            // Log the successful creation
            error_log("Contact created successfully with ID: " . $contact_id);

            // Prepare return data
            $returnData = [
                'id' => $contact_id,
                'name' => $data['first_name'] . ' ' . $data['last_name'],
                'email' => $data['email'],
                'created_at' => date('Y-m-d H:i:s')
            ];

            Response::success([
                'contact' => $returnData,
                'message' => 'Contact created successfully'
            ]);

        } catch (Exception $e) {
            error_log("Contact creation error: " . $e->getMessage());
            Response::error("Failed to create contact", 500);
        }
    }

    public function list() {
        try {
            $sql = "SELECT * FROM contacts WHERE deleted = 0 ORDER BY date_entered DESC";
            $result = $this->db->query($sql);

            $contacts = [];
            while ($row = $result->fetch_assoc()) {
                $contacts[] = $row;
            }

            Response::success(['contacts' => $contacts]);
        } catch (Exception $e) {
            error_log("Failed to fetch contacts: " . $e->getMessage());
            Response::error("Failed to fetch contacts", 500);
        }
    }

    public function get($id) {
        try {
            $sql = "SELECT * FROM contacts WHERE id = ? AND deleted = 0";
            $stmt = $this->db->prepare($sql);
            $stmt->bind_param("s", $id);
            $stmt->execute();

            $result = $stmt->get_result();
            $contact = $result->fetch_assoc();

            if (!$contact) {
                Response::error("Contact not found", 404);
                return;
            }

            Response::success(['contact' => $contact]);
        } catch (Exception $e) {
            error_log("Failed to fetch contact: " . $e->getMessage());
            Response::error("Failed to fetch contact", 500);
        }
    }

    public function search() {
        $search = new ContactSearch($this->db, $this->config);
        $results = $search->execute($_GET);
        Response::success($results);
    }
    
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
}