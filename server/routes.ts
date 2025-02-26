import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { buildSchema } from "type-graphql";
import { SuiteCRMResolver } from "./graphql/resolvers";
import { validateConfig } from "./config";
import { initDatabase } from "./database";
import axios from "axios";
import { db } from "@db";

// Get API configuration from environment
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/custom-api";
const API_TOKEN = process.env.API_TOKEN || "your_default_token";

export async function registerRoutes(app: Express): Promise<Server> {
  // Validate config and initialize database
  validateConfig();
  await initDatabase();

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
      await db.query.users.findMany();
      res.json({ 
        status: 'ok',
        message: 'Database connection successful',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Database check failed:', error);
      res.status(500).json({
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
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
      console.log('Making request to API endpoint:', `${API_BASE_URL}/api-proxy.php/contacts`);
      const response = await axios.post(`${API_BASE_URL}/api-proxy.php/contacts`, req.body, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      // Log success response
      console.log('API Response:', {
        status: response.status,
        data: response.data
      });

      res.status(response.status).json(response.data);
    } catch (error) {
      console.error('API Error:', error);

      if (axios.isAxiosError(error)) {
        console.error('Full error response:', error.response?.data);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'An error occurred while processing your request';
        console.error('Error details:', {
          status,
          message,
          response: error.response?.data,
          requestBody: req.body
        });
        res.status(status).json({ message });
      } else {
        console.error('Unexpected error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
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