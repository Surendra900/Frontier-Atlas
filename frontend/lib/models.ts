import { fetchApi } from './api';
import { getPapers } from './paperApi';

// Base interface to eliminate duplicate field definitions
export interface BaseModel {
  id: string;
  name: string;
  slug: string;
  vendor: string;
  vendorLogoUrl?: string;
  releaseDate: string | null;
  parameterCount: string | null;
  modality: string | null;
  accessType: string | null;
  opennessType: string | null;
  description: string | null;
  benchmarkScore: Record<string, number> | null;
  modelFamily: string | null;
  category: string | null;
  capabilities: string[] | null;
  researchAreas: string[] | null;
  architecture: string | null;
  contextWindow: string | number | null;
  maxOutputTokens?: number | null;
  inputCostPerMtoken?: number | null;
  outputCostPerMtoken?: number | null;
  license: string | null;
  paperUrl: string | null;
  repositoryUrl: string | null;
  apiUrl: string | null;
  huggingFaceId?: string | null;
  createdAt: string;
  paperCount: number;
  citationCount: number;
  githubStars: number;
  trendingScore: number;
  variants?: any[];
  isCanonical?: boolean;
  papers?: ModelPaper[];
  sourceCatalog?: string | null;
}

export interface CardMeta {
  slug: string;
  title: string;
  type: string;
  description: string;
  totalModels: number;
}

export interface BackendModelItem extends BaseModel {
  modelVersions: string[] | null;
  releaseNotes: string | null;
}

export interface ModelTask {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export interface ModelPaper {
  id: string;
  title: string;
  slug: string;
  arxivId?: string | null;
  citationCount: number;
  githubStars: number;
  role?: string | null;
  confidence?: number | null;
}

export interface BackendModelDetail extends Omit<BackendModelItem, "papers"> {
  papers: Array<{ paper_id?: string; model_id?: string; paper?: ModelPaper } | ModelPaper>;
  tasks: ModelTask[];
  methods: { id: string; name: string; slug: string; category: string }[];
  datasets: { id: string; name: string; slug: string }[];
  benchmarks: unknown[];
  relatedModels: { id: string; name: string; slug: string; paperCount: number }[];
}

export interface ModelItem extends BaseModel {
  latestPaperDate: string | null;
  latestPaperTitle: string | null;
  latestPaperSlug: string | null;
  tasks: ModelTask[];
  papers?: ModelPaper[];
}

export interface ModelDetail extends BaseModel {
  papers: ModelPaper[];
  tasks: ModelTask[];
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

interface GetModelsResponse {
  status: string;
  count: number;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  data: BackendModelItem[];
}

interface GetModelBySlugResponse {
  status: string;
  data: BackendModelDetail;
}

interface GetFacetsResponse {
  status: string;
  data: ModelFacets;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const modelsCache = new Map<string, CacheEntry<unknown>>();

function mapModelItem(m: BackendModelItem): ModelItem {
  const raw = m as any;
  return {
    id: m.id,
    name: m.name,
    slug: m.slug,
    vendor: m.vendor,
    vendorLogoUrl: m.vendorLogoUrl || raw.vendor_logo_url,
    releaseDate: m.releaseDate,
    parameterCount: m.parameterCount,
    modality: m.modality,
    accessType: m.accessType,
    opennessType: m.opennessType,
    description: m.description,
    benchmarkScore: m.benchmarkScore,
    modelFamily: m.modelFamily,
    category: m.category,
    capabilities: m.capabilities,
    researchAreas: m.researchAreas,
    architecture: m.architecture,
    contextWindow: (m.contextWindow !== undefined && m.contextWindow !== null)
      ? m.contextWindow
      : (raw.context_window !== undefined && raw.context_window !== null ? raw.context_window : null),
    maxOutputTokens: raw.maxOutputTokens || raw.max_output_tokens || null,
    inputCostPerMtoken: (raw.inputCostPerMtoken !== undefined && raw.inputCostPerMtoken !== null)
      ? raw.inputCostPerMtoken
      : (raw.input_cost_per_mtoken != null && raw.input_cost_per_mtoken !== "" ? parseFloat(raw.input_cost_per_mtoken) : null),
    outputCostPerMtoken: (raw.outputCostPerMtoken !== undefined && raw.outputCostPerMtoken !== null)
      ? raw.outputCostPerMtoken
      : (raw.output_cost_per_mtoken != null && raw.output_cost_per_mtoken !== "" ? parseFloat(raw.output_cost_per_mtoken) : null),
    license: m.license,
    paperUrl: m.paperUrl,
    repositoryUrl: m.repositoryUrl,
    apiUrl: m.apiUrl,
    huggingFaceId: raw.huggingFaceId || raw.hugging_face_id,
    createdAt: m.createdAt,
    paperCount: m.paperCount || (Array.isArray(raw.papers) ? raw.papers.length : 0),
    citationCount: m.citationCount,
    githubStars: m.githubStars,
    trendingScore: m.trendingScore,
    variants: Array.isArray(raw.variants) ? raw.variants : [],
    isCanonical: raw.is_canonical !== false,
    sourceCatalog: raw.sourceCatalog || raw.source_catalog || null,
    latestPaperDate: null,
    latestPaperTitle: null,
    latestPaperSlug: null,
    tasks: [],
    papers: Array.isArray(raw.papers) ? raw.papers : [],
  };
}

function getCached<T>(key: string): T | null {
  const now = Date.now();

  // 1. Check in-memory cache with TTL validation
  if (modelsCache.has(key)) {
    const entry = modelsCache.get(key) as CacheEntry<T>;
    if (now - entry.timestamp < CACHE_TTL_MS) {
      return entry.data;
    }
    modelsCache.delete(key);
  }

  // 2. Fall back to localStorage if in browser environment
  if (typeof window !== 'undefined') {
    try {
      const storageKey = `atlas_cache_${key}`;
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const entry: CacheEntry<T> = JSON.parse(cached);
        if (now - entry.timestamp < CACHE_TTL_MS) {
          modelsCache.set(key, entry);
          return entry.data;
        }
        localStorage.removeItem(storageKey);
      }
    } catch {
      // In case of invalid JSON or restricted storage access
    }
  }
  return null;
}

function setCached<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  modelsCache.set(key, entry as CacheEntry<unknown>);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`atlas_cache_${key}`, JSON.stringify(entry));
    } catch {
      // Handle potential quota errors gracefully
    }
  }
}

