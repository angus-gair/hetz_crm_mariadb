<?php
/**
 * Meetings Module Routes
 * 
 * Handles all meeting-related API requests
 */

require_once(__DIR__ . '/available.php');
require_once(__DIR__ . '/book.php');

class MeetingsRoutes {
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
     * List meetings
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
        $query = "SELECT m.id, m.name, m.date_start, m.date_end, m.status, m.description 
                 FROM meetings m 
                 WHERE m.deleted = 0 
                 ORDER BY m.date_start DESC 
                 LIMIT ? OFFSET ?";
        
        // Execute query
        $result = $this->db->executeQuery($query, "ii", [$limit, $offset]);
        $meetings = $this->db->fetchAll($result);
        
        // Get total count
        $count_query = "SELECT COUNT(*) as total FROM meetings WHERE deleted = 0";
        $count_result = $this->db->executeQuery($count_query);
        $count_data = $this->db->fetchOne($count_result);
        
        // Return response
        Response::success([
            'meetings' => $meetings,
            'pagination' => [
                'total' => (int)$count_data['total'],
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($count_data['total'] / $limit)
            ]
        ]);
    }
    
    /**
     * Get available time slots
     */
    public function available() {
        $available = new MeetingsAvailable($this->db, $this->config);
        $result = $available->execute($_GET);
        
        Response::success($result);
    }
    
    /**
     * Book a consultation
     */
    public function book($data) {
        $booking = new MeetingsBook($this->db, $this->config);
        $result = $booking->execute($data);
        
        Response::success(['meeting' => $result], 201, 'Meeting booked successfully');
    }
    
    /**
     * Get a single meeting
     */
    public function get($id) {
        // Validate ID
        if (empty($id) || !is_string($id)) {
            Response::error("Invalid meeting ID", 400);
        }
        
        // Load SuiteCRM
        $this->loadSuiteCRM();
        
        // Get meeting bean
        $meetingBean = BeanFactory::getBean('Meetings', $id);
        
        if (!$meetingBean || $meetingBean->deleted) {
            Response::error("Meeting not found", 404);
        }
        
        // Build response
        $meeting = [
            'id' => $meetingBean->id,
            'name' => $meetingBean->name,
            'date_start' => $meetingBean->date_start,
            'date_end' => $meetingBean->date_end,
            'status' => $meetingBean->status,
            'description' => $meetingBean->description,
            'location' => $meetingBean->location,
            'duration_hours' => $meetingBean->duration_hours,
            'duration_minutes' => $meetingBean->duration_minutes,
            'created_by' => $meetingBean->created_by,
            'date_entered' => $meetingBean->date_entered,
            'date_modified' => $meetingBean->date_modified
        ];
        
        // Get related contacts if requested
        if (isset($_GET['include']) && strpos($_GET['include'], 'contacts') !== false) {
            $meetingBean->load_relationship('contacts');
            $related_contacts = [];
            
            $beans = $meetingBean->contacts->getBeans();
            foreach ($beans as $contact) {
                $related_contacts[] = [
                    'id' => $contact->id,
                    'first_name' => $contact->first_name,
                    'last_name' => $contact->last_name,
                    'email1' => $contact->email1,
                    'phone_mobile' => $contact->phone_mobile
                ];
            }
            
            $meeting['contacts'] = $related_contacts;
        }
        
        Response::success(['meeting' => $meeting]);
    }
    
    /**
     * Update a meeting
     */
    public function update($id, $data) {
        // Validate ID
        if (empty($id) || !is_string($id)) {
            Response::error("Invalid meeting ID", 400);
        }
        
        // Define validation schema
        $schema = [
            'name' => ['type' => 'string', 'max' => 100],
            'date_start' => ['type' => 'datetime'],
            'date_end' => ['type' => 'datetime'],
            'duration_hours' => ['type' => 'integer', 'min' => 0, 'max' => 24],
            'duration_minutes' => ['type' => 'integer', 'min' => 0, 'max' => 59],
            'status' => ['type' => 'string', 'enum' => ['Planned', 'Held', 'Not Held', 'Canceled']],
            'description' => ['type' => 'string', 'allowHtml' => true],
            'location' => ['type' => 'string', 'max' => 255]
        ];
        
        // Validate input
        [$isValid, $errors] = Validation::validateRequest($data, $schema);
        
        if (!$isValid) {
            Response::error("Invalid meeting data", 400, $errors);
        }
        
        // Load SuiteCRM
        $this->loadSuiteCRM();
        
        // Get meeting bean
        $meetingBean = BeanFactory::getBean('Meetings', $id);
        
        if (!$meetingBean || $meetingBean->deleted) {
            Response::error("Meeting not found", 404);
        }
        
        // Update fields
        if (isset($data['name'])) $meetingBean->name = $data['name'];
        if (isset($data['date_start'])) $meetingBean->date_start = $data['date_start'];
        if (isset($data['date_end'])) $meetingBean->date_end = $data['date_end'];
        if (isset($data['duration_hours'])) $meetingBean->duration_hours = $data['duration_hours'];
        if (isset($data['duration_minutes'])) $meetingBean->duration_minutes = $data['duration_minutes'];
        if (isset($data['status'])) $meetingBean->status = $data['status'];
        if (isset($data['description'])) $meetingBean->description = $data['description'];
        if (isset($data['location'])) $meetingBean->location = $data['location'];
        
        // Save changes
        $meetingBean->save();
        
        Response::success(['id' => $meetingBean->id], 200, 'Meeting updated successfully');
    }
    
    /**
     * Cancel a meeting
     */
    public function cancel($id) {
        // Validate ID
        if (empty($id) || !is_string($id)) {
            Response::error("Invalid meeting ID", 400);
        }
        
        // Load SuiteCRM
        $this->loadSuiteCRM();
        
        // Get meeting bean
        $meetingBean = BeanFactory::getBean('Meetings', $id);
        
        if (!$meetingBean || $meetingBean->deleted) {
            Response::error("Meeting not found", 404);
        }
        
        // Update status to Canceled
        $meetingBean->status = 'Canceled';
        $meetingBean->save();
        
        Response::success(null, 200, 'Meeting canceled successfully');
    }
    
    /**
     * Delete a meeting
     */
    public function delete($id) {
        // Validate ID
        if (empty($id) || !is_string($id)) {
            Response::error("Invalid meeting ID", 400);
        }
        
        // Load SuiteCRM
        $this->loadSuiteCRM();
        
        // Get meeting bean
        $meetingBean = BeanFactory::getBean('Meetings', $id);
        
        if (!$meetingBean || $meetingBean->deleted) {
            Response::error("Meeting not found", 404);
        }
        
        // Mark as deleted
        $meetingBean->mark_deleted($id);
        
        Response::success(null, 200, 'Meeting deleted successfully');
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
