<?php
/**
 * Meetings Book Module
 * 
 * Handles creating new meeting appointments with contact relations
 */

class MeetingsBook {
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
     * Execute the booking process
     * 
     * @param array $data Booking data
     * @return array Created meeting data
     */
    public function execute($data) {
        // Define validation schema
        $schema = [
            // Contact information
            'first_name' => ['type' => 'string', 'required' => true, 'max' => 100],
            'last_name' => ['type' => 'string', 'required' => true, 'max' => 100],
            'email' => ['type' => 'email', 'required' => true],
            'phone' => ['type' => 'string', 'max' => 30],
            
            // Meeting information
            'date' => ['type' => 'date', 'required' => true],
            'time' => ['type' => 'time', 'required' => true],
            'duration' => ['type' => 'integer', 'min' => 15, 'max' => 480, 'default' => 60],
            'notes' => ['type' => 'string', 'allowHtml' => true],
            'type' => ['type' => 'string', 'enum' => ['consultation', 'follow_up', 'initial', 'other'], 'default' => 'consultation'],
            'location' => ['type' => 'string', 'max' => 255],
            
            // Marketing opt-in
            'marketingConsent' => ['type' => 'boolean', 'default' => false],
            
            // Optional fields
            'assigned_user_id' => ['type' => 'string', 'max' => 36]
        ];
        
        // Validate input
        [$isValid, $errors] = Validation::validateRequest($data, $schema);
        
        if (!$isValid) {
            Response::error("Invalid booking data", 400, $errors);
        }
        
        // Check if the requested slot is still available
        $isAvailable = $this->checkSlotAvailability($data['date'], $data['time'], $data['duration']);
        
        if (!$isAvailable) {
            Response::error("The selected time slot is no longer available. Please choose a different time.", 409);
        }
        
        // Load SuiteCRM framework
        $this->loadSuiteCRM();
        
        try {
            // Begin transaction
            $this->db->getConnection()->begin_transaction();
            
            // Create or find contact
            $contactId = $this->createOrUpdateContact($data);
            
            // Create the meeting
            $meetingId = $this->createMeeting($data, $contactId);
            
            // Commit transaction
            $this->db->getConnection()->commit();
            
            // Get the created meeting details
            $meetingBean = BeanFactory::getBean('Meetings', $meetingId);
            
            // Return the meeting data
            return [
                'id' => $meetingBean->id,
                'name' => $meetingBean->name,
                'date_start' => $meetingBean->date_start,
                'date_end' => $meetingBean->date_end,
                'status' => $meetingBean->status,
                'contact_id' => $contactId,
                'created_at' => $meetingBean->date_entered
            ];
            
        } catch (Exception $e) {
            // Rollback transaction on error
            $this->db->getConnection()->rollback();
            Response::error("Failed to book meeting: " . $e->getMessage(), 500);
        }
    }
    
    /**
     * Check if a time slot is available
     * 
     * @param string $date Date in Y-m-d format
     * @param string $time Time in H:i:s format
     * @param int $duration Duration in minutes
     * @return bool Whether the slot is available
     */
    private function checkSlotAvailability($date, $time, $duration) {
        // Calculate start and end times
        $startDatetime = $date . ' ' . $time;
        $endTime = strtotime($startDatetime) + ($duration * 60);
        $endDatetime = date('Y-m-d H:i:s', $endTime);
        
        // Query for overlapping meetings
        $query = "SELECT COUNT(*) as count 
                 FROM meetings 
                 WHERE deleted = 0 
                 AND status != 'Canceled'
                 AND (
                    (date_start <= ? AND date_end > ?) OR
                    (date_start < ? AND date_end >= ?) OR
                    (date_start >= ? AND date_end <= ?)
                 )";
        
        $result = $this->db->executeQuery($query, "ssssss", [
            $endDatetime, $startDatetime,  // Case 1: Meeting starts before and ends after our start
            $startDatetime, $endDatetime,  // Case 2: Meeting starts before and ends after our end
            $startDatetime, $endDatetime   // Case 3: Meeting falls entirely within our slot
        ]);
        
        $row = $this->db->fetchOne($result);
        
        // If count is 0, the slot is available
        return ($row['count'] == 0);
    }
    
    /**
     * Create or update a contact based on email
     * 
     * @param array $data Contact data
     * @return string Contact ID
     */
    private function createOrUpdateContact($data) {
        // Check if contact exists by email
        $query = "SELECT id FROM contacts WHERE email1 = ? AND deleted = 0";
        $result = $this->db->executeQuery($query, "s", [$data['email']]);
        
        if ($result->num_rows > 0) {
            // Contact exists, update info
            $row = $this->db->fetchOne($result);
            $contactId = $row['id'];
            
            $contactBean = BeanFactory::getBean('Contacts', $contactId);
            $contactBean->first_name = $data['first_name'];
            $contactBean->last_name = $data['last_name'];
            $contactBean->phone_mobile = $data['phone'] ?? '';
            
            // Update marketing preferences if provided
            if (isset($data['marketingConsent'])) {
                $contactBean->email_opt_in = $data['marketingConsent'] ? '1' : '0';
                if ($data['marketingConsent']) {
                    $contactBean->email_opt_in_date = date('Y-m-d H:i:s');
                }
            }
            
            $contactBean->save();
            
        } else {
            // Create new contact
            $contactBean = BeanFactory::newBean('Contacts');
            $contactBean->first_name = $data['first_name'];
            $contactBean->last_name = $data['last_name'];
            $contactBean->email1 = $data['email'];
            $contactBean->phone_mobile = $data['phone'] ?? '';
            $contactBean->lead_source = 'Website';
            
            // Set marketing preferences
            $contactBean->email_opt_in = isset($data['marketingConsent']) && $data['marketingConsent'] ? '1' : '0';
            if (isset($data['marketingConsent']) && $data['marketingConsent']) {
                $contactBean->email_opt_in_date = date('Y-m-d H:i:s');
            }
            
            $contactBean->save();
            $contactId = $contactBean->id;
        }
        
        return $contactId;
    }
    
    /**
     * Create a new meeting
     * 
     * @param array $data Meeting data
     * @param string $contactId Related contact ID
     * @return string Meeting ID
     */
    private function createMeeting($data, $contactId) {
        // Create a new meeting
        $meetingBean = BeanFactory::newBean('Meetings');
        
        // Generate meeting name
        $meetingType = ucfirst(str_replace('_', ' ', $data['type']));
        $meetingBean->name = "$meetingType with {$data['first_name']} {$data['last_name']}";
        
        // Set start date and time
        $startDatetime = $data['date'] . ' ' . $data['time'];
        $meetingBean->date_start = $startDatetime;
        
        // Calculate end time
        $duration = $data['duration'] ?? 60; // Default to 60 minutes
        $endTime = strtotime($startDatetime) + ($duration * 60);
        $meetingBean->date_end = date('Y-m-d H:i:s', $endTime);
        
        // Set duration fields
        $meetingBean->duration_hours = floor($duration / 60);
        $meetingBean->duration_minutes = $duration % 60;
        
        // Other meeting fields
        $meetingBean->status = 'Planned';
        $meetingBean->description = $data['notes'] ?? '';
        $meetingBean->location = $data['location'] ?? '';
        
        // Set assigned user if provided
        if (!empty($data['assigned_user_id'])) {
            $meetingBean->assigned_user_id = $data['assigned_user_id'];
        }
        
        // Save the meeting
        $meetingBean->save();
        
        // Relate meeting to contact
        $meetingBean->load_relationship('contacts');
        $meetingBean->contacts->add($contactId);
        
        return $meetingBean->id;
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