export function saveCachedModelDetail(slug: string, detail: ModelDetail): void {
  const cleanSlug = slug.toLowerCase().trim();
  setCached(`model_detail_${cleanSlug}`, detail);
}

export function getCachedModelBySlug(slug: string): ModelDetail | null {
  const cleanSlug = slug.toLowerCase().trim();

  // 1. Check direct detail cache
  const cachedDetail = getCached<ModelDetail>(`model_detail_${cleanSlug}`);
  if (cachedDetail) return cachedDetail;

  // 2. Check catalog list cache for instant preview
  const catalog = getCachedModels();
  if (catalog && Array.isArray(catalog)) {
    const item = catalog.find((m) => m.slug.toLowerCase() === cleanSlug || m.id === cleanSlug);
    if (item) {
      return {
        id: item.id,
        name: item.name,
        slug: item.slug,
        vendor: item.vendor,
        vendorLogoUrl: item.vendorLogoUrl,
        releaseDate: item.releaseDate,
        parameterCount: item.parameterCount,
        modality: item.modality,
        accessType: item.accessType,
        opennessType: item.opennessType,
        description: item.description,
        benchmarkScore: item.benchmarkScore,
        modelFamily: item.modelFamily,
        category: item.category,
        capabilities: item.capabilities,
        researchAreas: item.researchAreas,
        architecture: item.architecture,
        contextWindow: item.contextWindow,
        license: item.license,
        paperUrl: item.paperUrl,
        repositoryUrl: item.repositoryUrl,
        apiUrl: item.apiUrl,
        createdAt: item.createdAt,
        paperCount: item.paperCount,
        citationCount: item.citationCount,
        githubStars: item.githubStars,
        trendingScore: item.trendingScore,
        papers: [],
        tasks: item.tasks || [],
      };
    }
  }

  return null;
}

export async function getModels(params?: string | Record<string, unknown>): Promise<ModelItem[]> {
  let queryString = '?limit=10000';
  if (typeof params === 'string') {
    queryString = params.startsWith('?') ? params : `?${params}`;
  } else if (params && typeof params === 'object') {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) searchParams.set(k, String(v));
    });
    queryString = `?${searchParams.toString()}`;
  }

  const cacheKey = `models_${queryString}`;
  const cached = getCached<ModelItem[]>(cacheKey);
  if (cached) return cached;

  const response = await fetchApi<GetModelsResponse>(`/api/v1/models${queryString}`);
  // console.log(response)
  const items = Array.isArray(response?.data) ? response.data : [];
  const result = items.map(mapModelItem);

  setCached(cacheKey, result);
  return result;
}

