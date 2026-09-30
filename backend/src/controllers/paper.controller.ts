import { Context } from "hono";
import * as paperService from "../services/paper.service.js";
import * as searchService from "../services/search.service.js";
import { redisManager } from "../lib/redis.js";
import { QueryRouter } from "../routing/index.js";
import { DatabaseManager } from "../database/DatabaseManager.js";

// ---------------------------------------------------------------------------
// Version-counter helpers
// Maintains a lightweight integer version in Redis for list cache invalidation.
// ---------------------------------------------------------------------------

let cachedPapersVersion = "4_0";
let cachedVersionExpiresAt = 0;

const getPapersVersion = async (): Promise<string> => {
  if (Date.now() < cachedVersionExpiresAt) {
    return cachedPapersVersion;
  }
  try {
    const redis = redisManager.getClient();
    const v = await redis.get("papers:version");
    cachedPapersVersion = v ? `4_${String(v)}` : "4_0";
    cachedVersionExpiresAt = Date.now() + 60_000; // cache version locally for 60s
    return cachedPapersVersion;
  } catch {
    return cachedPapersVersion;
  }
};

const bumpPapersVersion = async (): Promise<void> => {
  cachedVersionExpiresAt = 0;
  try {
    const redis = redisManager.getClient();
    await redis.incr("papers:version");
  } catch (err) {
    console.error("Redis version bump failed:", err);
  }
};

// ---------------------------------------------------------------------------
// In-memory Cache Protection
// ---------------------------------------------------------------------------

const localMemoryCache = new Map<string, { data: unknown; expiresAt: number }>();
const LOCAL_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_LOCAL_CACHE_SIZE = 5000;

export const clearPaperLocalCache = (): void => {
  localMemoryCache.clear();
};

const setLocalCache = (key: string, data: unknown, ttlMs: number = LOCAL_TTL_MS): void => {
  if (localMemoryCache.size >= MAX_LOCAL_CACHE_SIZE) {
    const oldestKey = localMemoryCache.keys().next().value;
    if (oldestKey) {
      localMemoryCache.delete(oldestKey);
    }
  }
  localMemoryCache.set(key, { data, expiresAt: Date.now() + ttlMs });
};

export const makePapersCacheKey = (
  version: string,
  params: {
    sort?: string;
    task?: string;
    method?: string;
    model?: string;
    organization?: string;
    period?: string;
    page?: number;
    limit?: number;
    cursor?: string;
  }
): string => {
  return `papers:v${version}:${params.sort || "trending"}:${params.period || "all"}:${params.page || 1}:${params.limit || 20}:${params.task || ""}:${params.method || ""}:${params.model || ""}:${params.organization || ""}:${params.cursor || ""}`;
};

