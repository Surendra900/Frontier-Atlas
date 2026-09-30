import { Hono } from "hono";
import { cors } from "hono/cors";
import { PrismaClient } from "./generated/prisma/client.js";
import { DatabaseManager } from "./database/DatabaseManager.js";
import { QueryRouter } from "./routing/index.js";
import { redisManager } from "./lib/redis";

import authRoutes from "./routes/auth.routes.js";
import paperRoutes from "./routes/paper.routes.js";
import authorRoutes from "./routes/author.routes.js";
import modelRoutes from "./routes/model.routes.js";
import datasetRoutes from "./routes/dataset.routes.js";
import taskRoutes from "./routes/task.routes.js";
import discussionRoutes from "./routes/discussion.routes.js";
import methodRoutes from "./routes/method.routes.js";
import benchmarkRoutes from "./routes/benchmark.routes.js";
import searchRoutes from "./routes/search.routes.js";
import { prewarmCommonViews } from "./controllers/paper.controller.js";

// Environment Bindings and Context Variables
type Env = {
  Bindings: {
    DATABASE_URL: string;
    SHARD_1_DATABASE_URL?: string;
    UPSTASH_REDIS_REST_URL: string;
    UPSTASH_REDIS_REST_TOKEN: string;
    QUERY_TIMEOUT_MS?: string;
  };
  Variables: {
    prisma: PrismaClient;
    databaseManager: DatabaseManager;
    queryRouter: QueryRouter;
    userId: string;
  };
};

const app = new Hono<Env>();

// Configure CORS
// Configure CORS
app.use(
  "*",
  cors({
    origin: (origin) => {
  // Allow local development, production, and Cloudflare Pages previews
  if (
    !origin ||
    origin.includes("localhost") ||
    origin.includes("127.0.0.1") ||
    origin === "https://frontieratlas.co" ||
    /^https:\/\/[a-z0-9-]+\.frontieratlas\.pages\.dev$/.test(origin)
  ) {
    return origin;
  }

  return "https://frontieratlas.co";
},
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
    credentials: true,
  }),
);

// Per-Request Middleware
app.use("*", async (c, next) => {
  const rawDbUrl = c.env.DATABASE_URL || c.env.SHARD_1_DATABASE_URL;
  const DATABASE_URL = (rawDbUrl || "") as string;
  const QUERY_TIMEOUT_MS = c.env.QUERY_TIMEOUT_MS;

  const REDIS_URL = c.env.UPSTASH_REDIS_REST_URL;
  const REDIS_TOKEN = c.env.UPSTASH_REDIS_REST_TOKEN;

  redisManager.connect(REDIS_URL, REDIS_TOKEN);

  // Strip quotes if they were included in the .dev.vars file
  const cleanUrl = DATABASE_URL ? DATABASE_URL.replace(/^"|"$/g, "").trim() : "";

  if (!cleanUrl) {
    return c.json(
      {
        status: "error",
        message: "Database connection string is missing. Please configure DATABASE_URL in .dev.vars or environment bindings.",
      },
      500
    );
  }

  // Prewarm critical views in background on the very first incoming request
  prewarmCommonViews(undefined, cleanUrl);

  // Fresh DatabaseManager per request to prevent WebSocket channel concurrency locks in workerd
  const databaseManager = new DatabaseManager({
    DATABASE_URL: cleanUrl,
  });
  const queryRouter = new QueryRouter(databaseManager, QUERY_TIMEOUT_MS);

  c.set("prisma", databaseManager.getClient());
  c.set("databaseManager", databaseManager);
  c.set("queryRouter", queryRouter);

  try {
    await next();
  } finally {
    await databaseManager.disconnectAll();
  }
});

// Register Routes
app.get("/health", (c) => {
  const rawDbUrl = c.env.DATABASE_URL || c.env.SHARD_1_DATABASE_URL;
  const cleanUrl = rawDbUrl ? rawDbUrl.replace(/^"|"$/g, "").trim() : "";
  if (cleanUrl) {
    prewarmCommonViews(undefined, cleanUrl);
  }
  return c.json({
    status: "ok",
    message: "FrontierAtlas V1 API is running perfectly! 🚀",
  });
});
app.route("/api/v1/auth", authRoutes);
app.route("/api/v1/research-papers", paperRoutes);
app.route("/api/v1/authors", authorRoutes);
app.route("/api/v1/models", modelRoutes);
app.route("/api/v1/datasets", datasetRoutes);
app.route("/api/v1/tasks", taskRoutes);
app.route("/api/v1/discussions", discussionRoutes);
app.route("/api/v1/methods", methodRoutes);
app.route("/api/v1/benchmarks", benchmarkRoutes);
app.route("/api/v1/search", searchRoutes);

export default {
  fetch: app.fetch,
  async scheduled(event: any, env: any, ctx: any) {
    const rawUrl = env.DATABASE_URL || env.SHARD_1_DATABASE_URL;
    const cleanUrl = rawUrl ? rawUrl.replace(/^"|"$/g, "").trim() : "";
    if (!cleanUrl) return;

    const dbManager = new DatabaseManager({ DATABASE_URL: cleanUrl });
    const prisma = dbManager.getClient();
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log("Cron keep-alive successful");
    } catch (err) {
      console.error("Cron keep-alive failed", err);
    } finally {
      await dbManager.disconnectAll();
    }
  }
};
