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

// Helper function to clean URL (remove double slashes except after protocol)
const cleanUrl = (url: string) => url.replace(/([^:]\/)\/+/g, "$1");

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
          name: 'V8 Token Endpoint',
          url: cleanUrl(`${SUITECRM_URL}/legacy/Api/access_token`),
          method: 'get',
          headers: {
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/json',
            'User-Agent': 'SuiteCRM-Test-Client/1.0'
          }
        },
        {
          name: 'V8 OAuth Endpoint',
          url: cleanUrl(`${SUITECRM_URL}/legacy/Api/V8/oauth2/token`),
          method: 'post',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With',
            'Content-Type': 'application/json',
            'User-Agent': 'SuiteCRM-Test-Client/1.0'
          },
          data: {
            grant_type: 'password',
            client_id: 'sugar',
            client_secret: '',
            username: SUITECRM_USERNAME,
            password: SUITECRM_PASSWORD,
            scope: ''
          }
        },
        {
          name: 'Legacy API Endpoint',
          url: cleanUrl(`${SUITECRM_URL}/service/v4_1/rest.php`),
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'SuiteCRM-Test-Client/1.0'
          },
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

      console.log(`[SuiteCRM] Testing connection to ${SUITECRM_URL}`);

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
              data: response.data || '',
              error: response.status >= 400 ? 'Request failed' : undefined,
              headers: response.headers,
              method: endpoint.method
            };
          } catch (error: any) {
            console.error(`Error testing ${endpoint.name}:`, error.message);
            console.error('Full error:', error);
            return {
              name: endpoint.name,
              status: error.response?.status,
              statusText: error.response?.statusText || error.message,
              data: error.response?.data || '',
              error: error.message,
              headers: error.response?.headers || {},
              method: endpoint.method,
              stack: error.stack
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