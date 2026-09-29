import { fetchApi } from './api';

export interface PaperAuthor {
  name: string;
  slug: string;
}

export interface Paper {
  id: string | number;
  slug: string;
  title: string;
  thumbnail: string;
  authors: PaperAuthor[];
  date: string;
  description: string;
  sota: string;
  tags: string[];
  additionalTags?: string[];
  upvotes: string;
  repo: string;
  github_hourly_increase?: number;
  citations: number;
  conference?: string;
  githubUrl?: string;
  hfUrl?: string;
  huggingface_url?: string;
  hfUpvotes?: number;
  arxivId?: string;
  arxivUrl?: string;
  pdfUrl?: string;
  paperUrl?: string;
  sourceUrl?: string;
  projectUrl?: string;
  repositories?: {
    url: string;
    owner?: string;
    name?: string;
  }[];
}

export interface PapersResponse {
  status: string;
  count: number;
  data: {
    papers: Record<string, unknown>[];
    total: number;
    page: number;
    hasMore: boolean;
  };
}

export interface GetPapersParams {
  page?: number;
  task?: string;
  method?: string;
  model?: string;
  organization?: string;
  sort?: 'trending' | 'latest' | string;
  period?: 'today' | 'week' | 'month' | 'all' | string;
  limit?: number;
}

export interface GetPapersResult {
  papers: Paper[];
  total: number;
  page: number;
  hasMore: boolean;
}

function extractString(val: unknown): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    if (obj.name) return String(obj.name);
    if (obj.task && typeof obj.task === 'object' && obj.task !== null && 'name' in obj.task) return String((obj.task as { name: string }).name);
    if (obj.method && typeof obj.method === 'object' && obj.method !== null && 'name' in obj.method) return String((obj.method as { name: string }).name);
    if (obj.label) return String(obj.label);
  }
  return String(val);
}

function mapAuthors(rawAuthors: unknown): PaperAuthor[] {
  if (!Array.isArray(rawAuthors)) return [];
  return rawAuthors.map((a: unknown) => {
    if (typeof a === 'object' && a !== null) {
      const obj = a as Record<string, unknown>;
      const name = String(obj.name ?? (obj as any).author?.name ?? '');
      const slug = String(obj.slug ?? (obj as any).author?.slug ?? '');
      if (name && name !== 'undefined' && name !== 'null') return { name, slug };
    }
    return null;
  }).filter(Boolean) as PaperAuthor[];
}

export function extractArxivId(input?: string | null): string | null {
  if (!input) return null;
  const str = String(input).trim();
  const match = str.match(/(?:arxiv\.org\/(?:abs|pdf)\/|arxiv:\s*|^)([a-z\-]+(?:\.[a-z\-]+)?\/\d+|\d{4}\.\d{4,5}(?:v\d+)?)/i);
  if (match && match[1]) {
    return match[1].replace(/\.pdf$/i, "");
  }
  if (/^([a-z\-]+(?:\.[a-z\-]+)?\/\d+|\d{4}\.\d{4,5}(?:v\d+)?)$/i.test(str)) {
    return str;
  }
  return null;
}

export function getArxivAbsUrl(arxivId?: string | null, paperUrl?: string | null): string | null {
  const cleanId = extractArxivId(arxivId) || extractArxivId(paperUrl);
  if (cleanId) {
    return `https://arxiv.org/abs/${cleanId}`;
  }
  if (paperUrl && paperUrl.includes("arxiv.org") && !paperUrl.includes("pdf-")) {
    return paperUrl;
  }
  return null;
}

export function getArxivPdfUrl(pdfUrl?: string | null, paperUrl?: string | null, arxivId?: string | null): string | null {
  const cleanId = extractArxivId(arxivId) || extractArxivId(pdfUrl) || extractArxivId(paperUrl);
  if (cleanId) {
    return `https://arxiv.org/pdf/${cleanId}.pdf`;
  }
  if (pdfUrl && !pdfUrl.includes("pdf-") && pdfUrl !== "https://arxiv.org/pdf") {
    if (pdfUrl.includes("arxiv.org/pdf/") && !pdfUrl.endsWith(".pdf")) {
      return `${pdfUrl}.pdf`;
    }
    return pdfUrl;
  }
  if (paperUrl && !paperUrl.includes("pdf-") && paperUrl !== "https://arxiv.org/pdf") {
    if (paperUrl.includes("arxiv.org/pdf/") && !paperUrl.endsWith(".pdf")) {
      return `${paperUrl}.pdf`;
    }
    if (paperUrl.includes("arxiv.org/abs/")) {
      return paperUrl.replace("/abs/", "/pdf/") + ".pdf";
    }
  }
  return null;
}

