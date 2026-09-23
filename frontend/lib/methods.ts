import { fetchApi } from './api';

export interface MethodItem {
  id: string;
  name: string;
  slug: string;
  paperCount: number;
}

export interface GetMethodsResponseData {
  methods: MethodItem[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface GetMethodsResponse {
  status: string;
  count?: number;
  data: GetMethodsResponseData;
}

export interface GetMethodsParams {
  sort?: 'name' | 'papers';
  search?: string;
  page?: number;
  limit?: number;
}

export interface MethodPaperAuthor {
  name: string;
}

export interface MethodPaper {
  id: string;
  title: string;
  slug: string;
  citationCount: number;
  publicationDate: string;
  githubStars: number;
  authors: MethodPaperAuthor[];
  abstract?: string;
  pdfUrl?: string;
  githubUrl?: string;
}

export interface MethodDetail {
  id: string;
  name: string;
  slug: string;
  paperCount: number;
  papers: MethodPaper[];
  category?: string;
  categoryName?: string;
  categoryMethods?: { name: string; slug?: string }[];
  tasksJson?: { name: string; description?: string }[];
  implementations?: { name: string; url: string; type?: string }[];
  metricsJson?: { components?: number; repos?: number; papersUsing?: number; [key: string]: unknown };
  sotaResults?: { task: string; dataset: string; metric: string; score: string; model: string; year: number }[];
  usageTrend?: { year: number; count: number }[];
  description?: string;
  architectureUrl?: string;
  sourceUrl?: string;
}

export interface GetMethodBySlugResponse {
  status: string;
  data: MethodDetail;
}

export function slugify(name?: string): string {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

export async function getMethods(params: GetMethodsParams = {}): Promise<GetMethodsResponseData> {
  const searchParams = new URLSearchParams();
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.search) searchParams.set('search', params.search.trim());
  if (params.page && !isNaN(params.page)) searchParams.set('page', String(params.page));
  if (params.limit && !isNaN(params.limit)) searchParams.set('limit', String(params.limit));

  const qs = searchParams.toString();
  const endpoint = `/api/v1/methods${qs ? `?${qs}` : ''}`;

  try {
    const response = await fetchApi<GetMethodsResponse>(endpoint);
    return {
      methods: Array.isArray(response?.data?.methods) ? response.data.methods : [],
      total: response?.data?.total ?? 0,
      page: response?.data?.page ?? 1,
      hasMore: Boolean(response?.data?.hasMore),
    };
  } catch (error) {
    console.error('Error fetching methods:', error);
    return {
      methods: [],
      total: 0,
      page: 1,
      hasMore: false,
    };
  }
}

export async function getMethodBySlug(slug: string): Promise<MethodDetail | null> {
  if (!slug || typeof slug !== 'string') return null;

  try {
    const response = await fetchApi<GetMethodBySlugResponse>(`/api/v1/methods/${encodeURIComponent(slug.trim())}`);
    return response?.data ?? null;
  } catch (error) {
    console.error(`Error fetching method by slug "${slug}":`, error);
    return null;
  }
}