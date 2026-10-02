import { PrismaClient, Prisma } from "../generated/prisma/client";
import { QueryRouter } from "../routing/index.js";
import { buildDeterministicSlug, normalizeArxivId, hashDisambiguator } from "../utils/slug.js";

type GetPapersQuery = {
  sort?:
    | "latest"
    | "stars"
    | "citations"
    | "alphabetical"
    | "ranking"
    | "trending"
    | string;
  task?: string;
  method?: string;
  model?: string;
  organization?: string;
  period?: "today" | "week" | "month" | "all" | string;
  page?: number | string;
  limit?: number | string;
  skip?: number | string;
  cursor?: string;
};

const exposeThumbnailUrl = <T extends { thumbnailUrl?: string | null; arxivId?: string | null }>(
  paper: T,
) => {
  const { thumbnailUrl, ...rest } = paper;
  let cleanUrl = thumbnailUrl === "FAILED_404" ? null : (thumbnailUrl ?? null);
  if (cleanUrl && cleanUrl.includes("cloudinary.com")) {
    cleanUrl = paper.arxivId
      ? `https://pub-c9b7a41de3434a4ab7c7f137edbec13b.r2.dev/papers/real_page1_gcp/${paper.arxivId}.webp`
      : null;
  }
  return {
    ...rest,
    thumbnailUrl: cleanUrl,
    thumbnail_url: cleanUrl,
  };
};

const taskIdCache = new Map<string, { ids: string[]; expiresAt: number }>();
const methodIdCache = new Map<string, { ids: string[]; expiresAt: number }>();

async function getMatchingTaskIds(queryRouter: QueryRouter, taskSlugOrName: string): Promise<string[]> {
  const key = taskSlugOrName.toLowerCase().trim();
  const cached = taskIdCache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.ids;
  }

  try {
    const rows = await queryRouter.routeQuery<any[]>(async (prisma: PrismaClient) => {
      return prisma.$queryRawUnsafe<any[]>(
        `SELECT id FROM tasks WHERE slug = $1 OR slug = $1 || '-models' OR slug = $1 || '-agents' OR name ILIKE $1 OR name ILIKE '%' || $1 || '%'`,
        taskSlugOrName
      );
    });
    const ids = Array.isArray(rows) ? rows.map(r => r.id).filter(Boolean) : [];
    taskIdCache.set(key, { ids, expiresAt: Date.now() + 3600_000 });
    return ids;
  } catch {
    return [];
  }
}

async function getMatchingMethodIds(queryRouter: QueryRouter, methodSlugOrName: string): Promise<string[]> {
  const key = methodSlugOrName.toLowerCase().trim();
  const cached = methodIdCache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.ids;
  }

  try {
    const rows = await queryRouter.routeQuery<any[]>(async (prisma: PrismaClient) => {
      return prisma.$queryRawUnsafe<any[]>(
        `SELECT id FROM methods WHERE slug = $1 OR name ILIKE $1 OR name ILIKE '%' || $1 || '%'`,
        methodSlugOrName
      );
    });
    const ids = Array.isArray(rows) ? rows.map(r => r.id).filter(Boolean) : [];
    methodIdCache.set(key, { ids, expiresAt: Date.now() + 3600_000 });
    return ids;
  } catch {
    return [];
  }
}

