<?php
/**
 * Input Validation Utilities
 * 
 * Validates and sanitizes input data
 */

class Validation {
    /**
     * Validate an entire request payload against a schema
     * 
     * @param array $data Input data
     * @param array $schema Validation schema
     * @return array [isValid, errors]
     */
    public static function validateRequest($data, $schema) {
        $errors = [];
        $isValid = true;
        
        foreach ($schema as $field => $rules) {
            if (isset($rules['required']) && $rules['required'] && !isset($data[$field])) {
                $errors[$field] = 'Field is required';
                $isValid = false;
                continue;
            }
            
            // Skip validation for optional fields that are not present
            if (!isset($data[$field])) {
                continue;
            }
            
            $value = $data[$field];
            
            // Type checking
            if (isset($rules['type'])) {
                switch ($rules['type']) {
                    case 'string':
                        if (!is_string($value)) {
                            $errors[$field] = 'Must be a string';
                            $isValid = false;
                        }
                        break;
                    case 'number':
                    case 'integer':
                        if (!is_numeric($value)) {
                            $errors[$field] = 'Must be a number';
                            $isValid = false;
                        } elseif ($rules['type'] === 'integer' && !is_int($value + 0)) {
                            $errors[$field] = 'Must be an integer';
                            $isValid = false;
                        }
                        break;
                    case 'boolean':
                        if (!is_bool($value) && $value !== '0' && $value !== '1' && $value !== 0 && $value !== 1) {
                            $errors[$field] = 'Must be a boolean';
                            $isValid = false;
                        }
                        break;
                    case 'array':
                        if (!is_array($value)) {
                            $errors[$field] = 'Must be an array';
                            $isValid = false;
                        }
                        break;
                    case 'email':
                        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                            $errors[$field] = 'Must be a valid email address';
                            $isValid = false;
                        }
                        break;
                    case 'date':
                        if (!self::isValidDate($value)) {
                            $errors[$field] = 'Must be a valid date (YYYY-MM-DD)';
                            $isValid = false;
                        }
                        break;
                    case 'time':
                        if (!self::isValidTime($value)) {
                            $errors[$field] = 'Must be a valid time (HH:MM:SS)';
                            $isValid = false;
                        }
                        break;
                    case 'datetime':
                        if (!self::isValidDateTime($value)) {
                            $errors[$field] = 'Must be a valid datetime (YYYY-MM-DD HH:MM:SS)';
                            $isValid = false;
                        }
                        break;
                }
            }
            
            // Min/max validation for strings, numbers, and arrays
            if (isset($rules['min']) && is_numeric($rules['min'])) {
                if ((is_string($value) && strlen($value) < $rules['min']) || 
                    (is_numeric($value) && $value < $rules['min']) ||
                    (is_array($value) && count($value) < $rules['min'])) {
                    $errors[$field] = 'Must be at least ' . $rules['min'];
                    $isValid = false;
                }
            }
            
            if (isset($rules['max']) && is_numeric($rules['max'])) {
                if ((is_string($value) && strlen($value) > $rules['max']) || 
                    (is_numeric($value) && $value > $rules['max']) ||
                    (is_array($value) && count($value) > $rules['max'])) {
                    $errors[$field] = 'Must be at most ' . $rules['max'];
                    $isValid = false;
                }
            }
            
            // Pattern validation
            if (isset($rules['pattern']) && is_string($value) && !preg_match($rules['pattern'], $value)) {
                $errors[$field] = 'Invalid format';
                $isValid = false;
            }
            
            // Enum validation
            if (isset($rules['enum']) && is_array($rules['enum']) && !in_array($value, $rules['enum'])) {
                $errors[$field] = 'Must be one of: ' . implode(', ', $rules['enum']);
                $isValid = false;
            }
            
            // Custom validation
            if (isset($rules['custom']) && is_callable($rules['custom'])) {
                $customResult = $rules['custom']($value, $data);
                if ($customResult !== true) {
                    $errors[$field] = $customResult;
                    $isValid = false;
                }
            }
        }
        
        return [$isValid, $errors];
    }
    
    /**
     * Sanitize input data according to a schema
     * 
     * @param array $data Input data
     * @param array $schema Sanitization schema
     * @return array Sanitized data
     */
    public static function sanitize($data, $schema) {
        $sanitized = [];
        
        foreach ($schema as $field => $rules) {
            if (!isset($data[$field])) {
                // Set default value if specified
                if (isset($rules['default'])) {
                    $sanitized[$field] = $rules['default'];
                }
                continue;
            }
            
            $value = $data[$field];
            
            // Type conversion
            if (isset($rules['type'])) {
                switch ($rules['type']) {
                    case 'string':
                        $value = (string) $value;
                        break;
                    case 'integer':
                        $value = (int) $value;
                        break;
                    case 'number':
                        $value = (float) $value;
                        break;
                    case 'boolean':
                        $value = (bool) $value;
                        break;
                    case 'email':
                        $value = filter_var($value, FILTER_SANITIZE_EMAIL);
                        break;
                }
            }
            
            // Trimming
            if (is_string($value) && (!isset($rules['trim']) || $rules['trim'] !== false)) {
                $value = trim($value);
            }
            
            // Allow HTML
            if (is_string($value) && (!isset($rules['allowHtml']) || $rules['allowHtml'] === false)) {
                $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
            }
            
            // Custom sanitizer
            if (isset($rules['sanitize']) && is_callable($rules['sanitize'])) {
                $value = $rules['sanitize']($value);
            }
            
            $sanitized[$field] = $value;
        }
        
        return $sanitized;
    }
    
    /**
     * Check if a string is a valid date
     */
    private static function isValidDate($date) {
        if (!is_string($date)) {
            return false;
        }
        
        $format = 'Y-m-d';
        $dateTime = DateTime::createFromFormat($format, $date);
        return $dateTime && $dateTime->format($format) === $date;
    }
    
    /**
     * Check if a string is a valid time
     */
    private static function isValidTime($time) {
        if (!is_string($time)) {
            return false;
        }
        
        $format = 'H:i:s';
        $dateTime = DateTime::createFromFormat($format, $time);
        return $dateTime && $dateTime->format($format) === $time;
    }
    
    /**
     * Check if a string is a valid datetime
     */
    private static function isValidDateTime($datetime) {
        if (!is_string($datetime)) {
            return false;
        }
        
        $format = 'Y-m-d H:i:s';
        $dateTime = DateTime::createFromFormat($format, $datetime);
        return $dateTime && $dateTime->format($format) === $datetime;
    }
}
