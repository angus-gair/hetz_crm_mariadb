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

  // Build GraphQL schema
  const schema = await buildSchema({
    resolvers: [SuiteCRMResolver],
    emitSchemaFile: true,
  });

  // Create Apollo Server
  const apolloServer = new ApolloServer({
    schema,
  });

  await apolloServer.start();

  // API Routes
  const apiRouter = express.Router();

  // Request logging middleware
  apiRouter.use((req, res, next) => {
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
  apiRouter.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Contact Form Handler
  apiRouter.post('/contacts', async (req, res) => {
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

  // Mount GraphQL endpoint
  app.use('/graphql', 
    expressMiddleware(apolloServer)
  );

  // Mount API routes
  app.use('/api', apiRouter);

  return createServer(app);
}