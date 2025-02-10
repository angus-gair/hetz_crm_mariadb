import express, { type Express } from "express";
import { createServer, type Server } from "http";
import axios from "axios";
import { db } from "../db";
import { userSchema } from "../db/schema";
import { validateConfig } from "./config";
import { initDatabase } from "./database";

const SUITECRM_URL = 'http://135.181.101.154:8080';
const OAUTH2_CLIENT_ID = 'c64e46d7-bb4a-f32c-e2f0-67aa61527f73';

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
      // Test V8 API with different endpoints
      const testEndpoints = [
        {
          name: 'V8 Token Endpoint',
          url: `${SUITECRM_URL}/Api/access/token`,
          method: 'get',
          headers: {
            'Authorization': `Bearer ${OAUTH2_CLIENT_ID}`,
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
          }
        },
        {
          name: 'V8 OAuth Endpoint',
          url: `${SUITECRM_URL}/Api/V8/oauth2/token`,
          method: 'post',
          data: {
            grant_type: 'client_credentials',
            client_id: OAUTH2_CLIENT_ID,
            scope: 'standard:create standard:read standard:update standard:delete standard:relationship:create standard:relationship:read standard:relationship:update standard:relationship:delete'
          }
        },
        {
          name: 'Legacy API Endpoint',
          url: `${SUITECRM_URL}/service/v4_1/rest.php`,
          method: 'post',
          data: {
            method: 'login',
            input_type: 'JSON',
            response_type: 'JSON',
            rest_data: {
              user_auth: {
                user_name: 'admin',
                password: process.env.SUITECRM_ADMIN_PASSWORD || '',
                version: '8.1'
              },
              application_name: 'RestTest',
              name_value_list: []
            }
          }
        },
        {
          name: 'API Config Check',
          url: `${SUITECRM_URL}/Api/V8/config`,
          method: 'get',
          headers: {
            'Authorization': `Bearer ${OAUTH2_CLIENT_ID}`,
            'Accept': 'application/vnd.api+json'
          }
        }
      ];

      const results = await Promise.all(
        testEndpoints.map(async endpoint => {
          try {
            const response = await axios({
              method: endpoint.method,
              url: endpoint.url,
              data: endpoint.data,
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'SuiteCRM-Test-Client/1.0',
                'X-API-Version': 'v8',
                ...endpoint.headers
              },
              timeout: 5000,
              validateStatus: null,
              maxRedirects: 5
            });

            return {
              name: endpoint.name,
              status: response.status,
              statusText: response.statusText,
              data: response.data,
              headers: response.headers,
              method: endpoint.method
            };
          } catch (error: any) {
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
        },
        dockerConfig: {
          dbHost: '172.19.0.3',
          dbUser: 'bn_suitecrm',
          dbName: 'bitnami_suitecrm',
          apiPort: 8080,
          httpsPort: 8443
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