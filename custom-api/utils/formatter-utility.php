<?php
/**
 * Data Formatter Utility
 * 
 * Provides standardized data formatting functionality for the API
 */

class Formatter {
    /**
     * Format a contact record for API response
     * 
     * @param array $contact Raw contact data
     * @return array Formatted contact data
     */
    public static function formatContact($contact) {
        if (empty($contact)) {
            return null;
        }
        
        // Extract only the fields we want to expose in the API
        $formatted = [
            'id' => $contact['id'] ?? null,
            'first_name' => $contact['first_name'] ?? '',
            'last_name' => $contact['last_name'] ?? '',
            'full_name' => trim(($contact['first_name'] ?? '') . ' ' . ($contact['last_name'] ?? '')),
            'email' => $contact['email1'] ?? '',
            'phone' => $contact['phone_mobile'] ?? '',
            'title' => $contact['title'] ?? '',
            'department' => $contact['department'] ?? '',
            'lead_source' => $contact['lead_source'] ?? '',
            'created_at' => self::formatDateTime($contact['date_entered'] ?? null),
            'updated_at' => self::formatDateTime($contact['date_modified'] ?? null)
        ];
        
        // Add additional fields if they exist
        if (isset($contact['do_not_call'])) {
            $formatted['do_not_call'] = (bool)$contact['do_not_call'];
        }
        
        if (isset($contact['email_opt_in'])) {
            $formatted['marketing_consent'] = (bool)$contact['email_opt_in'];
        }
        
        return $formatted;
    }
    
    /**
     * Format a meeting record for API response
     * 
     * @param array $meeting Raw meeting data
     * @return array Formatted meeting data
     */
    public static function formatMeeting($meeting) {
        if (empty($meeting)) {
            return null;
        }
        
        $formatted = [
            'id' => $meeting['id'] ?? null,
            'name' => $meeting['name'] ?? '',
            'status' => $meeting['status'] ?? '',
            'start_datetime' => self::formatDateTime($meeting['date_start'] ?? null),
            'end_datetime' => self::formatDateTime($meeting['date_end'] ?? null),
            'duration' => [
                'hours' => (int)($meeting['duration_hours'] ?? 0),
                'minutes' => (int)($meeting['duration_minutes'] ?? 0)
            ],
            'location' => $meeting['location'] ?? '',
            'description' => $meeting['description'] ?? '',
            'created_at' => self::formatDateTime($meeting['date_entered'] ?? null),
            'updated_at' => self::formatDateTime($meeting['date_modified'] ?? null)
        ];
        
        // Format start and end time separately for easy display
        if (!empty($meeting['date_start'])) {
            $startTime = new DateTime($meeting['date_start']);
            $formatted['date'] = $startTime->format('Y-m-d');
            $formatted['time'] = $startTime->format('H:i:s');
            $formatted['formatted_time'] = $startTime->format('g:i A');
        }
        
        // Add links to related beans if requested
        if (isset($meeting['_relationships'])) {
            $formatted['relationships'] = $meeting['_relationships'];
        }
        
        return $formatted;
    }
    
    /**
     * Format a collection of items
     * 
     * @param array $items Collection of items
     * @param callable $formatter Formatter function to apply to each item
     * @return array Formatted collection
     */
    public static function formatCollection($items, $formatter) {
        if (!is_array($items)) {
            return [];
        }
        
        return array_map($formatter, $items);
    }
    
    /**
     * Format a date/time string
     * 
     * @param string $dateTime Date/time string
     * @param string $format Output format
     * @return string|null Formatted date/time or null if invalid
     */
    public static function formatDateTime($dateTime, $format = 'Y-m-d H:i:s') {
        if (empty($dateTime)) {
            return null;
        }
        
        try {
            $date = new DateTime($dateTime);
            return $date->format($format);
        } catch (Exception $e) {
            return null;
        }
    }
    
    /**
     * Format a date string
     * 
     * @param string $date Date string
     * @param string $format Output format
     * @return string|null Formatted date or null if invalid
     */
    public static function formatDate($date, $format = 'Y-m-d') {
        return self::formatDateTime($date, $format);
    }
    
    /**
     * Format a phone number
     * 
     * @param string $phone Phone number
     * @param string $format Format pattern
     * @return string Formatted phone number
     */
    public static function formatPhone($phone, $format = 'default') {
        if (empty($phone)) {
            return '';
        }
        
        // Remove all non-numeric characters
        $numeric = preg_replace('/[^0-9]/', '', $phone);
        
        // Apply formatting based on format parameter
        switch ($format) {
            case 'international':
                if (strlen($numeric) === 10) {
                    return '+1 (' . substr($numeric, 0, 3) . ') ' . substr($numeric, 3, 3) . '-' . substr($numeric, 6);
                } elseif (strlen($numeric) === 11 && substr($numeric, 0, 1) === '1') {
                    return '+' . substr($numeric, 0, 1) . ' (' . substr($numeric, 1, 3) . ') ' . substr($numeric, 4, 3) . '-' . substr($numeric, 7);
                }
                break;
                
            case 'dots':
                if (strlen($numeric) === 10) {
                    return substr($numeric, 0, 3) . '.' . substr($numeric, 3, 3) . '.' . substr($numeric, 6);
                }
                break;
                
            case 'raw':
                return $numeric;
                
            case 'default':
            default:
                if (strlen($numeric) === 10) {
                    return '(' . substr($numeric, 0, 3) . ') ' . substr($numeric, 3, 3) . '-' . substr($numeric, 6);
                }
                break;
        }
        
        // If no formatting applied, return the original
        return $phone;
    }
    
