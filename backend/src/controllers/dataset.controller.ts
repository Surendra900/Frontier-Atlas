import { Context } from 'hono';
import * as datasetService from '../services/dataset.service.js';
import { QueryRouter } from '../routing/index.js';
import { redisManager } from '../lib/redis.js';

export const getDatasets = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;
  const limit = Number(c.req.query('limit')) || 50;
  const skip = Number(c.req.query('skip')) || 0;

  const cacheKey = `datasets:list:${limit}:${skip}`;

  try {
    const redis = redisManager.getClient();
    let cached = null;

    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error('Redis GET failed:', err);
    }

    if (cached) {
      return c.json(cached as any, 200);
    }

    const datasets = await datasetService.getDatasets(queryRouter, limit, skip);
    const response = { status: 'success', count: datasets.length, data: datasets };

    try {
      await redis.set(cacheKey, response, { ex: 900 }); // 15 minutes — datasets added via paper imports
    } catch (err) {
      console.error('Redis SET failed:', err);
    }

    return c.json(response, 200);
  } catch (error: any) {
    return c.json({ status: 'error', detail: error.message }, 500);
  }
};

export const getDatasetBySlug = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;
  const slug = c.req.param('slug') as string;
  const cacheKey = `dataset:${slug}`;

  try {
    const redis = redisManager.getClient();
    let cached = null;

    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error('Redis GET failed:', err);
    }

    if (cached) {
      return c.json(cached as any, 200);
    }

    const dataset = await datasetService.getDatasetBySlug(queryRouter, slug);
    if (!dataset) return c.json({ status: 'error', message: 'Dataset not found' }, 404);

    const response = { status: 'success', data: dataset };

    try {
      await redis.set(cacheKey, response, { ex: 600 }); // 10 minutes
    } catch (err) {
      console.error('Redis SET failed:', err);
    }

    return c.json(response, 200);
  } catch (error: any) {
    return c.json({ status: 'error', detail: error.message }, 500);
  }
};
