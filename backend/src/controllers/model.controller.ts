import { Context } from 'hono';
import * as modelService from '../services/model.service.js';
import { QueryRouter } from '../routing/index.js';
import { redisManager } from '../lib/redis.js';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const MEMORY_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

function getFromMemoryCache<T>(key: string): T | null {
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return item.data as T;
}

function setToMemoryCache<T>(key: string, data: T, ttlMs: number = MEMORY_CACHE_TTL_MS): void {
  memoryCache.set(key, { data, expiresAt: Date.now() + ttlMs });
  if (memoryCache.size > 500) {
    const now = Date.now();
    for (const [k, v] of memoryCache.entries()) {
      if (now > v.expiresAt) memoryCache.delete(k);
    }
    if (memoryCache.size > 500) {
      const firstKey = memoryCache.keys().next().value;
      if (firstKey) memoryCache.delete(firstKey);
    }
  }
}

function parseRedisCachedData<T>(cached: unknown): T | null {
  if (!cached) return null;
  if (typeof cached === 'string') {
    try {
      return JSON.parse(cached) as T;
    } catch {
      return null;
    }
  }
  return cached as T;
}

export const getModels = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;

  const rawLimit = Number(c.req.query('limit'));
  const rawSkip = Number(c.req.query('skip'));

  const limit = !isNaN(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 10000) : 50;
  const skip = !isNaN(rawSkip) && rawSkip >= 0 ? rawSkip : 0;
  const sort = c.req.query('sort') || 'name';

  const vendor = c.req.query('vendor');
  const modality = c.req.query('modality');
  const accessType = c.req.query('accessType');
  const opennessType = c.req.query('opennessType');
  const modelFamily = c.req.query('modelFamily');
  const category = c.req.query('category');
  const capability = c.req.query('capability');
  const researchArea = c.req.query('researchArea');

  const cacheKey = [
    'models:list',
    limit,
    skip,
    sort,
    vendor || 'all',
    modality || 'all',
    accessType || 'all',
    opennessType || 'all',
    modelFamily || 'all',
    category || 'all',
    capability || 'all',
    researchArea || 'all',
  ].join(':');

  try {
    const memCached = getFromMemoryCache<any>(cacheKey);
    if (memCached) {
      c.header('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600');
      return c.json(memCached, 200);
    }

    const redis = redisManager.getClient();
    let redisRaw = null;

    try {
      redisRaw = await redis.get(cacheKey);
    } catch (err) {
      console.error('Redis GET failed:', err);
    }

    const parsedRedis = parseRedisCachedData<any>(redisRaw);
    if (parsedRedis) {
      setToMemoryCache(cacheKey, parsedRedis);
      c.header('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600');
      return c.json(parsedRedis, 200);
    }

    const models = await modelService.getModels(
      queryRouter,
      limit,
      skip,
      sort,
      vendor,
      modality,
      accessType,
      opennessType,
      modelFamily,
      category,
      capability,
      researchArea
    );

    const response = {
      status: 'success',
      count: models.length,
      data: models,
    };

    setToMemoryCache(cacheKey, response);

    try {
      const p = redis.set(cacheKey, response, { ex: 900 }).catch(() => {});
      if ((c as any).executionCtx?.waitUntil) {
        (c as any).executionCtx.waitUntil(p);
      }
    } catch (err) {
      console.error('Redis SET failed:', err);
    }

    c.header('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600');
    return c.json(response, 200);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in getModels controller:', error);

    return c.json(
      {
        status: 'error',
        detail: errorMessage,
      },
      500
    );
  }
};

export const getModelFacets = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;
  const cacheKey = 'models:facets';

  try {
    const memCached = getFromMemoryCache<any>(cacheKey);
    if (memCached) {
      c.header('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=7200');
      return c.json(memCached, 200);
    }

    const redis = redisManager.getClient();
    let redisRaw = null;

    try {
      redisRaw = await redis.get(cacheKey);
    } catch (err) {
      console.error('Redis GET failed:', err);
    }

    const parsedRedis = parseRedisCachedData<any>(redisRaw);
    if (parsedRedis) {
      setToMemoryCache(cacheKey, parsedRedis);
      c.header('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=7200');
      return c.json(parsedRedis, 200);
    }

    const facets = await modelService.getModelFacets(queryRouter);

    const response = {
      status: 'success',
      data: facets,
    };

    setToMemoryCache(cacheKey, response);

    try {
      const p = redis.set(cacheKey, response, { ex: 1800 }).catch(() => {});
      if ((c as any).executionCtx?.waitUntil) {
        (c as any).executionCtx.waitUntil(p);
      }
    } catch (err) {
      console.error('Redis SET failed:', err);
    }

    c.header('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=7200');
    return c.json(response, 200);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in getModelFacets controller:', error);

    return c.json(
      {
        status: 'error',
        detail: errorMessage,
      },
      500
    );
  }
};

export const getModelBySlug = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;
  const rawSlug = c.req.param('slug') as string;
  const slug = rawSlug ? decodeURIComponent(rawSlug).toLowerCase().trim() : '';

  if (!slug) {
    return c.json(
      {
        status: 'error',
        message: 'Invalid or missing slug parameter',
      },
      400
    );
  }

  const cacheKey = `model:${slug}`;

  try {
    const memCached = getFromMemoryCache<any>(cacheKey);
    if (memCached) {
      if (memCached.is404) {
        return c.json(memCached, 404);
      }
      c.header('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600');
      return c.json(memCached, 200);
    }

    const redis = redisManager.getClient();
    let redisRaw = null;

    try {
      redisRaw = await redis.get(cacheKey);
    } catch (err) {
      console.error('Redis GET failed:', err);
    }

    const parsedRedis = parseRedisCachedData<any>(redisRaw);
    if (parsedRedis) {
      setToMemoryCache(cacheKey, parsedRedis);
      if (parsedRedis.is404) {
        return c.json(parsedRedis, 404);
      }
      c.header('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600');
      return c.json(parsedRedis, 200);
    }

    const model = await modelService.getModelBySlug(queryRouter, slug);

    if (!model) {
      const response404 = {
        status: 'error',
        message: 'Model not found',
        is404: true,
      };
      setToMemoryCache(cacheKey, response404, 60_000);
      try {
        const p404 = redis.set(cacheKey, response404, { ex: 60 }).catch(() => {});
        if ((c as any).executionCtx?.waitUntil) {
          (c as any).executionCtx.waitUntil(p404);
        }
      } catch (err) {
        console.error('Redis SET 404 failed:', err);
      }
      return c.json(response404, 404);
    }

    const response = {
      status: 'success',
      data: model,
    };

    setToMemoryCache(cacheKey, response);

    try {
      const p = redis.set(cacheKey, response, { ex: 3600 }).catch(() => {});
      if ((c as any).executionCtx?.waitUntil) {
        (c as any).executionCtx.waitUntil(p);
      }
    } catch (err) {
      console.error('Redis SET failed:', err);
    }

    c.header('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600');
    return c.json(response, 200);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in getModelBySlug controller:', error);

    return c.json(
      {
        status: 'error',
        detail: errorMessage,
      },
      500
    );
  }
};