function mapBackendPaper(raw: Record<string, unknown>): Paper {

  let formattedDate = "Unknown Date";
  if (raw.publicationDate) {
    formattedDate = new Date(String(raw.publicationDate)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  let sotaString = "";
  if (Array.isArray(raw.sotaClaims) && raw.sotaClaims.length > 0) {
    sotaString = raw.sotaClaims.map((sc: unknown) => {
      if (typeof sc === 'object' && sc !== null && 'benchmark' in sc) {
        const benchmark = (sc as { benchmark: unknown }).benchmark;
        if (typeof benchmark === 'object' && benchmark !== null && 'name' in benchmark) {
          return `SOTA on ${(benchmark as { name: string }).name}`;
        }
      }
      return String(sc);
    }).join(" • ");
  }

  let rankingsString = "";
  if (Array.isArray(raw.rankings) && raw.rankings.length > 0) {
    rankingsString = raw.rankings.map((r: unknown) => {
      if (typeof r === 'object' && r !== null && 'rank' in r && 'benchmark' in r) {
        const rank = (r as { rank: unknown }).rank;
        const benchmark = (r as { benchmark: unknown }).benchmark;
        if (rank && typeof benchmark === 'object' && benchmark !== null && 'name' in benchmark) {
          return `#${rank} on ${(benchmark as { name: string }).name}`;
        }
      }
      return "";
    }).filter(Boolean).join(" • ");
  }

  if (sotaString && rankingsString) {
    sotaString = `${sotaString} • ${rankingsString}`;
  } else if (rankingsString) {
    sotaString = rankingsString;
  }

  const rawThumb = String(raw.thumbnail_url || raw.thumbnailUrl || raw.thumbnail || "");
  let finalThumbnail = "";

  const isDeadCloudinary = rawThumb.includes("cloudinary.com/xipefqle");

  if (rawThumb && rawThumb !== "FAILED_404" && !isDeadCloudinary) {
    // If it's a huge base64 image from the DB, format it properly
    if (rawThumb.startsWith("/9j/") || rawThumb.startsWith("iVBORw0KGgo")) {
      finalThumbnail = `data:image/jpeg;base64,${rawThumb}`;
    }
    // If it's a valid local path, http URL, or ALREADY a formatted data URL, keep it
    else if (rawThumb.startsWith("/") || rawThumb.startsWith("http") || rawThumb.startsWith("data:")) {
      finalThumbnail = rawThumb;
    }
    // Otherwise, it's a corrupted short string (e.g., 'z5HwCV1J...'). We ignore it to prevent 404s.
  }

  const cleanArxivId = extractArxivId(raw.arxivId as string) || extractArxivId(raw.paperUrl as string) || extractArxivId(raw.pdfUrl as string) || undefined;

  if (!finalThumbnail) {
    if (cleanArxivId) {
      // Primary source: Cloudflare R2 bucket containing verified page-1 WebP renders
      finalThumbnail = `https://pub-c9b7a41de3434a4ab7c7f137edbec13b.r2.dev/papers/real_page1_gcp/${cleanArxivId}.webp`;
    } else if (raw.slug) {
      finalThumbnail = `/thumbnails/${raw.slug}.jpg`;
    }
  }
  const computedArxivUrl = getArxivAbsUrl(cleanArxivId, raw.paperUrl as string) || undefined;
  const computedPdfUrl = getArxivPdfUrl(raw.pdfUrl as string, raw.paperUrl as string, cleanArxivId) || undefined;

  return {
    id: Number(raw.id) || String(raw.id),
    slug: String(raw.slug || raw.id || ""),
    title: String(raw.title || "Untitled Paper"),
    thumbnail: finalThumbnail,
    authors: mapAuthors(raw.authors),
    date: formattedDate,
    description: String(raw.abstract || ""),
    sota: sotaString,
    tags: Array.isArray(raw.tasks) ? raw.tasks.map(extractString) : [],
    additionalTags: Array.isArray(raw.methods) ? raw.methods.map(extractString) : [],
    upvotes: String(raw.githubStars || 0),
    github_hourly_increase: Number(raw.github_hourly_increase || 0),
    repo: String(raw.githubForks || 0),
    citations: Number(raw.citationCount || raw.citations || 0),
    conference: String(raw.conference || ""),
    githubUrl: raw.githubUrl ? String(raw.githubUrl) : undefined,
    hfUrl: raw.hfUrl ? String(raw.hfUrl) : undefined,
    huggingface_url: raw.huggingface_url ? String(raw.huggingface_url) : undefined,
    hfUpvotes: raw.hfUpvotes != null ? Number(raw.hfUpvotes) : undefined,
    arxivId: cleanArxivId,
    arxivUrl: computedArxivUrl,
    pdfUrl: computedPdfUrl,
    paperUrl: raw.paperUrl ? String(raw.paperUrl) : undefined,
    sourceUrl: raw.sourceUrl ? String(raw.sourceUrl) : undefined,
    projectUrl: (raw.projectUrl || raw.project_url) ? String(raw.projectUrl || raw.project_url) : undefined,
    repositories: Array.isArray(raw.repositories) ? raw.repositories : undefined,
  };
}

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function getCacheKey(params: GetPapersParams): string {
  const rawTask = params.task ? params.task.toLowerCase().trim() : "none";
  const normalizedTask =
    rawTask === "reasoning"
      ? "reasoning-models"
      : rawTask === "ss1" || rawTask === "ssl"
      ? "small-language-models"
      : rawTask;
  const rawMethod = params.method ? params.method.toLowerCase().trim() : "none";
  const normalizedMethod =
    rawMethod === "policy-learning" || rawMethod === "reinforcement-learning"
      ? "policy-learning"
      : rawMethod === "diffusion-models" || rawMethod === "diffusion"
      ? "diffusion-models"
      : rawMethod === "transformer" || rawMethod === "transformers"
      ? "transformer"
      : rawMethod === "rag" || rawMethod === "retrieval-augmented-generation"
      ? "retrieval-augmented-generation"
      : rawMethod;
  const safePeriod = params.period === "today" ? "all" : (params.period ?? "all");
  return `papers_v6:${params.page ?? 1}:${params.limit ?? 25}:${params.sort ?? "none"}:${safePeriod}:${normalizedTask}:${normalizedMethod}:${params.model ?? "none"}:${params.organization ?? "none"}`;
}

// In-memory cache — fastest possible, zero deserialization cost
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const inFlightMap = new Map<string, Promise<GetPapersResult>>();

// Immediate purge of any stale or poisoned empty paper caches from previous sessions
if (typeof window !== "undefined") {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      // Clean up old papers: prefix as well
      if (k && (k.startsWith("papers_v4:") || k.startsWith("papers_v3:") || k.startsWith("papers_v2:") || k.startsWith("papers:"))) {
        const item = localStorage.getItem(k);
        if (item) {
          try {
            const parsed = JSON.parse(item);
            if (k.startsWith("papers:") || k.startsWith("papers_v2:") || k.startsWith("papers_v3:") || !parsed?.data?.papers || parsed.data.papers.length === 0) {
              localStorage.removeItem(k);
            }
          } catch {
            localStorage.removeItem(k);
          }
        }
      }
    }
  } catch {}
}

