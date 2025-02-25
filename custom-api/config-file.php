<?php
/**
 * API Configuration
 * 
 * Centralized configuration for the API proxy
 */

return [
    // Database configuration
    'db' => [
        'host' => 'mariadb',
        'user' => 'suitecrm',
        'pass' => 'Jamfinnarc1776!',
        'name' => 'suitecrm'
    ],
    
    // SuiteCRM configuration
    'suitecrm' => [
        'path' => dirname(__FILE__) . '/../',  // Adjust to your SuiteCRM root path
        'entry_point' => 'include/entryPoint.php',
    ],
    
    // API configuration
    'api' => [
        'version' => '1.0',
        'allow_origin' => '*',  // For production, specify exact domains
        'debug' => false,
        'log_path' => dirname(__FILE__) . '/logs/',
    ],
    
    // Security configuration
    'security' => [
        'token_expiry_check' => true,
        'rate_limit' => 100,  // Requests per minute
        'validate_inputs' => true,
    ]
];
