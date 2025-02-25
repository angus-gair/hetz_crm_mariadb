<?php
/**
 * Contact Creation Module
 * 
 * Handles creating new contacts with validation
 */

class ContactCreate {
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
     * Execute the contact creation process
     * 
     * @param array $data Contact data
     * @return array Created contact data
     */
    public function execute($data) {
        // Define validation schema
        $schema = [
            'first_name' => ['type' => 'string', 'max' => 100],
            'last_name' => ['type' => 'string', 'required' => true, 'max' => 100],
            'email' => ['type' => 'email'],
            'phone_mobile' => ['type' => 'string', 'max' => 30],
            'title' => ['type' => 'string', 'max' => 100],
            'department' => ['type' => 'string', 'max' => 100],
            'description' => ['type' => 'string', 'allowHtml' => true],
            'lead_source' => ['type' => 'string', 'enum' => [
                'Cold Call', 'Existing Customer', 'Self Generated', 'Employee', 
                'Partner', 'Public Relations', 'Direct Mail', 'Conference', 
                'Trade Show', 'Website', 'Word of Mouth', 'Email', 'Campaign', 'Other'
            ]],
            'marketingConsent' => ['type' => 'boolean'],
            'assigned_user_id' => ['type' => 'string', 'max' => 36],
            'account_id' => ['type' => 'string', 'max' => 36]
        ];
        
        // Validate input
        [$isValid, $errors] = Validation::validateRequest($data, $schema);
        
        if (!$isValid) {
            Response::error("Invalid contact data", 400, $errors);
        }
        
        // Load SuiteCRM framework
        $this->loadSuiteCRM();
        
        try {
            // Create new contact bean
            $contactBean = BeanFactory::newBean('Contacts');
            
            // Set basic fields
            $contactBean->first_name = $data['first_name'] ?? '';
            $contactBean->last_name = $data['last_name'];
            $contactBean->email1 = $data['email'] ?? '';
            $contactBean->phone_mobile = $data['phone_mobile'] ?? '';
            $contactBean->title = $data['title'] ?? '';
            $contactBean->department = $data['department'] ?? '';
            $contactBean->description = $data['description'] ?? '';
            
            // Marketing fields
            $contactBean->lead_source = $data['lead_source'] ?? 'Website';
            
            if (!empty($data['marketingConsent'])) {
                $contactBean->email_opt_in = '1';
                $contactBean->email_opt_in_date = date('Y-m-d H:i:s');
            } else {
                $contactBean->email_opt_in = '0';
            }
            
            // Set assigned user if provided
            if (!empty($data['assigned_user_id'])) {
                $contactBean->assigned_user_id = $data['assigned_user_id'];
            }
            
            // Save the contact
            $contactBean->save();
            
            // Create relationship with account if provided
            if (!empty($data['account_id'])) {
                $contactBean->load_relationship('accounts');
                $contactBean->accounts->add($data['account_id']);
            }
            
            // Return the new contact data
            return [
                'id' => $contactBean->id,
                'first_name' => $contactBean->first_name,
                'last_name' => $contactBean->last_name,
                'email' => $contactBean->email1,
                'phone_mobile' => $contactBean->phone_mobile,
                'date_entered' => $contactBean->date_entered
            ];
            
        } catch (Exception $e) {
            Response::error("Failed to create contact: " . $e->getMessage(), 500);
        }
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
