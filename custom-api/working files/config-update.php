<?php
/**
 * API Configuration - Updated with security settings
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

    // Security configuration - ENHANCED
    'security' => [
        'token_expiry_check' => true,
        'rate_limit' => 5,     // Contact form submissions per period
        'rate_period' => 3600, // Period in seconds (1 hour)
        'validate_inputs' => true,
        'spam_protection' => true,
        'ip_blacklist' => [], // Add known malicious IPs here
        'honeypot_field' => 'website', // Hidden field to catch bots
    ]
];
