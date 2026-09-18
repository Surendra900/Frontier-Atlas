import { Context } from 'hono';
import * as benchmarkService from '../services/benchmark.service.js';
import { redisManager } from '../lib/redis.js';

const localBenchmarkCache = new Map<string, { data: any; expiresAt: number }>();
const LOCAL_BENCHMARK_TTL = 15 * 60 * 1000; // 15 minutes

export const getBenchmarks = async (c: Context) => {
  const prisma = c.var.prisma;
  const limit = Number(c.req.query('limit')) || 50;
  const skip = Number(c.req.query('skip')) || 0;

  const cacheKey = `benchmarks:list:${limit}:${skip}`;

  c.header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');

  try {
    const localHit = localBenchmarkCache.get(cacheKey);
    if (localHit && Date.now() < localHit.expiresAt) {
      return c.json(localHit.data, 200);
    }

    const redis = redisManager.getClient();
    let cached = null;

    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error('Redis GET failed:', err);
    }

    if (cached) {
      localBenchmarkCache.set(cacheKey, { data: cached, expiresAt: Date.now() + LOCAL_BENCHMARK_TTL });
      return c.json(cached as any, 200);
    }

    const benchmarks = await benchmarkService.getBenchmarks(prisma, limit, skip);
    const response = { status: 'success', count: benchmarks.length, data: benchmarks };

    localBenchmarkCache.set(cacheKey, { data: response, expiresAt: Date.now() + LOCAL_BENCHMARK_TTL });

    try {
      await redis.set(cacheKey, response, { ex: 1800 }); // 30 minutes — benchmarks are very stable
    } catch (err) {
      console.error('Redis SET failed:', err);
    }

    return c.json(response, 200);
  } catch (error: any) {
    console.error('Error in getBenchmarks controller:', error);
    return c.json({ status: 'error', detail: error.message }, 500);
  }
};

export const getBenchmarkBySlug = async (c: Context) => {
  const prisma = c.var.prisma;
  const slug = c.req.param('slug') as string;
  const cacheKey = `benchmark:${slug}`;

  c.header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');

  try {
    const localHit = localBenchmarkCache.get(cacheKey);
    if (localHit && Date.now() < localHit.expiresAt) {
      return c.json(localHit.data, 200);
    }

    const redis = redisManager.getClient();
    let cached = null;

    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error('Redis GET failed:', err);
    }

    if (cached) {
      localBenchmarkCache.set(cacheKey, { data: cached, expiresAt: Date.now() + LOCAL_BENCHMARK_TTL });
      return c.json(cached as any, 200);
    }

    const benchmark = await benchmarkService.getBenchmarkBySlug(prisma, slug);
    if (!benchmark) return c.json({ status: 'error', message: 'Benchmark not found' }, 404);

    const response = { status: 'success', data: benchmark };

    localBenchmarkCache.set(cacheKey, { data: response, expiresAt: Date.now() + LOCAL_BENCHMARK_TTL });

    try {
      await redis.set(cacheKey, response, { ex: 900 }); // 15 minutes
    } catch (err) {
      console.error('Redis SET failed:', err);
    }

    return c.json(response, 200);
  } catch (error: any) {
    console.error('Error in getBenchmarkBySlug controller:', error);
    return c.json({ status: 'error', detail: error.message }, 500);
  }
};
