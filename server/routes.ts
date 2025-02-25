import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { buildSchema } from "type-graphql";
import { SuiteCRMResolver } from "./graphql/resolvers";
import { validateConfig } from "./config";
import { initDatabase } from "./database";
import axios from "axios";

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

  // Health check endpoint
  apiRouter.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // CRM Contact Form Proxy
  apiRouter.post('/crm/contacts', async (req, res) => {
    console.log('=== CRM Contact Form Submission ===');
    console.log('Request payload:', req.body);

    try {
      console.log('Making request to SuiteCRM API...');
      const response = await axios.post(`${SUITECRM_API_URL}/contacts`, req.body, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('SuiteCRM API Response:', {
        status: response.status,
        data: response.data
      });

      console.log('Tables affected:');
      console.log('- contacts: New contact record created');
      console.log('- email_addr_bean_rel: Email relationship record created');
      console.log('- email_addresses: Email address record created');
      console.log('- prospect_lists_prospects: If marketing consent given, added to marketing list');

      res.status(response.status).json(response.data);
    } catch (error) {
      console.error('CRM API Error:', error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'An error occurred while processing your request';
        console.error('Error details:', {
          status,
          message,
          response: error.response?.data
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