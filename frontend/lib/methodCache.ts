"use client";

import { useState, useEffect, useRef } from "react";
import type { MethodDetail } from "@/lib/methods";

interface CacheEntry {
  data: MethodDetail;
  timestamp: number;
}

interface TaxonomyCategory {
  methods?: Array<{ slug?: string; id?: string }>;
}

const METHOD_CACHE = new Map<string, CacheEntry>();
const METHOD_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const MAX_CACHE_ENTRIES = 500;
const IN_FLIGHT = new Map<string, Promise<MethodDetail>>();

function setCacheWithLimit(key: string, entry: CacheEntry) {
  METHOD_CACHE.set(key, entry);
  if (METHOD_CACHE.size > MAX_CACHE_ENTRIES) {
    const firstKey = METHOD_CACHE.keys().next().value;
    if (firstKey) METHOD_CACHE.delete(firstKey);
  }
}

/**
 * Client-side method fetcher with aggressive in-memory + localStorage caching.
 * Called from HomeContent to warm the cache, and from MethodDetailClient to display data.
 */
export async function fetchMethodCached(slug: string): Promise<MethodDetail> {
  if (!slug || typeof slug !== "string") throw new Error("Slug is required");
  const cacheKey = `method:${slug.trim()}`;

  // 1. In-memory cache (instant, zero-cost)
  const mem = METHOD_CACHE.get(cacheKey);
  if (mem && Date.now() - mem.timestamp < METHOD_CACHE_TTL) {
    return mem.data;
  }

  // 2. localStorage cache (fast, persists across navigations)
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw) as CacheEntry;
        if (parsed && parsed.data && Date.now() - parsed.timestamp < METHOD_CACHE_TTL) {
          setCacheWithLimit(cacheKey, parsed);
          return parsed.data;
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }

  // 3. Deduplicate in-flight requests
  if (IN_FLIGHT.has(cacheKey)) {
    return IN_FLIGHT.get(cacheKey)!;
  }

  // 4. Fetch from API
  const defaultApiUrl = process.env.NODE_ENV === "development"
    ? "http://localhost:8787"
    : "https://frontieratlas-backend.morningsignal-india.workers.dev";
  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || defaultApiUrl).replace(/\/$/, "");

  const executeFetch = async () => {
    let url = `${API_BASE}/api/v1/methods/${encodeURIComponent(slug.trim())}`;
    let res: Response;

    const fetchWithTimeout = async (targetUrl: string, timeoutMs: number) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(targetUrl, {
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    };

    try {
      res = await fetchWithTimeout(url, 3000);
    } catch (err) {
      if (API_BASE.includes("localhost")) {
        url = `https://frontieratlas-backend.morningsignal-india.workers.dev/api/v1/methods/${encodeURIComponent(slug.trim())}`;
        res = await fetchWithTimeout(url, 5000);
      } else {
        throw err;
      }
    }

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    if (!json || !json.data) throw new Error("Invalid API response structure");

    const data = json.data as MethodDetail;
    const entry = { data, timestamp: Date.now() };

    setCacheWithLimit(cacheKey, entry);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(entry));
      } catch {
        // Ignore localStorage write quota errors
      }
    }

    return data;
  };

  const request = executeFetch().finally(() => {
    IN_FLIGHT.delete(cacheKey);
  });

  IN_FLIGHT.set(cacheKey, request);
  return request;
}

/**
 * Prefetch method data for all methods in the taxonomy.
 * Batches requests in the background to avoid network congestion.
 */
export function prefetchTaxonomyMethods(taxonomy?: TaxonomyCategory[]) {
  if (!taxonomy || !Array.isArray(taxonomy)) return;
  const slugs: string[] = [];

  taxonomy.forEach((cat) => {
    if (cat && Array.isArray(cat.methods)) {
      cat.methods.forEach((m) => {
        const s = m?.slug || m?.id;
        if (s && typeof s === "string" && !METHOD_CACHE.has(`method:${s}`)) {
          slugs.push(s);
        }
      });
    }
  });

  if (slugs.length === 0) return;

  const batchSize = 10;
  let index = 0;

  function nextBatch() {
    if (index >= slugs.length) return;
    const batch = slugs.slice(index, index + batchSize);
    index += batchSize;
    Promise.allSettled(batch.map((slug) => fetchMethodCached(slug))).then(() => {
      setTimeout(nextBatch, 20);
    });
  }

  nextBatch();
}

/**
 * Prefetch method data for all sidebar method slugs.
 * Called from HomeContent on mount to warm the cache.
 */
export function prefetchMethods() {
  const slugs = [
    "transformer", "diffusion-models", "mixture-of-experts",
    "policy-learning", "chain-of-thought", "retrieval-augmented-generation", "model-context-protocol-mcp", "lora", "rlhf",
  ];
  slugs.forEach((slug) => {
    fetchMethodCached(slug).catch(() => {});
  });
}

/**
 * Hook to use cached method data client-side.
 */
export function useMethodDetail(slug: string) {
  const [data, setData] = useState<MethodDetail | null>(() => {
    if (!slug || typeof window === "undefined") return null;
    const memKey = `method:${slug.trim()}`;
    const mem = METHOD_CACHE.get(memKey);
    if (mem && Date.now() - mem.timestamp < METHOD_CACHE_TTL) return mem.data;
    try {
      const raw = localStorage.getItem(memKey);
      if (raw) {
        const parsed = JSON.parse(raw) as CacheEntry;
        if (parsed && parsed.data && Date.now() - parsed.timestamp < METHOD_CACHE_TTL) {
          setCacheWithLimit(memKey, parsed);
          return parsed.data;
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
    return null;
  });

  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!slug) {
      setLoading(false);
      return;
    }

    const memKey = `method:${slug.trim()}`;
    const mem = METHOD_CACHE.get(memKey);
    if (mem && Date.now() - mem.timestamp < METHOD_CACHE_TTL) {
      setData(mem.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchMethodCached(slug)
      .then((result) => {
        if (mountedRef.current) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : "Failed to load method details");
          setLoading(false);
        }
      });

    return () => {
      mountedRef.current = false;
    };
  }, [slug]);

  return { data, loading, error };
}