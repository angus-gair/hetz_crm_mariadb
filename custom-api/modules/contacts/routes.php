<?php

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
            Response::error("Failed to fetch contact", 500);
        }
    }

    public function search() {
        // Implementation for search functionality can be added here
        Response::error("Search functionality not implemented", 501);
    }
}