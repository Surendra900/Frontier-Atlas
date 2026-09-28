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
  papers?: { paper: TaskPaper }[];
}

const DEFAULT_TASK_COUNTS: TaskPaperCounts = {
  "large-language-models": 2935,
  "small-language-models": 36,
  "vision-language-models": 911,
  "multimodal-models": 1698,
  "omni-models": 83,
  "embedding-models": 955,
  "reasoning-models": 1842,
  "world-models": 54,
  "long-context-models": 139,
  "reinforcement-learning": 914,
  "model-alignment": 1256,
  "efficient-training": 464,
  "agents": 1147,
  "coding-agents": 117,
  "computer-use-agents": 23,
  "browser-agents": 11,
  "research-agents": 7,
  "multi-agent-systems": 277,
  "tool-calling": 71,
  "agent-memory": 41,
  "agent-planning": 316,
  "workflow-automation": 5,
  "image-classification": 124,
  "image-understanding": 157,
  "object-detection": 532,
  "image-segmentation": 394,
  "instance-segmentation": 94,
  "image-generation": 413,
  "image-editing": 104,
  "image-inpainting": 38,
  "image-restoration": 347,
  "super-resolution": 114,
  "ocr": 46,
  "scene-text-recognition": 10,
  "face-recognition": 16,
  "pose-estimation": 98,
  "depth-estimation": 81,
  "medical-imaging": 413,
  "remote-sensing": 229,
  "satellite-imaging": 50,
  "document-layout-analysis": 13,
  "deepfake-detection": 48,
  "video-understanding": 357,
  "video-classification": 9,
  "video-generation": 161,
  "video-editing": 14,
  "video-segmentation": 26,
  "video-restoration": 22,
  "object-tracking": 57,
  "action-recognition": 48,
  "motion-generation": 50,
  "video-retrieval": 18,
  "machine-translation": 118,
  "question-answering": 365,
  "summarization": 70,
  "conversational-ai": 18,
  "named-entity-recognition": 14,
  "relation-extraction": 19,
  "text-classification": 37,
  "text-retrieval": 81,
  "information-extraction": 39,
  "text-to-sql": 21,
  "document-understanding": 20,
  "semantic-parsing": 2,
  "automatic-speech-recognition": 59,
  "text-to-speech": 48,
  "voice-cloning": 7,
  "audio-generation": 16,
  "audio-understanding": 13,
  "audio-classification": 3,
  "speech-enhancement": 7,
  "music-generation": 7,
  "robotics": 249,
  "autonomous-driving": 261,
  "navigation": 121,
  "robot-manipulation": 35,
  "robot-perception": 7,
  "human-robot-interaction": 9,
  "embodied-ai": 25,
  "simulation": 219,
  "biology": 166,
  "drug-discovery": 37,
  "protein-modeling": 24,
  "chemistry": 74,
  "healthcare-ai": 561,
  "materials-science": 8,
  "climate-ai": 13,
  "scientific-discovery": 46,
  "graph-machine-learning": 142,
  "knowledge-graphs": 120,
  "recommendation-systems": 77,
  "tabular-learning": 60,
  "time-series-forecasting": 217,
  "time-series-classification": 14,
  "search-ranking": 1,
  "fraud-detection": 165,
  "ai-safety": 393,
  "ai-security": 61,
  "explainable-ai": 323,
  "model-evaluation": 610,
  "benchmarking": 2037,
  "model-compression": 452,
  "quantization": 178,
  "federated-learning": 85,
};

export async function getTasks(): Promise<TaskItem[]> {
  try {
    const response = await fetchApi<GetTasksResponse>('/api/v1/tasks?limit=100');
    const tasks = Array.isArray(response?.data) ? response.data : [];
    const counts = await getTaskPaperCounts();

    return tasks
      .filter((t): t is BackendTaskItem => Boolean(t && typeof t === 'object' && t.id && t.slug))
      .map((t) => ({
        id: t.id,
        name: t.name || '',
        slug: t.slug,
        color: t.color ?? null,
        paperCount: counts[t.slug] ?? 0,
      }));
  } catch (err) {
    console.error('Failed to fetch tasks:', err);
    return [];
  }
}

export async function getTaskPaperCounts(): Promise<TaskPaperCounts> {
  try {
    const counts = await fetchApi<TaskPaperCounts>('/api/v1/tasks/counts');
    if (counts && typeof counts === 'object' && !Array.isArray(counts) && Object.keys(counts).length > 0) {
      return counts;
    }
  } catch (err) {
    // Graceful fallback to real static snapshot
  }
  return DEFAULT_TASK_COUNTS;
}

export async function getTaskBySlug(slug: string): Promise<TaskDetail> {
  if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
    return {
      id: '',
      name: '',
      slug: '',
      color: null,
      paperCount: 0,
      papers: [],
    };
  }

  const cleanSlug = slug.trim();

  try {
    const response = await fetchApi<GetTaskBySlugResponse>(`/api/v1/tasks/${encodeURIComponent(cleanSlug)}`);
    const data = response?.data;

    if (!data || typeof data !== 'object') {
      return {
        id: '',
        name: cleanSlug,
        slug: cleanSlug,
        color: null,
        paperCount: 0,
        papers: [],
      };
    }

    const rawPapers = Array.isArray(data.papers) ? data.papers : [];
    const validPapers: TaskPaper[] = rawPapers
      .map((item) => item?.paper)
      .filter((p): p is TaskPaper => Boolean(p && typeof p === 'object' && p.id));

    return {
      id: data.id || '',
      name: data.name || cleanSlug,
      slug: data.slug || cleanSlug,
      color: data.color ?? null,
      paperCount: validPapers.length,
      papers: validPapers,
    };
  } catch (err) {
    console.error(`Failed to fetch task by slug [${cleanSlug}]:`, err);
    return {
      id: '',
      name: cleanSlug,
      slug: cleanSlug,
      color: null,
      paperCount: 0,
      papers: [],
    };
  }
}

export { slugify };