import { fetchApi } from "./api";

export interface PaperAuthor {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaperTask {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export interface PaperModel {
  id: string;
  name: string;
  slug: string;
}

export interface PaperDataset {
  id: string;
  name: string;
  slug: string;
}

export interface PaperMethod {
  id: string;
  name: string;
  slug: string;
}

export interface PaperConference {
  id: string;
  name: string;
  slug: string;
}

export interface PaperRanking {
  id: string;
  paper_id: string;
  benchmark_id: string;
  rank: number;
  previous_rank: number | null;
  benchmark: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface PaperSotaClaim {
  id: string;
  paper_id: string;
  benchmark_id: string;
  benchmark: {
    id: string;
    name: string;
    slug: string;
  };
  paper?: PaperDetail;
}

export interface PaperDetail {
  id: string;
  slug: string;
  title: string;
  shortTitle: string | null;
  abstract: string | null;
  tlDr: string | null;
  publicationDate: string | null;
  submissionDate: string | null;
  arxivId: string | null;
  doi: string | null;
  paperUrl: string | null;
  pdfUrl: string | null;
  sourceUrl: string | null;
  projectUrl: string | null;
  citationCount: number;
  referenceCount: number;
  pageCount: number | null;
  paperType: string | null;
  status: string | null;
  language: string | null;
  license: string | null;
  githubForks: number | null;
  githubStars: number | null;
  githubUrl: string | null;
  thumbnailUrl: string | null;
  isOfficialCode: boolean | null;
  hfUpvotes: number | null;
  hfUrl?: string | null;
  huggingface_url?: string | null;
  hf_model_url?: string | null;
  repositories?: { url: string; owner?: string; name?: string }[];
  trendingScore: number | null;
  discoverySource: string | null;
  createdAt: string;
  updatedAt: string | null;
  authors: PaperAuthor[];
  models: PaperModel[];
  datasets: PaperDataset[];
  tasks: PaperTask[];
  methods: PaperMethod[];
  conferences: PaperConference[];
  rankings: PaperRanking[];
  sotaClaims: PaperSotaClaim[];
}

interface PaperDetailResponse {
  status: string;
  data: PaperDetail;
}

// --- Two-layer cache: memory (instant) + sessionStorage (persists navigation) ---
const paperMemCache = new Map<string, { data: PaperDetail; ts: number }>();
const PAPER_CACHE_TTL = 300_000; // 5 minutes
const inflightFetches = new Map<string, Promise<PaperDetail>>();
const SS_PREFIX = "fa:paper:";

function readPaperFromStorage(slug: string): { data: PaperDetail; ts: number } | null {
  // Memory first — zero cost
  const mem = paperMemCache.get(slug);
  if (mem && Date.now() - mem.ts < PAPER_CACHE_TTL) return mem;
  if (typeof window === "undefined") return null;
  // sessionStorage fallback (survives SPA navigations)
  try {
    const raw = sessionStorage.getItem(SS_PREFIX + slug);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: PaperDetail; ts: number };
    if (Date.now() - parsed.ts < PAPER_CACHE_TTL) {
      paperMemCache.set(slug, parsed); // warm memory from storage
      return parsed;
    }
    sessionStorage.removeItem(SS_PREFIX + slug);
  } catch { /* SSR or storage unavailable */ }
  return null;
}

function writePaperToCache(slug: string, data: PaperDetail): void {
  const entry = { data, ts: Date.now() };
  paperMemCache.set(slug, entry);
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SS_PREFIX + slug, JSON.stringify(entry));
  } catch { /* storage full */ }
}

/** Synchronous cache read — returns data immediately if available, or null */
export function getPaperBySlugSync(slug: string): PaperDetail | null {
  return readPaperFromStorage(slug)?.data ?? null;
}

export async function getPaperBySlug(slug: string): Promise<PaperDetail> {
  const cached = readPaperFromStorage(slug);
  if (cached) return cached.data;

  const inflight = inflightFetches.get(slug);
  if (inflight) {
    try {
      return await inflight;
    } catch {
      // Fall through to fresh request
    }
  }

  const promise = fetchApi<PaperDetailResponse>(
    `/api/v1/research-papers/${encodeURIComponent(slug)}`
  ).then((response) => {
    writePaperToCache(slug, response.data);
    return response.data;
  }).finally(() => {
    inflightFetches.delete(slug);
  });

  inflightFetches.set(slug, promise);
  return promise;
}

export function prefetchPaperBySlug(slug: string): void {
  getPaperBySlug(slug).catch(() => {});
}
