import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { db } from "../db";
import { userSchema } from "../db/schema";
import { validateConfig } from "./config";
import { initDatabase } from "./database";
import consultationRoutes from "./routes/consultation";

export async function registerRoutes(app: Express): Promise<Server> {
  // Validate config and initialize database
  validateConfig();
  await initDatabase();

  // API Routes
  const apiRouter = express.Router();

  // CORS middleware for API routes
  apiRouter.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check endpoint
  apiRouter.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Mount consultation routes
  apiRouter.use('/consultation', consultationRoutes);

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

  // Mount API routes at /api
  app.use('/api', apiRouter);

  // Add catch-all for API routes that don't exist
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  return createServer(app);
}