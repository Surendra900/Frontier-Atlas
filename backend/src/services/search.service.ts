import type { PrismaClient } from "../generated/prisma/client.js";
import { QueryRouter } from "../routing/index.js";
import { redisManager } from "../lib/redis.js";

// In-memory cache for ultra-fast (0ms) global search responses
const localGlobalSearchCache = new Map<string, { data: any; expiresAt: number }>();
const GLOBAL_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_GLOBAL_CACHE_SIZE = 2000;

const setLocalGlobalCache = (key: string, data: any, ttlMs: number = GLOBAL_CACHE_TTL_MS) => {
  if (localGlobalSearchCache.size >= MAX_GLOBAL_CACHE_SIZE) {
    const oldestKey = localGlobalSearchCache.keys().next().value;
    if (oldestKey) {
      localGlobalSearchCache.delete(oldestKey);
    }
  }
  localGlobalSearchCache.set(key, { data, expiresAt: Date.now() + ttlMs });
};

export const globalSearch = async (
  queryRouter: QueryRouter,
  query: string,
  limit: number = 5
) => {
  const searchTerm = query.trim().toLowerCase();

  if (!searchTerm) {
    return {
      papers: [],
      methods: [],
      tasks: [],
      models: [],
      datasets: [],
    };
  }

  const cacheKey = `search:global:${searchTerm}:${limit}`;

  // 1. Check local in-memory cache first (0ms instant response)
  const localHit = localGlobalSearchCache.get(cacheKey);
  if (localHit && Date.now() < localHit.expiresAt) {
    return localHit.data;
  }

  // 2. Check Redis cache if configured
  const redis = redisManager.getClient();
  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      const parsed = typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;
      setLocalGlobalCache(cacheKey, parsed);
      return parsed;
    }
  } catch (err) {
    // Redis optional fallback
  }

  // 3. Fast indexed database queries using pg_trgm GIN indexes
  const results = await queryRouter.routeQuery(async (prisma: PrismaClient) => {
    const pattern = `%${searchTerm}%`;

    const [papers, methods, tasks, models, datasets] = await Promise.all([
      prisma.$queryRawUnsafe<any[]>(
        `SELECT id, slug, title, github_stars as "githubStars", citation_count as "citationCount", authors, thumbnail_url as "thumbnailUrl", project_url as "projectUrl"
         FROM papers
         WHERE title ILIKE $1 OR authors ILIKE $1
         ORDER BY github_stars DESC NULLS LAST
         LIMIT $2`,
        pattern,
        limit * 3
      ),

      prisma.method.findMany({
        where: {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        take: limit,
        select: {
          id: true,
          slug: true,
          name: true,
        },
      }),

      prisma.task.findMany({
        where: {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        take: limit,
        select: {
          id: true,
          slug: true,
          name: true,
        },
      }),

      prisma.model.findMany({
        where: {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        take: limit,
        select: {
          id: true,
          slug: true,
          name: true,
        },
      }),

      prisma.dataset.findMany({
        where: {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        take: limit,
        select: {
          id: true,
          slug: true,
          name: true,
        },
      }),
    ]);

    const safePapers = Array.isArray(papers) ? papers : [];
    const uniquePapers = Array.from(
      new Map(safePapers.map((paper: any) => [paper.slug, paper])).values()
    );

    return {
      papers: uniquePapers.slice(0, limit).map((p: any) => ({
        type: "papers",
        id: p.id,
        title: p.title,
        slug: p.slug,
        subtitle: p.authors
          ? `${p.authors} • ${p.citationCount || 0} citations`
          : `${p.citationCount || 0} citations`,
      })),

      methods: (methods || []).map((m) => ({
        type: "methods",
        id: m.id,
        title: m.name,
        slug: m.slug,
      })),

      tasks: (tasks || []).map((t) => ({
        type: "tasks",
        id: t.id,
        title: t.name,
        slug: t.slug,
      })),

      models: (models || []).map((m) => ({
        type: "models",
        id: m.id,
        title: m.name,
        slug: m.slug,
      })),

      datasets: (datasets || []).map((d) => ({
        type: "datasets",
        id: d.id,
        title: d.name,
        slug: d.slug,
      })),
    };
  });

  // 4. Cache in local memory
  setLocalGlobalCache(cacheKey, results);

  // 5. Asynchronously cache in Redis without blocking
  try {
    redis.set(cacheKey, JSON.stringify(results), { ex: 300 }).catch(() => {});
  } catch {
    // Non-blocking
  }

  return results;
};