let hasPrewarmed = false;
export const prewarmCommonViews = (queryRouter?: QueryRouter, databaseUrl?: string): void => {
  if (hasPrewarmed) return;
  hasPrewarmed = true;

  const dbUrl = databaseUrl || process.env.DATABASE_URL;
  let activeRouter = queryRouter;
  if (dbUrl) {
    const standaloneDb = new DatabaseManager({ DATABASE_URL: dbUrl });
    activeRouter = new QueryRouter(standaloneDb, "30000");
  }
  if (!activeRouter) return;
  const router = activeRouter;

  const targets = [
    // 1. Discovery Links (both limit 20 and limit 25 used by desktop/mobile feeds)
    // Most GitHub Stars
    { sort: "stars", period: "all", limit: 20, page: 1 },
    { sort: "stars", period: "all", limit: 25, page: 1 },
    { sort: "stars", period: "week", limit: 20, page: 1 },
    { sort: "stars", period: "week", limit: 25, page: 1 },
    { sort: "stars", period: "month", limit: 20, page: 1 },
    { sort: "stars", period: "month", limit: 25, page: 1 },
    { sort: "stars", period: "today", limit: 20, page: 1 },
    { sort: "stars", period: "today", limit: 25, page: 1 },

    // Trending Papers
    { sort: "trending", period: "all", limit: 20, page: 1 },
    { sort: "trending", period: "all", limit: 25, page: 1 },
    { sort: "trending", period: "week", limit: 20, page: 1 },
    { sort: "trending", period: "week", limit: 25, page: 1 },
    { sort: "trending", period: "month", limit: 20, page: 1 },
    { sort: "trending", period: "month", limit: 25, page: 1 },
    { sort: "trending", period: "today", limit: 20, page: 1 },
    { sort: "trending", period: "today", limit: 25, page: 1 },

    // Latest Papers
    { sort: "latest", period: "all", limit: 20, page: 1 },
    { sort: "latest", period: "all", limit: 25, page: 1 },
    { sort: "latest", period: "week", limit: 20, page: 1 },
    { sort: "latest", period: "week", limit: 25, page: 1 },
    { sort: "latest", period: "month", limit: 20, page: 1 },
    { sort: "latest", period: "month", limit: 25, page: 1 },
    { sort: "latest", period: "today", limit: 20, page: 1 },
    { sort: "latest", period: "today", limit: 25, page: 1 },

    // 2. All 6 Topic Chips
    // Agents
    { sort: "trending", period: "all", task: "agents", limit: 20, page: 1 },
    { sort: "stars", period: "all", task: "agents", limit: 20, page: 1 },
    { sort: "latest", period: "all", task: "agents", limit: 20, page: 1 },
    { sort: "trending", period: "today", task: "agents", limit: 20, page: 1 },
    { sort: "latest", period: "today", task: "agents", limit: 20, page: 1 },

    // Reasoning
    { sort: "trending", period: "all", task: "reasoning-models", limit: 20, page: 1 },
    { sort: "stars", period: "all", task: "reasoning-models", limit: 20, page: 1 },
    { sort: "latest", period: "all", task: "reasoning-models", limit: 20, page: 1 },
    { sort: "trending", period: "all", task: "reasoning", limit: 20, page: 1 },
    { sort: "trending", period: "today", task: "reasoning-models", limit: 20, page: 1 },
    { sort: "latest", period: "today", task: "reasoning-models", limit: 20, page: 1 },

    // Vision
    { sort: "trending", period: "all", task: "vision-language-models", limit: 20, page: 1 },
    { sort: "stars", period: "all", task: "vision-language-models", limit: 20, page: 1 },
    { sort: "latest", period: "all", task: "vision-language-models", limit: 20, page: 1 },
    { sort: "trending", period: "all", task: "vision", limit: 20, page: 1 },
    { sort: "trending", period: "today", task: "vision-language-models", limit: 20, page: 1 },
    { sort: "latest", period: "today", task: "vision-language-models", limit: 20, page: 1 },

    // Coding
    { sort: "trending", period: "all", task: "coding-agents", limit: 20, page: 1 },
    { sort: "stars", period: "all", task: "coding-agents", limit: 20, page: 1 },
    { sort: "latest", period: "all", task: "coding-agents", limit: 20, page: 1 },
    { sort: "trending", period: "all", task: "coding", limit: 20, page: 1 },
    { sort: "trending", period: "today", task: "coding-agents", limit: 20, page: 1 },
    { sort: "latest", period: "today", task: "coding-agents", limit: 20, page: 1 },

    // Robotics
    { sort: "trending", period: "all", task: "robotics", limit: 20, page: 1 },
    { sort: "stars", period: "all", task: "robotics", limit: 20, page: 1 },
    { sort: "latest", period: "all", task: "robotics", limit: 20, page: 1 },
    { sort: "trending", period: "today", task: "robotics", limit: 20, page: 1 },
    { sort: "latest", period: "today", task: "robotics", limit: 20, page: 1 },

    // MCP
    { sort: "trending", period: "all", method: "model-context-protocol-mcp", limit: 20, page: 1 },
    { sort: "stars", period: "all", method: "model-context-protocol-mcp", limit: 20, page: 1 },
    { sort: "latest", period: "all", method: "model-context-protocol-mcp", limit: 20, page: 1 },
    { sort: "trending", period: "all", method: "mcp", limit: 20, page: 1 },
    { sort: "trending", period: "all", task: "model-context-protocol-mcp", limit: 20, page: 1 },
    { sort: "trending", period: "today", method: "model-context-protocol-mcp", limit: 20, page: 1 },
    { sort: "latest", period: "today", method: "model-context-protocol-mcp", limit: 20, page: 1 },
  ];

  const commonSearchPrefixes = [
    "agent", "agents", "reasoning", "vision", "coding", "robotics", "mcp",
    "trans", "transformer", "transformers", "llm", "diff", "diffusion",
    "multimodal", "deepseek", "mamba", "robot", "eval", "clip", "attention",
    "gpt", "bert", "rl", "reinforcement", "lora", "fine-tuning", "vlm", "model"
  ];

  setTimeout(async () => {
    try {
      const version = await getPapersVersion();
      for (const target of targets) {
        const cacheKey = makePapersCacheKey(version, target);
        if (localMemoryCache.has(cacheKey)) continue;

        try {
          const result = await paperService.getPapers(router, target as any);
          const response = {
            status: "success",
            count: Array.isArray(result?.papers) ? result.papers.length : 0,
            data: result,
          };
          setLocalCache(cacheKey, response);
        } catch {
          // ignore single target failure
        }
        await new Promise((r) => setTimeout(r, 20));
      }

      // Prewarm common search terms for both hero dropdown and global search page
      for (const term of commonSearchPrefixes) {
        // Hero search dropdown (/api/v1/research-papers/search?q=...)
        const searchCacheKey = `search:${term}:relevance:1:20`;
        if (!localMemoryCache.has(searchCacheKey)) {
          try {
            const result = await paperService.searchPapers(router, { q: term, limit: 20, page: 1, sort: "relevance" });
            const response = { status: "success", data: result };
            setLocalCache(searchCacheKey, response, 60 * 60 * 1000);
          } catch {}
        }

        // Global search page (/api/v1/search?q=...)
        try {
          await searchService.globalSearch(router, term, 5);
          await searchService.globalSearch(router, term, 10);
        } catch {}

        await new Promise((r) => setTimeout(r, 20));
      }
    } catch {
      // Non-blocking prewarm
    }
  }, 50);
};

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export const ingestPaper = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;
  const body = await c.req.json();

  if (!body || !body.content) {
    return c.json({ status: "error", message: "Paper content is required" }, 400);
  }

  const newPaper = await paperService.ingestPaper(queryRouter, body.content);

  // Invalidate list cache via version bump
  await bumpPapersVersion();
  clearPaperLocalCache();

  try {
    const redis = redisManager.getClient();
    await redis.del(`paper:${newPaper.slug}`);
  } catch (err) {
    console.error("Redis cache invalidation failed:", err);
  }

  return c.json(
    {
      status: "success",
      message: "Paper successfully ingested",
      paper_id: newPaper.id,
      slug: newPaper.slug,
    },
    201,
  );
};

