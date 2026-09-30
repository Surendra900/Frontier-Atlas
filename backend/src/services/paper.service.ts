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

  const where: Prisma.PaperWhereInput = {};

  if (query.task) where.tasks = { some: { task: { slug: query.task } } };
  if (query.method) where.methods = { some: { method: { slug: query.method } } };
  if (query.model) where.models = { some: { model: { slug: query.model } } };
  if (query.organization) {
    const orgName = query.organization.trim();
    where.OR = [
      { organization: { equals: orgName, mode: "insensitive" } },
      { models: { some: { model: { vendor: { equals: orgName, mode: "insensitive" } } } } },
    ];
  }

  // Only apply mandatory task/method/sota filtering when on the general unfiltered feed.
  // When a user selects a specific task or method chip, applying redundant EXISTS checks damages query performance.
  if (!query.task && !query.method) {
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
    conditions.push(`EXISTS (
      SELECT 1 FROM paper_tasks pt 
      JOIN tasks t ON pt.task_id = t.id 
      WHERE pt.paper_id = p.id AND (t.slug = $${pIdx} OR t.name ILIKE $${pIdx})
    )`);
    sqlParams.push(query.task);
    pIdx++;
  }

  if (query.method) {
    conditions.push(`EXISTS (
      SELECT 1 FROM paper_methods pm 
      JOIN methods m ON pm.method_id = m.id 
      WHERE pm.paper_id = p.id AND (m.slug = $${pIdx} OR m.name ILIKE $${pIdx})
    )`);
    sqlParams.push(query.method);
    pIdx++;
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

  if (!query.task && !query.method) {
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
      ), '[]'::json) as rankings,
      COALESCE((
        SELECT json_agg(json_build_object('repository', json_build_object('url', repo.url, 'owner', repo.owner, 'name', repo.name)))
        FROM paper_repositories pr
        JOIN repositories repo ON pr.repository_id = repo.id
        WHERE pr.paper_id = p.id
      ), '[]'::json) as repositories
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

  // Fast count optimization:
  // 1. If page 1 and results are within limit, count is exact without querying the DB!
  // 2. Otherwise, check in-memory count cache before executing expensive count query.
  let totalCount: number;
  if (page === 1 && !hasMore) {
    totalCount = safePapers.length;
  } else {
    const countCacheKey = JSON.stringify(where);
    const cachedCount = countCache.get(countCacheKey);
    if (cachedCount && Date.now() < cachedCount.expiresAt) {
      totalCount = cachedCount.count;
    } else {
      totalCount = await queryRouter.routeQuery<number>(
        async (prisma: PrismaClient) => {
          return prisma.paper.count({ where });
        },
      ).then((cnt) => {
        if (typeof cnt === "number") {
          countCache.set(countCacheKey, { count: cnt, expiresAt: Date.now() + 600_000 });
        }
        return cnt;
      }).catch(() => (hasMore ? skip + limit + 1 : skip + pagePapers.length));
    }
  }

  return {
    papers: pagePapers.map((paper) => ({
      ...exposeThumbnailUrl(paper),
      repositories: Array.isArray(paper.repositories)
        ? paper.repositories.map(({ repository }: any) => repository)
        : [],
      authors: parseAuthors(paper.authors),
      tasks: Array.isArray(paper.tasks) ? paper.tasks.map(({ task }: any) => task) : [],
      methods: Array.isArray(paper.methods) ? paper.methods.map(({ method }: any) => method) : [],
    })),
    total: typeof totalCount === "number" && totalCount > 0 ? totalCount : (hasMore ? skip + limit + 1 : skip + pagePapers.length),
    page,
    hasMore,
    nextCursor: null,
  };
};

