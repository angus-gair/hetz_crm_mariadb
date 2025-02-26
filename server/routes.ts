import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { sql } from "drizzle-orm";
import fetch from "node-fetch";


export async function registerRoutes(app: Express): Promise<Server> {
  // Global middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} [express] ${req.method} ${req.path} - Request started`);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);

    // Log response
    const originalSend = res.send;
    res.send = function(...args) {
      const responseTimestamp = new Date().toISOString();
      console.log(`${responseTimestamp} [express] ${req.method} ${req.path} ${res.statusCode} - Request completed`);
      console.log('Response body:', args[0]);
      return originalSend.apply(res, args);
    };

    next();
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Database check endpoint
  app.get('/api/db-check', async (req, res) => {
    try {
      // Simple query to check database connection
      await db.execute(sql`SELECT 1`);

      // Get database connection info
      const dbUrl = new URL(process.env.DATABASE_URL || '');

      res.json({ 
        status: 'ok',
        message: 'Database connection successful',
        timestamp: new Date().toISOString(),
        connection: {
          host: dbUrl.hostname,
          port: dbUrl.port,
          database: dbUrl.pathname.substring(1),
          user: dbUrl.username,
          ssl: dbUrl.searchParams.get('sslmode') || 'prefer'
        },
        type: 'postgresql'
      });
    } catch (error) {
      console.error('Database check failed:', error);
      res.status(500).json({
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : undefined
      });
    }
  });

  // Contact Form Handler
  app.post('/api/contacts', async (req, res) => {
    console.log('=== Contact Form Submission ===');
    console.log('Request payload:', req.body);

    // Validate Content-Type
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Invalid Content-Type:', contentType);
      return res.status(415).json({ 
        message: 'Content-Type must be application/json' 
      });
    }

    try {
      const response = await fetch(`${process.env.API_BASE_URL}/api-proxy.php/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        return res.status(response.status).json(errorData);
      }

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error('Error processing contact form:', error);
      res.status(500).json({ 
        message: 'An error occurred while processing your request',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
      path: req.path,
      timestamp: new Date().toISOString()
    });
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}