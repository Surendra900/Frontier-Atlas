import { fetchApi } from './api';

export interface BackendDatasetItem {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface DatasetItem {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface DatasetPaper {
  id: string;
  title: string;
  slug: string;
  citationCount: number;
}

export interface DatasetDetail {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  paperCount: number;
  papers: DatasetPaper[];
}

export interface GetDatasetsResponse {
  status: string;
  count: number;
  data: BackendDatasetItem[];
}

export interface GetDatasetBySlugResponse {
  status: string;
  data: BackendDatasetDetail;
}

interface BackendDatasetDetail {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  papers: { paper: DatasetPaper }[];
}

export async function getDatasets(): Promise<DatasetItem[]> {
  const response = await fetchApi<GetDatasetsResponse>('/api/v1/datasets?limit=100');
  const items = Array.isArray(response?.data) ? response.data : [];
  return items.map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    createdAt: d.createdAt,
  }));
}

export async function getDatasetBySlug(slug: string): Promise<DatasetDetail> {
  const response = await fetchApi<GetDatasetBySlugResponse>(`/api/v1/datasets/${encodeURIComponent(slug)}`);
  const data = response.data;
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    createdAt: data.createdAt,
    paperCount: data.papers?.length ?? 0,
    papers: (data.papers ?? []).map(({ paper }) => paper),
  };
}