function readCache<T>(key: string): { data: T; timestamp: number } | null {
  // Check in-memory first (instant)
  const mem = memoryCache.get(key);
  if (mem && Date.now() - mem.timestamp < CACHE_TTL) {
    const papersData = (mem.data as any)?.papers;
    if (Array.isArray(papersData) && papersData.length === 0) {
      memoryCache.delete(key);
    } else {
      return mem as { data: T; timestamp: number };
    }
  }
  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: T; timestamp: number };
    // Warm memory cache from localStorage hit
    if (parsed && Date.now() - parsed.timestamp < CACHE_TTL) {
      const papersData = (parsed.data as any)?.papers;
      if (Array.isArray(papersData) && papersData.length === 0) {
        localStorage.removeItem(key);
        return null;
      }
      memoryCache.set(key, parsed);
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function findFuzzyCache(params: GetPapersParams): GetPapersResult | null {

 
  

  // Never use fuzzy matching if the user explicitly requested a specific sort or period
  // Otherwise, they will never see the new sorted/filtered response unless they refresh.
  if (params.sort && params.sort !== "trending" && params.sort !== "popular") return null;
  if (params.period && params.period !== "all" && params.period !== "today") return null;

  const targetTask = params.task ? params.task.toLowerCase().replace(/-/g, " ") : null;
  const targetMethod = params.method ? params.method.toLowerCase().replace(/-/g, " ") : null;
  const targetOrganization = params.organization ? `:${params.organization}:`: null;

  for (const [key, entry] of memoryCache.entries()) {
    if (!entry.data?.papers?.length) continue;


    if (params.task && key.toLowerCase().includes(params.task.toLowerCase())) {
      return entry.data as GetPapersResult;
    } else if (params.method && key.toLowerCase().includes(params.method.toLowerCase())) {

      return entry.data as GetPapersResult;
    }
     else if (targetOrganization) {
  if (key.endsWith(targetOrganization)) {
    return entry.data as GetPapersResult;
  }
  }
}

  // Check localStorage if memoryCache miss
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith("papers_v4:")) continue;
      if (params.task && k.toLowerCase().includes(params.task.toLowerCase())) {
        const item = readCache<GetPapersResult>(k);
        if (item?.data?.papers?.length) return item.data;
      }
    }
  } catch { }

  // Instant fallback: filter existing stored papers by task/method/tag
  const searchFilter = targetTask || targetMethod;
  if (searchFilter) {
    const allStoredPapers: Paper[] = [];
    for (const entry of memoryCache.values()) {
      if (entry.data?.papers) {
        allStoredPapers.push(...entry.data.papers);
      }
    }
    const matched = allStoredPapers.filter(p => {
      const text = [...(p.tags || []), ...(p.additionalTags || []), p.title].join(" ").toLowerCase();
      return text.includes(searchFilter);
    });
    if (matched.length > 0) {
      const uniqueMap = new Map<string, Paper>();
      matched.forEach(p => uniqueMap.set(p.slug, p));
      return {
        papers: Array.from(uniqueMap.values()),
        total: uniqueMap.size,
        page: 1,
        hasMore: false,
      };
    }
  }

  return null;
}

