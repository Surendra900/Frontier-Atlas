import { Context } from 'hono';
import * as taskService from '../services/task.service.js';
import { QueryRouter } from '../routing/index.js';
import { redisManager } from '../lib/redis.js';

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const localTaskCache = new Map<string, CacheEntry>();
const LOCAL_TASK_TTL = 15 * 60 * 1000; // 15 minutes
const MAX_LOCAL_CACHE_SIZE = 500;

function setLocalCache(key: string, data: unknown, ttlMs = LOCAL_TASK_TTL) {
  if (localTaskCache.size >= MAX_LOCAL_CACHE_SIZE) {
    const firstKey = localTaskCache.keys().next().value;
    if (firstKey) localTaskCache.delete(firstKey);
  }
  localTaskCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function invalidateTaskCache(key: string) {
  localTaskCache.delete(key);
}

export function clearAllTaskCache() {
  localTaskCache.clear();
}

export const getTasks = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;
  const limit = Math.max(Number(c.req.query('limit')) || 50, 1);
  const skip = Math.max(Number(c.req.query('skip')) || 0, 0);

  const cacheKey = `tasks:list:${limit}:${skip}`;
  c.header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');

  try {
    const localHit = localTaskCache.get(cacheKey);
    if (localHit && Date.now() < localHit.expiresAt) {
      return c.json(localHit.data, 200);
    }

    const redis = redisManager.getClient();
    let cached = null;

    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error('Redis GET failed in getTasks:', err);
    }

    if (cached) {
      const parsedData = typeof cached === 'string' ? JSON.parse(cached) : cached;
      setLocalCache(cacheKey, parsedData);
      return c.json(parsedData, 200);
    }

    const tasks = await taskService.getTasks(queryRouter, limit, skip);
    const response = { status: 'success', count: Array.isArray(tasks) ? tasks.length : 0, data: tasks };

    setLocalCache(cacheKey, response);

    try {
      await redis.set(cacheKey, response, { ex: 1800 }); // 30 minutes — tasks are very stable taxonomy
    } catch (err) {
      console.error('Redis SET failed in getTasks:', err);
    }

    return c.json(response, 200);
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : 'Internal server error';
    return c.json({ status: 'error', detail }, 500);
  }
};

export const getTaskPaperCounts = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;
  const cacheKey = `tasks:counts`;
  c.header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');

  try {
    const localHit = localTaskCache.get(cacheKey);
    if (localHit && Date.now() < localHit.expiresAt) {
      return c.json(localHit.data, 200);
    }

    const redis = redisManager.getClient();
    let cached = null;

    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error('Redis GET failed in getTaskPaperCounts:', err);
    }

    if (cached) {
      const parsedData = typeof cached === 'string' ? JSON.parse(cached) : cached;
      setLocalCache(cacheKey, parsedData);
      return c.json(parsedData, 200);
    }

    const counts = await taskService.getTaskPaperCounts(queryRouter);
    setLocalCache(cacheKey, counts);

    try {
      await redis.set(cacheKey, counts, { ex: 600 }); // 10 minutes — counts change when papers are added
    } catch (err) {
      console.error('Redis SET failed in getTaskPaperCounts:', err);
    }

    return c.json(counts, 200);
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : 'Internal server error';
    return c.json({ status: 'error', detail }, 500);
  }
};

export const getTaskBySlug = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;
  const rawSlug = c.req.param('slug');

  if (!rawSlug || typeof rawSlug !== 'string' || rawSlug.trim().length === 0) {
    return c.json({ status: 'error', message: 'Invalid slug parameter' }, 400);
  }

  const slug = rawSlug.trim();
  const cacheKey = `task:${slug}`;
  c.header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');

  try {
    const localHit = localTaskCache.get(cacheKey);
    if (localHit && Date.now() < localHit.expiresAt) {
      return c.json(localHit.data, 200);
    }

    const redis = redisManager.getClient();
    let cached = null;

    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error('Redis GET failed in getTaskBySlug:', err);
    }

    if (cached) {
      const parsedData = typeof cached === 'string' ? JSON.parse(cached) : cached;
      setLocalCache(cacheKey, parsedData);
      return c.json(parsedData, 200);
    }

    const task = await taskService.getTaskBySlug(queryRouter, slug);
    if (!task) return c.json({ status: 'error', message: 'Task not found' }, 404);

    const response = { status: 'success', data: task };
    setLocalCache(cacheKey, response);

    try {
      await redis.set(cacheKey, response, { ex: 600 }); // 10 minutes
    } catch (err) {
      console.error('Redis SET failed in getTaskBySlug:', err);
    }

    return c.json(response, 200);
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : 'Internal server error';
    return c.json({ status: 'error', detail }, 500);
  }
};