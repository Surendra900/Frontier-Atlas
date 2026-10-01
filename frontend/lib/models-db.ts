import { neon } from "@neondatabase/serverless";
import { resolveCardContract } from "./models-contract";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

export const CAPABILITY_SQL_CONDITIONS: Record<string, string> = {
  chat: `(m.capabilities @> '["chat"]'::jsonb AND NOT (COALESCE(m.architecture->'output_modalities', '[]'::jsonb) @> '["image"]'::jsonb) AND m.category NOT IN ('Audio', 'Robotics', 'Embeddings', 'Document AI') AND (m.architecture->>'pipeline_tag' IS NULL OR m.architecture->>'pipeline_tag' IN ('text-generation', 'conversational')))`,
  reasoning: `((m.category = 'Reasoning' OR m.capabilities @> '["reasoning"]'::jsonb) AND NOT (COALESCE(m.architecture->'output_modalities', '[]'::jsonb) @> '["image"]'::jsonb) AND m.category NOT IN ('Audio', 'Robotics', 'Embeddings', 'Document AI'))`,
  coding: `(m.category IN ('Code Generation', 'Code') OR m.capabilities @> '["coding"]'::jsonb OR m.capabilities @> '["code"]'::jsonb)`,
  code: `(m.category IN ('Code Generation', 'Code') OR m.capabilities @> '["coding"]'::jsonb OR m.capabilities @> '["code"]'::jsonb)`,
  "computer-vision": `(m.category = 'Vision' OR m.capabilities @> '["computer_vision"]'::jsonb OR m.capabilities @> '["vision"]'::jsonb OR m.architecture->>'pipeline_tag' IN ('image-classification', 'text-to-image'))`,
  vision: `(m.category = 'Vision' OR m.capabilities @> '["computer_vision"]'::jsonb OR m.capabilities @> '["vision"]'::jsonb OR m.architecture->>'pipeline_tag' IN ('image-classification', 'text-to-image'))`,
  multimodal: `(m.modality = 'multimodal' OR m.capabilities @> '["multimodal"]'::jsonb OR COALESCE(m.architecture->'output_modalities', '[]'::jsonb) @> '["image"]'::jsonb)`,
  audio: `(m.category = 'Audio' OR m.capabilities @> '["audio"]'::jsonb OR m.capabilities @> '["speech"]'::jsonb OR m.architecture->>'pipeline_tag' IN ('text-to-speech', 'automatic-speech-recognition'))`,
  speech: `(m.category = 'Audio' OR m.capabilities @> '["audio"]'::jsonb OR m.capabilities @> '["speech"]'::jsonb OR m.architecture->>'pipeline_tag' IN ('text-to-speech', 'automatic-speech-recognition'))`,
  "document-ai": `(m.category = 'Document AI' OR m.capabilities @> '["document_ai"]'::jsonb OR m.capabilities @> '["ocr"]'::jsonb OR m.architecture->>'pipeline_tag' = 'document-question-answering')`,
  ocr: `(m.category = 'Document AI' OR m.capabilities @> '["document_ai"]'::jsonb OR m.capabilities @> '["ocr"]'::jsonb OR m.architecture->>'pipeline_tag' = 'document-question-answering')`,
  robotics: `(m.category = 'Robotics' OR m.capabilities @> '["robotics"]'::jsonb OR m.architecture->>'pipeline_tag' = 'robotics')`,
  "embodied-ai": `(m.category = 'Robotics' OR m.capabilities @> '["robotics"]'::jsonb OR m.architecture->>'pipeline_tag' = 'robotics')`,
  embeddings: `(m.category = 'Embeddings' OR m.capabilities @> '["embeddings"]'::jsonb OR m.capabilities @> '["search"]'::jsonb OR m.architecture->>'pipeline_tag' = 'sentence-similarity')`,
  search: `(m.category = 'Embeddings' OR m.capabilities @> '["embeddings"]'::jsonb OR m.capabilities @> '["search"]'::jsonb OR m.architecture->>'pipeline_tag' = 'sentence-similarity')`,
  "tool-use": `(m.capabilities @> '["tools"]'::jsonb OR m.capabilities @> '["tool_use"]'::jsonb)`,
  tools: `(m.capabilities @> '["tools"]'::jsonb OR m.capabilities @> '["tool_use"]'::jsonb)`,
  planning: `(m.capabilities @> '["planning"]'::jsonb OR m.capabilities @> '["agents"]'::jsonb)`,
  agents: `(m.capabilities @> '["agents"]'::jsonb OR m.capabilities @> '["planning"]'::jsonb)`,
  "agentic-ai": `(m.capabilities @> '["agents"]'::jsonb OR m.capabilities @> '["planning"]'::jsonb)`,
  mathematics: `(m.capabilities @> '["math"]'::jsonb)`,
  math: `(m.capabilities @> '["math"]'::jsonb)`,
  translation: `(m.capabilities @> '["translation"]'::jsonb)`,
  "instruction-following": `(m.capabilities @> '["instruction_following"]'::jsonb)`,
  "general-purpose": `(m.capabilities @> '["general_purpose"]'::jsonb AND m.category NOT IN ('Audio', 'Robotics', 'Embeddings', 'Document AI') AND NOT (COALESCE(m.architecture->'output_modalities', '[]'::jsonb) @> '["image"]'::jsonb))`,
  healthcare: `(m.capabilities @> '["healthcare"]'::jsonb)`,
  "image-generation": `(m.capabilities @> '["image_generation"]'::jsonb OR m.architecture->>'pipeline_tag' = 'text-to-image' OR COALESCE(m.architecture->'output_modalities', '[]'::jsonb) @> '["image"]'::jsonb)`,
};

