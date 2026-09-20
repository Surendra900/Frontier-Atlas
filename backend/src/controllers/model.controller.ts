import { Context } from 'hono';
import * as modelService from '../services/model.service.js';
import { QueryRouter } from '../routing/index.js';
import { redisManager } from '../lib/redis.js';

const memoryCache = new Map<string, { data: any; timestamp: number }>();
const MEMORY_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

function getFromMemoryCache(key: string): any | null {
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > MEMORY_CACHE_TTL_MS) {
    memoryCache.delete(key);
    return null;
  }
  return item.data;
}

function setToMemoryCache(key: string, data: any) {
  memoryCache.set(key, { data, timestamp: Date.now() });
  if (memoryCache.size > 3000) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) memoryCache.delete(firstKey);
  }
}

export const getModels = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;

  const limit = Number(c.req.query('limit')) || 50;
  const skip = Number(c.req.query('skip')) || 0;
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
    c.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    const memCached = getFromMemoryCache(cacheKey);
    if (memCached) {
      return c.json(memCached, 200);
    }

    const redis = redisManager.getClient();
    let cached = null;

    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error('Redis GET failed:', err);
    }

    if (cached) {
      setToMemoryCache(cacheKey, cached);
      return c.json(cached as any, 200);
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
      researchArea,
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
  } catch (error: any) {
    console.error('Error in getModels controller:', error);

    return c.json(
      {
        status: 'error',
        detail: error.message,
      },
      500,
    );
  }
};

export const getModelFacets = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;
  const cacheKey = 'models:facets';

  try {
    c.header('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    const memCached = getFromMemoryCache(cacheKey);
    if (memCached) {
      return c.json(memCached, 200);
    }

    const redis = redisManager.getClient();
    let cached = null;

    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error('Redis GET failed:', err);
    }

    if (cached) {
      setToMemoryCache(cacheKey, cached);
      return c.json(cached as any, 200);
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
  } catch (error: any) {
    console.error('Error in getModelFacets controller:', error);

    return c.json(
      {
        status: 'error',
        detail: error.message,
      },
      500,
    );
  }
};

export const getModelBySlug = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;
  const slug = c.req.param('slug') as string;

  const cacheKey = `model:${slug}`;

  try {
    c.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    const memCached = getFromMemoryCache(cacheKey);
    if (memCached) {
      return c.json(memCached, 200);
    }

    const redis = redisManager.getClient();
    let cached = null;

    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error('Redis GET failed:', err);
    }

    if (cached) {
      setToMemoryCache(cacheKey, cached);
      return c.json(cached as any, 200);
    }

    const model = await modelService.getModelBySlug(queryRouter, slug);

    if (!model) {
      return c.json(
        {
          status: 'error',
          message: 'Model not found',
        },
        404,
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
  } catch (error: any) {
    return c.json(
      {
        status: 'error',
        detail: error.message,
      },
      500,
    );
  }
};

export const compareModels = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;
  const slugsParam = c.req.query('slugs') || '';
  const slugs = slugsParam.split(',').map((s) => s.trim()).filter(Boolean);

  if (slugs.length < 2) {
    return c.json(
      {
        status: 'error',
        message: 'Please provide at least two model slugs to compare, e.g. ?slugs=llama-3-1-8b,phi-3-5',
      },
      400,
    );
  }

  const sortedKey = [...slugs].sort().join(',');
  const cacheKey = `models:compare:${sortedKey}`;

  try {
    c.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    const memCached = getFromMemoryCache(cacheKey);
    if (memCached) {
      return c.json(memCached, 200);
    }

    const redis = redisManager.getClient();
    let cached = null;
    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error('Redis GET failed:', err);
    }

    if (cached) {
      setToMemoryCache(cacheKey, cached);
      return c.json(cached as any, 200);
    }

    const comparison = await modelService.compareModels(queryRouter, slugs);

    const response = {
      status: 'success',
      data: comparison,
    };

    setToMemoryCache(cacheKey, response);

    try {
      await redis.set(cacheKey, response, { ex: 600 });
    } catch (err) {
      console.error('Redis SET failed:', err);
    }

    return c.json(response, 200);
  } catch (error: any) {
    console.error('Error in compareModels controller:', error);
    return c.json(
      {
        status: 'error',
        message: error.message || 'Failed to compare models',
      },
      500,
    );
  }
};