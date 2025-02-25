<?php
/**
 * Response Handler
 * 
 * Standardizes API responses
 */

class Response {
    /**
     * Send a success response
     * 
     * @param mixed $data The data to return
     * @param int $code HTTP status code
     * @param string $message Optional success message
     */
    public static function success($data = null, $code = 200, $message = '') {
        $response = [
            'success' => true,
            'code' => $code
        ];
        
        if (!empty($message)) {
            $response['message'] = $message;
        }
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        self::send($response, $code);
    }
    
    /**
     * Send an error response
     * 
     * @param string $message Error message
     * @param int $code HTTP status code
     * @param array $errors Additional error details
     */
    public static function error($message, $code = 400, $errors = []) {
        $response = [
            'success' => false,
            'code' => $code,
            'message' => $message
        ];
        
        if (!empty($errors)) {
            $response['errors'] = $errors;
        }
        
        self::send($response, $code);
    }
    
    /**
     * Send a response
     * 
     * @param array $data Response data
     * @param int $code HTTP status code
     */
    private static function send($data, $code) {
        http_response_code($code);
        
        // Add CORS headers if not already set
        if (!headers_sent()) {
            header('Content-Type: application/json');
        }
        
        echo json_encode($data);
        exit;
    }
    
    /**
     * Send a file download response
     * 
     * @param string $filePath Path to the file
     * @param string $fileName Filename for download
     * @param string $mimeType MIME type
     */
    public static function download($filePath, $fileName, $mimeType = null) {
        if (!file_exists($filePath)) {
            self::error('File not found', 404);
        }
        
        if ($mimeType === null) {
            $mimeType = mime_content_type($filePath);
        }
        
        header('Content-Type: ' . $mimeType);
        header('Content-Disposition: attachment; filename="' . $fileName . '"');
        header('Content-Length: ' . filesize($filePath));
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');
        
        readfile($filePath);
        exit;
    }
}
