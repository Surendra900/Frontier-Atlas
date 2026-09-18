import { fetchApi } from './api';

export interface ModelData {
  platform: string;
  source: string;
  time: string;
  title: string;
  likes: string;
  comments: string;
}

export interface ModelsResponse {
  status?: string;
  data: {
    models: ModelData[];
  };
}

export async function getModels(): Promise<ModelData[]> {
  const response = await fetchApi<{
  status: string;
  count: number;
  data: ModelData[];
}>("/api/v1/discussions");

  return response.data;
}