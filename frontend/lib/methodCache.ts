"use client";

import { useState, useEffect, useRef } from "react";
import type { MethodDetail } from "@/lib/methods";

const METHOD_CACHE = new Map<string, { data: MethodDetail; timestamp: number }>();
const METHOD_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const IN_FLIGHT = new Map<string, Promise<MethodDetail>>();

/**
 * Client-side method fetcher with aggressive in-memory + localStorage caching.
 * Called from HomeContent to warm the cache, and from MethodDetailClient to display data.
 */
/* ─── Client-side Method Cache & Fetcher ─────────────────────────────────── */
export async function fetchMethodCached(slug: string): Promise<MethodDetail> {
  if (!slug) throw new Error("Slug is required");
  const cacheKey = `method:${slug}`;

  // 1. In-memory cache (instant, zero-cost)
  const mem = METHOD_CACHE.get(cacheKey);
  if (mem && Date.now() - mem.timestamp < METHOD_CACHE_TTL) {
    return mem.data;
  }

  // 2. localStorage cache (fast, persists across navigations)
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const parsed = JSON.parse(raw) as { data: MethodDetail; timestamp: number };
      if (parsed && Date.now() - parsed.timestamp < METHOD_CACHE_TTL) {
        METHOD_CACHE.set(cacheKey, parsed);
        return parsed.data;
      }
    }
  } catch { }

  // 3. Deduplicate in-flight requests
  if (IN_FLIGHT.has(cacheKey)) {
    return IN_FLIGHT.get(cacheKey)!;
  }

  // 4. Fetch from API (default to local dev server http://localhost:8787 in development)
  const defaultApiUrl = process.env.NODE_ENV === "development"
    ? "http://localhost:8787"
    : "https://frontieratlas-backend.morningsignal-india.workers.dev";
  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || defaultApiUrl).replace(/\/$/, "");

  const executeFetch = async () => {
    let url = `${API_BASE}/api/v1/methods/${encodeURIComponent(slug)}`;
    let res: Response;
    try {
      res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(3000),
      });
    } catch (err) {
      if (API_BASE.includes("localhost")) {
        url = `https://frontieratlas-backend.morningsignal-india.workers.dev/api/v1/methods/${encodeURIComponent(slug)}`;
        res = await fetch(url, {
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(5000),
        });
      } else {
        throw err;
      }
    }
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    const data = json.data as MethodDetail;

    const entry = { data, timestamp: Date.now() };
    METHOD_CACHE.set(cacheKey, entry);
    try {
      localStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch { }

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
export function prefetchTaxonomyMethods(taxonomy: any[]) {
  if (!taxonomy || !Array.isArray(taxonomy)) return;
  const slugs: string[] = [];
  taxonomy.forEach((cat) => {
    if (Array.isArray(cat.methods)) {
      cat.methods.forEach((m: any) => {
        const s = m.slug || m.id;
        if (s && !METHOD_CACHE.has(`method:${s}`)) {
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
    fetchMethodCached(slug).catch(() => { });
  });
}

/**
 * Hook to use cached method data client-side.
 */
export function useMethodDetail(slug: string) {
  const [data, setData] = useState<MethodDetail | null>(() => {
    const memKey = `method:${slug}`;
    const mem = METHOD_CACHE.get(memKey);
    if (mem && Date.now() - mem.timestamp < METHOD_CACHE_TTL) return mem.data;
    try {
      const raw = localStorage.getItem(memKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { data: MethodDetail; timestamp: number };
        if (parsed && Date.now() - parsed.timestamp < METHOD_CACHE_TTL) {
          METHOD_CACHE.set(memKey, parsed);
          return parsed.data;
        }
      }
    } catch { }
    return null;
  });
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const mem = METHOD_CACHE.get(`method:${slug}`);
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
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      mountedRef.current = false;
    };
  }, [slug]);

  return { data, loading, error };
}
