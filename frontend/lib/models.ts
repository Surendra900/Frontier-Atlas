import { fetchApi } from './api';
import { getPapers } from './paperApi';

export interface BackendModelItem {
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
  contextWindow: string | null;
  license: string | null;
  modelVersions: string[] | null;
  releaseNotes: string | null;
  paperUrl: string | null;
  repositoryUrl: string | null;
  apiUrl: string | null;
  createdAt: string;
  paperCount: number;
  citationCount: number;
  githubStars: number;
  trendingScore: number;
}

export interface ModelTask {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export interface BackendModelDetail extends BackendModelItem {
  papers: { paper_id: string; model_id: string; paper: ModelPaper }[];
  tasks: ModelTask[];
  methods: { id: string; name: string; slug: string; category: string }[];
  datasets: { id: string; name: string; slug: string }[];
  benchmarks: unknown[];
  relatedModels: { id: string; name: string; slug: string; paperCount: number }[];
  familyModels?: BackendModelItem[];
}

export interface ModelPaper {
  id: string;
  title: string;
  slug: string;
  citationCount: number;
  githubStars: number;
}

export interface ModelItem {
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
  contextWindow: string | null;
  license: string | null;
  paperUrl: string | null;
repositoryUrl: string | null;
apiUrl: string | null;
  createdAt: string;
  paperCount: number;
  citationCount: number;
  githubStars: number;
  trendingScore: number;
  latestPaperDate: string | null;
  latestPaperTitle: string | null;
  latestPaperSlug: string | null;
  tasks: ModelTask[];
}

export interface ModelDetail {
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
  contextWindow: string | null;
  license: string | null;
  paperUrl: string | null;
repositoryUrl: string | null;
apiUrl: string | null;
  createdAt: string;
  paperCount: number;
  citationCount: number;
  githubStars: number;
  trendingScore: number;
  papers: ModelPaper[];
  tasks: ModelTask[];
  familyModels?: ModelItem[];
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

function mapModelItem(m: BackendModelItem | any): ModelItem {
  return {
    id: m.id,
    name: m.name,
    slug: m.slug,
    vendor: m.vendor || '',
    vendorLogoUrl: m.vendorLogoUrl || m.vendor_logo_url,
    releaseDate: m.releaseDate ?? null,
    parameterCount: m.parameterCount ?? null,
    modality: m.modality ?? null,
    accessType: m.accessType ?? null,
    opennessType: m.opennessType ?? null,
    description: m.description ?? null,
    benchmarkScore: m.benchmarkScore ?? m.benchmark_score ?? null,
    modelFamily: m.modelFamily ?? m.model_family ?? null,
    category: m.category ?? null,
    capabilities: m.capabilities ?? null,
    researchAreas: m.researchAreas ?? m.research_areas ?? null,
    architecture: m.architecture ?? null,
    contextWindow: m.contextWindow ?? m.context_window ?? null,
    license: m.license ?? null,
    paperUrl: m.paperUrl ?? m.paper_url ?? null,
    repositoryUrl: m.repositoryUrl ?? m.repository_url ?? null,
    apiUrl: m.apiUrl ?? m.api_url ?? null,
    createdAt: m.createdAt || '',
    paperCount: m.paperCount || 0,
    citationCount: m.citationCount || 0,
    githubStars: m.githubStars || 0,
    trendingScore: m.trendingScore || 0,
    latestPaperDate: null,
    latestPaperTitle: null,
    latestPaperSlug: null,
    tasks: [],
  };
}

const modelsCache = new Map<string, any>();

function getCached<T>(key: string): T | null {
  if (modelsCache.has(key)) return modelsCache.get(key) as T;
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(`atlas_cache_${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 15 * 60 * 1000) { // 15 min TTL
          modelsCache.set(key, data);
          return data as T;
        }
      }
    } catch(e) {}
  }
  return null;
}

function setCached(key: string, data: any) {
  modelsCache.set(key, data);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`atlas_cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch(e) {}
  }
}

export function saveCachedModelDetail(slug: string, detail: ModelDetail) {
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

export async function getModels(params?: string | Record<string, any>): Promise<ModelItem[]> {
  let queryString = '?limit=10000';
  if (typeof params === 'string') {
    queryString = params.startsWith('?') ? params : `?${params}`;
  } else if (params && typeof params === 'object') {
    const searchParams = new URLSearchParams();
    if (!('limit' in params)) {
      searchParams.set('limit', '10000');
    }
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) searchParams.set(k, String(v));
    });
    queryString = `?${searchParams.toString()}`;
  }

  const cacheKey = `models_${queryString}`;
  
  const cached = getCached<ModelItem[]>(cacheKey);
  if (cached) return cached;

  const response = await fetchApi<GetModelsResponse>(`/api/v1/models${queryString}`);
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
  
  // Make API call to fetch full fresh data with benchmarks & papers
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
      papers: (data.papers ?? []).map((item: any) => item?.paper || item).filter(Boolean),
      tasks: data.tasks ?? [],
      familyModels: Array.isArray(data.familyModels)
        ? data.familyModels.map(mapModelItem)
        : [],
    };
    saveCachedModelDetail(cleanSlug, detail);
    return detail;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

export function prefetchModelBySlug(slug: string) {
  if (typeof window === "undefined" || !slug) return;

  const cleanSlug = slug.toLowerCase().trim();

  if (!modelsCache.has(`model_detail_${cleanSlug}`)) {
    getModelBySlug(cleanSlug).catch(() => {});
  }

  getPapers({
    page: 1,
    model: cleanSlug,
    sort: "popular",
    period: "all",
  }).catch(() => {});
}

if (typeof window !== "undefined") {
  const prefetchModels = async () => {
    try {
      await Promise.all([
        getModels(),
        getModelFacets(),
        getTrendingModels(15),
      ]);
    } catch (e) {
      console.warn("Pre-warming models cache failed:", e);
    }
  };
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(() => setTimeout(prefetchModels, 100));
  } else {
    setTimeout(prefetchModels, 500);
  }
}
