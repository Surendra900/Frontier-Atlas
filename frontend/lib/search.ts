import { fetchApi } from './api';
import { getMethods } from './methods';
import { getTasks } from './tasks';
import { getModels } from './models';
import { getDatasets } from './datasets';
import { getAuthors } from './authors';
import { searchPapers } from "./paperApi";

export type SearchResultType = 'papers' | 'authors' | 'methods' | 'tasks' | 'models' | 'datasets';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  metadata?: Record<string, unknown>;
}

export interface SearchResults {
  papers: SearchResult[];
  authors: SearchResult[];
  methods: SearchResult[];
  tasks: SearchResult[];
  models: SearchResult[];
  datasets: SearchResult[];
}

export interface SearchResultsResponse {
  status: string;
  data: SearchResults;
}

/**
 * Global search API - NOTE: This endpoint does not exist yet in the backend.
 * 
 * REQUIRED BACKEND ENDPOINT:
 * GET /api/v1/search?q={query}&limit={limit}
 * 
 * Expected response format:
 * {
 *   status: "success",
 *   data: {
 *     papers: [{ id, title, slug, citationCount, publicationDate, ... }],
 *     authors: [{ id, name, slug, paperCount, ... }],
 *     methods: [{ id, name, slug, paperCount, ... }],
 *     tasks: [{ id, name, slug, color, ... }],
 *     models: [{ id, name, slug, paperCount, ... }],
 *     datasets: [{ id, name, slug, paperCount, ... }]
 *   }
 * }
 * 
 * CURRENT BACKEND LIMITATIONS:
 * - No global search endpoint exists
 * - Methods endpoint supports search parameter
 * - Papers endpoint supports task/method filters but not full-text search
 * - Authors, Tasks, Models, Datasets endpoints have no search parameters
 * 
 * This function will attempt to call the global search endpoint when available,
 * and fall back to individual entity searches with client-side filtering.
 */
export async function globalSearch(query: string, limit: number = 10): Promise<SearchResults> {
  if (!query.trim()) {
    return {
      papers: [],
      authors: [],
      methods: [],
      tasks: [],
      models: [],
      datasets: [],
    };
  }

  try {
    const response = await fetchApi<SearchResultsResponse>(
      `/api/v1/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    const data = response?.data || ({} as any);
    return {
      papers: Array.isArray(data.papers) ? data.papers : [],
      authors: Array.isArray(data.authors) ? data.authors : [],
      methods: Array.isArray(data.methods) ? data.methods : [],
      tasks: Array.isArray(data.tasks) ? data.tasks : [],
      models: Array.isArray(data.models) ? data.models : [],
      datasets: Array.isArray(data.datasets) ? data.datasets : [],
    };
  } catch (err) {
    console.log("Backend search failed, using fallback:", err);
    return fallbackSearch(query, limit);
  }
}

/**
 * Fallback search using individual APIs with client-side filtering.
 * This is a temporary solution until backend global search is implemented.
 */
async function fallbackSearch(query: string, limit: number): Promise<SearchResults> {
  const q = query.toLowerCase();

  // Individual sub-fetches with resilient error handling
  const methodsData = await getMethods({ search: q, limit }).catch(() => ({ methods: [], total: 0, page: 1, hasMore: false }));
  const methods: SearchResult[] = (methodsData?.methods || []).slice(0, limit).map((m) => ({
    type: 'methods' as const,
    id: m.id,
    title: m.name,
    slug: m.slug,
    subtitle: `${m.paperCount} paper${m.paperCount !== 1 ? 's' : ''}`,
    metadata: { paperCount: m.paperCount },
  }));

  const [tasks, models, datasets, authors, papersResult] = await Promise.all([
    getTasks().catch(() => []),
    getModels().catch(() => []),
    getDatasets().catch(() => []),
    getAuthors().catch(() => []),
    searchPapers(query).catch(() => []),
  ]);

  const papersData = papersResult;
  console.log("papersData:", papersData);

  const tasksFiltered = tasks
    .filter((t) => t.name.toLowerCase().includes(q))
    .slice(0, limit)
    .map((t) => ({
      type: 'tasks' as const,
      id: t.id,
      title: t.name,
      slug: t.slug,
      metadata: { color: t.color },
    }));

  const modelsFiltered = models
    .filter((m) => m.name.toLowerCase().includes(q))
    .slice(0, limit)
    .map((m) => ({
      type: 'models' as const,
      id: m.id,
      title: m.name,
      slug: m.slug,
      metadata: { createdAt: m.createdAt },
    }));

  const datasetsFiltered = datasets
    .filter((d) => d.name.toLowerCase().includes(q))
    .slice(0, limit)
    .map((d) => ({
      type: 'datasets' as const,
      id: d.id,
      title: d.name,
      slug: d.slug,
      metadata: { createdAt: d.createdAt },
    }));

  const authorsFiltered = authors
    .filter((a) => a.name.toLowerCase().includes(q))
    .slice(0, limit)
    .map((a) => ({
      type: 'authors' as const,
      id: a.id,
      title: a.name,
      slug: a.slug,
      metadata: { createdAt: a.createdAt },
    }));

  const papersFiltered = papersData
    .filter((p) => p.title.toLowerCase().includes(q))
    .slice(0, limit)
    .map((p) => ({
      type: 'papers' as const,
      id: String(p.id),
      title: p.title,
      slug: p.slug,
      subtitle: `${p.citations} citation${p.citations !== 1 ? 's' : ''}`,
      metadata: { citationCount: p.citations, date: p.date, projectUrl: p.projectUrl },
    }));

  return {
    papers: papersFiltered,
    authors: authorsFiltered,
    methods,
    tasks: tasksFiltered,
    models: modelsFiltered,
    datasets: datasetsFiltered,
  };
}

/**
 * Search suggestions/autocomplete - NOTE: This endpoint does not exist yet.
 * 
 * REQUIRED BACKEND ENDPOINT:
 * GET /api/v1/search/suggestions?q={query}&limit={limit}
 * 
 * Expected response format:
 * {
 *   status: "success",
 *   data: [
 *     { type: 'paper', id, title, slug },
 *     { type: 'author', id, title, slug },
 *     ...
 *   ]
 * }
 */
export async function searchSuggestions(query: string, limit: number = 8): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  try {
    const response = await fetchApi<{ status: string; data: SearchResult[] }>(
      `/api/v1/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    if (Array.isArray(response?.data)) {
      return response.data;
    }
    throw new Error("Invalid format");
  } catch {
    // Fallback: Use global search and combine prioritized results
    const results = await globalSearch(query, limit);
    const combined: SearchResult[] = [
      ...(results.papers || []).slice(0, 3),
      ...(results.models || []).slice(0, 2),
      ...(results.tasks || []).slice(0, 2),
      ...(results.methods || []).slice(0, 2),
      ...(results.authors || []).slice(0, 2),
      ...(results.datasets || []).slice(0, 1),
    ];
    return combined.slice(0, limit);
  }
}