export const getPapers = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;
  const sort = c.req.query("sort") || "trending";
  const task = c.req.query("task");
  const method = c.req.query("method");
  const model = c.req.query("model");
  const organization = c.req.query("organization");
  const period = c.req.query("period") || "all";
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const cursor = c.req.query("cursor");

  try {
    const version = await getPapersVersion();
    const cacheKey = makePapersCacheKey(version, { sort, task, method, model, organization, period, page, limit, cursor });

    // 1. Check zero-latency in-memory cache
    const localHit = localMemoryCache.get(cacheKey);
    if (localHit && Date.now() < localHit.expiresAt) {
      c.header("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
      return c.json(localHit.data, 200);
    }

    // 2. Check Redis cache
    const redis = redisManager.getClient();
    let cached: unknown = null;
    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error("Redis GET failed:", err);
    }

    if (cached) {
      setLocalCache(cacheKey, cached);
      c.header("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
      return c.json(cached, 200);
    }

    const result = await paperService.getPapers(queryRouter, {
      sort,
      task,
      method,
      model,
      organization,
      period,
      page,
      limit,
      cursor,
    });

    prewarmCommonViews(queryRouter);

    const response = {
      status: "success",
      count: Array.isArray(result?.papers) ? result.papers.length : 0,
      data: result,
    };

    setLocalCache(cacheKey, response);

    try {
      await redis.set(cacheKey, response, { ex: 600 }); // 10 minutes
    } catch (err) {
      console.error("Redis SET failed:", err);
    }

    c.header("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
    return c.json(response, 200);
  } catch (error: unknown) {
    console.error("Error in getPapers controller:", error);
    const message = error instanceof Error ? error.message : String(error);
    const status =
      message.startsWith("Invalid cursor") || message.includes("Cursor sort")
        ? 400
        : 500;
    return c.json(
      {
        status: "error",
        detail: message,
      },
      status,
    );
  }
};

export const getPaperBySlug = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;
  const slug = c.req.param("slug") || "";
  if (!slug) {
    return c.json({ status: "error", message: "Slug is required" }, 400);
  }

  const cacheKey = `paper:${slug}`;

  try {
    // 1. Check local in-memory cache first (0ms)
    const localHit = localMemoryCache.get(cacheKey);
    if (localHit && Date.now() < localHit.expiresAt) {
      c.header("Cache-Control", "public, max-age=180, s-maxage=900, stale-while-revalidate=1800");
      return c.json(localHit.data, 200);
    }

    // 2. Check Redis cache
    const redis = redisManager.getClient();
    let cached: Record<string, unknown> | null = null;

    try {
      cached = (await redis.get(cacheKey)) as Record<string, unknown> | null;
    } catch (err) {
      console.error("Redis GET failed:", err);
    }

    if (cached) {
      if (cached.is404) {
        return c.json(cached, 404);
      }
      setLocalCache(cacheKey, cached);
      c.header("Cache-Control", "public, max-age=180, s-maxage=900, stale-while-revalidate=1800");
      return c.json(cached, 200);
    }

    const paper = await paperService.getPaperBySlug(queryRouter, slug);
    if (!paper) {
      const response404 = { status: "error", message: "Paper not found", is404: true };
      setLocalCache(cacheKey, response404, 60_000);
      try {
        await redis.set(cacheKey, response404, { ex: 60 });
      } catch (err) {
        console.error("Redis SET 404 failed:", err);
      }
      return c.json(response404, 404);
    }

    const response = { status: "success", data: paper };
    setLocalCache(cacheKey, response);

    try {
      await redis.set(cacheKey, response, { ex: 1800 });
    } catch (err) {
      console.error("Redis SET failed:", err);
    }

    c.header("Cache-Control", "public, max-age=180, s-maxage=900, stale-while-revalidate=1800");
    return c.json(response, 200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return c.json({ status: "error", detail: message }, 500);
  }
};

export const getPaperById = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;
  const id = c.req.param("id");

  if (!id) {
    return c.json({ status: "error", message: "ID is required" }, 400);
  }

  const cacheKey = `paper:id:${id}`;

  try {
    // 1. Check local in-memory cache first (0ms)
    const localHit = localMemoryCache.get(cacheKey);
    if (localHit && Date.now() < localHit.expiresAt) {
      c.header("Cache-Control", "public, max-age=180, s-maxage=900, stale-while-revalidate=1800");
      return c.json(localHit.data, 200);
    }

    const redis = redisManager.getClient();

    let cached: Record<string, unknown> | null = null;
    try {
      cached = (await redis.get(cacheKey)) as Record<string, unknown> | null;
    } catch (err) {
      console.error("Redis GET failed:", err);
    }

    if (cached) {
      if (cached.is404) {
        return c.json(cached, 404);
      }
      setLocalCache(cacheKey, cached);
      c.header("Cache-Control", "public, max-age=180, s-maxage=900, stale-while-revalidate=1800");
      return c.json(cached, 200);
    }

    const paper = await paperService.getPaperById(queryRouter, id);
    if (!paper) {
      const response404 = { status: "error", message: "Paper not found", is404: true };
      setLocalCache(cacheKey, response404, 60_000);
      try {
        await redis.set(cacheKey, response404, { ex: 60 });
      } catch (err) {
        console.error("Redis SET 404 failed:", err);
      }
      return c.json(response404, 404);
    }

    const response = { status: "success", data: paper };
    setLocalCache(cacheKey, response);

    try {
      await redis.set(cacheKey, response, { ex: 300 });
    } catch (err) {
      console.error("Redis SET failed:", err);
    }

    c.header("Cache-Control", "public, max-age=180, s-maxage=900, stale-while-revalidate=1800");
    return c.json(response, 200);
  } catch (error: unknown) {
    console.error("[getPaperById] Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return c.json({ status: "error", detail: message }, 500);
  }
};

export const updatePaper = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;
  const slug = c.req.param("slug") || "";
  const body = await c.req.json();

  try {
    const updatedPaper = await paperService.updatePaper(
      queryRouter,
      slug,
      body,
    );

    if (!updatedPaper) {
      return c.json({ status: "error", message: "Paper not found" }, 404);
    }

    await bumpPapersVersion();
    clearPaperLocalCache();

    try {
      const redis = redisManager.getClient();
      await redis.del(`paper:${slug}`);
      if (updatedPaper && typeof updatedPaper === "object" && "id" in updatedPaper) {
        await redis.del(`paper:id:${updatedPaper.id}`);
      }
    } catch (err) {
      console.error("Cache invalidation failed:", err);
    }

    return c.json({ status: "success", data: updatedPaper }, 200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return c.json({ status: "error", detail: message }, 500);
  }
};

export const deletePaper = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;
  const slug = c.req.param("slug") || "";

  try {
    await paperService.deletePaper(queryRouter, slug);

    await bumpPapersVersion();
    clearPaperLocalCache();

    try {
      const redis = redisManager.getClient();
      await redis.del(`paper:${slug}`);
    } catch (err) {
      console.error("Cache invalidation failed:", err);
    }

    return c.json({ status: "success", message: "Paper deleted" }, 200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return c.json({ status: "error", detail: message }, 500);
  }
};

export const searchPapers = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;

  const q = c.req.query("q")?.trim() || "";
  const sort = c.req.query("sort") || "relevance";
  const page = c.req.query("page") ? Number(c.req.query("page")) : 1;
  const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 20;

  const searchQuery = { q, sort, page, limit };

  if (q) {
    const normalizedQ = q.toLowerCase();
    const cacheKey = `search:${normalizedQ}:${sort}:${page}:${limit}`;

    try {
      // 1. Check local in-memory cache first (0ms instant response)
      const localHit = localMemoryCache.get(cacheKey);
      if (localHit && Date.now() < localHit.expiresAt) {
        c.header("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
        return c.json(localHit.data, 200);
      }

      // 2. Check Redis if available
      const redis = redisManager.getClient();
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
          setLocalCache(cacheKey, parsed, 15 * 60 * 1000);
          c.header("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
          return c.json(parsed, 200);
        }
      } catch {
        // Non-blocking fallback
      }

      // 3. Query database with pg_trgm index
      const result = await paperService.searchPapers(queryRouter, searchQuery);
      const response = { status: "success", data: result };

      // Cache locally: 15 min for results, 2 min for empty queries
      const hasPapers = Array.isArray(result?.papers) && result.papers.length > 0;
      setLocalCache(cacheKey, response, hasPapers ? 15 * 60 * 1000 : 2 * 60 * 1000);

      // Save to Redis in background (non-blocking)
      try {
        redis.set(cacheKey, response, { ex: 300 }).catch(() => {});
      } catch {
        // Non-blocking
      }

      c.header("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
      return c.json(response, 200);
    } catch (error: unknown) {
      console.error("Search error:", error);
      const message = error instanceof Error ? error.message : "Search failed";
      return c.json({ status: "error", message }, 500);
    }
  }

  try {
    const result = await paperService.searchPapers(queryRouter, searchQuery);
    c.header("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
    return c.json({ status: "success", data: result }, 200);
  } catch (error: unknown) {
    console.error("Search error:", error);
    const message = error instanceof Error ? error.message : "Search failed";
    return c.json({ status: "error", message }, 500);
  }
};

export const checkSavedPaper = async (c: Context) => {
  const prisma = c.get("prisma");
  const userId = c.get("userId") || c.get("user")?.id || c.get("user");
  const paper_id = c.req.query("paper_id");

  if (!userId || !paper_id) {
    return c.json({ isSaved: false });
  }

  try {
    const existingSave = await prisma.savedPaper.findUnique({
      where: {
        user_id_paper_id: {
          user_id: userId,
          paper_id: paper_id,
        },
      },
    });

    return c.json({ isSaved: !!existingSave });
  } catch (error) {
    console.error("Error checking saved paper:", error);
    return c.json({ isSaved: false }, 500);
  }
};

export const toggleSavePaper = async (c: Context) => {
  const prisma = c.get("prisma");
  const userId = c.get("userId") || c.get("user")?.id || c.get("user");

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const paper_id = body?.paper_id;

    if (!paper_id) {
      return c.json({ error: "Paper ID is required" }, 400);
    }

    const existingSave = await prisma.savedPaper.findUnique({
      where: {
        user_id_paper_id: {
          user_id: userId,
          paper_id: paper_id,
        },
      },
    });

    if (existingSave) {
      await prisma.savedPaper.delete({
        where: {
          user_id_paper_id: {
            user_id: userId,
            paper_id: paper_id,
          },
        },
      });
      return c.json({ isSaved: false });
    } else {
      await prisma.savedPaper.create({
        data: {
          user_id: userId,
          paper_id: paper_id,
        },
      });
      return c.json({ isSaved: true });
    }
  } catch (error) {
    console.error("Error toggling saved paper:", error);
    return c.json({ error: "Failed to toggle saved paper" }, 500);
  }
};

export const getSavedPapers = async (c: Context) => {
  const prisma = c.get("prisma");
  const userId = c.get("userId") || c.get("user")?.id || c.get("user");

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const savedRecords = await prisma.savedPaper.findMany({
      where: { user_id: userId },
      include: { paper: true },
      orderBy: { created_at: "desc" },
    });

    const papers = Array.isArray(savedRecords)
      ? savedRecords.map((record: { paper: unknown }) => record.paper)
      : [];

    return c.json({ papers });
  } catch (error) {
    console.error("Error fetching saved papers:", error);
    return c.json({ error: "Failed to fetch saved papers" }, 500);
  }
};

