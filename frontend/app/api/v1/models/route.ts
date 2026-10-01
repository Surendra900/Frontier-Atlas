import { NextRequest, NextResponse } from "next/server";
import { getModelsFromDb } from "@/lib/models-db";

// In-memory response cache with 60s TTL
interface CacheEntry {
  data: unknown;
  timestamp: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const cardSlug = searchParams.get("card") || searchParams.get("card_slug") || searchParams.get("slug") || "";
  const search = searchParams.get("search") || searchParams.get("q") || "";
  const vendor = searchParams.get("vendor") || "";
  const family = searchParams.get("family") || "";
  const modality = searchParams.get("modality") || "";
  const openness = searchParams.get("openness") || "";
  const capability = searchParams.get("capability") || "";
  const minContext = parseInt(searchParams.get("min_context") || searchParams.get("minContext") || "0", 10);
  const maxPrice = parseFloat(searchParams.get("max_price") || searchParams.get("maxPrice") || searchParams.get("price") || "0");
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
  const includeVariants = searchParams.get("include_variants") === "true";

  const cacheKey = `models:${cardSlug}:${search}:${vendor}:${family}:${modality}:${openness}:${capability}:${minContext}:${maxPrice}:${sort}:${page}:${limit}:${includeVariants}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  }

  try {
    const result = await getModelsFromDb({
      cardSlug,
      search,
      vendor,
      family,
      modality,
      openness,
      capability,
      minContext,
      maxPrice,
      sort,
      page,
      limit,
      includeVariants,
    });

    cache.set(cacheKey, { data: result, timestamp: Date.now() });

    return NextResponse.json(result, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Models API Error:", msg);
    return NextResponse.json(
      { status: "error", message: msg },
      { status: 500 }
    );
  }
}
