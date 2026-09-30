import { neon } from "@neondatabase/serverless";
import { resolveCardContract } from "./models-contract";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

export interface ModelsQueryParams {
  cardSlug?: string;
  search?: string;
  vendor?: string;
  family?: string;
  modality?: string;
  openness?: string;
  capability?: string;
  minContext?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
  includeVariants?: boolean;
}

export interface FacetCount {
  name: string;
  count: number;
}

export interface ModelDbFacets {
  vendors: FacetCount[];
  modalities: FacetCount[];
  openness: FacetCount[];
  capabilities: FacetCount[];
  families: FacetCount[];
}

export interface ModelDbResult {
  status: string;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  count: number;
  data: any[];
  facets?: ModelDbFacets;
}

/**
 * Fetch models using Authoritative Contract resolution, canonical collapsing, and faceted counts.
 */
export async function getModelsFromDb(params: ModelsQueryParams): Promise<ModelDbResult> {
  const {
    cardSlug = "",
    search = "",
    vendor = "",
    family = "",
    modality = "",
    openness = "",
    capability = "",
    minContext = 0,
    maxPrice = 0,
    sort = "newest",
    page = 1,
    limit = 50,
    includeVariants = false,
  } = params;

  const conditions: string[] = [];
  const queryParams: unknown[] = [];
  let pIdx = 1;

  // 1. By default, collapse variants under canonical models
  if (!includeVariants) {
    conditions.push("m.is_canonical = true");
  }

  // 2. Authoritative Card Slug Resolution
  if (cardSlug && cardSlug !== "all" && cardSlug !== "models") {
    const contract = resolveCardContract(cardSlug);

    // Apply contract vendor
    if (contract.filters.vendor) {
      conditions.push(`LOWER(m.vendor) = LOWER($${pIdx})`);
      queryParams.push(contract.filters.vendor);
      pIdx++;
    }

    // Apply contract family
    if (contract.filters.family) {
      conditions.push(`(
        LOWER(m.model_family) = LOWER($${pIdx}) OR
        LOWER(REPLACE(m.model_family, ' ', '-')) = LOWER($${pIdx}) OR
        m.name ILIKE '%' || $${pIdx} || '%'
      )`);
      queryParams.push(contract.filters.family);
      pIdx++;
    }

    // Apply contract category
    if (contract.filters.category) {
      conditions.push(`LOWER(m.category) = LOWER($${pIdx})`);
      queryParams.push(contract.filters.category);
      pIdx++;
    }

    // Apply contract capabilitiesAny (e.g. Chat, Coding, Tool Use, etc.)
    if (contract.filters.capabilitiesAny && contract.filters.capabilitiesAny.length > 0) {
      const capClauses: string[] = [];
      for (const cap of contract.filters.capabilitiesAny) {
        capClauses.push(`m.capabilities @> to_jsonb(ARRAY[$${pIdx}]::text[])`);
        queryParams.push(cap.toLowerCase());
        pIdx++;
      }
      conditions.push(`(${capClauses.join(" OR ")})`);
    }

    // Apply contract modality
    if (contract.filters.modality) {
      conditions.push(`LOWER(m.modality) = LOWER($${pIdx})`);
      queryParams.push(contract.filters.modality);
      pIdx++;
    }

    // Apply contract openness
    if (contract.filters.openness) {
      if (contract.filters.openness === "open_weights") {
        conditions.push(`m.openness_type = 'Open Weights'`);
      } else if (contract.filters.openness === "proprietary") {
        conditions.push(`m.openness_type = 'Proprietary'`);
      }
    }

    // Apply generic nameKeyword fallback if type is generic
    if (contract.type === "generic" && contract.filters.nameKeyword) {
      conditions.push(`(
        LOWER(m.vendor) = LOWER($${pIdx}) OR
        LOWER(REPLACE(m.vendor, ' ', '-')) = LOWER($${pIdx}) OR
        LOWER(m.model_family) = LOWER($${pIdx}) OR
        LOWER(m.category) = LOWER($${pIdx}) OR
        m.slug ILIKE '%' || $${pIdx} || '%' OR
        m.name ILIKE '%' || $${pIdx} || '%'
      )`);
      queryParams.push(contract.slug);
      pIdx++;
    }
  }

  // 3. User Filter Overrides
  if (vendor && vendor !== "all") {
    conditions.push(`LOWER(m.vendor) = LOWER($${pIdx})`);
    queryParams.push(vendor);
    pIdx++;
  }

  if (family && family !== "all") {
    conditions.push(`LOWER(m.model_family) = LOWER($${pIdx})`);
    queryParams.push(family);
    pIdx++;
  }

  if (modality && modality !== "all") {
    conditions.push(`LOWER(m.modality) = LOWER($${pIdx})`);
    queryParams.push(modality);
    pIdx++;
  }

  if (openness && openness !== "all") {
    if (openness === "open" || openness === "open_weights") {
      conditions.push(`m.openness_type = 'Open Weights'`);
    } else if (openness === "proprietary") {
      conditions.push(`m.openness_type = 'Proprietary'`);
    }
  }

  if (capability && capability !== "all") {
    const cleanCap = capability.toLowerCase().trim();
    if (cleanCap === "reasoning") {
      conditions.push(`(m.category = 'Reasoning' OR m.capabilities @> '["reasoning"]'::jsonb)`);
    } else if (cleanCap === "coding" || cleanCap === "code") {
      conditions.push(`(m.capabilities @> '["code"]'::jsonb OR m.capabilities @> '["coding"]'::jsonb)`);
    } else if (cleanCap === "vision" || cleanCap === "computer-vision") {
      conditions.push(`(m.category = 'Vision' OR m.capabilities @> '["vision"]'::jsonb)`);
    } else {
      conditions.push(`m.capabilities @> to_jsonb(ARRAY[$${pIdx}]::text[])`);
      queryParams.push(cleanCap);
      pIdx++;
    }
  }

  if (minContext > 0) {
    conditions.push(`m.context_window >= $${pIdx}`);
    queryParams.push(minContext);
    pIdx++;
  }

  if (maxPrice > 0) {
    conditions.push(`m.input_cost_per_mtoken <= $${pIdx}`);
    queryParams.push(maxPrice);
    pIdx++;
  }

  if (search && search.trim() !== "") {
    const term = search.trim();
    conditions.push(`(
      m.name ILIKE '%' || $${pIdx} || '%' OR
      m.slug ILIKE '%' || $${pIdx} || '%' OR
      m.vendor ILIKE '%' || $${pIdx} || '%' OR
      m.description ILIKE '%' || $${pIdx} || '%' OR
      m.model_family ILIKE '%' || $${pIdx} || '%'
    )`);
    queryParams.push(term);
    pIdx++;
  }

  const whereClause = conditions.length > 0 ? conditions.join(" AND ") : "1=1";

  // 4. Sorting
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

  const offset = (Math.max(1, page) - 1) * limit;

  // 5. Total Count Query
  const countSql = `SELECT COUNT(*)::int as total FROM models m WHERE ${whereClause}`;
  const [countRes] = (await sql.query(countSql, queryParams)) as Array<{ total: number }>;
  const total = Number(countRes?.total || 0);

  // 6. Data Query with JSON aggregation of mapped papers
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
      m.is_canonical,
      m.canonical_model_id,
      m.variants,
      m.source_catalog,
      COUNT(pm.paper_id)::int as paper_count,
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

  const dataParams = [...queryParams, limit, offset];
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
    isCanonical: row.is_canonical !== false,
    canonicalModelId: row.canonical_model_id,
    variants: Array.isArray(row.variants) ? row.variants : [],
    sourceCatalog: row.source_catalog || "openrouter",
    paperCount: parseInt(row.paper_count, 10) || 0,
    papers: Array.isArray(row.papers) ? row.papers : [],
  }));

  // 7. Calculate Facets for current card scope (without user filter narrowing) so filter chips always know available counts
  const facetSql = `
    SELECT
      jsonb_build_object(
        'vendors', (
          SELECT jsonb_agg(jsonb_build_object('name', vendor, 'count', cnt))
          FROM (SELECT vendor, COUNT(*)::int as cnt FROM models WHERE is_canonical = true GROUP BY vendor ORDER BY cnt DESC LIMIT 20) v
        ),
        'modalities', (
          SELECT jsonb_agg(jsonb_build_object('name', modality, 'count', cnt))
          FROM (SELECT modality, COUNT(*)::int as cnt FROM models WHERE is_canonical = true AND modality IS NOT NULL GROUP BY modality ORDER BY cnt DESC) m
        ),
        'openness', (
          SELECT jsonb_agg(jsonb_build_object('name', openness_type, 'count', cnt))
          FROM (SELECT openness_type, COUNT(*)::int as cnt FROM models WHERE is_canonical = true AND openness_type IS NOT NULL GROUP BY openness_type ORDER BY cnt DESC) o
        ),
        'capabilities', (
          SELECT jsonb_agg(jsonb_build_object('name', cap, 'count', cnt))
          FROM (
            SELECT jsonb_array_elements_text(capabilities) as cap, COUNT(*)::int as cnt 
            FROM models WHERE is_canonical = true 
            GROUP BY cap ORDER BY cnt DESC LIMIT 25
          ) c
        )
      ) as facets
  `;

  let facets: ModelDbFacets = {
    vendors: [],
    modalities: [],
    openness: [],
    capabilities: [],
    families: [],
  };

  try {
    const [facetRow] = (await sql.query(facetSql)) as Array<{ facets: any }>;
    if (facetRow?.facets) {
      facets = {
        vendors: Array.isArray(facetRow.facets.vendors) ? facetRow.facets.vendors : [],
        modalities: Array.isArray(facetRow.facets.modalities) ? facetRow.facets.modalities : [],
        openness: Array.isArray(facetRow.facets.openness) ? facetRow.facets.openness : [],
        capabilities: Array.isArray(facetRow.facets.capabilities) ? facetRow.facets.capabilities : [],
        families: [],
      };
    }
  } catch (facetErr) {
    console.warn("Facet calculation warning:", facetErr);
  }

  return {
    status: "success",
    total,
    page: Math.max(1, page),
    limit,
    totalPages: Math.ceil(total / limit),
    count: formattedModels.length,
    data: formattedModels,
    facets,
  };
}

