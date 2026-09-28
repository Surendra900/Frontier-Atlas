import { useState, useEffect } from 'react';
import { fetchApi } from './api';
import { MOCK_BENCHMARKS, getMockBenchmarkDetail } from './mockBenchmarks';

let benchmarksCache: Promise<BenchmarkItem[]> | null = null;

const BENCHMARK_CACHE = new Map<string, { data: BenchmarkDetail; timestamp: number }>();
const BENCHMARK_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const BENCHMARK_IN_FLIGHT = new Map<string, Promise<BenchmarkDetail | null>>();

export interface BenchmarkItem {
  id: string;
  name: string;
  slug: string;
  _count?: {
    rankings: number;
    claims: number;
  };
}

export interface BenchmarkDetailRanking {
  id: string;
  rank: number;
  previous_rank: number | null;
  paper: {
    id: string;
    title: string;
    slug: string;
    githubStars: number;
    citationCount: number;
    publicationDate: string | null;
  };
}

export interface BenchmarkDetailClaim {
  id: string;
  paper: {
    id: string;
    title: string;
    slug: string;
    githubStars: number;
    citationCount: number;
    publicationDate: string | null;
  };
}

export interface BenchmarkDetail {
  id: string;
  name: string;
  slug: string;
  rankings: BenchmarkDetailRanking[];
  claims: BenchmarkDetailClaim[];
}

export interface GetBenchmarksResponse {
  status: string;
  count: number;
  data: BenchmarkItem[];
}

export interface GetBenchmarkBySlugResponse {
  status: string;
  data: BenchmarkDetail;
}

let syncBenchmarkList: BenchmarkItem[] | null = null;
let syncBenchmarkListTimestamp = 0;
const BENCHMARKS_LIST_TTL = 10 * 60 * 1000;

if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem('atlas_benchmarks_list');
    if (raw) {
      const parsed = JSON.parse(raw) as { data: BenchmarkItem[]; timestamp: number };
      if (parsed && Date.now() - parsed.timestamp < BENCHMARKS_LIST_TTL) {
        syncBenchmarkList = parsed.data;
        syncBenchmarkListTimestamp = parsed.timestamp;
        benchmarksCache = Promise.resolve(parsed.data);
      }
    }
  } catch {}
}

export async function getBenchmarks(): Promise<BenchmarkItem[]> {
  const isFresh = syncBenchmarkList && (Date.now() - syncBenchmarkListTimestamp < BENCHMARKS_LIST_TTL);

  if (isFresh && syncBenchmarkList!.length > 0) {
    if (!benchmarksCache) {
      benchmarksCache = Promise.resolve(syncBenchmarkList!);
    }
    return syncBenchmarkList!;
  }

  // stale or missing — clear so it actually refetches
  benchmarksCache = null;

  try {
    benchmarksCache = fetchApi<GetBenchmarksResponse>('/api/v1/benchmarks?limit=5000', { signal: AbortSignal.timeout(5000) })
      .then(response => {
        const items = Array.isArray(response?.data) ? response.data : [];
        if (items.length > 0) {
          syncBenchmarkList = items;
          syncBenchmarkListTimestamp = Date.now();
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem('atlas_benchmarks_list', JSON.stringify({ data: items, timestamp: Date.now() }));
            }
          } catch {}
        }
        return items;
      })
      .catch(error => {
        benchmarksCache = null;
        console.warn('[benchmarks] API unavailable:', error.message);
        return MOCK_BENCHMARKS;
      });

    return await benchmarksCache;
  } catch (error) {
    benchmarksCache = null;
    return MOCK_BENCHMARKS;
  }
}

export function getCachedBenchmarksSync(): BenchmarkItem[] | null {
  if (syncBenchmarkList && (Date.now() - syncBenchmarkListTimestamp < BENCHMARKS_LIST_TTL)) {
    return syncBenchmarkList;
  }
  return null;
}

