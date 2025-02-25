<?php
/**
 * API Configuration
 * 
 * Centralized configuration for the API proxy
 */

return [
    // Database configuration
    'db' => [
        'host' => 'localhost',
        'user' => 'neondb_owner',
        'pass' => 'npg_tUOHfoV7Zeu1',
        'name' => 'neondb'
    ],

    // SuiteCRM configuration
    'suitecrm' => [
        'path' => dirname(__FILE__) . '/../',  // Adjust to your SuiteCRM root path
        'entry_point' => 'include/entryPoint.php',
    ],

    // API configuration
    'api' => [
        'version' => '1.0',
        'allow_origin' => '*',  // For development, in production specify exact domains
        'debug' => true,  // Enable debug mode to see detailed errors
        'log_path' => __DIR__ . '/logs/',
    ],

    // Security configuration
    'security' => [
        'token_expiry_check' => true,
        'rate_limit' => 100,  // Requests per minute
        'validate_inputs' => true,
        'spam_protection' => [
            'enabled' => true,
            'max_urls' => 3,  // Maximum number of URLs allowed in description
            'keywords' => ['viagra', 'casino', 'pharmacy', 'diet', 'weight loss', 'sex', 'porn'],
            'check_caps_ratio' => true,  // Check for excessive capitalization
            'max_caps_ratio' => 0.3,  // Maximum ratio of uppercase letters
        ],
    ]
];