/**
 * Fetch authoritative metadata for a card slug (Title, Type, Description, and live Model Count)
 */
export async function getCardMetaFromDb(rawSlug: string): Promise<{
  slug: string;
  title: string;
  type: string;
  description: string;
  totalModels: number;
}> {
  const contract = resolveCardContract(rawSlug);

  // Compute live model count using the exact contract filter
  const result = await getModelsFromDb({
    cardSlug: contract.slug,
    limit: 1,
  });

  return {
    slug: contract.slug,
    title: contract.title,
    type: contract.type,
    description: contract.description,
    totalModels: result.total,
  };
}

/**
 * Fetch a single model by slug or id, including variants and papers
 */
export async function getModelDetailFromDb(slugOrId: string): Promise<any | null> {
  const clean = slugOrId.toLowerCase().trim();

  const query = `
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
      m.is_canonical,
      m.canonical_model_id,
      m.variants,
      m.source_catalog,
      COUNT(pm.paper_id)::int as paper_count,
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
    WHERE m.slug = $1 OR m.id = $1 OR LOWER(m.name) = $1
    GROUP BY m.id
    LIMIT 1
  `;

  const rows = (await sql.query(query, [clean])) as Array<Record<string, any>>;
  if (rows.length === 0) return null;

  const row = rows[0];
  return {
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
    isCanonical: row.is_canonical !== false,
    canonicalModelId: row.canonical_model_id,
    variants: Array.isArray(row.variants) ? row.variants : [],
    sourceCatalog: row.source_catalog || "openrouter",
    paperCount: parseInt(row.paper_count, 10) || 0,
    papers: Array.isArray(row.papers) ? row.papers : [],
  };
}

