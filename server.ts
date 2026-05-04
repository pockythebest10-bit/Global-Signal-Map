import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { initializePipeline } from "./src/pipeline/index";
import { ingestionEngine } from "./src/pipeline/IngestionEngine";
import { logger } from "./src/lib/logger";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize pipeline
  const pipeline = initializePipeline();
  
  // Run pipeline initially and then periodically
  setTimeout(() => {
    logger.info("Running initial pipeline cycle...");
    pipeline.runCycle().catch(err => logger.error("Initial pipeline cycle failed", err));
  }, 1000);
  
  setInterval(() => {
    logger.debug("Running periodic pipeline cycle...");
    pipeline.runCycle().catch(err => logger.error("Periodic pipeline cycle failed", err));
  }, 120000);

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/pipeline/run", async (_req, res, next) => {
    try {
      await pipeline.runCycle();
      res.json({ status: "ok", message: "Pipeline cycle completed successfully" });
    } catch (error: any) {
      logger.error("Error running pipeline on-demand", error);
      next(error);
    }
  });

  app.get("/api/system/debug", (_req, res) => {
    try {
      const providers = ingestionEngine.getProviders().map(p => {
        const stats = ingestionEngine.providerStats.get(p.id);
        return {
          id: p.id,
          name: p.name,
          type: p.type,
          status: stats?.status,
          lastFetchTime: stats?.lastFetchTime,
          numIngested: stats?.numIngested
        };
      });

      const rawItems = ingestionEngine.rawStorage;
      const normalizedItems = ingestionEngine.normalizedStorage;
      const canonicalEvents = pipeline.getEvents();

      res.json({
        env: {
          GNEWS_API_KEY_LOADED: !!process.env.GNEWS_API_KEY,
          REAL_SOURCE_RSS_URL_LOADED: !!process.env.REAL_SOURCE_RSS_URL
        },
        providers,
        stats: {
          totalRawIngested: rawItems.length,
          totalNormalizedGenerated: normalizedItems.length,
          totalCanonicalGenerated: canonicalEvents.length,
          feedItemsRendered: canonicalEvents.length,
          searchIndexAvailable: canonicalEvents.length
        },
        latestRaw: rawItems.slice(-3).reverse().map(i => i.title),
        latestNormalized: normalizedItems.slice(-3).reverse().map(i => i.title),
        latestCanonical: canonicalEvents.slice(0, 3).map(i => i.title)
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/events", (_req, res, next) => {
    try {
      // In a real database we would query here. For now we will return events from the pipeline's in-memory store.
      const events = pipeline.getEvents();
      res.json(events);
    } catch (error: any) {
      logger.error("Error fetching live events", error);
      next(error);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Error handling middleware
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ status: "error", message: err.message || "Internal server error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
