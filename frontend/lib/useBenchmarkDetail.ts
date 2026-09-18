"use client";

import { useState, useEffect } from "react";
import {
  getBenchmarkBySlug,
  type BenchmarkDetail,
} from "./benchmarks";

export function useBenchmarkDetail(slug: string, initialData?: BenchmarkDetail | null) {
  const [data, setData] = useState<BenchmarkDetail | null>(() => initialData ?? null);
  const [loading, setLoading] = useState(() => !initialData && Boolean(slug));

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // Only set loading true if we don't already have matching data
    if (!data || data.slug !== slug) {
      setLoading(true);
    }

    getBenchmarkBySlug(slug)
      .then((res) => {
        if (mounted && res) {
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