export async function getBenchmarkBySlug(slug: string): Promise<BenchmarkDetail | null> {
  if (!slug) return null;
  const cacheKey = `benchmark:${slug}`;

  // 1. Check in-memory cache (instant)
  const mem = BENCHMARK_CACHE.get(cacheKey);
  if (mem && Date.now() - mem.timestamp < BENCHMARK_CACHE_TTL) {
    return mem.data;
  }

  // 2. Check localStorage cache
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as { data: BenchmarkDetail; timestamp: number };
      if (parsed && Date.now() - parsed.timestamp < BENCHMARK_CACHE_TTL) {
        BENCHMARK_CACHE.set(cacheKey, parsed);
        return parsed.data;
      }
    }
  } catch {}

  // 3. Deduplicate in-flight requests
  if (BENCHMARK_IN_FLIGHT.has(cacheKey)) {
    return BENCHMARK_IN_FLIGHT.get(cacheKey)!;
  }

  // 4. Fetch from API with fallback to mock data
  const request = (async () => {
    try {
      const response = await fetchApi<GetBenchmarkBySlugResponse>(`/api/v1/benchmarks/${encodeURIComponent(slug)}`, { signal: AbortSignal.timeout(5000) });
      const data = response?.data || getMockBenchmarkDetail(slug);
      if (data) {
        const entry = { data, timestamp: Date.now() };
        BENCHMARK_CACHE.set(cacheKey, entry);
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(cacheKey, JSON.stringify(entry));
          }
        } catch {}
      }
      return data;
    } catch (error) {
      console.warn(`[benchmarks] API unavailable for slug "${slug}", using mock data:`, (error as Error).message);
      const mockData = getMockBenchmarkDetail(slug);
      if (mockData) {
        const entry = { data: mockData, timestamp: Date.now() };
        BENCHMARK_CACHE.set(cacheKey, entry);
      }
      return mockData;
    }
  })().finally(() => {
    BENCHMARK_IN_FLIGHT.delete(cacheKey);
  });

  BENCHMARK_IN_FLIGHT.set(cacheKey, request);
  return request;
}

export function prefetchBenchmarkDetail(slug: string) {
  if (!slug) return;
  const cacheKey = `benchmark:${slug}`;
  if (BENCHMARK_CACHE.has(cacheKey)) return;
  getBenchmarkBySlug(slug).catch(() => {});
}

export function prefetchBenchmarkList(items: { slug: string }[]) {
  if (!Array.isArray(items) || items.length === 0) return;
  const slugs = items.map((i) => i.slug).filter(Boolean);
  if (slugs.length === 0) return;

  const batchSize = 12;
  let index = 0;

  function nextBatch() {
    if (index >= slugs.length) return;
    const batch = slugs.slice(index, index + batchSize);
    index += batchSize;
    Promise.allSettled(batch.map((slug) => prefetchBenchmarkDetail(slug))).then(() => {
      setTimeout(nextBatch, 15);
    });
  }

  nextBatch();
}

export function useBenchmarkDetail(slug: string) {
  const [data, setData] = useState<BenchmarkDetail | null>(() => {
    if (!slug) return null;
    const cacheKey = `benchmark:${slug}`;
    const mem = BENCHMARK_CACHE.get(cacheKey);
    if (mem && Date.now() - mem.timestamp < BENCHMARK_CACHE_TTL) return mem.data;
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as { data: BenchmarkDetail; timestamp: number };
        if (parsed && Date.now() - parsed.timestamp < BENCHMARK_CACHE_TTL) {
          BENCHMARK_CACHE.set(cacheKey, parsed);
          return parsed.data;
        }
      }
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    if (!slug) return;
    let mounted = true;

    const cacheKey = `benchmark:${slug}`;
    const mem = BENCHMARK_CACHE.get(cacheKey);
    if (mem && Date.now() - mem.timestamp < BENCHMARK_CACHE_TTL) {
      setData(mem.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    getBenchmarkBySlug(slug)
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  return { data, loading };
}
