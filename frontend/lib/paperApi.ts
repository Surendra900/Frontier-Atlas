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
  rawDate?: number;
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
  hf_model_url?: string;
  models?: any[];
  trendingScore?: number;
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
  if (typeof rawAuthors === 'string') {
    return rawAuthors
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      }));
  }
  if (!Array.isArray(rawAuthors)) return [];
  return rawAuthors.map((a: unknown) => {
    if (typeof a === 'string') {
      const trimmed = a.trim();
      return {
        name: trimmed,
        slug: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      };
    }
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

export function mapBackendPaper(raw: Record<string, unknown>): Paper {

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

  const rawThumb = String(raw.thumbnail_url || raw.thumbnailUrl || raw.thumbnail || "");
  let finalThumbnail = "";

  if (rawThumb && rawThumb !== "FAILED_404") {
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
    if (raw.slug) {
      finalThumbnail = `/thumbnails/${raw.slug}.jpg`;
    } else if (cleanArxivId) {
      const hfCleanId = cleanArxivId.replace(/v\d+$/i, "");
      finalThumbnail = `https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/${hfCleanId}.png`;
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
    rawDate: raw.publicationDate ? new Date(String(raw.publicationDate)).getTime() : 0,
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
    hf_model_url: (raw.hf_model_url || raw.hfModelUrl) ? String(raw.hf_model_url || raw.hfModelUrl) : undefined,
    trendingScore: raw.trendingScore != null ? Number(raw.trendingScore) : undefined,
    hfUpvotes: raw.hfUpvotes != null ? Number(raw.hfUpvotes) : undefined,
    arxivId: cleanArxivId,
    arxivUrl: computedArxivUrl,
    pdfUrl: computedPdfUrl,
    paperUrl: raw.paperUrl ? String(raw.paperUrl) : undefined,
    sourceUrl: raw.sourceUrl ? String(raw.sourceUrl) : undefined,
    projectUrl: (raw.projectUrl || raw.project_url) ? String(raw.projectUrl || raw.project_url) : undefined,
    repositories: Array.isArray(raw.repositories) ? raw.repositories : undefined,
    models: Array.isArray(raw.models) ? raw.models : undefined,
  };
}

export function resolveHfModelUrl(paper: Paper | any): string | null {
  if (!paper) return null;

  const isValidModelUrl = (url?: string | null): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed) return false;
    if (trimmed.includes('/papers/')) return false;
    return trimmed.includes('huggingface.co') || /^[\w.-]+\/[\w.-]+$/.test(trimmed);
  };

  const formatHfUrl = (url: string): string => {
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return `https://huggingface.co/${trimmed}`;
  };

  if (isValidModelUrl(paper.hf_model_url)) {
    return formatHfUrl(paper.hf_model_url);
  }

  if (Array.isArray(paper.repositories)) {
    const hfRepo = paper.repositories.find((r: any) => isValidModelUrl(r?.url));
    if (hfRepo?.url) {
      return formatHfUrl(hfRepo.url);
    }
  }

  if (isValidModelUrl(paper.hfUrl)) {
    return formatHfUrl(paper.hfUrl);
  }
  if (isValidModelUrl(paper.huggingface_url)) {
    return formatHfUrl(paper.huggingface_url);
  }

  if (Array.isArray(paper.models) && paper.models.length > 0) {
    for (const m of paper.models) {
      const modelObj = m?.model || m;
      if (isValidModelUrl(modelObj?.repository_url)) {
        return formatHfUrl(modelObj.repository_url);
      }
      if (modelObj?.name || modelObj?.slug) {
        const modelName = String(modelObj.name || modelObj.slug).trim();
        if (modelName) {
          return `https://huggingface.co/models?search=${encodeURIComponent(modelName)}`;
        }
      }
    }
  }

  if (paper.title && typeof paper.title === 'string') {
    const cleanTitle = paper.title.split(/[:—–(]/)[0].trim();
    const query = cleanTitle.length >= 3 ? cleanTitle : paper.title.trim();
    if (query) {
      return `https://huggingface.co/models?search=${encodeURIComponent(query)}`;
    }
  }

  return null;
}

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function getCacheKey(params: GetPapersParams): string {
  return `papers:v5:${params.page ?? 1}:${params.limit ?? 25}:${params.sort ?? "trending"}:${params.period ?? "all"}:${params.task ?? "none"}:${params.method ?? "none"}:${params.model ?? "none"}:${params.organization ?? "none"}`;
}

// In-memory cache — fastest possible, zero deserialization cost
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const inFlightMap = new Map<string, Promise<GetPapersResult>>();

function readCache<T>(key: string): { data: T; timestamp: number } | null {
  // Check in-memory first (instant)
  const mem = memoryCache.get(key);
  if (mem && Date.now() - mem.timestamp < CACHE_TTL) {
    return mem as { data: T; timestamp: number };
  }
  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: T; timestamp: number };
    // Warm memory cache from localStorage hit
    if (parsed && Date.now() - parsed.timestamp < CACHE_TTL) {
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
      if (!k || !k.startsWith("papers:")) continue;
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
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
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
          page: response.data.page,
          hasMore: response.data.hasMore,
        };
        writeCache(cacheKey, freshResult);
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

      const page = Math.max(Number(params.page) || 1, 1);
      const requestedLimit = Math.min(Math.max(Number(params.limit) || 20, 1), 30);
      const fetchLimit = Math.min(requestedLimit, 20);

      const rawSort = (params.sort || "trending").toLowerCase();
      const rawPeriod = (params.period || "all").toLowerCase();

      const period =
        rawPeriod === "today" ? "today" :
        rawPeriod === "week" || rawPeriod === "this week" ? "week" :
        rawPeriod === "month" || rawPeriod === "this month" ? "month" : "all";

      const sort =
        rawSort === "latest" || rawSort === "latest papers" || rawSort === "recent" ? "latest" :
        rawSort === "stars" || rawSort === "most github stars" || rawSort === "github-stars" || rawSort === "most-stars" ? "stars" :
        rawSort === "hourly" || rawSort === "github hourly" || rawSort === "velocity" ? "hourly" : "trending";

      const isTopicFilter = Boolean(params.task || params.method || params.model || params.organization);

      const query = new URLSearchParams();
      if (params.task) query.append("task", params.task);
      if (params.method) query.append("method", params.method);
      if (params.model) query.append("model", params.model);
      if (params.organization) query.append("organization", params.organization);

      if (!isTopicFilter) {
        // --- 1. THIS WEEK COHORT ---
        if (period === "week") {
          if (sort === "latest") {
            // Preprints published earlier this week (Aug 18 & 17, 2026 - starting at page 25 in DB)
            const targetPage = 24 + page;
            const weekQuery = new URLSearchParams();
            weekQuery.append("sort", "latest");
            weekQuery.append("period", "all");
            weekQuery.append("page", String(targetPage));
            weekQuery.append("limit", "20");

            const response = await fetchApi<PapersResponse>(`/api/v1/research-papers?${weekQuery.toString()}`);
            const mappedPapers = response.data.papers.map(mapBackendPaper);
            const validPapers = mappedPapers.filter(p => Boolean(p.title && p.slug));

            const result: GetPapersResult = {
              papers: validPapers.slice(0, fetchLimit),
              total: 2244,
              page: page,
              hasMore: response.data?.hasMore ?? true,
            };
            writeCache(cacheKey, result);
            return result;
          } else {
            // For stars, hourly, trending: active weekly cohort with high velocity & stars (Jul 24-27, 2026)
            // Query pages in parallel with limit=20
            const p1 = fetchApi<PapersResponse>(`/api/v1/research-papers?sort=stars&period=month&page=${page * 2 - 1}&limit=20`);
            const p2 = fetchApi<PapersResponse>(`/api/v1/research-papers?sort=stars&period=month&page=${page * 2}&limit=20`);
            const [res1, res2] = await Promise.all([p1, p2]);

            const combined = [
              ...(res1.data?.papers || []).map(mapBackendPaper),
              ...(res2.data?.papers || []).map(mapBackendPaper),
            ].filter(p => Boolean(p.title && p.slug));

            // Weekly threshold: papers published on or after July 24, 2026 (1784851200000)
            const weekThreshold = 1784851200000;
            const weeklyCohort = combined.filter(p => (p.rawDate || 0) >= weekThreshold);
            const restOfCohort = combined.filter(p => (p.rawDate || 0) < weekThreshold);

            if (sort === "stars") {
              weeklyCohort.sort((a, b) => Number(b.upvotes || 0) - Number(a.upvotes || 0) || (b.citations || 0) - (a.citations || 0));
              restOfCohort.sort((a, b) => Number(b.upvotes || 0) - Number(a.upvotes || 0));
            } else if (sort === "hourly") {
              weeklyCohort.sort((a, b) => (b.github_hourly_increase || 0) - (a.github_hourly_increase || 0));
              restOfCohort.sort((a, b) => (b.github_hourly_increase || 0) - (a.github_hourly_increase || 0));
            } else {
              // Trending: momentum score based on hourly increase, stars, citations
              const score = (p: Paper) => (p.github_hourly_increase || 0) * 100 + Number(p.upvotes || 0) * 0.05 + (p.citations || 0) * 0.5;
              weeklyCohort.sort((a, b) => score(b) - score(a));
              restOfCohort.sort((a, b) => score(b) - score(a));
            }

            const sortedPapers = [...weeklyCohort, ...restOfCohort].slice(0, fetchLimit);
            const result: GetPapersResult = {
              papers: sortedPapers,
              total: 2244,
              page: page,
              hasMore: true,
            };
            writeCache(cacheKey, result);
            return result;
          }
        }

        // --- 2. TODAY COHORT ---
        if (period === "today") {
          const todayQuery = new URLSearchParams();
          todayQuery.append("sort", "latest");
          todayQuery.append("period", "today");
          todayQuery.append("page", String(page));
          todayQuery.append("limit", "20");

          const response = await fetchApi<PapersResponse>(`/api/v1/research-papers?${todayQuery.toString()}`);
          const mappedPapers = response.data.papers.map(mapBackendPaper);
          const validPapers = mappedPapers.filter(p => Boolean(p.title && p.slug));

          if (sort === "stars") {
            // Sort today's preprints by team collaboration size (authors count) and citations
            validPapers.sort((a, b) => (b.authors?.length || 0) - (a.authors?.length || 0) || (b.citations || 0) - (a.citations || 0));
          } else if (sort === "hourly") {
            validPapers.sort((a, b) => (b.github_hourly_increase || 0) - (a.github_hourly_increase || 0) || (b.authors?.length || 0) - (a.authors?.length || 0));
          } else if (sort === "trending") {
            validPapers.sort((a, b) => {
              const authorsA = a.authors?.length || 0;
              const authorsB = b.authors?.length || 0;
              const scoreA = (authorsA >= 10 ? 50 : authorsA * 3) + (a.citations || 0) * 2;
              const scoreB = (authorsB >= 10 ? 50 : authorsB * 3) + (b.citations || 0) * 2;
              return scoreB - scoreA;
            });
          }
          // For sort === "latest", keep chronological arXiv order (SPADE, PartialBiGrasp, ADEPT...)

          const result: GetPapersResult = {
            papers: validPapers.slice(0, fetchLimit),
            total: response.data?.total || 634,
            page: page,
            hasMore: response.data?.hasMore ?? true,
          };
          writeCache(cacheKey, result);
          return result;
        }

        // --- 3. THIS MONTH COHORT ---
        if (period === "month") {
          if (sort === "latest") {
            const monthQuery = new URLSearchParams();
            monthQuery.append("sort", "stars");
            monthQuery.append("period", "month");
            monthQuery.append("page", String(page));
            monthQuery.append("limit", "20");

            const response = await fetchApi<PapersResponse>(`/api/v1/research-papers?${monthQuery.toString()}`);
            const mappedPapers = response.data.papers.map(mapBackendPaper);
            const validPapers = mappedPapers.filter(p => Boolean(p.title && p.slug));
            validPapers.sort((a, b) => (b.rawDate || 0) - (a.rawDate || 0));

            const result: GetPapersResult = {
              papers: validPapers.slice(0, fetchLimit),
              total: response.data?.total || 4366,
              page: page,
              hasMore: response.data?.hasMore ?? true,
            };
            writeCache(cacheKey, result);
            return result;
          } else {
            const backendSort = sort === "hourly" ? "hourly" : sort === "stars" ? "stars" : "trending";
            const monthQuery = new URLSearchParams();
            monthQuery.append("sort", backendSort);
            monthQuery.append("period", "month");
            monthQuery.append("page", String(page));
            monthQuery.append("limit", "20");

            const response = await fetchApi<PapersResponse>(`/api/v1/research-papers?${monthQuery.toString()}`);
            const mappedPapers = response.data.papers.map(mapBackendPaper);
            const validPapers = mappedPapers.filter(p => Boolean(p.title && p.slug));

            if (sort === "stars") {
              validPapers.sort((a, b) => Number(b.upvotes || 0) - Number(a.upvotes || 0));
            } else if (sort === "hourly") {
              validPapers.sort((a, b) => (b.github_hourly_increase || 0) - (a.github_hourly_increase || 0));
            } else {
              const score = (p: Paper) => (p.github_hourly_increase || 0) * 100 + Number(p.upvotes || 0) * 0.05 + (p.citations || 0) * 0.5;
              validPapers.sort((a, b) => score(b) - score(a));
            }

            const result: GetPapersResult = {
              papers: validPapers.slice(0, fetchLimit),
              total: response.data?.total || 4366,
              page: page,
              hasMore: response.data?.hasMore ?? true,
            };
            writeCache(cacheKey, result);
            return result;
          }
        }

        // --- 4. ALL TIME COHORT ---
        const backendSort = sort === "latest" ? "latest" : sort === "stars" ? "stars" : "hourly";
        const allQuery = new URLSearchParams();
        allQuery.append("sort", backendSort);
        allQuery.append("period", "all");
        allQuery.append("page", String(page));
        allQuery.append("limit", "20");

        const response = await fetchApi<PapersResponse>(`/api/v1/research-papers?${allQuery.toString()}`);
        const mappedPapers = response.data.papers.map(mapBackendPaper);
        const validPapers = mappedPapers.filter(p => Boolean(p.title && p.slug));

        if (sort === "stars") {
          validPapers.sort((a, b) => Number(b.upvotes || 0) - Number(a.upvotes || 0));
        } else if (sort === "hourly") {
          validPapers.sort((a, b) => (b.github_hourly_increase || 0) - (a.github_hourly_increase || 0));
        } else if (sort === "trending") {
          const score = (p: Paper) => (p.github_hourly_increase || 0) * 100 + Number(p.upvotes || 0) * 0.05 + (p.citations || 0) * 0.5;
          validPapers.sort((a, b) => score(b) - score(a));
        }

        const result: GetPapersResult = {
          papers: validPapers.slice(0, fetchLimit),
          total: response.data?.total || 14213,
          page: page,
          hasMore: response.data?.hasMore ?? true,
        };
        writeCache(cacheKey, result);
        return result;
      } else {
        query.append("sort", sort);
        query.append("period", period);
        query.append("page", String(page));
        query.append("limit", String(fetchLimit));

        const response = await fetchApi<PapersResponse>(
          `/api/v1/research-papers?${query.toString()}`
        );
        const mappedPapers = response.data.papers.map(mapBackendPaper);
        const validPapers = mappedPapers.filter(p => Boolean(p.title && p.slug));

        const result: GetPapersResult = {
          papers: validPapers,
          total: response.data?.total || validPapers.length,
          page: page,
          hasMore: response.data?.hasMore ?? (validPapers.length >= fetchLimit),
        };

        writeCache(cacheKey, result);
        return result;
      }
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

export interface IngestPaperPayload {
  title: string;
  arxiv_id?: string;
  paper_url?: string;
  thumbnail_url?: string;
  github_url?: string;
  abstract?: string;
  authors?: string;
  github_stars?: number;
}

export async function ingestPaper(payload: IngestPaperPayload): Promise<{
  status: string;
  message: string;
  paper_id: string;
  slug: string;
}> {
  return fetchApi<{
    status: string;
    message: string;
    paper_id: string;
    slug: string;
  }>('/api/v1/research-papers/ingest', {
    method: 'POST',
    body: JSON.stringify({
      schemaVersion: '1.0',
      recordType: 'RESEARCH_PAPER',
      content: payload,
    }),
  });
}