export interface HubFacetsData {
  totalModels: number;
  vendors: FacetCount[];
  modalities: FacetCount[];
  accessTypes: FacetCount[];
  opennessTypes: FacetCount[];
  modelFamilies: FacetCount[];
  capabilities: FacetCount[];
  researchAreas: FacetCount[];
}

let cachedHubFacets: { data: HubFacetsData; expiresAt: number } | null = null;

export async function getHubFacetsFromDb(): Promise<HubFacetsData> {
  const now = Date.now();
  if (cachedHubFacets && cachedHubFacets.expiresAt > now) {
    return cachedHubFacets.data;
  }

  const [
    totalRows,
    vendorRows,
    familyRows,
    capRows,
    researchRows,
    modalityRows,
    accessRows,
    opennessRows,
  ] = await Promise.all([
    sql`SELECT COUNT(*)::int as count FROM models WHERE is_canonical = true`,
    sql`
      SELECT vendor as name, COUNT(*)::int as count
      FROM models
      WHERE is_canonical = true AND vendor IS NOT NULL AND vendor != ''
      GROUP BY vendor
      ORDER BY count DESC
      LIMIT 40
    `,
    sql`
      SELECT model_family as name, COUNT(*)::int as count
      FROM models
      WHERE is_canonical = true AND model_family IS NOT NULL AND model_family != '' AND model_family != 'General Models'
      GROUP BY model_family
      ORDER BY count DESC
      LIMIT 40
    `,
    sql`
      SELECT jsonb_array_elements_text(capabilities) as cap, COUNT(*)::int as count
      FROM models
      WHERE is_canonical = true AND capabilities IS NOT NULL AND jsonb_typeof(capabilities) = 'array'
      GROUP BY cap
      ORDER BY count DESC
    `,
    sql`
      SELECT jsonb_array_elements_text(research_areas) as area, COUNT(*)::int as count
      FROM models
      WHERE is_canonical = true AND research_areas IS NOT NULL AND jsonb_typeof(research_areas) = 'array'
      GROUP BY area
      ORDER BY count DESC
      LIMIT 40
    `,
    sql`
      SELECT modality as name, COUNT(*)::int as count
      FROM models
      WHERE is_canonical = true AND modality IS NOT NULL AND modality != ''
      GROUP BY modality
      ORDER BY count DESC
    `,
    sql`
      SELECT access_type as name, COUNT(*)::int as count
      FROM models
      WHERE is_canonical = true AND access_type IS NOT NULL AND access_type != ''
      GROUP BY access_type
      ORDER BY count DESC
    `,
    sql`
      SELECT openness_type as name, COUNT(*)::int as count
      FROM models
      WHERE is_canonical = true AND openness_type IS NOT NULL AND openness_type != ''
      GROUP BY openness_type
      ORDER BY count DESC
    `,
  ]);

  const rawCapMap = new Map<string, number>();
  for (const r of capRows as Array<{ cap: string; count: number }>) {
    rawCapMap.set(r.cap, r.count);
  }

  const CAPABILITY_DEFS = [
    { name: "Chat", keys: ["chat"] },
    { name: "Reasoning", keys: ["reasoning"] },
    { name: "Computer Vision", keys: ["computer_vision", "vision"] },
    { name: "Coding", keys: ["coding", "code"] },
    { name: "Multimodal", keys: ["multimodal"] },
    { name: "Agentic AI", keys: ["agents", "planning"] },
    { name: "Tool Use", keys: ["tools", "tool_use"] },
    { name: "Audio", keys: ["audio", "speech"] },
    { name: "Document AI", keys: ["document_ai", "ocr"] },
    { name: "Robotics", keys: ["robotics"] },
    { name: "Embeddings", keys: ["embeddings"] },
    { name: "Mathematics", keys: ["math"] },
    { name: "Translation", keys: ["translation"] },
    { name: "Search", keys: ["search"] },
    { name: "Instruction Following", keys: ["instruction_following"] },
    { name: "Healthcare", keys: ["healthcare"] },
    { name: "General Purpose", keys: ["general_purpose"] },
  ];

  const capabilities: FacetCount[] = CAPABILITY_DEFS.map((def) => {
    let maxCount = 0;
    for (const k of def.keys) {
      const c = rawCapMap.get(k) || 0;
      if (c > maxCount) maxCount = c;
    }
    return { name: def.name, count: maxCount };
  }).filter((c) => c.count > 0);

  const researchAreas: FacetCount[] = (researchRows as Array<{ area: string; count: number }>).map((r) => ({
    name: r.area,
    count: r.count,
  }));

  const data: HubFacetsData = {
    totalModels: (totalRows[0] as { count: number })?.count || 0,
    vendors: (vendorRows as Array<{ name: string; count: number }>).map((r) => ({ name: r.name, count: r.count })),
    modalities: (modalityRows as Array<{ name: string; count: number }>).map((r) => ({ name: r.name, count: r.count })),
    accessTypes: (accessRows as Array<{ name: string; count: number }>).map((r) => ({ name: r.name, count: r.count })),
    opennessTypes: (opennessRows as Array<{ name: string; count: number }>).map((r) => ({ name: r.name, count: r.count })),
    modelFamilies: (familyRows as Array<{ name: string; count: number }>).map((r) => ({ name: r.name, count: r.count })),
    capabilities,
    researchAreas,
  };

  cachedHubFacets = {
    data,
    expiresAt: now + 5 * 60 * 1000, // 5 minutes cache
  };

  return data;
}

