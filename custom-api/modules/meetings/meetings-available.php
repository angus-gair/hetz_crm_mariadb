<?php
/**
 * Meetings Available Module
 * 
 * Handles fetching available time slots for meetings
 */

class MeetingsAvailable {
    private $db;
    private $config;
    
    // Default business hours
    private $defaultHours = [
        'start' => 9,  // 9 AM
        'end' => 17,   // 5 PM
        'duration' => 60, // 60 minutes per slot
        'buffer' => 15,  // 15 minutes buffer between meetings
        'days_ahead' => 30, // Show availability for the next 30 days
        'weekend' => false  // Don't include weekends by default
    ];
    
    /**
     * Constructor
     */
    public function __construct($db, $config) {
        $this->db = $db;
        $this->config = $config;
    }
    
    /**
     * Execute the available slots request
     * 
     * @param array $params Request parameters
     * @return array Available slots
     */
    public function execute($params) {
        // Get the date parameter or use today's date
        $date = isset($params['date']) ? $params['date'] : date('Y-m-d');
        
        // Validate date format
        if (!$this->isValidDate($date)) {
            Response::error("Invalid date format. Please use YYYY-MM-DD", 400);
        }
        
        // Check if date is in the past
        $dateObj = new DateTime($date);
        $today = new DateTime(date('Y-m-d'));
        
        if ($dateObj < $today) {
            Response::error("Cannot check availability for past dates", 400);
        }
        
        // Set up time slot parameters
        $startHour = isset($params['start_hour']) ? (int)$params['start_hour'] : $this->defaultHours['start'];
        $endHour = isset($params['end_hour']) ? (int)$params['end_hour'] : $this->defaultHours['end'];
        $duration = isset($params['duration']) ? (int)$params['duration'] : $this->defaultHours['duration'];
        $buffer = isset($params['buffer']) ? (int)$params['buffer'] : $this->defaultHours['buffer'];
        
        // Validate parameters
        if ($startHour < 0 || $startHour > 23 || $endHour < 0 || $endHour > 23 || $startHour >= $endHour) {
            Response::error("Invalid business hours", 400);
        }
        
        if ($duration < 15 || $duration > 480) {
            Response::error("Invalid duration. Must be between 15 and 480 minutes", 400);
        }
        
        // Check if we need to show multiple days
        $daysToShow = isset($params['days']) ? (int)$params['days'] : 1;
        if ($daysToShow < 1 || $daysToShow > $this->defaultHours['days_ahead']) {
            $daysToShow = 1;
        }
        
        // Get all booked slots for the requested date range
        $bookedSlots = $this->getBookedSlots($date, $daysToShow);
        
        // Generate availability for each day
        $availability = [];
        
        for ($day = 0; $day < $daysToShow; $day++) {
            // Calculate the date for this day
            $currentDate = (new DateTime($date))->add(new DateInterval("P{$day}D"))->format('Y-m-d');
            
            // Skip weekends if configured
            $dayOfWeek = date('N', strtotime($currentDate));
            if (!$this->defaultHours['weekend'] && ($dayOfWeek >= 6)) {
                continue;
            }
            
            // Generate all possible time slots
            $daySlots = $this->generateTimeSlots($currentDate, $startHour, $endHour, $duration);
            
            // Remove booked slots
            $availableSlots = $this->filterAvailableSlots($daySlots, $bookedSlots, $duration, $buffer);
            
            // Add to results
            $availability[] = [
                'date' => $currentDate,
                'day_of_week' => date('l', strtotime($currentDate)),
                'available_slots' => $availableSlots
            ];
        }
        
        return [
            'availability' => $availability,
            'config' => [
                'duration' => $duration,
                'buffer' => $buffer,
                'start_hour' => $startHour,
                'end_hour' => $endHour
            ]
        ];
    }
    
