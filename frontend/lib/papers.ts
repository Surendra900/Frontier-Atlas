"use client";

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
  role?: string;
  model?: any;
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

export function normalizePaperDetail(data: any): PaperDetail {
  if (!data) return data;
  return {
    ...data,
    authors: Array.isArray(data.authors)
      ? data.authors
          .map((a: any) => {
            if (!a) return null;
            if (typeof a === "string") return { id: a, name: a, slug: a.toLowerCase().replace(/[^a-z0-9]+/g, "-"), createdAt: "", updatedAt: "" };
            return {
              id: a.id || a.name || "",
              name: a.name || "",
              slug: a.slug || (a.name ? a.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : ""),
              createdAt: a.createdAt || "",
              updatedAt: a.updatedAt || "",
              ...a,
            };
          })
          .filter(Boolean)
      : [],
    tasks: Array.isArray(data.tasks)
      ? data.tasks
          .map((t: any) => {
            if (!t) return null;
            const taskObj = t.task && typeof t.task === "object" ? t.task : t;
            return {
              id: taskObj.id || "",
              name: taskObj.name || "",
              slug: taskObj.slug || "",
              color: taskObj.color || null,
              ...taskObj,
            };
          })
          .filter(Boolean)
      : [],
    methods: Array.isArray(data.methods)
      ? data.methods
          .map((m: any) => {
            if (!m) return null;
            const methodObj = m.method && typeof m.method === "object" ? m.method : m;
            return {
              id: methodObj.id || "",
              name: methodObj.name || "",
              slug: methodObj.slug || "",
              ...methodObj,
            };
          })
          .filter(Boolean)
      : [],
    datasets: Array.isArray(data.datasets)
      ? data.datasets
          .map((d: any) => {
            if (!d) return null;
            const datasetObj = d.dataset && typeof d.dataset === "object" ? d.dataset : d;
            return {
              id: datasetObj.id || "",
              name: datasetObj.name || "",
              slug: datasetObj.slug || "",
              ...datasetObj,
            };
          })
          .filter(Boolean)
      : [],
    conferences: Array.isArray(data.conferences)
      ? data.conferences
          .map((c: any) => {
            if (!c) return null;
            const confObj = c.conference && typeof c.conference === "object" ? c.conference : c;
            return {
              id: confObj.id || "",
              name: confObj.name || "",
              slug: confObj.slug || "",
              ...confObj,
            };
          })
          .filter(Boolean)
      : [],
    rankings: Array.isArray(data.rankings)
      ? data.rankings
          .map((r: any) => {
            if (!r) return null;
            const bm = r.benchmark && typeof r.benchmark === "object" ? r.benchmark : {};
            return {
              ...r,
              id: r.id || "",
              paper_id: r.paper_id || data.id || "",
              benchmark_id: r.benchmark_id || bm.id || "",
              rank: typeof r.rank === "number" ? r.rank : 0,
              previous_rank: typeof r.previous_rank === "number" ? r.previous_rank : null,
              benchmark: {
                id: bm.id || r.benchmark_id || "",
                name: bm.name || r.benchmark_name || "Benchmark",
                slug: bm.slug || "",
                ...bm,
              },
            };
          })
          .filter(Boolean)
      : [],
    sotaClaims: Array.isArray(data.sotaClaims)
      ? data.sotaClaims
          .map((s: any) => {
            if (!s) return null;
            const bm = s.benchmark && typeof s.benchmark === "object" ? s.benchmark : {};
            return {
              ...s,
              id: s.id || "",
              paper_id: s.paper_id || data.id || "",
              benchmark_id: s.benchmark_id || bm.id || "",
              benchmark: {
                id: bm.id || s.benchmark_id || "",
                name: bm.name || s.benchmark_name || "Benchmark",
                slug: bm.slug || "",
                ...bm,
              },
            };
          })
          .filter(Boolean)
      : [],
    repositories: Array.isArray(data.repositories)
      ? data.repositories
          .map((repo: any) => {
            if (!repo) return null;
            const repoObj = repo.repository && typeof repo.repository === "object" ? repo.repository : repo;
            return {
              id: repoObj.id || "",
              url: repoObj.url || "",
              owner: repoObj.owner || "",
              name: repoObj.name || "",
              ...repoObj,
            };
          })
          .filter(Boolean)
      : [],
    models: Array.isArray(data.models)
      ? data.models
          .map((m: any) => {
            if (!m) return null;
            // Handle both { role, model: { id, name, slug } } and { id, name, slug }
            if (m.model && typeof m.model === "object") {
              return {
                id: m.model.id || m.id || "",
                name: m.model.name || m.name || "",
                slug: m.model.slug || m.slug || "",
                role: m.role || "referenced",
                ...m.model,
              };
            }
            return {
              id: m.id || "",
              name: m.name || "",
              slug: m.slug || "",
              role: m.role || "referenced",
              ...m,
            };
          })
          .filter(Boolean)
      : [],
  };
}

function readPaperFromStorage(slug: string): { data: PaperDetail; ts: number } | null {
  // Memory first — zero cost
  const mem = paperMemCache.get(slug);
  if (mem && Date.now() - mem.ts < PAPER_CACHE_TTL) return mem;
  // sessionStorage fallback (survives SPA navigations)
  try {
    const raw = sessionStorage.getItem(SS_PREFIX + slug);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: PaperDetail; ts: number };
    if (Date.now() - parsed.ts < PAPER_CACHE_TTL) {
      const normalizedData = normalizePaperDetail(parsed.data);
      const normalized = { ...parsed, data: normalizedData };
      paperMemCache.set(slug, normalized); // warm memory from storage
      return normalized;
    }
    sessionStorage.removeItem(SS_PREFIX + slug);
  } catch { /* SSR or storage unavailable */ }
  return null;
}

function writePaperToCache(slug: string, data: PaperDetail): void {
  const normalized = normalizePaperDetail(data);
  const entry = { data: normalized, ts: Date.now() };
  paperMemCache.set(slug, entry);
  try {
    sessionStorage.setItem(SS_PREFIX + slug, JSON.stringify(entry));
  } catch { /* storage full */ }
}

/** Synchronous cache read — returns data immediately if available, or null */
export function getPaperBySlugSync(slug: string): PaperDetail | null {
  const stored = readPaperFromStorage(slug);
  return stored ? normalizePaperDetail(stored.data) : null;
}

export async function getPaperBySlug(slug: string, force = false): Promise<PaperDetail> {
  if (!force) {
    const cached = readPaperFromStorage(slug);
    if (cached) return cached.data;
  }

  const inflight = inflightFetches.get(slug);
  if (inflight && !force) {
    try {
      return await inflight;
    } catch {
      // Fall through to fresh request
    }
  }

  const promise = fetchApi<PaperDetailResponse>(
    `/api/v1/research-papers/${encodeURIComponent(slug)}`
  ).then((response) => {
    const normalized = normalizePaperDetail(response.data);
    writePaperToCache(slug, normalized);
    return normalized;
  }).finally(() => {
    inflightFetches.delete(slug);
  });

  inflightFetches.set(slug, promise);
  return promise;
}

export function prefetchPaperBySlug(slug: string): void {
  getPaperBySlug(slug).catch(() => {});
}
