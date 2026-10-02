import type { PrismaClient } from "../generated/prisma/client.js";
import { QueryRouter } from "../routing/index.js";
import { redisManager } from "../lib/redis.js";

// In-memory cache for ultra-fast (0ms) global search responses
const localGlobalSearchCache = new Map<string, { data: any; expiresAt: number }>();
const GLOBAL_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_GLOBAL_CACHE_SIZE = 2000;

const setLocalGlobalCache = (key: string, data: any, ttlMs: number = GLOBAL_CACHE_TTL_MS) => {
  if (localGlobalSearchCache.size >= MAX_GLOBAL_CACHE_SIZE) {
    const oldestKey = localGlobalSearchCache.keys().next().value;
    if (oldestKey) {
      localGlobalSearchCache.delete(oldestKey);
    }
  }
  localGlobalSearchCache.set(key, { data, expiresAt: Date.now() + ttlMs });
};

export const globalSearch = async (
  queryRouter: QueryRouter,
  query: string,
  limit: number = 5
) => {
  const searchTerm = query.trim().toLowerCase();

  if (!searchTerm) {
    return {
      papers: [],
      methods: [],
      tasks: [],
      models: [],
      datasets: [],
    };
  }

  const cacheKey = `search:global:${searchTerm}:${limit}`;

  // 1. Check local in-memory cache first (0ms instant response)
  const localHit = localGlobalSearchCache.get(cacheKey);
  if (localHit && Date.now() < localHit.expiresAt) {
    return localHit.data;
  }

  // 2. Check Redis cache if configured
  const redis = redisManager.getClient();
  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      const parsed = typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;
      setLocalGlobalCache(cacheKey, parsed);
      return parsed;
    }
  } catch (err) {
    // Redis optional fallback
  }

  // 3. Fast indexed database queries using pg_trgm GIN indexes and smart ranking
  const results = await queryRouter.routeQuery(async (prisma: PrismaClient) => {
    // 1. Detect arXiv ID or arXiv URL
    const arxivMatch = searchTerm.match(
      /(?:arxiv\.org\/(?:abs|pdf)\/|arxiv:\s*|^)(\d{4}\.\d{4,5}(?:v\d+)?|[a-z\-]+(?:\.[a-z\-]+)?\/\d+)/i
    );
    const detectedArxivId = arxivMatch ? arxivMatch[1].replace(/\.pdf$/i, "") : "";

    // 2. Normalize query variants
    const alphaNumQuery = searchTerm.toLowerCase().replace(/[^a-z0-9]/g, "");
    const slugCandidate = searchTerm.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const cleanQuery = searchTerm.replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim();
    const words = cleanQuery.split(/[\s-]+/).filter((w) => w.length > 0);

    const phrasePattern = `%${words.length > 0 ? words.join("%") : cleanQuery}%`;
    const rawContains = `%${cleanQuery || searchTerm}%`;
    const prefixPattern = `${cleanQuery}%`;

    const paperSqlParams: any[] = [
      detectedArxivId,
      slugCandidate,
      alphaNumQuery,
      cleanQuery,
      phrasePattern,
      rawContains,
      prefixPattern,
    ];

    let pIdx = 8;
    const allWordsInTitleConditions: string[] = [];
    const allWordsAnywhereConditions: string[] = [];

    for (const word of words) {
      allWordsInTitleConditions.push(`title ILIKE $${pIdx}`);
      allWordsAnywhereConditions.push(`(title ILIKE $${pIdx} OR authors ILIKE $${pIdx} OR abstract ILIKE $${pIdx})`);
      paperSqlParams.push(`%${word}%`);
      pIdx++;
    }

    const titleAllWordsSql = allWordsInTitleConditions.length > 0 ? allWordsInTitleConditions.join(" AND ") : "false";
    const anywhereAllWordsSql = allWordsAnywhereConditions.length > 0 ? allWordsAnywhereConditions.join(" AND ") : "false";
    const limitParamIdx = pIdx;
    paperSqlParams.push(limit * 3);

    const paperQuery = `
      SELECT id, slug, title, github_stars as "githubStars", citation_count as "citationCount", authors, thumbnail_url as "thumbnailUrl", project_url as "projectUrl"
      FROM papers
      WHERE 
        ($1::text != '' AND arxiv_id = $1::text)
        OR ($2::text != '' AND slug = $2::text)
        OR ($3::text != '' AND REGEXP_REPLACE(LOWER(title), '[^a-z0-9]', '', 'g') = $3::text)
        OR title ILIKE $5
        OR title ILIKE $6
        OR slug ILIKE $5
        OR authors ILIKE $5
        OR authors ILIKE $6
        OR abstract ILIKE $5
        OR (${titleAllWordsSql})
        OR (${anywhereAllWordsSql})
      ORDER BY 
        CASE
          WHEN $1::text != '' AND arxiv_id = $1::text THEN 1
          WHEN $2::text != '' AND slug = $2::text THEN 1
          WHEN $3::text != '' AND REGEXP_REPLACE(LOWER(title), '[^a-z0-9]', '', 'g') = $3::text THEN 1
          WHEN LOWER(title) = LOWER($4) THEN 2
          WHEN $3::text != '' AND REGEXP_REPLACE(LOWER(title), '[^a-z0-9]', '', 'g') LIKE ($3::text || '%') THEN 3
          WHEN LOWER(title) LIKE LOWER($7) THEN 4
          WHEN title ILIKE $6 THEN 5
          WHEN title ILIKE $5 THEN 6
          WHEN ${titleAllWordsSql} THEN 7
          WHEN authors ILIKE $5 OR authors ILIKE $6 THEN 8
          WHEN ${anywhereAllWordsSql} THEN 9
          ELSE 10
        END ASC,
        github_stars DESC NULLS LAST,
        citation_count DESC NULLS LAST
      LIMIT $${limitParamIdx}
    `;

    const [papers, methods, tasks, models, datasets] = await Promise.all([
      prisma.$queryRawUnsafe<any[]>(paperQuery, ...paperSqlParams),
      prisma.$queryRawUnsafe<any[]>(`SELECT id, slug, name FROM methods WHERE name ILIKE $1 OR slug ILIKE $1 OR name ILIKE $2 LIMIT $3`, phrasePattern, rawContains, limit),
      prisma.$queryRawUnsafe<any[]>(`SELECT id, slug, name FROM tasks WHERE name ILIKE $1 OR slug ILIKE $1 OR name ILIKE $2 LIMIT $3`, phrasePattern, rawContains, limit),
      prisma.$queryRawUnsafe<any[]>(`SELECT id, slug, name FROM models WHERE name ILIKE $1 OR slug ILIKE $1 OR name ILIKE $2 LIMIT $3`, phrasePattern, rawContains, limit),
      prisma.$queryRawUnsafe<any[]>(`SELECT id, slug, name FROM datasets WHERE name ILIKE $1 OR slug ILIKE $1 OR name ILIKE $2 LIMIT $3`, phrasePattern, rawContains, limit),
    ]);

    const safePapers = Array.isArray(papers) ? papers : [];
    const uniquePapers = Array.from(
      new Map(safePapers.map((paper: any) => [paper.slug, paper])).values()
    );

    const seenAuthors = new Set<string>();
    const authorResults: any[] = [];
    for (const paper of safePapers) {
      if (paper.authors) {
        const names = String(paper.authors).split(",").map((n: string) => n.trim()).filter(Boolean);
        for (const name of names) {
          const lowerName = name.toLowerCase();
          if (lowerName.includes(searchTerm) && !seenAuthors.has(lowerName)) {
            seenAuthors.add(lowerName);
            const slug = lowerName.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            authorResults.push({
              type: "authors",
              id: slug,
              title: name,
              slug: slug,
            });
            if (authorResults.length >= limit) break;
          }
        }
      }
      if (authorResults.length >= limit) break;
    }

    return {
      papers: uniquePapers.slice(0, limit).map((p: any) => ({
        type: "papers",
        id: p.id,
        title: p.title,
        slug: p.slug,
        subtitle: p.authors
          ? `${p.authors} • ${p.citationCount || 0} citations`
          : `${p.citationCount || 0} citations`,
      })),

      authors: authorResults,

      methods: (methods || []).map((m) => ({
        type: "methods",
        id: m.id,
        title: m.name,
        slug: m.slug,
      })),

      tasks: (tasks || []).map((t) => ({
        type: "tasks",
        id: t.id,
        title: t.name,
        slug: t.slug,
      })),

      models: (models || []).map((m) => ({
        type: "models",
        id: m.id,
        title: m.name,
        slug: m.slug,
      })),

      datasets: (datasets || []).map((d) => ({
        type: "datasets",
        id: d.id,
        title: d.name,
        slug: d.slug,
      })),
    };
  });

  // 4. Cache in local memory
  setLocalGlobalCache(cacheKey, results);

  // 5. Asynchronously cache in Redis without blocking
  try {
    redis.set(cacheKey, JSON.stringify(results), { ex: 300 }).catch(() => {});
  } catch {
    // Non-blocking
  }

  return results;
};