    /**
     * Generate all possible time slots for a day
     * 
     * @param string $date The date in Y-m-d format
     * @param int $startHour Starting hour (0-23)
     * @param int $endHour Ending hour (0-23)
     * @param int $duration Duration in minutes
     * @return array List of time slots
     */
    private function generateTimeSlots($date, $startHour, $endHour, $duration) {
        $slots = [];
        $interval = $duration * 60; // Convert to seconds
        
        $startTime = strtotime($date . ' ' . sprintf('%02d:00:00', $startHour));
        $endTime = strtotime($date . ' ' . sprintf('%02d:00:00', $endHour));
        
        for ($time = $startTime; $time < $endTime; $time += $interval) {
            if (($time + $interval) <= $endTime) {
                $slots[] = [
                    'start' => date('H:i:s', $time),
                    'end' => date('H:i:s', $time + $interval),
                    'start_datetime' => date('Y-m-d H:i:s', $time),
                    'end_datetime' => date('Y-m-d H:i:s', $time + $interval)
                ];
            }
        }
        
        return $slots;
    }
    
    /**
     * Get booked slots from the database
     * 
     * @param string $startDate Starting date in Y-m-d format
     * @param int $days Number of days to include
     * @return array List of booked meetings
     */
    private function getBookedSlots($startDate, $days) {
        // Calculate end date
        $endDate = (new DateTime($startDate))->add(new DateInterval("P{$days}D"))->format('Y-m-d');
        
        // Query for meetings in the date range
        $query = "SELECT id, name, date_start, date_end, status 
                 FROM meetings 
                 WHERE date_start >= ? 
                 AND date_start < ? 
                 AND deleted = 0 
                 AND status != 'Canceled'";
        
        $result = $this->db->executeQuery($query, "ss", [
            $startDate . ' 00:00:00',
            $endDate . ' 23:59:59'
        ]);
        
        $bookedSlots = $this->db->fetchAll($result);
        
        // Transform to easier format for comparison
        $transformed = [];
        foreach ($bookedSlots as $slot) {
            $transformed[] = [
                'id' => $slot['id'],
                'start_datetime' => $slot['date_start'],
                'end_datetime' => $slot['date_end'],
                'status' => $slot['status']
            ];
        }
        
        return $transformed;
    }
    
    /**
     * Filter available slots by removing booked ones
     * 
     * @param array $allSlots All possible slots
     * @param array $bookedSlots Booked slots
     * @param int $duration Duration in minutes
     * @param int $buffer Buffer time in minutes
     * @return array Available slots
     */
    private function filterAvailableSlots($allSlots, $bookedSlots, $duration, $buffer) {
        $available = [];
        
        foreach ($allSlots as $slot) {
            $isAvailable = true;
            $slotStart = strtotime($slot['start_datetime']);
            $slotEnd = strtotime($slot['end_datetime']);
            
            // Check against all booked slots
            foreach ($bookedSlots as $booked) {
                $bookedStart = strtotime($booked['start_datetime']);
                $bookedEnd = strtotime($booked['end_datetime']);
                
                // Add buffer time
                $bookedStartWithBuffer = $bookedStart - ($buffer * 60);
                $bookedEndWithBuffer = $bookedEnd + ($buffer * 60);
                
                // Check if the current slot overlaps with the booked slot (with buffer)
                if (($slotStart < $bookedEndWithBuffer) && ($slotEnd > $bookedStartWithBuffer)) {
                    $isAvailable = false;
                    break;
                }
            }
            
            if ($isAvailable) {
                $available[] = [
                    'start' => $slot['start'],
                    'end' => $slot['end'],
                    'start_datetime' => $slot['start_datetime'],
                    'end_datetime' => $slot['end_datetime'],
                    'formatted_start' => date('g:i A', strtotime($slot['start_datetime'])),
                    'formatted_end' => date('g:i A', strtotime($slot['end_datetime']))
                ];
            }
        }
        
        return $available;
    }
    
    /**
     * Validate date format
     * 
     * @param string $date Date string
     * @return bool Whether the date is valid
     */
    private function isValidDate($date) {
        $d = DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }
}
