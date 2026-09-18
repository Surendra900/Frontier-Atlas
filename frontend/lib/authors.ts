import { fetchApi } from './api';

export interface BackendAuthorItem {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface AuthorItem {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface AuthorPaper {
  id: string;
  title: string;
  slug: string;
  citationCount: number;
}

export interface AuthorDetail {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  paperCount: number;
  papers: AuthorPaper[];
}

export interface GetAuthorsResponse {
  status: string;
  count: number;
  data: BackendAuthorItem[];
}

export interface GetAuthorBySlugResponse {
  status: string;
  data: BackendAuthorDetail;
}

interface BackendAuthorDetail {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  papers: { paper: AuthorPaper }[];
}

export async function getAuthors(): Promise<AuthorItem[]> {
  const response = await fetchApi<GetAuthorsResponse>('/api/v1/authors?limit=100');
  const items = Array.isArray(response?.data) ? response.data : [];
  return items.map((a) => ({
    id: a.id,
    name: a.name,
    slug: a.slug,
    createdAt: a.createdAt,
  }));
}

export async function getAuthorBySlug(slug: string): Promise<AuthorDetail> {
  const response = await fetchApi<GetAuthorBySlugResponse>(`/api/v1/authors/${encodeURIComponent(slug)}`);
  const data = response.data;
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    createdAt: data.createdAt,
    paperCount: data.papers?.length ?? 0,
    papers: (data.papers ?? []).map((item: any) => item?.paper || item).filter(Boolean),
  };
}
