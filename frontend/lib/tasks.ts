import { fetchApi } from './api';
import { slugify } from './methods';

export interface BackendTaskItem {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export interface TaskItem {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  paperCount?: number;
}

export interface TaskPaper {
  id: string;
  title: string;
  slug: string;
  citationCount: number;
}

export interface TaskDetail {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  paperCount: number;
  papers: TaskPaper[];
}

export interface GetTasksResponse {
  status: string;
  count: number;
  data: BackendTaskItem[];
}

export interface GetTaskBySlugResponse {
  status: string;
  data: BackendTaskDetail;
}

export type TaskPaperCounts = Record<string, number>;

interface BackendTaskDetail {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  papers: { paper: TaskPaper }[];
}

export async function getTasks(): Promise<TaskItem[]> {
  const response = await fetchApi<GetTasksResponse>('/api/v1/tasks?limit=100');
  const tasks = Array.isArray(response?.data) ? response.data : [];
  const counts = await getTaskPaperCounts();

return tasks.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    color: t.color,
    paperCount: counts[t.slug] ?? 0,
}));
}

export async function getTaskPaperCounts(): Promise<TaskPaperCounts> {
  return fetchApi<TaskPaperCounts>('/api/v1/tasks/counts');
}

export async function getTaskBySlug(slug: string): Promise<TaskDetail> {
  const response = await fetchApi<GetTaskBySlugResponse>(`/api/v1/tasks/${encodeURIComponent(slug)}`);
  const data = response.data;
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    color: data.color,
    paperCount: data.papers?.length ?? 0,
    papers: (data.papers ?? []).map(({ paper }) => paper),
  };
}

export { slugify };
