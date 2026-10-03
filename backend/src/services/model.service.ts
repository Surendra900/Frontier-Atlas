import { PrismaClient } from "../generated/prisma/client.js";
import { QueryRouter } from "../routing/index.js";

export interface ModelTaskItem {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export interface ModelListItem {
  id: string;
  name: string;
  slug: string;
  vendor: string | null;
  vendorLogoUrl: string | null;
  releaseDate: string | null;
  parameterCount: string | null;
  modality: string | null;
  accessType: string | null;
  opennessType: string | null;
  description: string | null;
  benchmarkScore: Record<string, unknown> | null;
  modelFamily: string | null;
  category: string | null;
  capabilities: string[] | null;
  researchAreas: string[] | null;
  architecture: string | null;
  contextWindow: string | null;
  license: string | null;
  modelVersions: string[] | null;
  releaseNotes: string | null;
  paperUrl: string | null;
  repositoryUrl: string | null;
  apiUrl: string | null;
  createdAt: string;
  trendingScore: number;
  paperCount: number;
  citationCount: number;
  githubStars: number;
  latestPaperTitle: string | null;
  latestPaperSlug: string | null;
  latestPaperDate: string | null;
  tasks: ModelTaskItem[];
}

export interface ModelDetailPaper {
  id: string;
  title: string;
  slug: string;
  citationCount: number;
  githubStars: number;
}

export interface ModelDetailItem extends ModelListItem {
  papers: ModelDetailPaper[];
  methods: Array<{ id: string; name: string; slug: string; category: string }>;
  datasets: Array<{ id: string; name: string; slug: string }>;
  benchmarks: Array<{ rank?: number; benchmark: { id: string; name: string; slug: string } }>;
  relatedModels: Array<{ id: string; name: string; slug: string; paperCount: number }>;
}

export interface FacetItem {
  name: string;
  count: number;
}

export interface ModelFacets {
  totalModels: number;
  vendors: FacetItem[];
  modalities: FacetItem[];
  accessTypes: FacetItem[];
  opennessTypes: FacetItem[];
  modelFamilies: FacetItem[];
  capabilities: FacetItem[];
  researchAreas: FacetItem[];
}

function safeParseJson<T>(val: unknown, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") {
    try {
      return JSON.parse(val) as T;
    } catch {
      return fallback;
    }
  }
  return val as T;
}

function safeDateIso(val: unknown): string | null {
  if (!val) return null;
  const d = new Date(val as string | number | Date);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function mapModelRow(row: any): ModelListItem {
  const paperCount = Number(row.paperCount) || 0;
  const citationCount = Number(row.citationCount) || 0;
  const githubStars = Number(row.githubStars) || 0;
  const rawTrendingScore = Number(row.trendingScore) || 0;
  const computedTrendingScore = rawTrendingScore > 0 ? rawTrendingScore : (citationCount + githubStars);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    vendor: row.vendor ?? null,
    vendorLogoUrl: row.vendorLogoUrl ?? null,
    releaseDate: safeDateIso(row.releaseDate),
    parameterCount: row.parameterCount ?? null,
    modality: row.modality ?? null,
    accessType: row.accessType ?? null,
    opennessType: row.opennessType ?? null,
    description: row.description ?? null,
    benchmarkScore: safeParseJson<Record<string, unknown> | null>(row.benchmarkScore, null),
    modelFamily: row.modelFamily ?? null,
    category: row.category ?? null,
    capabilities: safeParseJson<string[] | null>(row.capabilities, null),
    researchAreas: safeParseJson<string[] | null>(row.researchAreas, null),
    architecture: row.architecture ?? null,
    contextWindow: row.contextWindow ?? null,
    license: row.license ?? null,
    modelVersions: safeParseJson<string[] | null>(row.modelVersions, null),
    releaseNotes: row.releaseNotes ?? null,
    paperUrl: row.paperUrl ?? null,
    repositoryUrl: row.repositoryUrl ?? null,
    apiUrl: row.apiUrl ?? null,
    createdAt: safeDateIso(row.createdAt) ?? new Date().toISOString(),
    trendingScore: computedTrendingScore,
    paperCount,
    citationCount,
    githubStars,
    latestPaperTitle: row.latestPaperTitle ?? null,
    latestPaperSlug: row.latestPaperSlug ?? null,
    latestPaperDate: safeDateIso(row.latestPaperDate),
    tasks: Array.isArray(row.tasks) ? row.tasks : [],
  };
}