export const CAPABILITY_FACET_LIST = [
  { name: "Chat", slug: "chat" },
  { name: "Reasoning", slug: "reasoning" },
  { name: "Computer Vision", slug: "computer-vision" },
  { name: "Coding", slug: "coding" },
  { name: "Multimodal", slug: "multimodal" },
  { name: "Agentic AI", slug: "agentic-ai" },
  { name: "Tool Use", slug: "tool-use" },
  { name: "Audio", slug: "audio" },
  { name: "Document AI", slug: "document-ai" },
  { name: "Robotics", slug: "robotics" },
  { name: "Embeddings", slug: "embeddings" },
  { name: "Mathematics", slug: "mathematics" },
  { name: "Translation", slug: "translation" },
  { name: "Instruction Following", slug: "instruction-following" },
  { name: "General Purpose", slug: "general-purpose" },
  { name: "Healthcare", slug: "healthcare" },
  { name: "Image Generation", slug: "image-generation" },
];

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

    // Apply contract capability
    if (contract.filters.capability) {
      const cleanContractCap = contract.filters.capability.toLowerCase().trim();
      if (CAPABILITY_SQL_CONDITIONS[cleanContractCap]) {
        conditions.push(CAPABILITY_SQL_CONDITIONS[cleanContractCap]);
      } else {
        conditions.push(`m.capabilities @> to_jsonb(ARRAY[$${pIdx}]::text[])`);
        queryParams.push(cleanContractCap);
        pIdx++;
      }
    }

    // Apply contract capabilitiesAny (e.g. Chat, Coding, Tool Use, etc.)
    if (contract.filters.capabilitiesAny && contract.filters.capabilitiesAny.length > 0) {
      const capClauses: string[] = [];
      for (const cap of contract.filters.capabilitiesAny) {
        const cleanCap = cap.toLowerCase().trim();
        if (CAPABILITY_SQL_CONDITIONS[cleanCap]) {
          capClauses.push(CAPABILITY_SQL_CONDITIONS[cleanCap]);
        } else {
          capClauses.push(`m.capabilities @> to_jsonb(ARRAY[$${pIdx}]::text[])`);
          queryParams.push(cleanCap);
          pIdx++;
        }
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
    if (CAPABILITY_SQL_CONDITIONS[cleanCap]) {
      conditions.push(CAPABILITY_SQL_CONDITIONS[cleanCap]);
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
    contextWindow: row.context_window !== null && row.context_window !== undefined && row.context_window !== "" ? Number(row.context_window) : null,
    maxOutputTokens: row.max_output_tokens !== null && row.max_output_tokens !== undefined && row.max_output_tokens !== "" ? Number(row.max_output_tokens) : null,
    inputCostPerMtoken: row.input_cost_per_mtoken !== null && row.input_cost_per_mtoken !== undefined ? parseFloat(row.input_cost_per_mtoken) : null,
    outputCostPerMtoken: row.output_cost_per_mtoken !== null && row.output_cost_per_mtoken !== undefined ? parseFloat(row.output_cost_per_mtoken) : null,
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

  // 7. Use authoritative cached Hub Facets for filter options
  let facets: ModelDbFacets = {
    vendors: [],
    modalities: [],
    openness: [],
    capabilities: [],
    families: [],
  };

  try {
    const hubFacets = await getHubFacetsFromDb();
    facets = {
      vendors: hubFacets.vendors,
      modalities: hubFacets.modalities,
      openness: hubFacets.opennessTypes,
      capabilities: hubFacets.capabilities,
      families: hubFacets.modelFamilies,
    };
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
    contextWindow: row.context_window !== null && row.context_window !== undefined && row.context_window !== "" ? Number(row.context_window) : null,
    maxOutputTokens: row.max_output_tokens !== null && row.max_output_tokens !== undefined && row.max_output_tokens !== "" ? Number(row.max_output_tokens) : null,
    inputCostPerMtoken: row.input_cost_per_mtoken !== null && row.input_cost_per_mtoken !== undefined ? parseFloat(row.input_cost_per_mtoken) : null,
    outputCostPerMtoken: row.output_cost_per_mtoken !== null && row.output_cost_per_mtoken !== undefined ? parseFloat(row.output_cost_per_mtoken) : null,
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

  const capSelectClauses = CAPABILITY_FACET_LIST.map(
    (item, idx) => `COUNT(*) FILTER (WHERE ${CAPABILITY_SQL_CONDITIONS[item.slug]})::int as cap_${idx}`
  ).join(",\n");

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
    sql.query(`SELECT ${capSelectClauses} FROM models m WHERE m.is_canonical = true`),
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

  const capRow = ((capRows as unknown) as Array<Record<string, number>>)[0] || {};
  const capabilities: FacetCount[] = CAPABILITY_FACET_LIST.map((item, idx) => ({
    name: item.name,
    count: Number(capRow[`cap_${idx}`] || 0),
  })).filter((c) => c.count > 0);

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

