import { fetchApi } from './api';

export interface TaskItem {
  id: string;
  label: string;
  icon: string;
}

interface BackendTask {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export interface TasksResponse {
  status: string;
  count: number;
  data: BackendTask[];
}

const ICON_MAP: Record<string, string> = {
  agents: "bot",
  reasoning: "brain",
  "language-modeling": "message-square",
  "coding-agents": "code",
  "computer-use": "monitor",
  "world-models": "globe",
  robotics: "cpu",
  "text-generation": "message-square",
  "image-generation": "monitor",
  "video-generation": "monitor",
  "audio-generation": "bot",
};

export async function getTasks(): Promise<TaskItem[]> {
  try {
    const response = await fetchApi<TasksResponse>('/api/v1/tasks');
    const tasks = Array.isArray(response?.data) ? response.data : [];

    return tasks.map((t) => ({
      id: t.id,
      label: t.name,
      icon: ICON_MAP[t.slug] || "bot",
    }));
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    throw error;
  }
}