import { Context } from 'hono';
import * as modelService from '../services/model.service.js';
import { QueryRouter } from '../routing/index.js';
import { redisManager } from '../lib/redis.js';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const MEMORY_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

function getFromMemoryCache<T>(key: string): T | null {
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > MEMORY_CACHE_TTL_MS) {
    memoryCache.delete(key);
    return null;
  }
  return item.data as T;
}

function setToMemoryCache<T>(key: string, data: T): void {
  memoryCache.set(key, { data, timestamp: Date.now() });
  if (memoryCache.size > 3000) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) memoryCache.delete(firstKey);
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
    const memCached = getFromMemoryCache(cacheKey);
    if (memCached) {
      return c.json(memCached, 200);
    }

    const redis = redisManager.getClient();
    let redisRaw = null;

    try {
      redisRaw = await redis.get(cacheKey);
    } catch (err) {
      console.error('Redis GET failed:', err);
    }

    const parsedRedis = parseRedisCachedData(redisRaw);
    if (parsedRedis) {
      setToMemoryCache(cacheKey, parsedRedis);
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
      await redis.set(cacheKey, response, { ex: 900 });
    } catch (err) {
      console.error('Redis SET failed:', err);
    }

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
    const memCached = getFromMemoryCache(cacheKey);
    if (memCached) {
      return c.json(memCached, 200);
    }

    const redis = redisManager.getClient();
    let redisRaw = null;

    try {
      redisRaw = await redis.get(cacheKey);
    } catch (err) {
      console.error('Redis GET failed:', err);
    }

    const parsedRedis = parseRedisCachedData(redisRaw);
    if (parsedRedis) {
      setToMemoryCache(cacheKey, parsedRedis);
      return c.json(parsedRedis, 200);
    }

    const facets = await modelService.getModelFacets(queryRouter);

    const response = {
      status: 'success',
      data: facets,
    };

    setToMemoryCache(cacheKey, response);

    try {
      await redis.set(cacheKey, response, { ex: 900 });
    } catch (err) {
      console.error('Redis SET failed:', err);
    }

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
    const memCached = getFromMemoryCache(cacheKey);
    if (memCached) {
      return c.json(memCached, 200);
    }

    const redis = redisManager.getClient();
    let redisRaw = null;

    try {
      redisRaw = await redis.get(cacheKey);
    } catch (err) {
      console.error('Redis GET failed:', err);
    }

    const parsedRedis = parseRedisCachedData(redisRaw);
    if (parsedRedis) {
      setToMemoryCache(cacheKey, parsedRedis);
      return c.json(parsedRedis, 200);
    }

    const model = await modelService.getModelBySlug(queryRouter, slug);

    if (!model) {
      return c.json(
        {
          status: 'error',
          message: 'Model not found',
        },
        404
      );
    }

    const response = {
      status: 'success',
      data: model,
    };

    setToMemoryCache(cacheKey, response);

    try {
      await redis.set(cacheKey, response, { ex: 600 });
    } catch (err) {
      console.error('Redis SET failed:', err);
    }

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