export async function getTrendingModels(limit = 20): Promise<ModelItem[]> {
  return getModels(`sort=trending&limit=${limit}`);
}

export async function getModelFacets(): Promise<ModelFacets> {
  const cacheKey = 'models_facets';

  const cached = getCached<ModelFacets>(cacheKey);
  if (cached) return cached;

  const response = await fetchApi<GetFacetsResponse>('/api/v1/models/facets');
  setCached(cacheKey, response.data);
  return response.data;
}

export function getCachedModels(params?: string): ModelItem[] | null {
  const query = params ? `?${params}` : '?limit=10000';
  return getCached<ModelItem[]>(`models_${query}`);
}

export function getCachedTrendingModels(limit = 20): ModelItem[] | null {
  return getCached<ModelItem[]>(`models_?sort=trending&limit=${limit}`);
}

export function getCachedModelFacets(): ModelFacets | null {
  return getCached<ModelFacets>('models_facets');
}

export async function getModelBySlug(slug: string): Promise<ModelDetail> {
  const cleanSlug = slug.toLowerCase().trim();
  const cached = getCachedModelBySlug(cleanSlug);

  try {
    const response = await fetchApi<GetModelBySlugResponse>(`/api/v1/models/${encodeURIComponent(cleanSlug)}`);
    const data = response.data;

    const detail: ModelDetail = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      vendor: data.vendor,
      vendorLogoUrl: data.vendorLogoUrl,
      releaseDate: data.releaseDate,
      parameterCount: data.parameterCount,
      modality: data.modality,
      accessType: data.accessType,
      opennessType: data.opennessType,
      description: data.description,
      benchmarkScore: data.benchmarkScore,
      modelFamily: data.modelFamily,
      category: data.category,
      capabilities: data.capabilities,
      researchAreas: data.researchAreas,
      architecture: data.architecture,
      contextWindow: data.contextWindow,
      license: data.license,
      paperUrl: data.paperUrl,
      repositoryUrl: data.repositoryUrl,
      apiUrl: data.apiUrl,
      createdAt: data.createdAt,
      paperCount: data.paperCount,
      citationCount: data.citationCount,
      githubStars: data.githubStars,
      trendingScore: data.trendingScore,
      papers: (data.papers ?? [])
        .map((item) => (item && typeof item === "object" && "paper" in item && item.paper ? item.paper : item))
        .filter((paper): paper is ModelPaper => Boolean(paper && typeof paper === "object" && "id" in paper && paper.id && "title" in paper && paper.title)),
      tasks: data.tasks ?? [],
    };

    saveCachedModelDetail(cleanSlug, detail);
    return detail;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

export function prefetchModelBySlug(slug: string): void {
  if (typeof window === 'undefined' || !slug) return;

  const cleanSlug = slug.toLowerCase().trim();

  if (!modelsCache.has(`model_detail_${cleanSlug}`)) {
    getModelBySlug(cleanSlug).catch(() => { });
  }

  getPapers({
    page: 1,
    model: cleanSlug,
    sort: 'popular',
    period: 'all',
  }).catch(() => { });
}

if (typeof window !== 'undefined') {
  const prefetchModels = async (): Promise<void> => {
    try {
      await Promise.all([
        getModels(),
        getModelFacets(),
        getTrendingModels(15),
      ]);
    } catch (e) {
      console.warn('Pre-warming models cache failed:', e);
    }
  };

  const win = window as unknown as { requestIdleCallback?: (cb: () => void) => void };
  if (typeof win.requestIdleCallback === 'function') {
    win.requestIdleCallback(() => setTimeout(prefetchModels, 100));
  } else {
    setTimeout(prefetchModels, 500);
  }
}

export async function getModelCardMeta(slug: string): Promise<CardMeta> {
  const cleanSlug = slug.toLowerCase().trim();
  const cacheKey = `card_meta_${cleanSlug}`;
  const cached = getCached<CardMeta>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetchApi<{ status: string; data: CardMeta }>(
      `/api/v1/models/card-meta?slug=${encodeURIComponent(cleanSlug)}`
    );
    if (res?.data) {
      setCached(cacheKey, res.data);
      return res.data;
    }
  } catch (err) {
    console.error("Failed to fetch card meta:", err);
  }

  const formatted = cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1).replace(/-/g, " ");
  return {
    slug: cleanSlug,
    title: `${formatted} AI Models`,
    type: "general",
    description: `Explore frontier AI models, pricing specifications, and mapped research papers for ${formatted}.`,
    totalModels: 0,
  };
}