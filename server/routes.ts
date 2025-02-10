import express, { type Express } from "express";
import { createServer, type Server } from "http";
import axios from "axios";
import { db } from "../db";
import { userSchema } from "../db/schema";
import { validateConfig } from "./config";
import { initDatabase } from "./database";

const SUITECRM_URL = 'http://135.181.101.154:8080';

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
      // Test V8 API
      const v8Result = await axios.get(`${SUITECRM_URL}/Api/access/token`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }).catch(error => ({
        error: {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        }
      }));

      // Test Legacy API
      const legacyResult = await axios.get(`${SUITECRM_URL}/service/v4_1/rest.php`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }).catch(error => ({
        error: {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        }
      }));

      res.json({
        v8Api: v8Result.error || v8Result.data,
        legacyApi: legacyResult.error || legacyResult.data,
        serverTime: new Date().toISOString()
      });
    } catch (error) {
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