export const getModels = async (
  queryRouter: QueryRouter,
  limit: number = 50,
  skip: number = 0,
  sort: string = "name",
  vendor?: string,
  modality?: string,
  accessType?: string,
  opennessType?: string,
  modelFamily?: string,
  category?: string,
  capability?: string,
  researchArea?: string
): Promise<ModelListItem[]> => {
  const conditions: string[] = [];
  const params: any[] = [];

  if (vendor && vendor.trim()) {
    params.push(vendor.trim());
    conditions.push(`LOWER(m.vendor) = LOWER($${params.length})`);
  }

  if (modality && modality.trim()) {
    params.push(modality.trim());
    conditions.push(`LOWER(m.modality) = LOWER($${params.length})`);
  }

  if (accessType && accessType.trim()) {
    params.push(accessType.trim());
    conditions.push(`LOWER(COALESCE(m.access_type, m."accessType")) = LOWER($${params.length})`);
  }

  if (opennessType && opennessType.trim()) {
    params.push(opennessType.trim());
    conditions.push(`LOWER(COALESCE(m.openness_type, m."opennessType")) = LOWER($${params.length})`);
  }

  if (modelFamily && modelFamily.trim()) {
    params.push(modelFamily.trim());
    const idx = params.length;
    conditions.push(`(LOWER(COALESCE(m.model_family, m."modelFamily")) = LOWER($${idx}) OR LOWER(m.name) LIKE '%' || LOWER($${idx}) || '%')`);
  }

  if (category && category.trim()) {
    params.push(category.trim());
    conditions.push(`LOWER(m.category) = LOWER($${params.length})`);
  }

  if (capability && capability.trim()) {
    params.push(capability.trim());
    const idx = params.length;
    conditions.push(`EXISTS (
      SELECT 1 FROM jsonb_array_elements_text(
        CASE 
          WHEN jsonb_typeof(m.capabilities::jsonb) = 'array' THEN m.capabilities::jsonb 
          ELSE '[]'::jsonb 
        END
      ) elem 
      WHERE LOWER(elem) LIKE '%' || LOWER($${idx}) || '%'
    )`);
  }

  if (researchArea && researchArea.trim()) {
    params.push(researchArea.trim());
    const idx = params.length;
    conditions.push(`EXISTS (
      SELECT 1 FROM jsonb_array_elements_text(
        CASE 
          WHEN jsonb_typeof(COALESCE(m.research_areas, m."researchAreas")::jsonb) = 'array' 
            THEN COALESCE(m.research_areas, m."researchAreas")::jsonb 
          ELSE '[]'::jsonb 
        END
      ) elem 
      WHERE LOWER(elem) LIKE '%' || LOWER($${idx}) || '%'
    )`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  let orderByClause = "ORDER BY m.name ASC";
  if (sort === "recent") {
    orderByClause = "ORDER BY COALESCE(m.release_date, m.\"releaseDate\", m.created_at, m.\"createdAt\") DESC NULLS LAST, m.name ASC";
  } else if (sort === "trending") {
    orderByClause = "ORDER BY (COALESCE(m.trending_score, 0) + COALESCE(ms.citation_count, 0) + COALESCE(ms.github_stars, 0)) DESC, COALESCE(ms.paper_count, 0) DESC, m.name ASC";
  } else if (sort === "papers") {
    orderByClause = "ORDER BY COALESCE(ms.paper_count, 0) DESC, m.name ASC";
  } else if (sort === "benchmark") {
    orderByClause = "ORDER BY (COALESCE((COALESCE(m.benchmark_score, m.\"benchmarkScore\")->>'mmlu')::numeric, 0)) DESC NULLS LAST, m.name ASC";
  }

  params.push(limit);
  const limitIdx = params.length;
  params.push(skip);
  const skipIdx = params.length;

  const sql = `
    WITH model_stats AS (
      SELECT 
        pm.model_id,
        COUNT(pm.paper_id)::int as paper_count,
        SUM(COALESCE(p.citation_count, 0))::int as citation_count,
        SUM(COALESCE(p.github_stars, 0))::int as github_stars
      FROM paper_models pm
      JOIN papers p ON p.id = pm.paper_id
      GROUP BY pm.model_id
    ),
    model_latest_paper AS (
      SELECT DISTINCT ON (pm.model_id)
        pm.model_id,
        p.title as "latestPaperTitle",
        p.slug as "latestPaperSlug",
        p.publication_date as "latestPaperDate"
      FROM paper_models pm
      JOIN papers p ON p.id = pm.paper_id
      ORDER BY pm.model_id, p.publication_date DESC NULLS LAST, p.created_at DESC
    ),
    model_tasks AS (
      SELECT 
        sub.model_id,
        json_agg(json_build_object('id', sub.id, 'name', sub.name, 'slug', sub.slug, 'color', sub.color)) as tasks
      FROM (
        SELECT DISTINCT ON (pm.model_id, t.id)
          pm.model_id,
          t.id,
          t.name,
          t.slug,
          t.color
        FROM paper_models pm
        JOIN paper_tasks pt ON pt.paper_id = pm.paper_id
        JOIN tasks t ON t.id = pt.task_id
      ) sub
      GROUP BY sub.model_id
    )
    SELECT 
      m.id,
      m.name,
      m.slug,
      m.vendor,
      m.vendor_logo_url as "vendorLogoUrl",
      COALESCE(m.release_date, m."releaseDate") as "releaseDate",
      COALESCE(m.parameter_count, m."parameterCount") as "parameterCount",
      m.modality,
      COALESCE(m.access_type, m."accessType") as "accessType",
      COALESCE(m.openness_type, m."opennessType") as "opennessType",
      m.description,
      COALESCE(m.benchmark_score, m."benchmarkScore") as "benchmarkScore",
      COALESCE(m.model_family, m."modelFamily") as "modelFamily",
      m.category,
      m.capabilities,
      COALESCE(m.research_areas, m."researchAreas") as "researchAreas",
      m.architecture,
      COALESCE(m.context_window, m."contextWindow") as "contextWindow",
      m.license,
      COALESCE(m.model_versions, m."modelVersions") as "modelVersions",
      COALESCE(m.release_notes, m."releaseNotes") as "releaseNotes",
      COALESCE(m.paper_url, m."paperUrl") as "paperUrl",
      COALESCE(m.repository_url, m."repositoryUrl") as "repositoryUrl",
      COALESCE(m.api_url, m."apiUrl") as "apiUrl",
      COALESCE(m.created_at, m."createdAt") as "createdAt",
      COALESCE(m.trending_score, 0) as "trendingScore",
      COALESCE(ms.paper_count, 0) as "paperCount",
      COALESCE(ms.citation_count, 0) as "citationCount",
      COALESCE(ms.github_stars, 0) as "githubStars",
      mlp."latestPaperTitle",
      mlp."latestPaperSlug",
      mlp."latestPaperDate",
      COALESCE(mt.tasks, '[]'::json) as tasks
    FROM models m
    LEFT JOIN model_stats ms ON ms.model_id = m.id
    LEFT JOIN model_latest_paper mlp ON mlp.model_id = m.id
    LEFT JOIN model_tasks mt ON mt.model_id = m.id
    ${whereClause}
    ${orderByClause}
    LIMIT $${limitIdx} OFFSET $${skipIdx};
  `;

  const rows = await queryRouter.routeQuery<any[]>(async (prisma: PrismaClient) => {
    return prisma.$queryRawUnsafe<any[]>(sql, ...params);
  });

  if (!Array.isArray(rows)) return [];
  return rows.map(mapModelRow);
};

export const getModelBySlug = async (
  queryRouter: QueryRouter,
  slug: string
): Promise<ModelDetailItem | null> => {
  if (!slug || !slug.trim()) return null;

  const sql = `
    SELECT 
      m.id,
      m.name,
      m.slug,
      m.vendor,
      m.vendor_logo_url as "vendorLogoUrl",
      COALESCE(m.release_date, m."releaseDate") as "releaseDate",
      COALESCE(m.parameter_count, m."parameterCount") as "parameterCount",
      m.modality,
      COALESCE(m.access_type, m."accessType") as "accessType",
      COALESCE(m.openness_type, m."opennessType") as "opennessType",
      m.description,
      COALESCE(m.benchmark_score, m."benchmarkScore") as "benchmarkScore",
      COALESCE(m.model_family, m."modelFamily") as "modelFamily",
      m.category,
      m.capabilities,
      COALESCE(m.research_areas, m."researchAreas") as "researchAreas",
      m.architecture,
      COALESCE(m.context_window, m."contextWindow") as "contextWindow",
      m.license,
      COALESCE(m.model_versions, m."modelVersions") as "modelVersions",
      COALESCE(m.release_notes, m."releaseNotes") as "releaseNotes",
      COALESCE(m.paper_url, m."paperUrl") as "paperUrl",
      COALESCE(m.repository_url, m."repositoryUrl") as "repositoryUrl",
      COALESCE(m.api_url, m."apiUrl") as "apiUrl",
      COALESCE(m.created_at, m."createdAt") as "createdAt",
      COALESCE(m.trending_score, 0) as "trendingScore",
      COALESCE(stats.paper_count, 0)::int as "paperCount",
      COALESCE(stats.citation_count, 0)::int as "citationCount",
      COALESCE(stats.github_stars, 0)::int as "githubStars",
      COALESCE((
        SELECT json_agg(json_build_object(
          'id', p.id,
          'title', p.title,
          'slug', p.slug,
          'citationCount', COALESCE(p.citation_count, 0),
          'githubStars', COALESCE(p.github_stars, 0)
        ) ORDER BY COALESCE(p.github_stars, 0) DESC, COALESCE(p.citation_count, 0) DESC)
        FROM paper_models pm
        JOIN papers p ON p.id = pm.paper_id
        WHERE pm.model_id = m.id
      ), '[]'::json) as papers,
      COALESCE((
        SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug, 'color', t.color) ORDER BY t.name ASC)
        FROM (
          SELECT DISTINCT ON (t.id) t.id, t.name, t.slug, t.color
          FROM paper_models pm
          JOIN paper_tasks pt ON pt.paper_id = pm.paper_id
          JOIN tasks t ON t.id = pt.task_id
          WHERE pm.model_id = m.id
        ) t
      ), '[]'::json) as tasks,
      COALESCE((
        SELECT json_agg(json_build_object('id', me.id, 'name', me.name, 'slug', me.slug, 'category', me.category) ORDER BY me.name ASC)
        FROM (
          SELECT DISTINCT ON (me.id) me.id, me.name, me.slug, me.category
          FROM paper_models pm
          JOIN paper_methods pme ON pme.paper_id = pm.paper_id
          JOIN methods me ON me.id = pme.method_id
          WHERE pm.model_id = m.id
        ) me
      ), '[]'::json) as methods,
      COALESCE((
        SELECT json_agg(json_build_object('id', d.id, 'name', d.name, 'slug', d.slug) ORDER BY d.name ASC)
        FROM (
          SELECT DISTINCT ON (d.id) d.id, d.name, d.slug
          FROM paper_models pm
          JOIN paper_datasets pd ON pd.paper_id = pm.paper_id
          JOIN datasets d ON d.id = pd.dataset_id
          WHERE pm.model_id = m.id
        ) d
      ), '[]'::json) as datasets,
      COALESCE((
        SELECT json_agg(json_build_object(
          'rank', r.rank,
          'benchmark', json_build_object('id', r.b_id, 'name', r.b_name, 'slug', r.b_slug)
        ))
        FROM (
          SELECT DISTINCT ON (b.id) r.rank, b.id as b_id, b.name as b_name, b.slug as b_slug
          FROM paper_models pm
          JOIN rankings r ON r.paper_id = pm.paper_id
          JOIN benchmarks b ON b.id = r.benchmark_id
          WHERE pm.model_id = m.id
        ) r
      ), '[]'::json) as benchmarks,
      COALESCE((
        SELECT json_agg(json_build_object('id', rm.id, 'name', rm.name, 'slug', rm.slug, 'paperCount', rm.paper_count))
        FROM (
          SELECT rm2.id, rm2.name, rm2.slug, COUNT(DISTINCT pm3.paper_id)::int as paper_count
          FROM paper_models pm1
          JOIN paper_models pm2 ON pm1.paper_id = pm2.paper_id AND pm2.model_id != m.id
          JOIN models rm2 ON rm2.id = pm2.model_id
          LEFT JOIN paper_models pm3 ON pm3.model_id = rm2.id
          WHERE pm1.model_id = m.id
          GROUP BY rm2.id, rm2.name, rm2.slug
          ORDER BY paper_count DESC
          LIMIT 6
        ) rm
      ), '[]'::json) as "relatedModels"
    FROM models m
    LEFT JOIN LATERAL (
      SELECT 
        COUNT(pm.paper_id) as paper_count,
        SUM(COALESCE(p.citation_count, 0)) as citation_count,
        SUM(COALESCE(p.github_stars, 0)) as github_stars
      FROM paper_models pm
      JOIN papers p ON p.id = pm.paper_id
      WHERE pm.model_id = m.id
    ) stats ON true
    WHERE LOWER(m.slug) = LOWER($1) OR m.id = $1
    LIMIT 1;
  `;

  const rows = await queryRouter.routeQuery<any[]>(async (prisma: PrismaClient) => {
    return prisma.$queryRawUnsafe<any[]>(sql, slug.trim());
  });

  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  const row = rows[0];
  const base = mapModelRow(row);

  return {
    ...base,
    papers: Array.isArray(row.papers) ? row.papers : [],
    methods: Array.isArray(row.methods) ? row.methods : [],
    datasets: Array.isArray(row.datasets) ? row.datasets : [],
    benchmarks: Array.isArray(row.benchmarks) ? row.benchmarks : [],
    relatedModels: Array.isArray(row.relatedModels) ? row.relatedModels : [],
  };
};

export const getModelFacets = async (queryRouter: QueryRouter): Promise<ModelFacets> => {
  const sql = `
    WITH 
    total AS (
      SELECT COUNT(*)::int as count FROM models
    ),
    vendors AS (
      SELECT vendor as name, COUNT(*)::int as count 
      FROM models 
      WHERE vendor IS NOT NULL AND TRIM(vendor) != ''
      GROUP BY vendor 
      ORDER BY count DESC
    ),
    modalities AS (
      SELECT modality as name, COUNT(*)::int as count 
      FROM models 
      WHERE modality IS NOT NULL AND TRIM(modality) != ''
      GROUP BY modality 
      ORDER BY count DESC
    ),
    access_types AS (
      SELECT COALESCE(access_type, "accessType") as name, COUNT(*)::int as count 
      FROM models 
      WHERE COALESCE(access_type, "accessType") IS NOT NULL AND TRIM(COALESCE(access_type, "accessType")) != ''
      GROUP BY COALESCE(access_type, "accessType") 
      ORDER BY count DESC
    ),
    openness_types AS (
      SELECT COALESCE(openness_type, "opennessType") as name, COUNT(*)::int as count 
      FROM models 
      WHERE COALESCE(openness_type, "opennessType") IS NOT NULL AND TRIM(COALESCE(openness_type, "opennessType")) != ''
      GROUP BY COALESCE(openness_type, "opennessType") 
      ORDER BY count DESC
    ),
    model_families AS (
      SELECT COALESCE(model_family, "modelFamily") as name, COUNT(*)::int as count 
      FROM models 
      WHERE COALESCE(model_family, "modelFamily") IS NOT NULL AND TRIM(COALESCE(model_family, "modelFamily")) != ''
      GROUP BY COALESCE(model_family, "modelFamily") 
      ORDER BY count DESC
    ),
    caps AS (
      SELECT elem as name, COUNT(*)::int as count
      FROM models m,
      LATERAL (
        SELECT jsonb_array_elements_text(
          CASE 
            WHEN jsonb_typeof(m.capabilities::jsonb) = 'array' THEN m.capabilities::jsonb
            ELSE '[]'::jsonb
          END
        ) as elem
      ) t
      WHERE elem IS NOT NULL AND TRIM(elem) != ''
      GROUP BY elem
      ORDER BY count DESC
    ),
    areas AS (
      SELECT elem as name, COUNT(*)::int as count
      FROM models m,
      LATERAL (
        SELECT jsonb_array_elements_text(
          CASE 
            WHEN jsonb_typeof(COALESCE(m.research_areas, m."researchAreas")::jsonb) = 'array' 
              THEN COALESCE(m.research_areas, m."researchAreas")::jsonb
            ELSE '[]'::jsonb
          END
        ) as elem
      ) t
      WHERE elem IS NOT NULL AND TRIM(elem) != ''
      GROUP BY elem
      ORDER BY count DESC
    )
    SELECT 
      (SELECT count FROM total) as "totalModels",
      COALESCE((SELECT json_agg(json_build_object('name', name, 'count', count)) FROM vendors), '[]'::json) as vendors,
      COALESCE((SELECT json_agg(json_build_object('name', name, 'count', count)) FROM modalities), '[]'::json) as modalities,
      COALESCE((SELECT json_agg(json_build_object('name', name, 'count', count)) FROM access_types), '[]'::json) as "accessTypes",
      COALESCE((SELECT json_agg(json_build_object('name', name, 'count', count)) FROM openness_types), '[]'::json) as "opennessTypes",
      COALESCE((SELECT json_agg(json_build_object('name', name, 'count', count)) FROM model_families), '[]'::json) as "modelFamilies",
      COALESCE((SELECT json_agg(json_build_object('name', name, 'count', count)) FROM caps), '[]'::json) as capabilities,
      COALESCE((SELECT json_agg(json_build_object('name', name, 'count', count)) FROM areas), '[]'::json) as "researchAreas";
  `;

  const rows = await queryRouter.routeQuery<any[]>(async (prisma: PrismaClient) => {
    return prisma.$queryRawUnsafe<any[]>(sql);
  });

  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      totalModels: 0,
      vendors: [],
      modalities: [],
      accessTypes: [],
      opennessTypes: [],
      modelFamilies: [],
      capabilities: [],
      researchAreas: [],
    };
  }

  const r = rows[0];
  return {
    totalModels: Number(r.totalModels) || 0,
    vendors: Array.isArray(r.vendors) ? r.vendors : [],
    modalities: Array.isArray(r.modalities) ? r.modalities : [],
    accessTypes: Array.isArray(r.accessTypes) ? r.accessTypes : [],
    opennessTypes: Array.isArray(r.opennessTypes) ? r.opennessTypes : [],
    modelFamilies: Array.isArray(r.modelFamilies) ? r.modelFamilies : [],
    capabilities: Array.isArray(r.capabilities) ? r.capabilities : [],
    researchAreas: Array.isArray(r.researchAreas) ? r.researchAreas : [],
  };
};