    /**
     * Format currency
     * 
     * @param float $amount Amount
     * @param string $currency Currency code (USD, EUR, etc.)
     * @param int $decimals Number of decimal places
     * @return string Formatted currency
     */
    public static function formatCurrency($amount, $currency = 'USD', $decimals = 2) {
        if (!is_numeric($amount)) {
            return '';
        }
        
        $symbols = [
            'USD' => '$',
            'EUR' => '€',
            'GBP' => '£',
            'JPY' => '¥',
            'CAD' => 'C$',
            'AUD' => 'A$',
            'CHF' => 'CHF',
            'CNY' => '¥',
            'INR' => '₹',
            'BRL' => 'R$'
        ];
        
        $symbol = $symbols[$currency] ?? $currency . ' ';
        
        // Format with commas and appropriate decimal places
        $formatted = number_format((float)$amount, $decimals);
        
        // Prepend currency symbol
        return $symbol . $formatted;
    }
    
    /**
     * Format a percentage
     * 
     * @param float $value Value to format
     * @param int $decimals Number of decimal places
     * @param bool $includeSymbol Whether to include the % symbol
     * @return string Formatted percentage
     */
    public static function formatPercentage($value, $decimals = 2, $includeSymbol = true) {
        if (!is_numeric($value)) {
            return '';
        }
        
        $formatted = number_format((float)$value, $decimals);
        
        return $includeSymbol ? $formatted . '%' : $formatted;
    }
    
    /**
     * Format file size
     * 
     * @param int $bytes Size in bytes
     * @param int $precision Decimal precision
     * @return string Formatted file size
     */
    public static function formatFileSize($bytes, $precision = 2) {
        if ($bytes <= 0) {
            return '0 B';
        }
        
        $units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        $base = log($bytes, 1024);
        $power = min(floor($base), count($units) - 1);
        
        return round(pow(1024, $base - $power), $precision) . ' ' . $units[$power];
    }
    
    /**
     * Convert an array to CSV string
     * 
     * @param array $data Data array
     * @param array $headers Optional header row
     * @return string CSV formatted string
     */
    public static function arrayToCsv($data, $headers = []) {
        if (empty($data)) {
            return '';
        }
        
        $output = fopen('php://temp', 'r+');
        
        // Add headers if provided
        if (!empty($headers)) {
            fputcsv($output, $headers);
        }
        
        // Add data rows
        foreach ($data as $row) {
            fputcsv($output, $row);
        }
        
        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);
        
        return $csv;
    }
    
    /**
     * Truncate text to a specified length
     * 
     * @param string $text Text to truncate
     * @param int $length Maximum length
     * @param string $suffix Suffix to add if truncated
     * @return string Truncated text
     */
    public static function truncate($text, $length = 100, $suffix = '...') {
        if (empty($text) || strlen($text) <= $length) {
            return $text;
        }
        
        return substr($text, 0, $length) . $suffix;
    }
    
    /**
     * Convert camelCase or snake_case to Title Case
     * 
     * @param string $text Text to convert
     * @return string Title case text
     */
    public static function toTitleCase($text) {
        // Convert camelCase to spaces
        $text = preg_replace('/(?<!^)([A-Z])/', ' $1', $text);
        
        // Convert snake_case to spaces
        $text = str_replace('_', ' ', $text);
        
        // Title case and trim
        return trim(ucwords($text));
    }
    
    /**
     * Clean HTML content for safe output
     * 
     * @param string $html HTML content
     * @param array $allowedTags Allowed HTML tags
     * @return string Cleaned HTML
     */
    public static function cleanHtml($html, $allowedTags = '<p><br><strong><em><ul><ol><li><span><div><h1><h2><h3><h4><h5><h6><a>') {
        if (empty($html)) {
            return '';
        }
        
        // First strip all tags not in the allowed list
        $cleaned = strip_tags($html, $allowedTags);
        
        // Then remove any dangerous attributes
        $cleaned = preg_replace(
            '/(<[^>]+) (onclick|onload|onmouseover|onmouseout|onkeydown|onkeypress|onkeyup|onerror|onabort|onfocus|onblur)=[^>]*>/i',
            '$1>',
            $cleaned
        );
        
        return $cleaned;
    }
}
