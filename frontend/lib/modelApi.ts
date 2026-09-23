import { fetchApi } from './api';

export interface ModelData {
  platform: string;
  source: string;
  time: string;
  title: string;
  likes: string;
  comments: string;
}

export interface GetDiscussionsResponse {
  status: string;
  count?: number;
  data: ModelData[];
}

export async function getModels(): Promise<ModelData[]> {
  try {
    const response = await fetchApi<GetDiscussionsResponse>('/api/v1/discussions');
    
    if (Array.isArray(response?.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Failed to fetch model discussions:', error);
    return [];
  }
}