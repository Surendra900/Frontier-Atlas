import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

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
  const minContext = parseInt(searchParams.get("min_context") || "0", 10);
  const maxPrice = parseFloat(searchParams.get("max_price") || "0");
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
  const offset = (page - 1) * limit;

  const cacheKey = `models:${cardSlug}:${search}:${vendor}:${family}:${modality}:${openness}:${capability}:${minContext}:${maxPrice}:${sort}:${page}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  }

  try {
    const conditions: string[] = ["1=1"];
    const params: unknown[] = [];
    let pIdx = 1;

    // Card Slug resolution
    if (cardSlug && cardSlug !== "all" && cardSlug !== "models") {
      const cleanSlug = cardSlug.toLowerCase().trim();
      conditions.push(`(
        LOWER(m.vendor) = $${pIdx} OR
        LOWER(REPLACE(m.vendor, ' ', '-')) = $${pIdx} OR
        LOWER(m.model_family) = $${pIdx} OR
        LOWER(REPLACE(m.model_family, ' ', '-')) = $${pIdx} OR
        LOWER(m.category) = $${pIdx} OR
        LOWER(REPLACE(m.category, ' ', '-')) = $${pIdx} OR
        m.capabilities @> to_jsonb(ARRAY[$${pIdx}]::text[]) OR
        m.slug = $${pIdx} OR
        LOWER(m.name) LIKE '%' || $${pIdx} || '%'
      )`);
      params.push(cleanSlug);
      pIdx++;
    }

    // Search query
    if (search) {
      conditions.push(`(
        m.name ILIKE '%' || $${pIdx} || '%' OR
        m.slug ILIKE '%' || $${pIdx} || '%' OR
        m.vendor ILIKE '%' || $${pIdx} || '%' OR
        m.description ILIKE '%' || $${pIdx} || '%' OR
        m.model_family ILIKE '%' || $${pIdx} || '%'
      )`);
      params.push(search);
      pIdx++;
    }

    // Explicit Vendor filter
    if (vendor && vendor !== "all") {
      conditions.push(`LOWER(m.vendor) = LOWER($${pIdx})`);
      params.push(vendor);
      pIdx++;
    }

    // Explicit Family filter
    if (family && family !== "all") {
      conditions.push(`LOWER(m.model_family) = LOWER($${pIdx})`);
      params.push(family);
      pIdx++;
    }

    // Modality filter
    if (modality && modality !== "all") {
      conditions.push(`LOWER(m.modality) = LOWER($${pIdx})`);
      params.push(modality);
      pIdx++;
    }

    // Openness filter (open_weights vs proprietary)
    if (openness && openness !== "all") {
      if (openness === "open" || openness === "open_weights") {
        conditions.push(`m.openness_type = 'Open Weights'`);
      } else if (openness === "proprietary") {
        conditions.push(`m.openness_type = 'Proprietary'`);
      }
    }

    // Capability filter
    if (capability && capability !== "all") {
      conditions.push(`m.capabilities @> to_jsonb(ARRAY[$${pIdx}]::text[])`);
      params.push(capability.toLowerCase());
      pIdx++;
    }

    // Context length filter
    if (minContext > 0) {
      conditions.push(`m.context_window >= $${pIdx}`);
      params.push(minContext);
      pIdx++;
    }

    // Price filter
    if (maxPrice > 0) {
      conditions.push(`m.input_cost_per_mtoken <= $${pIdx}`);
      params.push(maxPrice);
      pIdx++;
    }

    // Sorting
    let orderBy = "m.trending_score DESC, m.release_date DESC NULLS LAST";
    if (sort === "newest" || sort === "recent") {
      orderBy = "m.release_date DESC NULLS LAST, m.name ASC";
    } else if (sort === "name") {
      orderBy = "m.name ASC";
    } else if (sort === "price_asc") {
      orderBy = "m.input_cost_per_mtoken ASC NULLS LAST, m.name ASC";
    } else if (sort === "price_desc") {
      orderBy = "m.input_cost_per_mtoken DESC NULLS LAST, m.name ASC";
    } else if (sort === "context_desc" || sort === "context") {
      orderBy = "m.context_window DESC NULLS LAST, m.name ASC";
    }

    const whereClause = conditions.join(" AND ");

    // Count total query
    const countSql = `SELECT COUNT(*) as total FROM models m WHERE ${whereClause}`;
    const countRes = (await sql.query(countSql, params)) as Array<{ total: string }>;
    const total = parseInt(countRes[0]?.total || "0", 10);

    // Data query with JSON aggregation of mapped papers
    const dataSql = `
      SELECT 
        m.id,
        m.name,
        m.slug,
        m.vendor,
        m.vendor_logo_url,
        m.description,
        m.parameter_count,
        m.modality,
        m.access_type,
        m.openness_type,
        m.release_date,
        m.model_family,
        m.category,
        m.capabilities,
        m.research_areas,
        m.architecture,
        m.context_window,
        m.max_output_tokens,
        m.input_cost_per_mtoken,
        m.output_cost_per_mtoken,
        m.license,
        m.paper_url,
        m.repository_url,
        m.api_url,
        m.hugging_face_id,
        m.trending_score,
        COUNT(pm.paper_id) as paper_count,
        COALESCE(
          json_agg(
            json_build_object(
              'id', p.id,
              'title', p.title,
              'slug', p.slug,
              'arxivId', p.arxiv_id,
              'citationCount', p.citation_count,
              'githubStars', p.github_stars,
              'role', pm.role,
              'confidence', pm.confidence
            )
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'::json
        ) as papers
      FROM models m
      LEFT JOIN paper_models pm ON pm.model_id = m.id
      LEFT JOIN papers p ON p.id = pm.paper_id
      WHERE ${whereClause}
      GROUP BY m.id
      ORDER BY ${orderBy}
      LIMIT $${pIdx} OFFSET $${pIdx + 1}
    `;

    const dataParams = [...params, limit, offset];
    const dataRows = (await sql.query(dataSql, dataParams)) as Array<Record<string, any>>;

    const formattedModels = dataRows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      vendor: row.vendor,
      vendorLogoUrl: row.vendor_logo_url,
      description: row.description,
      parameterCount: row.parameter_count,
      modality: row.modality,
      accessType: row.access_type,
      opennessType: row.openness_type,
      releaseDate: row.release_date ? new Date(row.release_date).toISOString() : null,
      modelFamily: row.model_family,
      category: row.category,
      capabilities: Array.isArray(row.capabilities) ? row.capabilities : [],
      researchAreas: Array.isArray(row.research_areas) ? row.research_areas : [],
      architecture: row.architecture || {},
      contextWindow: row.context_window || 128000,
      maxOutputTokens: row.max_output_tokens || 4096,
      inputCostPerMtoken: parseFloat(row.input_cost_per_mtoken) || 0,
      outputCostPerMtoken: parseFloat(row.output_cost_per_mtoken) || 0,
      license: row.license || "Commercial",
      paperUrl: row.paper_url,
      repositoryUrl: row.repository_url,
      apiUrl: row.api_url,
      huggingFaceId: row.hugging_face_id,
      trendingScore: row.trending_score || 50,
      paperCount: parseInt(row.paper_count, 10) || 0,
      papers: Array.isArray(row.papers) ? row.papers : [],
    }));

    const responsePayload = {
      status: "success",
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      count: formattedModels.length,
      data: formattedModels,
    };

    cache.set(cacheKey, { data: responsePayload, timestamp: Date.now() });

    return NextResponse.json(responsePayload, {
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
