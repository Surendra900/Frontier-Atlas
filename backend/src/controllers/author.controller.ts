import { Context } from 'hono';
import * as authorService from '../services/author.service.js';
import { QueryRouter } from '../routing/index.js';
import { redisManager } from '../lib/redis.js';

export const getAuthors = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;
  const limit = Number(c.req.query('limit')) || 50;
  const skip = Number(c.req.query('skip')) || 0;

  const cacheKey = `authors:list:${limit}:${skip}`;

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

    const authors = await authorService.getAuthors(queryRouter, limit, skip);
    const response = { status: 'success', count: authors.length, data: authors };

    try {
      await redis.set(cacheKey, response, { ex: 900 }); // 15 minutes — authors change only via paper imports
    } catch (err) {
      console.error('Redis SET failed:', err);
    }

    return c.json(response, 200);
  } catch (error: any) {
    return c.json({ status: 'error', detail: error.message }, 500);
  }
};

export const getAuthorBySlug = async (c: Context) => {
  const queryRouter = c.var.queryRouter as QueryRouter;
  const slug = c.req.param('slug') as string;
  const cacheKey = `author:${slug}`;

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

    const author = await authorService.getAuthorBySlug(queryRouter, slug);
    if (!author) return c.json({ status: 'error', message: 'Author not found' }, 404);

    const response = { status: 'success', data: author };

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