export function getPapersSync(params: GetPapersParams = {}): GetPapersResult | null {
  const cacheKey = getCacheKey(params);
  const cached = readCache<GetPapersResult>(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

export function writeCache<T>(key: string, data: T): void {
  // Never cache empty paper results
  const papersData = (data as any)?.papers;
  if (Array.isArray(papersData) && papersData.length === 0) {
    return;
  }
  const entry = { data, timestamp: Date.now() };
  // Write to memory (instant)
  memoryCache.set(key, entry);
  // Write to localStorage (persistent across tabs)
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable
  }
}

export async function getPapers(params: GetPapersParams = {}): Promise<GetPapersResult> {
  const cacheKey = getCacheKey(params);

  // 1. Check exact cache (0ms)
  const cached = readCache<GetPapersResult>(cacheKey);
  if (cached && cached.data?.papers?.length > 0 && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // 2. Check in-flight request deduplication
  const existingInFlight = inFlightMap.get(cacheKey);
  if (existingInFlight) {
    return existingInFlight;
  }

  // 3. (Disabled) Instant Fuzzy Stale-While-Revalidate fallback
  // This was causing severe UI locking behaviors when changing sorting tabs because 
  // the stale paper array was returned instantly but never updated with the background response.
  const fuzzy = null; // findFuzzyCache(params);
  if (fuzzy && (fuzzy as any).papers.length > 0) {
    // Revalidate in background without blocking
    const bgFetch = (async () => {
      try {
        const query = new URLSearchParams();
        if (params.page !== undefined) query.append("page", params.page.toString());
        if (params.limit !== undefined) query.append("limit", params.limit.toString());
        if (params.task) query.append("task", params.task);
        if (params.method) query.append("method", params.method);
        if (params.model) query.append("model", params.model);
        if (params.organization) query.append("organization", params.organization);
        if (params.sort) query.append("sort", params.sort);
        if (params.period) query.append("period", params.period);

        const response = await fetchApi<PapersResponse>(`/api/v1/research-papers?${query.toString()}`);
        const mappedPapers = response.data.papers.map(mapBackendPaper);
        const validPapers = mappedPapers.filter(p => Boolean(p.title && p.slug));
        const freshResult: GetPapersResult = {
          papers: validPapers,
          total: response.data.total,
          page: response.data.page ?? params.page ?? 1,
          hasMore: response.data.hasMore,
        };
        if (validPapers.length > 0) {
          writeCache(cacheKey, freshResult);
        }
        return freshResult;
      } catch {
        return fuzzy;
      } finally {
        inFlightMap.delete(cacheKey);
      }
    })();
    inFlightMap.set(cacheKey, bgFetch);
    return fuzzy; // Instant return of cached paper set!
  }

  const fetchPromise = (async (): Promise<GetPapersResult> => {
    try {
      const start = performance.now();
      if (process.env.NODE_ENV === "development") console.log(`[paperApi] getPapers called with params:`, params);

      const query = new URLSearchParams();

      if (params.page !== undefined) query.append("page", params.page.toString());
      if (params.limit !== undefined) query.append("limit", params.limit.toString());
      if (params.task) {
        const rawTask = params.task.toLowerCase().trim();
        const normalizedTask =
          rawTask === "reasoning"
            ? "reasoning-models"
            : rawTask === "ss1" || rawTask === "ssl"
            ? "small-language-models"
            : rawTask;
        query.append("task", normalizedTask);
      }
      if (params.method) {
        const rawMethod = params.method.toLowerCase().trim();
        const normalizedMethod =
          rawMethod === "policy-learning" || rawMethod === "reinforcement-learning"
            ? "policy-learning"
            : rawMethod === "diffusion-models" || rawMethod === "diffusion"
            ? "diffusion-models"
            : rawMethod === "transformer" || rawMethod === "transformers"
            ? "transformer"
            : rawMethod === "rag" || rawMethod === "retrieval-augmented-generation"
            ? "retrieval-augmented-generation"
            : rawMethod;
        query.append("method", normalizedMethod);
      }
      if (params.model) query.append("model", params.model);
      if (params.organization) query.append("organization", params.organization);
      if (params.sort) query.append("sort", params.sort);
      if (params.period) {
        // Guard: historical DB papers should not return 0 results on 'today'
        const safePeriod = params.period === "today" ? "all" : params.period;
        query.append("period", safePeriod);
      }

      const response = await fetchApi<PapersResponse>(
        `/api/v1/research-papers?${query.toString()}`
      );

      const mapStart = performance.now();
      const mappedPapers = (response.data?.papers || []).map(mapBackendPaper);
      const mapDuration = performance.now() - mapStart;
      const totalDuration = performance.now() - start;

      if (process.env.NODE_ENV === "development") console.log(`[paperApi] getPapers complete in ${totalDuration.toFixed(2)}ms (mapping took ${mapDuration.toFixed(2)}ms)`);

      const validPapers = mappedPapers.filter(p => Boolean(p.title && p.slug));

      const result: GetPapersResult = {
        papers: validPapers,
        total: response.data?.total ?? 0,
        page: response.data?.page ?? params.page ?? 1,
        hasMore: response.data?.hasMore ?? (validPapers.length >= (params.limit ?? 25)),
      };

      if (validPapers.length > 0) {
        writeCache(cacheKey, result);
      }

      return result;
    } catch (error) {
      console.error('Failed to fetch research papers:', error);
      throw error;
    } finally {
      inFlightMap.delete(cacheKey);
    }
  })();

  inFlightMap.set(cacheKey, fetchPromise);
  return fetchPromise;
}

export async function searchPapers(query: string): Promise<Paper[]> {
  if (!query.trim()) return [];

  try {
    // Try backend search first
    const response = await fetchApi<{
      status: string;
      data: {
        papers: Record<string, unknown>[];
      };
    }>(
      `/api/v1/research-papers/search?q=${encodeURIComponent(query)}`
    );
    return response.data.papers.map(mapBackendPaper);
  } catch (error) {
    console.warn('Backend search unavailable, falling back to client-side filtering', error);
    // Fallback: fetch all and filter locally
    try {
      const result = await getPapers({ limit: 100 });
      const lowerQuery = query.toLowerCase();
      return result.papers.filter((paper) => {
        return (
          paper.title.toLowerCase().includes(lowerQuery) ||
          paper.authors.map(a => a.name).join(' ').toLowerCase().includes(lowerQuery) ||
          paper.description.toLowerCase().includes(lowerQuery) ||
          paper.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
          (paper.additionalTags || []).some(t => t.toLowerCase().includes(lowerQuery))
        );
      });
    } catch (fallbackError) {
      console.error('Fallback search failed:', fallbackError);
      throw fallbackError;
    }
  }
}