export const getOrganizationMetrics = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;
  const organization = c.req.query("organization");

  try {
    const version = await getPapersVersion();
    const cacheKey = `org_metrics:v${version}:${organization || "all"}`;

    const localHit = localMemoryCache.get(cacheKey);
    if (localHit && Date.now() < localHit.expiresAt) {
      c.header("Cache-Control", "public, max-age=300, s-maxage=1800, stale-while-revalidate=3600");
      return c.json(localHit.data, 200);
    }

    const redis = redisManager.getClient();
    let cached = null;
    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error("Redis GET failed:", err);
    }

    if (cached) {
      localMemoryCache.set(cacheKey, { data: cached, expiresAt: Date.now() + LOCAL_TTL_MS });
      c.header("Cache-Control", "public, max-age=300, s-maxage=1800, stale-while-revalidate=3600");
      return c.json(cached as any, 200);
    }

    const metricsRes: any = await paperService.getOrganizationMetrics(queryRouter, organization);
    const metrics = Array.isArray(metricsRes) ? metricsRes : (metricsRes?.data || []);

    const counts: Record<string, number> = {};
    const citations: Record<string, number> = {};
    const stars: Record<string, number> = {};
    const trendingScores: Record<string, number> = {};

    for (const item of metrics) {
      counts[item.organization] = item.paperCount;
      citations[item.organization] = item.citations;
      stars[item.organization] = item.stars;
      trendingScores[item.organization] = item.trendingScore;
    }

    const response = {
      status: "success",
      count: metrics.length,
      data: metrics,
      counts,
      citations,
      stars,
      trendingScores,
    };

    localMemoryCache.set(cacheKey, { data: response, expiresAt: Date.now() + LOCAL_TTL_MS });

    try {
      await redis.set(cacheKey, response, { ex: 600 });
    } catch (err) {
      console.error("Redis SET failed:", err);
    }

    c.header("Cache-Control", "public, max-age=300, s-maxage=1800, stale-while-revalidate=3600");
    return c.json(response, 200);
  } catch (error: any) {
    console.error("Error in getOrganizationMetrics controller:", error);
    return c.json(
      {
        status: "error",
        detail: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
};