export const getPaperBySlug = async (queryRouter: QueryRouter, slug: string) => {
  if (!slug) return null;

  return queryRouter.routeQuery(
    async (prisma: PrismaClient) => {
      const paperData = await prisma.paper.findUnique({
        where: { slug },
        select: {
          id: true,
          slug: true,
          title: true,
          abstract: true,
          tlDr: true,
          publicationDate: true,
          submissionDate: true,
          arxivId: true,
          doi: true,
          paperUrl: true,
          pdfUrl: true,
          thumbnailUrl: true,
          sourceUrl: true,
          projectUrl: true,
          citationCount: true,
          referenceCount: true,
          pageCount: true,
          paperType: true,
          status: true,
          language: true,
          license: true,
          updatedAt: true,
          githubForks: true,
          githubStars: true,
          github_hourly_increase: true,
          githubUrl: true,
          hfUrl: true,
          isOfficialCode: true,
          discoverySource: true,
          authors: true,
          models: {
            include: {
              model: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  parameterCount: true,
                  architecture: true,
                  vendor: true,
                  vendor_logo_url: true,
                  modelFamily: true,
                  description: true,
                  repositoryUrl: true,
                },
              },
            },
          },
          datasets: {
            select: {
              dataset: { select: { id: true, name: true, slug: true } },
            },
          },
          tasks: {
            orderBy: { task: { name: "asc" } },
            select: {
              task: { select: { id: true, name: true, slug: true, color: true } },
            },
          },
          methods: {
            orderBy: { method: { name: "asc" } },
            select: {
              method: { select: { id: true, name: true, slug: true } },
            },
          },
          conferences: {
            select: {
              conference: { select: { id: true, name: true, slug: true } },
            },
          },
          rankings: {
            select: {
              id: true,
              paper_id: true,
              benchmark_id: true,
              rank: true,
              previous_rank: true,
              benchmark: { select: { id: true, name: true, slug: true } },
            },
          },
          sotaClaims: {
            select: {
              id: true,
              paper_id: true,
              benchmark_id: true,
              benchmark: { select: { id: true, name: true, slug: true } },
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
          huggingface_url: true,
          hfUpvotes: true,
        },
      });

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
        models: Array.isArray(paperData.models)
          ? paperData.models.map((r: any) => ({ role: r.role, model: r.model }))
          : [],
        datasets: Array.isArray(paperData.datasets)
          ? paperData.datasets.map((r: any) => r.dataset)
          : [],
        tasks: Array.isArray(paperData.tasks)
          ? paperData.tasks.map((r: any) => r.task)
          : [],
        methods: Array.isArray(paperData.methods)
          ? paperData.methods.map((r: any) => r.method)
          : [],
        conferences: Array.isArray(paperData.conferences)
          ? paperData.conferences.map((r: any) => r.conference)
          : [],
        rankings: paperData.rankings || [],
        sotaClaims: paperData.sotaClaims || [],
        repositories: Array.isArray(paperData.repositories)
          ? paperData.repositories.map((r: any) => r.repository)
          : [],
      };
    },
  );
};

export const getPaperById = async (queryRouter: QueryRouter, id: string) => {
  if (!id) return null;
  const paper = await queryRouter.routeQuery(async (prisma: PrismaClient) => {
    return prisma.paper.findUnique({
      where: { id },
      select: paperSelect,
    });
  });
  return paper ? exposeThumbnailUrl(paper) : null;
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

  const orderClause =
    sort === "latest"
      ? `publication_date DESC NULLS LAST, github_stars DESC NULLS LAST`
      : `github_stars DESC NULLS LAST, publication_date DESC NULLS LAST`;

  const papers = await queryRouter.routeQuery<any[]>(
    async (prisma: PrismaClient) => {
      return prisma.$queryRawUnsafe<any[]>(
        `SELECT id, slug, title, github_stars as "githubStars", github_hourly_increase as "github_hourly_increase",
                citation_count as "citationCount", thumbnail_url as "thumbnailUrl", authors, project_url as "projectUrl"
         FROM papers
         WHERE title ILIKE $1 OR authors ILIKE $1
         ORDER BY ${orderClause}
         LIMIT $2 OFFSET $3`,
        `%${searchTerm}%`,
        limit,
        skip
      );
    },
  );

  const safePapers = Array.isArray(papers) ? papers : [];

  return {
    papers: safePapers.map((paper) => ({
      ...exposeThumbnailUrl(paper),
      repositories: [],
      authors: parseAuthors(paper.authors),
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