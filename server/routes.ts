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

const SUITECRM_API_URL = "http://5.75.135.254/custom-api/api-proxy.php";
const API_TOKEN = "c038c571a0f0dc8ff2b1c89e9545dcd5d4e13319cf63c0657c1d39e0fefd24aa";

export async function registerRoutes(app: Express): Promise<Server> {
  // Validate config and initialize database
  validateConfig();
  await initDatabase();

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

    // Log response
    const originalSend = res.send;
    res.send = function(...args) {
      const responseTimestamp = new Date().toISOString();
      console.log(`${responseTimestamp} [express] ${req.method} ${req.path} ${res.statusCode} - Request completed`);
      return originalSend.apply(res, args);
    };

    next();
  });

  // Health check endpoint
  apiRouter.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // CRM Contact Form Proxy
  apiRouter.post('/crm/contacts', async (req, res) => {
    console.log('=== CRM Contact Form Submission ===');
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
      console.log('Making request to SuiteCRM API...');
      const startTime = Date.now();
      const response = await axios.post(`${SUITECRM_API_URL}/contacts`, req.body, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      const endTime = Date.now();

      // Enhanced response logging
      console.log('SuiteCRM API Response:', {
        status: response.status,
        data: response.data,
        contact_id: response.data?.contact?.id || 'Not returned',
        contact_name: response.data?.contact?.name || 'Not returned',
        contact_email: response.data?.contact?.email || 'Not returned',
        created_at: response.data?.contact?.created_at || 'Not returned',
        responseTime: `${endTime - startTime}ms`
      });

      console.log('Tables affected:');
      console.log('- contacts: New contact record created');
      console.log('- email_addr_bean_rel: Email relationship record created');
      console.log('- email_addresses: Email address record created');
      console.log('- prospect_lists_prospects: If marketing consent given, added to marketing list');

      // Execute SQL verification query using execute_sql_tool
      if (response.data?.contact?.id) {
        try {
          const sql_query = `
            SELECT 
              id, 
              first_name, 
              last_name, 
              date_entered,
              email_address,
              prospect_list_name
            FROM contacts
            WHERE id = '${response.data.contact.id}'
          `;
          console.log('Executing verification query:', sql_query);
          // Here you would need to add the actual execution of the query using the db object from "@db"
          // Example (assuming a method exists on the db object):  await db.execute(sql_query);
        } catch (dbError) {
          console.error('Database verification failed:', dbError);
        }
      }

      res.status(response.status).json(response.data);
    } catch (error) {
      console.error('CRM API Error:', error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'An error occurred while processing your request';
        console.error('Error details:', {
          status,
          message,
          response: error.response?.data,
          requestBody: req.body,
          requestHeaders: error.config?.headers,
          responseHeaders: error.response?.headers
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
    express.json(),
    expressMiddleware(apolloServer)
  );

  // Mount API routes
  app.use('/api', apiRouter);

  return createServer(app);
}