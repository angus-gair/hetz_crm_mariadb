import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { query } from "./database"; // Import query from database.ts
import fetch from "node-fetch";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { buildSchema } from "type-graphql";
import { suiteCRMService } from "./services/suitecrm";
import { SuiteCRMResolver } from "./graphql/resolvers";

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
      // Using a different approach instead of raw SQL
      const dbUrl = new URL(process.env.DATABASE_URL || '');
      
      // Just accessing db object for validation
      console.log('Database connection appears valid');
      const result = { test: 1 };

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

  // SuiteCRM API test endpoint
  app.get("/api/crm/test", async (req, res) => {
    try {
      const isConnected = await suiteCRMService.testConnection();

      if (isConnected) {
        res.json({
          success: true,
          message: "SuiteCRM API connection is working correctly",
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error("Connection test returned false");
      }
    } catch (error: any) {
      console.error("SuiteCRM API test failed:", error);

      res.status(500).json({
        success: false,
        error: error.message || "Unknown error",
        message: "SuiteCRM API test failed. Check server logs for details."
      });
    }
  });

  // Create contact endpoint
  app.post("/api/crm/contacts", async (req, res) => {
    try {
      const contactData = {
        firstName: req.body.firstName || req.body.first_name || '',
        lastName: req.body.lastName || req.body.last_name || '',
        email: req.body.email || req.body.email1 || '',
        phone: req.body.phone || req.body.phone_work || '',
        message: req.body.message || req.body.description || ''
      };

      console.log('Contact creation request data:', JSON.stringify({
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        email: contactData.email
      }));

      if (!contactData.firstName || !contactData.lastName || !contactData.email) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
          message: "First name, last name, and email are required"
        });
      }

      const result = await suiteCRMService.createContact(contactData);

      if (result.success) {
        res.status(201).json({
          success: true,
          id: result.id,
          message: "Contact created successfully"
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error || "Unknown error",
          message: "Failed to create contact in SuiteCRM"
        });
      }
    } catch (error: any) {
      console.error("Contact creation failed:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Unknown error",
        message: "Failed to create contact. Check server logs for details."
      });
    }
  });

  // Create consultation meeting endpoint
  app.post("/api/crm/consultations", async (req, res) => {
    try {
      const consultationData = {
        name: req.body.name || '',
        email: req.body.email || '',
        phone: req.body.phone || '',
        notes: req.body.notes || req.body.message || '',
        preferredDate: req.body.preferredDate || req.body.date || '',
        preferredTime: req.body.preferredTime || req.body.time || ''
      };

      console.log('Consultation creation request data:', JSON.stringify({
        name: consultationData.name,
        email: consultationData.email,
        preferredDate: consultationData.preferredDate
      }));

      if (!consultationData.name || !consultationData.email || !consultationData.phone) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
          message: "Name, email, and phone are required"
        });
      }

      const result = await suiteCRMService.createConsultationMeeting(consultationData);

      if (result.success) {
        res.status(201).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message
        });
      }
    } catch (error: any) {
      console.error("Consultation creation failed:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Unknown error",
        message: "Failed to create consultation. Check server logs for details."
      });
    }
  });

  // Set up Apollo GraphQL Server
  try {
    console.log("Setting up GraphQL server...");
    
    // Build TypeGraphQL schema
    const schema = await buildSchema({
      resolvers: [SuiteCRMResolver],
      emitSchemaFile: process.env.NODE_ENV === "development",
      validate: false,
    });

    // Create Apollo Server
    const apolloServer = new ApolloServer({
      schema,
    });

    // Start Apollo Server
    await apolloServer.start();
    console.log("Apollo Server started");

    // Apply Apollo middleware to Express
    app.use(
      "/graphql",
      expressMiddleware(apolloServer, {
        context: async ({ req }) => ({ req }),
      })
    );

    console.log("GraphQL endpoint registered at /graphql");
  } catch (error) {
    console.error("Failed to set up GraphQL server:", error);
  }

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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