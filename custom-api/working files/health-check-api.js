// For Node.js/Express backend
// File: pages/api/health.js (Next.js) or routes/health.js (Express)

// If using Next.js
export default function handler(req, res) {
  try {
    // Return basic system information
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      node_version: process.version,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      api_version: process.env.API_VERSION || '1.0.0'
    });
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}

// If using Express
// const express = require('express');
// const router = express.Router();
// 
// router.get('/health', (req, res) => {
//   // Same implementation as above
// });
// 
// module.exports = router;