const paperSelect = {
  id: true,
  slug: true,
  title: true,
  abstract: true,
  thumbnailUrl: true,
  publicationDate: true,
  createdAt: true,
  updatedAt: true,
  arxivId: true,
  paperUrl: true,
  pdfUrl: true,
  githubUrl: true,
  githubStars: true,
  github_hourly_increase: true,
  githubForks: true,
  hfUrl: true,
  huggingface_url: true,
  hfUpvotes: true,
  projectUrl: true,
  citationCount: true,
  language: true,
  authors: true,
  task: true,
  tasks: {
    select: {
      task: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  },
  methods: {
    select: {
      method: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  },
  sotaClaims: {
    select: {
      benchmark: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  },
  rankings: {
    select: {
      rank: true,
      benchmark: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  },
  repositories: {
    select: {
      repository: {
        select: {
          url: true,
          owner: true,
          name: true,
        },
      },
    },
  },
  models: {
    select: {
      model: {
        select: {
          id: true,
          name: true,
          slug: true,
          repositoryUrl: true,
          apiUrl: true,
        },
      },
    },
  },
} satisfies Prisma.PaperSelect;

const parseAuthors = (authors?: string | null) => {
  if (!authors) return [];

  return authors.split(",").map((name) => {
    const t = name.trim();
    return {
      id: t,
      name: t,
      slug: t.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    };
  });
};

const paperSearchSelect = {
  id: true,
  slug: true,
  title: true,
  githubStars: true,
  github_hourly_increase: true,
  citationCount: true,
  thumbnailUrl: true,
  authors: true,
  projectUrl: true,
} satisfies Prisma.PaperSelect;

export const ingestPaper = async (queryRouter: QueryRouter, data: Record<string, any>) => {
  const arxivId = normalizeArxivId(data.arxiv_id || data.arxivId);
  const baseSlug = buildDeterministicSlug(data.title || "paper");
  const incomingUrl = data.paper_url || data.paperUrl;

  let initialSlug = baseSlug;

  if (!arxivId) {
    const disambiguator = hashDisambiguator(data.title || "", incomingUrl || "");
    initialSlug = `${baseSlug}-${disambiguator}`;
  }

  return queryRouter.routeQuery(
    async (prisma: PrismaClient) => {
      const attemptUpsert = async (slugToUse: string) => {
        const where = arxivId ? { arxivId } : { slug: slugToUse };
        return prisma.paper.upsert({
          where,
          create: {
            slug: slugToUse,
            arxivId,
            title: data.title,
            abstract: data.abstract,
            paperUrl: incomingUrl,
            thumbnailUrl: data.thumbnail_url || data.thumbnailUrl,
            projectUrl: data.github_url || data.githubUrl,
            githubStars: data.github_stars || data.githubStars || 0,
            citationCount: data.citationCount || 0,
          },
          update: {
            title: data.title,
            abstract: data.abstract,
            paperUrl: incomingUrl,
            thumbnailUrl: data.thumbnail_url || data.thumbnailUrl,
            projectUrl: data.github_url || data.githubUrl,
            githubStars: data.github_stars || data.githubStars || 0,
            citationCount: data.citationCount || 0,
          },
        });
      };

      try {
        return await attemptUpsert(initialSlug);
      } catch (error: any) {
        const isSlugCollision =
          error.code === "P2002" &&
          error.meta?.target &&
          (Array.isArray(error.meta.target)
            ? error.meta.target.includes("slug")
            : error.meta.target === "slug" || error.meta.target.includes("slug"));

        if (isSlugCollision) {
          let disambiguator = "";
          if (arxivId) {
            disambiguator = arxivId.slice(-6).replace(/[^a-z0-9]/gi, "");
          } else {
            disambiguator = hashDisambiguator(data.title || "", incomingUrl || "", "1");
          }

          const fallbackSlug = `${baseSlug}-${disambiguator}`;
          return await attemptUpsert(fallbackSlug);
        }

        throw error;
      }
    },
  );
};

const countCache = new Map<string, { count: number; expiresAt: number }>();
let cachedLatestPaperDate: { date: Date; timestamp: number } | null = { date: new Date(), timestamp: Date.now() };

export const getPapers = async (
  queryRouter: QueryRouter,
  queryOrLimit: GetPapersQuery | number = {},
  legacySkip: number = 0,
): Promise<{ papers: any[]; total: number; page: number; hasMore: boolean; nextCursor: null }> => {
  const query: GetPapersQuery =
    typeof queryOrLimit === "number"
      ? {
          limit: queryOrLimit,
          skip: legacySkip,
          page: Math.floor(legacySkip / queryOrLimit) + 1,
        }
      : queryOrLimit;

  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const page = Math.max(Number(query.page) || 1, 1);
  const skip = Number(query.skip) || (page - 1) * limit;
  const sort = query.sort || "trending";
  const period = query.period || "all";
  const isStarsSort = sort === "stars" || sort === "github-stars" || sort === "most-stars";

  const where: Prisma.PaperWhereInput = {};

  if (query.task) {
    const tSlug = query.task.toLowerCase().trim();
    if (tSlug === "model-context-protocol-mcp" || tSlug === "mcp") {
      where.methods = { some: { method: { slug: "model-context-protocol-mcp" } } };
    } else if (tSlug === "reasoning") {
      where.tasks = { some: { task: { slug: "reasoning-models" } } };
    } else if (tSlug === "vision") {
      where.tasks = { some: { task: { slug: "vision-language-models" } } };
    } else if (tSlug === "coding") {
      where.tasks = { some: { task: { slug: "coding-agents" } } };
    } else {
      where.tasks = { some: { task: { slug: query.task } } };
    }
  }
  if (query.method) {
    const mSlug = query.method.toLowerCase().trim();
    if (mSlug === "mcp") {
      where.methods = { some: { method: { slug: "model-context-protocol-mcp" } } };
    } else {
      where.methods = { some: { method: { slug: query.method } } };
    }
  }
  if (query.model) where.models = { some: { model: { slug: query.model } } };
  if (query.organization) {
    const orgName = query.organization.trim();
    where.OR = [
      { organization: { equals: orgName, mode: "insensitive" } },
      { models: { some: { model: { vendor: { equals: orgName, mode: "insensitive" } } } } },
    ];
  }

  // For stars sort, ensure papers have GitHub stars (> 0)
  if (isStarsSort) {
    where.githubStars = { gt: 0 };
  }

  // Only apply mandatory task/method/sota filtering when on the general unfiltered feed.
  // When a user selects a specific task or method chip, applying redundant EXISTS checks damages query performance.
  if (!query.task && !query.method) {
    if (isStarsSort) {
      // For Most GitHub Stars feed:
      // Require papers to have tags, methods, SOTA claims, rankings, or a category task so frontend renders them with tags
      where.OR = [
        { tasks: { some: {} } },
        { methods: { some: {} } },
        { sotaClaims: { some: {} } },
        { rankings: { some: {} } },
        { task: { not: null } },
      ];
    } else {
      const feedConditions: any[] = [
        {
          OR: [
            { tasks: { some: {} } },
            { methods: { some: {} } },
          ],
        },
      ];

      if (!query.model && !query.organization) {
        feedConditions.push({
          OR: [
            { sotaClaims: { some: {} } },
            { rankings: { some: {} } },
          ],
        });
      }

      where.AND = [
        ...(where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : []),
        ...feedConditions,
      ];
    }
  }

  let baseDate = new Date();
  if (period !== "all") {
    let latestDbDate = new Date();
    if (cachedLatestPaperDate && Date.now() - cachedLatestPaperDate.timestamp < 3600000) {
      latestDbDate = cachedLatestPaperDate.date;
    } else {
      try {
        const latestPaper = await queryRouter.routeQuery<any>(async (prisma: PrismaClient) => {
          return prisma.paper.findFirst({
            where: { publicationDate: { not: null } },
            orderBy: { publicationDate: "desc" },
            select: { publicationDate: true },
          });
        });
        const now = new Date();
        const rawDate = latestPaper?.publicationDate ? new Date(latestPaper.publicationDate) : now;
        latestDbDate = rawDate.getTime() > 0 && rawDate.getTime() <= now.getTime() ? rawDate : now;
        cachedLatestPaperDate = { date: latestDbDate, timestamp: Date.now() };
      } catch {
        latestDbDate = new Date();
      }
    }
    baseDate = latestDbDate;

    const publicationCutoff = new Date(baseDate);

    if (period === "today") {
      publicationCutoff.setDate(publicationCutoff.getDate() - 2);
    } else if (period === "week") {
      publicationCutoff.setDate(publicationCutoff.getDate() - 7);
    } else if (period === "month") {
      publicationCutoff.setDate(publicationCutoff.getDate() - 30);
    }

    if (period === "today" || period === "week" || period === "month") {
      where.publicationDate = {
        gte: publicationCutoff,
      };
    }
  } else {
    where.publicationDate = { not: null };
  }

  const orderBy: Prisma.PaperOrderByWithRelationInput[] =
    sort === "latest" || sort === "recent"
      ? [{ publicationDate: "desc" }, { githubStars: "desc" }, { slug: "asc" }]
      : sort === "citations"
      ? [{ citationCount: "desc" }, { githubStars: "desc" }, { publicationDate: "desc" }, { slug: "asc" }]
      : sort === "trending" || sort === "popular" || sort === "stars"
      ? [{ githubStars: "desc" }, { citationCount: "desc" }, { publicationDate: "desc" }, { slug: "asc" }]
      : sort === "alphabetical"
      ? [{ title: "asc" }, { slug: "asc" }]
      : [{ githubStars: "desc" }, { citationCount: "desc" }, { publicationDate: "desc" }, { slug: "asc" }];

  const conditions: string[] = [];
  const sqlParams: any[] = [];
  let pIdx = 1;

  if (query.task) {
    const tSlug = query.task.toLowerCase().trim();
    if (tSlug === "model-context-protocol-mcp" || tSlug === "mcp") {
      conditions.push(`EXISTS (
        SELECT 1 FROM paper_methods pm 
        JOIN methods m ON pm.method_id = m.id 
        WHERE pm.paper_id = p.id AND (m.slug IN ('model-context-protocol-mcp', 'mcp') OR m.name ILIKE '%MCP%' OR m.name ILIKE '%Model Context Protocol%')
      )`);
    } else {
      const taskIds = await getMatchingTaskIds(queryRouter, query.task);
      if (taskIds.length > 0) {
        conditions.push(`EXISTS (
          SELECT 1 FROM paper_tasks pt 
          WHERE pt.paper_id = p.id AND pt.task_id = ANY($${pIdx}::text[])
        )`);
        sqlParams.push(taskIds);
        pIdx++;
      } else {
        conditions.push(`EXISTS (
          SELECT 1 FROM paper_tasks pt 
          JOIN tasks t ON pt.task_id = t.id 
          WHERE pt.paper_id = p.id AND (
            t.slug = $${pIdx} OR 
            t.slug = $${pIdx} || '-models' OR 
            t.slug = $${pIdx} || '-agents' OR 
            t.name ILIKE $${pIdx} OR 
            t.name ILIKE '%' || $${pIdx} || '%'
          )
        )`);
        sqlParams.push(query.task);
        pIdx++;
      }
    }
  }

  if (query.method) {
    const mSlug = query.method.toLowerCase().trim();
    if (mSlug === "mcp" || mSlug === "model-context-protocol-mcp") {
      conditions.push(`EXISTS (
        SELECT 1 FROM paper_methods pm 
        JOIN methods m ON pm.method_id = m.id 
        WHERE pm.paper_id = p.id AND (m.slug IN ('model-context-protocol-mcp', 'mcp') OR m.name ILIKE '%MCP%' OR m.name ILIKE '%Model Context Protocol%')
      )`);
    } else {
      const methodIds = await getMatchingMethodIds(queryRouter, query.method);
      if (methodIds.length > 0) {
        conditions.push(`EXISTS (
          SELECT 1 FROM paper_methods pm 
          WHERE pm.paper_id = p.id AND pm.method_id = ANY($${pIdx}::text[])
        )`);
        sqlParams.push(methodIds);
        pIdx++;
      } else {
        conditions.push(`EXISTS (
          SELECT 1 FROM paper_methods pm 
          JOIN methods m ON pm.method_id = m.id 
          WHERE pm.paper_id = p.id AND (m.slug = $${pIdx} OR m.name ILIKE $${pIdx} OR m.name ILIKE '%' || $${pIdx} || '%')
        )`);
        sqlParams.push(query.method);
        pIdx++;
      }
    }
  }

  if (query.model) {
    conditions.push(`EXISTS (
      SELECT 1 FROM paper_models pmo 
      JOIN models mo ON pmo.model_id = mo.id 
      WHERE pmo.paper_id = p.id AND mo.slug = $${pIdx}
    )`);
    sqlParams.push(query.model);
    pIdx++;
  }

  if (query.organization) {
    conditions.push(`(
      p.organization ILIKE $${pIdx} OR 
      EXISTS (
        SELECT 1 FROM paper_models pmo 
        JOIN models mo ON pmo.model_id = mo.id 
        WHERE pmo.paper_id = p.id AND mo.vendor ILIKE $${pIdx}
      )
    )`);
    sqlParams.push(query.organization.trim());
    pIdx++;
  }

  if (isStarsSort) {
    conditions.push(`p.github_stars > 0`);
  }

  if (!query.task && !query.method) {
    if (isStarsSort) {
      // For Most GitHub Stars, allow any paper with tasks, methods, SOTA claims, rankings, or a defined task string
      conditions.push(`(
        EXISTS (SELECT 1 FROM paper_tasks pt WHERE pt.paper_id = p.id) OR
        EXISTS (SELECT 1 FROM paper_methods pm WHERE pm.paper_id = p.id) OR
        EXISTS (SELECT 1 FROM sota_claims sc WHERE sc.paper_id = p.id) OR
        EXISTS (SELECT 1 FROM rankings r WHERE r.paper_id = p.id) OR
        (p.task IS NOT NULL AND TRIM(p.task) != '')
      )`);
    } else {
      conditions.push(`(
        EXISTS (SELECT 1 FROM paper_tasks pt WHERE pt.paper_id = p.id) OR
        EXISTS (SELECT 1 FROM paper_methods pm WHERE pm.paper_id = p.id)
      )`);
      if (!query.model && !query.organization) {
        conditions.push(`(
          p.id IN (SELECT paper_id FROM sota_claims UNION ALL SELECT paper_id FROM rankings)
        )`);
      }
    }
  }

  let periodCutoff: Date | null = null;
  if (period !== "all") {
    const days = period === "today" ? 2 : period === "week" ? 7 : 30;
    const cutoff = new Date(baseDate);
    cutoff.setDate(cutoff.getDate() - days);
    periodCutoff = cutoff;
    conditions.push(`p.publication_date >= $${pIdx}`);
    sqlParams.push(cutoff);
    pIdx++;
  } else {
    conditions.push(`p.publication_date IS NOT NULL`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  let orderSql = `ORDER BY p.github_stars DESC NULLS LAST, p.citation_count DESC NULLS LAST, p.publication_date DESC NULLS LAST, p.slug ASC`;
  if (sort === "latest" || sort === "recent") {
    orderSql = `ORDER BY p.publication_date DESC NULLS LAST, p.github_stars DESC NULLS LAST, p.slug ASC`;
  } else if (sort === "citations") {
    orderSql = `ORDER BY p.citation_count DESC NULLS LAST, p.github_stars DESC NULLS LAST, p.publication_date DESC NULLS LAST, p.slug ASC`;
  } else if (sort === "alphabetical") {
    orderSql = `ORDER BY p.title ASC NULLS LAST, p.slug ASC`;
  }

  const buildUnifiedSql = (whereStr: string) => `
    WITH selected_papers AS (
      SELECT p.*
      FROM papers p
      ${whereStr}
      ${orderSql}
      LIMIT ${limit + 1} OFFSET ${skip}
    )
    SELECT
      p.id,
      p.slug,
      p.title,
      p.abstract,
      p.thumbnail_url as "thumbnailUrl",
      p.publication_date as "publicationDate",
      p.created_at as "createdAt",
      p.updated_at as "updatedAt",
      p.arxiv_id as "arxivId",
      p.paper_url as "paperUrl",
      p.pdf_url as "pdfUrl",
      p.github_url as "githubUrl",
      p.github_stars as "githubStars",
      p.github_hourly_increase,
      p.github_forks as "githubForks",
      p.hf_url as "hfUrl",
      p.huggingface_url,
      p.hf_upvotes as "hfUpvotes",
      p.project_url as "projectUrl",
      p.citation_count as "citationCount",
      p.language,
      p.authors,
      COALESCE((
        SELECT json_agg(json_build_object('task', json_build_object('name', t.name, 'slug', t.slug)))
        FROM paper_tasks pt
        JOIN tasks t ON pt.task_id = t.id
        WHERE pt.paper_id = p.id
      ), 
      CASE WHEN p.task IS NOT NULL AND TRIM(p.task) != ''
           THEN json_build_array(json_build_object('task', json_build_object('name', p.task, 'slug', lower(regexp_replace(trim(p.task), '[^a-zA-Z0-9]+', '-', 'g')))))
           ELSE '[]'::json
      END) as tasks,
      COALESCE((
        SELECT json_agg(json_build_object('method', json_build_object('name', m.name, 'slug', m.slug)))
        FROM paper_methods pm
        JOIN methods m ON pm.method_id = m.id
        WHERE pm.paper_id = p.id
      ), '[]'::json) as methods,
      COALESCE((
        SELECT json_agg(json_build_object('benchmark', json_build_object('name', b.name, 'slug', b.slug)))
        FROM sota_claims sc
        JOIN benchmarks b ON sc.benchmark_id = b.id
        WHERE sc.paper_id = p.id
      ), '[]'::json) as "sotaClaims",
      COALESCE((
        SELECT json_agg(json_build_object('rank', r.rank, 'benchmark', json_build_object('name', b.name, 'slug', b.slug)))
        FROM rankings r
        JOIN benchmarks b ON r.benchmark_id = b.id
        WHERE r.paper_id = p.id
      ), '[]'::json) as rankings,
      COALESCE((
        SELECT json_agg(json_build_object('repository', json_build_object('url', repo.url, 'owner', repo.owner, 'name', repo.name)))
        FROM paper_repositories pr
        JOIN repositories repo ON pr.repository_id = repo.id
        WHERE pr.paper_id = p.id
      ), '[]'::json) as repositories,
      COALESCE((
        SELECT json_agg(json_build_object('model', json_build_object('id', mo.id, 'name', mo.name, 'slug', mo.slug, 'repositoryUrl', mo.repository_url, 'apiUrl', mo.api_url)))
        FROM paper_models pmo
        JOIN models mo ON pmo.model_id = mo.id
        WHERE pmo.paper_id = p.id
      ), '[]'::json) as models
    FROM selected_papers p
    ${orderSql};
  `;

  let papers: any[] = [];
  try {
    papers = await queryRouter.routeQuery<any[]>(async (prisma: PrismaClient) => {
      return prisma.$queryRawUnsafe<any[]>(buildUnifiedSql(whereClause), ...sqlParams);
    });

    if ((!papers || papers.length === 0) && skip === 0 && period !== "all" && periodCutoff) {
      const fallbackCutoff = new Date(baseDate);
      const lookbackDays = period === "today" ? 7 : period === "week" ? 30 : 90;
      fallbackCutoff.setDate(fallbackCutoff.getDate() - lookbackDays);
      const fallbackParams = [...sqlParams];
      fallbackParams[fallbackParams.length - 1] = fallbackCutoff;
      papers = await queryRouter.routeQuery<any[]>(async (prisma: PrismaClient) => {
        return prisma.$queryRawUnsafe<any[]>(buildUnifiedSql(whereClause), ...fallbackParams);
      });
    }
  } catch (rawErr) {
    console.warn("Unified SQL query error, falling back to Prisma findMany:", rawErr);
    papers = await queryRouter.routeQuery<any[]>(async (prisma: PrismaClient) => {
      return prisma.paper.findMany({
        where,
        orderBy,
        take: limit + 1,
        skip,
        select: paperSelect,
      });
    });
  }

  const safePapers = Array.isArray(papers) ? papers : [];
  const hasMore = safePapers.length > limit;
  const pagePapers = hasMore ? safePapers.slice(0, limit) : safePapers;

  // Ultra-fast count optimization:
  // 1. If page 1 and results are within limit, count is exact without querying the DB.
  // 2. If cached, use cached count immediately.
  // 3. Otherwise, return estimate immediately (0ms) and asynchronously warm exact count in background.
  let totalCount: number;
  if (page === 1 && !hasMore) {
    totalCount = safePapers.length;
  } else {
    const countCacheKey = JSON.stringify({ where, task: query.task, method: query.method, period });
    const cachedCount = countCache.get(countCacheKey);
    if (cachedCount && Date.now() < cachedCount.expiresAt) {
      totalCount = cachedCount.count;
    } else {
      totalCount = hasMore ? skip + limit + 50 : skip + pagePapers.length;

      // Populate exact count in background using fast SQL count without blocking HTTP response
      const countSql = `SELECT count(*) as count FROM papers p ${whereClause}`;
      queryRouter
        .routeQuery<any[]>(async (prisma: PrismaClient) => prisma.$queryRawUnsafe(countSql, ...sqlParams))
        .then((res) => {
          const cnt = Number(res?.[0]?.count ?? 0);
          if (cnt > 0) {
            countCache.set(countCacheKey, { count: cnt, expiresAt: Date.now() + 1_800_000 });
          }
        })
        .catch(() => {});
    }
  }

  return {
    papers: pagePapers.map((paper) => ({
      ...exposeThumbnailUrl(paper),
      repositories: Array.isArray(paper.repositories)
        ? paper.repositories.map(({ repository }: any) => repository)
        : [],
      models: Array.isArray(paper.models)
        ? paper.models.map(({ model }: any) => model)
        : [],
      authors: parseAuthors(paper.authors),
      tasks:
        Array.isArray(paper.tasks) && paper.tasks.length > 0
          ? paper.tasks.map(({ task }: any) => task).filter(Boolean)
          : paper.task
          ? [{ name: paper.task, slug: String(paper.task).toLowerCase().replace(/[^a-z0-9]+/g, "-") }]
          : [],
      methods: Array.isArray(paper.methods) ? paper.methods.map(({ method }: any) => method) : [],
    })),
    total: typeof totalCount === "number" && totalCount > 0 ? totalCount : (hasMore ? skip + limit + 1 : skip + pagePapers.length),
    page,
    hasMore,
    nextCursor: null,
  };
};

async function fetchFullPaperRaw(prisma: PrismaClient, column: "slug" | "id", value: string) {
  const whereSql = column === "slug" ? `p.slug = $1` : `p.id = $1`;
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT 
       p.id,
       p.slug,
       p.title,
       p.short_title as "shortTitle",
       p.abstract,
       p.tl_dr as "tlDr",
       p.publication_date as "publicationDate",
       p.submission_date as "submissionDate",
       p.arxiv_id as "arxivId",
       p.doi,
       p.paper_url as "paperUrl",
       p.pdf_url as "pdfUrl",
       p.thumbnail_url as "thumbnailUrl",
       p.source_url as "sourceUrl",
       p.project_url as "projectUrl",
       p.citation_count as "citationCount",
       p.reference_count as "referenceCount",
       p.page_count as "pageCount",
       p.paper_type as "paperType",
       p.status,
       p.language,
       p.license,
       p.created_at as "createdAt",
       p.updated_at as "updatedAt",
       p.github_forks as "githubForks",
       p.github_stars as "githubStars",
       p.github_hourly_increase,
       p.github_url as "githubUrl",
       p.hf_url as "hfUrl",
       p.is_official_code as "isOfficialCode",
       p.discovery_source as "discoverySource",
       p.authors,
       p.huggingface_url,
       p.hf_model_url as "hf_model_url",
       p.hf_upvotes as "hfUpvotes",
       p.trending_score as "trendingScore",
       COALESCE((
         SELECT json_agg(json_build_object(
           'role', pm.role,
           'model', json_build_object(
             'id', m.id, 'name', m.name, 'slug', m.slug,
             'parameterCount', m.parameter_count, 'architecture', m.architecture,
             'vendor', m.vendor, 'vendor_logo_url', m.vendor_logo_url,
             'modelFamily', m.model_family, 'description', m.description,
             'repositoryUrl', m.repository_url
           )
         ))
         FROM paper_models pm
         JOIN models m ON pm.model_id = m.id
         WHERE pm.paper_id = p.id
       ), '[]'::json) as models,
       COALESCE((
         SELECT json_agg(json_build_object('id', d.id, 'name', d.name, 'slug', d.slug))
         FROM paper_datasets pd
         JOIN datasets d ON pd.dataset_id = d.id
         WHERE pd.paper_id = p.id
       ), '[]'::json) as datasets,
       COALESCE((
         SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug, 'color', t.color) ORDER BY t.name ASC)
         FROM paper_tasks pt
         JOIN tasks t ON pt.task_id = t.id
         WHERE pt.paper_id = p.id
       ), '[]'::json) as tasks,
       COALESCE((
         SELECT json_agg(json_build_object('id', m.id, 'name', m.name, 'slug', m.slug) ORDER BY m.name ASC)
         FROM paper_methods pm
         JOIN methods m ON pm.method_id = m.id
         WHERE pm.paper_id = p.id
       ), '[]'::json) as methods,
       COALESCE((
         SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug))
         FROM paper_conferences pc
         JOIN conferences c ON pc.conference_id = c.id
         WHERE pc.paper_id = p.id
       ), '[]'::json) as conferences,
       COALESCE((
         SELECT json_agg(json_build_object(
           'id', r.id, 'paper_id', r.paper_id, 'benchmark_id', r.benchmark_id,
           'rank', r.rank, 'previous_rank', r.previous_rank,
           'benchmark', json_build_object('id', b.id, 'name', b.name, 'slug', b.slug)
         ))
         FROM rankings r
         JOIN benchmarks b ON r.benchmark_id = b.id
         WHERE r.paper_id = p.id
       ), '[]'::json) as rankings,
       COALESCE((
         SELECT json_agg(json_build_object(
           'id', sc.id, 'paper_id', sc.paper_id, 'benchmark_id', sc.benchmark_id,
           'benchmark', json_build_object('id', b.id, 'name', b.name, 'slug', b.slug)
         ))
         FROM sota_claims sc
         JOIN benchmarks b ON sc.benchmark_id = b.id
         WHERE sc.paper_id = p.id
       ), '[]'::json) as "sotaClaims",
       COALESCE((
         SELECT json_agg(json_build_object('url', repo.url, 'owner', repo.owner, 'name', repo.name))
         FROM paper_repositories pr
         JOIN repositories repo ON pr.repository_id = repo.id
         WHERE pr.paper_id = p.id
       ), '[]'::json) as repositories
     FROM papers p
     WHERE ${whereSql}
     LIMIT 1`,
    value
  );

  const paperData = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  if (!paperData) return null;

  let resolvedThumb = paperData.thumbnailUrl === "FAILED_404" ? null : paperData.thumbnailUrl;
  if (resolvedThumb && resolvedThumb.includes("cloudinary.com")) {
    resolvedThumb = paperData.arxivId
      ? `https://pub-c9b7a41de3434a4ab7c7f137edbec13b.r2.dev/papers/real_page1_gcp/${paperData.arxivId}.webp`
      : null;
  }

  return {
    ...paperData,
    thumbnailUrl: resolvedThumb,
    thumbnail_url: resolvedThumb,
    authors: parseAuthors(paperData.authors),
    models: Array.isArray(paperData.models) ? paperData.models : [],
    datasets: Array.isArray(paperData.datasets) ? paperData.datasets : [],
    tasks: Array.isArray(paperData.tasks) ? paperData.tasks : [],
    methods: Array.isArray(paperData.methods) ? paperData.methods : [],
    conferences: Array.isArray(paperData.conferences) ? paperData.conferences : [],
    rankings: Array.isArray(paperData.rankings) ? paperData.rankings : [],
    sotaClaims: Array.isArray(paperData.sotaClaims) ? paperData.sotaClaims : [],
    repositories: Array.isArray(paperData.repositories) ? paperData.repositories : [],
  };
}

export const getPaperBySlug = async (queryRouter: QueryRouter, slug: string) => {
  if (!slug) return null;
  return queryRouter.routeQuery(async (prisma: PrismaClient) => {
    return fetchFullPaperRaw(prisma, "slug", slug);
  });
};

export const getPaperById = async (queryRouter: QueryRouter, id: string) => {
  if (!id) return null;
  return queryRouter.routeQuery(async (prisma: PrismaClient) => {
    return fetchFullPaperRaw(prisma, "id", id);
  });
};

export const updatePaper = async (
  queryRouter: QueryRouter,
  slug: string,
  data: Record<string, any>,
) => {
  if (!slug) return null;
  const paper = await queryRouter.routeQuery(
    async (prisma: PrismaClient) => {
      const { thumbnail_url, ...rest } = data;
      return prisma.paper.update({
        where: { slug },
        data: {
          ...rest,
          ...(thumbnail_url !== undefined ? { thumbnailUrl: thumbnail_url } : {}),
        },
      });
    },
  );

  return paper ? exposeThumbnailUrl(paper) : null;
};

export const deletePaper = async (queryRouter: QueryRouter, slug: string) => {
  if (!slug) return null;
  return queryRouter.routeQuery(
    async (prisma: PrismaClient) => {
      return prisma.paper.delete({
        where: { slug },
      });
    },
  );
};

export const searchPapers = async (
  queryRouter: QueryRouter,
  query: { q?: string; limit?: number; page?: number; sort?: string } = {},
) => {
  const searchTerm = query.q?.trim() || "";
  if (!searchTerm) {
    return { papers: [], total: 0, page: 1, hasMore: false, query: "" };
  }

  const limit = Math.max(Number(query.limit) || 20, 1);
  const page = Math.max(Number(query.page) || 1, 1);
  const skip = (page - 1) * limit;
  const sort = query.sort || "relevance";

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

  const sqlParams: any[] = [
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
    allWordsInTitleConditions.push(`p.title ILIKE $${pIdx}`);
    allWordsAnywhereConditions.push(`(
      p.title ILIKE $${pIdx} 
      OR p.authors ILIKE $${pIdx} 
      OR p.abstract ILIKE $${pIdx}
      OR EXISTS (
        SELECT 1 FROM paper_tasks pt 
        JOIN tasks t ON pt.task_id = t.id 
        WHERE pt.paper_id = p.id AND (t.name ILIKE $${pIdx} OR t.slug ILIKE $${pIdx})
      )
      OR EXISTS (
        SELECT 1 FROM paper_methods pm 
        JOIN methods m ON pm.method_id = m.id 
        WHERE pm.paper_id = p.id AND (m.name ILIKE $${pIdx} OR m.slug ILIKE $${pIdx})
      )
    )`);
    sqlParams.push(`%${word}%`);
    pIdx++;
  }

  const titleAllWordsSql = allWordsInTitleConditions.length > 0 ? allWordsInTitleConditions.join(" AND ") : "false";
  const anywhereAllWordsSql = allWordsAnywhereConditions.length > 0 ? allWordsAnywhereConditions.join(" AND ") : "false";

  const whereCondition = `(
    ($1::text != '' AND p.arxiv_id = $1::text)
    OR ($2::text != '' AND p.slug = $2::text)
    OR ($3::text != '' AND REGEXP_REPLACE(LOWER(p.title), '[^a-z0-9]', '', 'g') = $3::text)
    OR p.title ILIKE $5
    OR p.title ILIKE $6
    OR p.slug ILIKE $5
    OR p.authors ILIKE $5
    OR p.authors ILIKE $6
    OR p.abstract ILIKE $5
    OR (${titleAllWordsSql})
    OR (${anywhereAllWordsSql})
  )`;

  let orderClause = `
    ORDER BY 
      CASE
        -- Rank 1: Exact matches (ArXiv ID, slug, or normalized title ignoring punctuation/spacing)
        WHEN $1::text != '' AND p.arxiv_id = $1::text THEN 1
        WHEN $2::text != '' AND p.slug = $2::text THEN 1
        WHEN $3::text != '' AND REGEXP_REPLACE(LOWER(p.title), '[^a-z0-9]', '', 'g') = $3::text THEN 1
        -- Rank 2: Title exactly equals clean query
        WHEN LOWER(p.title) = LOWER($4) THEN 2
        -- Rank 3: Title starts with normalized query or prefix
        WHEN $3::text != '' AND REGEXP_REPLACE(LOWER(p.title), '[^a-z0-9]', '', 'g') LIKE ($3::text || '%') THEN 3
        WHEN LOWER(p.title) LIKE LOWER($7) THEN 4
        -- Rank 4: Title contains the search phrase
        WHEN p.title ILIKE $6 THEN 5
        WHEN p.title ILIKE $5 THEN 6
        -- Rank 5: Title contains all search words
        WHEN ${titleAllWordsSql} THEN 7
        -- Rank 6: Authors or abstract contains phrase or words
        WHEN p.authors ILIKE $5 OR p.authors ILIKE $6 THEN 8
        WHEN ${anywhereAllWordsSql} THEN 9
        ELSE 10
      END ASC,
      p.github_stars DESC NULLS LAST,
      p.citation_count DESC NULLS LAST,
      p.publication_date DESC NULLS LAST
  `;

  if (sort === "latest") {
    orderClause = `ORDER BY p.publication_date DESC NULLS LAST, p.github_stars DESC NULLS LAST`;
  } else if (sort === "stars") {
    orderClause = `ORDER BY p.github_stars DESC NULLS LAST, p.citation_count DESC NULLS LAST`;
  }

  const limitParamIdx = pIdx;
  const skipParamIdx = pIdx + 1;
  sqlParams.push(limit, skip);

  const papers = await queryRouter.routeQuery<any[]>(
    async (prisma: PrismaClient) => {
      return prisma.$queryRawUnsafe<any[]>(
        `SELECT 
           p.id, 
           p.slug, 
           p.title, 
           p.abstract,
           p.publication_date as "publicationDate",
           p.github_stars as "githubStars", 
           p.github_hourly_increase as "github_hourly_increase",
           p.github_forks as "githubForks",
           p.citation_count as "citationCount", 
           p.thumbnail_url as "thumbnailUrl", 
           p.authors, 
           p.project_url as "projectUrl",
           p.paper_url as "paperUrl",
           p.pdf_url as "pdfUrl",
           p.arxiv_id as "arxivId",
           p.hf_url as "hfUrl",
           p.huggingface_url,
           COALESCE((
             SELECT json_agg(json_build_object('task', json_build_object('name', t.name, 'slug', t.slug)))
             FROM paper_tasks pt
             JOIN tasks t ON pt.task_id = t.id
             WHERE pt.paper_id = p.id
           ), '[]'::json) as tasks,
           COALESCE((
             SELECT json_agg(json_build_object('method', json_build_object('name', m.name, 'slug', m.slug)))
             FROM paper_methods pm
             JOIN methods m ON pm.method_id = m.id
             WHERE pm.paper_id = p.id
           ), '[]'::json) as methods,
           COALESCE((
             SELECT json_agg(json_build_object('benchmark', json_build_object('name', b.name, 'slug', b.slug)))
             FROM sota_claims sc
             JOIN benchmarks b ON sc.benchmark_id = b.id
             WHERE sc.paper_id = p.id
           ), '[]'::json) as "sotaClaims",
           COALESCE((
             SELECT json_agg(json_build_object('rank', r.rank, 'benchmark', json_build_object('name', b.name, 'slug', b.slug)))
             FROM rankings r
             JOIN benchmarks b ON r.benchmark_id = b.id
             WHERE r.paper_id = p.id
           ), '[]'::json) as rankings
         FROM papers p
         WHERE ${whereCondition}
         ${orderClause}
         LIMIT $${limitParamIdx} OFFSET $${skipParamIdx}`,
        ...sqlParams
      );
    },
  );

  const safePapers = Array.isArray(papers) ? papers : [];

  return {
    papers: safePapers.map((paper) => ({
      ...exposeThumbnailUrl(paper),
      repositories: [],
      authors: parseAuthors(paper.authors),
      tasks: Array.isArray(paper.tasks) ? paper.tasks : [],
      methods: Array.isArray(paper.methods) ? paper.methods : [],
      sotaClaims: Array.isArray(paper.sotaClaims) ? paper.sotaClaims : [],
      rankings: Array.isArray(paper.rankings) ? paper.rankings : [],
    })),
    total: safePapers.length,
    page,
    hasMore: safePapers.length >= limit,
    query: searchTerm,
  };
};
/**
 * Retrieves aggregated organization metrics (paper counts, citations, stars, trending scores).
 */
export async function getOrganizationMetrics(queryRouter: QueryRouter, organization?: string) {
  return queryRouter.routeQuery(async (prisma: PrismaClient) => {
    let sql = `
      SELECT 
        LOWER(TRIM(m.vendor)) AS organization,
        COUNT(DISTINCT p.id)::int AS "paperCount",
        COALESCE(SUM(p.citation_count), 0)::int AS citations,
        COALESCE(SUM(p.github_stars), 0)::int AS stars,
        COALESCE(SUM(p.github_hourly_increase), 0)::float AS "trendingScore"
      FROM papers p
      JOIN paper_models pm ON p.id = pm.paper_id
      JOIN models m ON pm.model_id = m.id
      WHERE m.vendor IS NOT NULL AND TRIM(m.vendor) != ''
    `;

    const params: any[] = [];
    if (organization && organization.trim()) {
      sql += ` AND LOWER(TRIM(m.vendor)) = LOWER(TRIM($1))`;
      params.push(organization.trim());
    }

    sql += ` GROUP BY LOWER(TRIM(m.vendor)) ORDER BY "paperCount" DESC;`;

    const data = await prisma.$queryRawUnsafe<any[]>(sql, ...params);

    return {
      status: "success",
      count: data.length,
      data,
    };
  });
}