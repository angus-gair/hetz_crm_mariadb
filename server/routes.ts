import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { buildSchema } from "type-graphql";
import { SuiteCRMResolver } from "./graphql/resolvers";
import { validateConfig } from "./config";
import { initDatabase } from "./database";

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

  // Mount GraphQL endpoint
  app.use('/graphql', 
    express.json(),
    expressMiddleware(apolloServer)
  );

  // Mount API routes
  app.use('/api', apiRouter);

  return createServer(app);
}