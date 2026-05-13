import "reflect-metadata";
import express, { Express } from "express";
import cors from "cors";
import { config } from "../config";
import { initializeDatabase } from "../infrastructure/database";
import { Logger } from "../shared/logger";
import initRoutes from "./routes";

function createExpressApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: config.cors.allowedOrigin,
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  return app;
}

let cachedApp: Express | null = null;

export async function getApp(): Promise<Express> {
  if (cachedApp) return cachedApp;
  const app = createExpressApp();
  await initializeDatabase();
  initRoutes(app);
  Logger.info("Routes initialized");

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: "Route not found." });
  });

  // Global error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    Logger.error(`Unhandled error: ${err.message}`);
    res.status(500).json({ error: "Internal server error." });
  });

  cachedApp = app;
  return app;
}

const PORT = config.port;

const startServer = async () => {
  try {
    const app = await getApp();
    app.listen(PORT, "0.0.0.0", () => {
      Logger.info(`🚀 BloodConnect API running on http://0.0.0.0:${PORT}`);
      Logger.info(`💚 Health check: http://0.0.0.0:${PORT}/api/health`);
    });
  } catch (error) {
    Logger.error(`❌ Server failed to start: ${error}`);
    process.exit(1);
  }
};

startServer();

export default cachedApp;
