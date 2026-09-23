import { Context } from "hono";
import * as paperService from "../services/paper.service.js";
import { redisManager } from "../lib/redis.js";
import { QueryRouter } from "../routing/index.js";

// ---------------------------------------------------------------------------
// Version-counter helpers
// Maintains a lightweight integer version in Redis for list cache invalidation.
// ---------------------------------------------------------------------------

const getPapersVersion = async (): Promise<string> => {
  try {
    const redis = redisManager.getClient();
    const v = await redis.get("papers:version");
    return v ? String(v) : "0";
  } catch {
    return "0";
  }
};

const bumpPapersVersion = async (): Promise<void> => {
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
const LOCAL_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_LOCAL_CACHE_SIZE = 500;

export const clearPaperLocalCache = (): void => {
  localMemoryCache.clear();
};

const setLocalCache = (key: string, data: unknown): void => {
  if (localMemoryCache.size >= MAX_LOCAL_CACHE_SIZE) {
    const oldestKey = localMemoryCache.keys().next().value;
    if (oldestKey) {
      localMemoryCache.delete(oldestKey);
    }
  }
  localMemoryCache.set(key, { data, expiresAt: Date.now() + LOCAL_TTL_MS });
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
    const cacheKey = `papers:v${version}:${JSON.stringify({ sort, task, method, model, organization, period, page, limit, cursor })}`;

    // 1. Check zero-latency in-memory cache
    const localHit = localMemoryCache.get(cacheKey);
    if (localHit && Date.now() < localHit.expiresAt) {
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
      return c.json(cached, 200);
    }

    const paper = await paperService.getPaperBySlug(queryRouter, slug);
    if (!paper) {
      const response404 = { status: "error", message: "Paper not found", is404: true };
      try {
        await redis.set(cacheKey, response404, { ex: 60 });
      } catch (err) {
        console.error("Redis SET 404 failed:", err);
      }
      return c.json(response404, 404);
    }

    const response = { status: "success", data: paper };

    try {
      await redis.set(cacheKey, response, { ex: 1800 });
    } catch (err) {
      console.error("Redis SET failed:", err);
    }

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
      return c.json(cached, 200);
    }

    const paper = await paperService.getPaperById(queryRouter, id);
    if (!paper) {
      const response404 = { status: "error", message: "Paper not found", is404: true };
      try {
        await redis.set(cacheKey, response404, { ex: 60 });
      } catch (err) {
        console.error("Redis SET 404 failed:", err);
      }
      return c.json(response404, 404);
    }

    const response = { status: "success", data: paper };

    try {
      await redis.set(cacheKey, response, { ex: 300 });
    } catch (err) {
      console.error("Redis SET failed:", err);
    }

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
      const redis = redisManager.getClient();

      let cached: unknown = null;
      try {
        cached = await redis.get(cacheKey);
      } catch (err) {
        console.error("Redis GET failed:", err);
      }

      if (cached) {
        return c.json(cached, 200);
      }

      const result = await paperService.searchPapers(queryRouter, searchQuery);
      const response = { status: "success", data: result };

      if (Array.isArray(result?.papers) && result.papers.length > 0) {
        try {
          await redis.set(cacheKey, response, { ex: 300 });
        } catch (err) {
          console.error("Redis SET failed:", err);
        }
      }

      return c.json(response, 200);
    } catch (error: unknown) {
      console.error("Search error:", error);
      const message = error instanceof Error ? error.message : "Search failed";
      return c.json({ status: "error", message }, 500);
    }
  }

  try {
    const result = await paperService.searchPapers(queryRouter, searchQuery);
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