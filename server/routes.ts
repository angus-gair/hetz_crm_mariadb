import express, { type Express } from "express";
import { createServer, type Server } from "http";
import axios from "axios";
import { db } from "../db";
import { userSchema } from "../db/schema";
import { validateConfig } from "./config";
import { initDatabase } from "./database";

// SuiteCRM configuration
const SUITECRM_URL = process.env.SUITECRM_URL || 'http://135.181.101.154:8080';
const SUITECRM_USERNAME = process.env.SUITECRM_USERNAME || 'user';
const SUITECRM_PASSWORD = process.env.SUITECRM_PASSWORD || 'bitnami';

export async function registerRoutes(app: Express): Promise<Server> {
  // Validate config and initialize database
  validateConfig();
  await initDatabase();

  // API Routes
  const apiRouter = express.Router();

  // Health check endpoint
  apiRouter.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // SuiteCRM test endpoint
  apiRouter.get('/test-suitecrm', async (req, res) => {
    try {
      const testEndpoints = [
        {
          name: 'Legacy API Authentication',
          url: `${SUITECRM_URL}/service/v4_1/rest.php`,
          method: 'post',
          data: {
            method: 'login',
            input_type: 'JSON',
            response_type: 'JSON',
            rest_data: {
              user_auth: {
                user_name: SUITECRM_USERNAME,
                password: SUITECRM_PASSWORD,
                version: '8.1'
              },
              application_name: 'RestTest'
            }
          }
        }
      ];

      const results = await Promise.all(
        testEndpoints.map(async endpoint => {
          try {
            console.log(`Testing endpoint: ${endpoint.name}`);
            console.log(`URL: ${endpoint.url}`);
            console.log('Headers:', endpoint.headers);
            console.log('Data:', endpoint.data);

            const response = await axios({
              method: endpoint.method,
              url: endpoint.url,
              data: endpoint.data,
              headers: {
                'User-Agent': 'SuiteCRM-Test-Client/1.0',
                'Content-Type': 'application/json',
                ...endpoint.headers
              },
              timeout: 5000,
              validateStatus: null,
              maxRedirects: 5
            });

            console.log(`Response status: ${response.status}`);
            console.log('Response headers:', response.headers);
            console.log('Response data:', response.data);

            return {
              name: endpoint.name,
              status: response.status,
              statusText: response.statusText,
              data: response.data,
              headers: response.headers,
              method: endpoint.method
            };
          } catch (error: any) {
            console.error(`Error testing ${endpoint.name}:`, error.message);
            return {
              name: endpoint.name,
              error: true,
              status: error.response?.status,
              statusText: error.response?.statusText,
              message: error.message,
              data: error.response?.data,
              headers: error.response?.headers,
              method: endpoint.method
            };
          }
        })
      );

      res.json({
        results,
        serverTime: new Date().toISOString(),
        serverInfo: {
          nodeVersion: process.version,
          platform: process.platform
        }
      });
    } catch (error) {
      console.error('SuiteCRM test error:', error);
      res.status(500).json({
        error: 'Failed to test SuiteCRM connection',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // User routes
  apiRouter.post('/users', async (req, res) => {
    try {
      const userData = userSchema.parse(req.body);
      const userId = await db.users.create(userData);
      res.status(201).json({ id: userId });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  apiRouter.get('/users/:id', async (req, res) => {
    try {
      const user = await db.users.findById(Number(req.params.id));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Mount API routes
  app.use('/api', apiRouter);

  return createServer(app);
}