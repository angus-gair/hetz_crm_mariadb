// For Node.js/Express backend
// File: pages/api/db-check.js (Next.js) or routes/api/db-check.js (Express)

// If using Next.js
export default async function handler(req, res) {
  try {
    // Import your database configuration
    const mysql = require('mysql2/promise');
    
    // Create connection using your SuiteCRM database credentials
    // Use the same credentials from your config-file.php
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'neondb_owner',
      password: process.env.DB_PASSWORD || 'npg_tUOHfoV7Zeu1',
      database: process.env.DB_NAME || 'neondb',
      ssl: process.env.DB_SSL === 'true' ? true : false
    });
    
    // Test the connection with a simple query
    const [rows] = await connection.execute('SELECT 1 as connection_test');
    
    // Close the connection
    await connection.end();
    
    // Return success response with connection details
    return res.status(200).json({
      status: 'connected',
      type: 'MySQL/MariaDB',
      connection: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        database: process.env.DB_NAME || 'neondb',
        ssl: process.env.DB_SSL === 'true' ? 'enabled' : 'disabled'
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    // Return error response
    return res.status(500).json({
      status: 'error',
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// If using Express
// const express = require('express');
// const router = express.Router();
// 
// router.get('/db-check', async (req, res) => {
//   // Same implementation as above
// });
// 
// module.exports = router;
