import { PrismaClient, Prisma } from "../generated/prisma/client";
import { QueryRouter } from "../routing/index.js";

import { redisManager } from "../lib/redis.js";
import { CursorManager } from "../pagination/CursorManager.js";
import { SortingEngine } from "../pagination/SortingEngine.js";
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
  if (cleanUrl && cleanUrl.includes("cloudinary.com/xipefqle")) {
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

// Define the specific select object
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

// Infer the type from the select object
type PaperFindManyResult = Prisma.PaperGetPayload<{
  select: typeof paperSelect;
}>[];
type PaperQueryResult = PaperFindManyResult;
type PaperQueryItem = PaperFindManyResult[number];

const getPaperIdentity = (paper: PaperQueryItem): string =>
  paper.arxivId || paper.slug;

const getConflictTimestamp = (paper: PaperQueryItem): number => {
  const timestamp = paper.updatedAt ?? paper.publicationDate ?? paper.createdAt;
  if (!timestamp) return 0;

  const time =
    timestamp instanceof Date
      ? timestamp.getTime()
      : new Date(timestamp).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const getCompletenessScore = (paper: PaperQueryItem): number => {
  const fields: unknown[] = [
    paper.abstract,
    paper.thumbnailUrl,
    paper.paperUrl,
    paper.pdfUrl,
    paper.githubUrl,
    paper.language,
    paper.authors?.length || 0,
    paper.tasks.length,
    paper.methods.length,
    paper.sotaClaims.length,
    paper.rankings.length,
  ];

  return fields.reduce<number>((score, value) => score + (value ? 1 : 0), 0);
};

const resolvePaperConflict = (
  current: PaperQueryItem,
  incoming: PaperQueryItem,
): PaperQueryItem => {
  const currentTimestamp = getConflictTimestamp(current);
  const incomingTimestamp = getConflictTimestamp(incoming);

  if (incomingTimestamp > currentTimestamp) return incoming;
  if (incomingTimestamp < currentTimestamp) return current;

  const currentScore = getCompletenessScore(current);
  const incomingScore = getCompletenessScore(incoming);

  if (incomingScore > currentScore) return incoming;
  if (incomingScore < currentScore) return current;

  return incoming.id.localeCompare(current.id) < 0 ? incoming : current;
};

const deduplicatePapers = (papers: PaperQueryItem[]): PaperFindManyResult => {
  const deduplicated = new Map<string, PaperQueryItem>();

  for (const paper of papers) {
    const key = getPaperIdentity(paper);
    const existing = deduplicated.get(key);
    deduplicated.set(
      key,
      existing ? resolvePaperConflict(existing, paper) : paper,
    );
  }

  return Array.from(deduplicated.values());
};

export const ingestPaper = async (queryRouter: QueryRouter, data: any) => {
  const arxivId = normalizeArxivId(data.arxiv_id || data.arxivId);
  const baseSlug = buildDeterministicSlug(data.title);
  const incomingUrl = data.paper_url || data.paperUrl;

  let initialSlug = baseSlug;

  // If no arxivId, we must guarantee uniqueness against different papers with the same title.
  // We avoid a findUnique read-before-write (which has race conditions) by ALWAYS
  // appending a deterministic hash of the paperUrl to the slug.
  if (!arxivId) {
    const disambiguator = hashDisambiguator(data.title, incomingUrl);
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
            githubStars: data.github_stars || data.githubStars || 0, // Added Github Stars
            citationCount: data.citationCount || 0, // Fixed Citation Count
          },
          update: {
            title: data.title,
            abstract: data.abstract,
            paperUrl: incomingUrl,
            thumbnailUrl: data.thumbnail_url || data.thumbnailUrl,
            projectUrl: data.github_url || data.githubUrl,
            githubStars: data.github_stars || data.githubStars || 0, // Added Github Stars
            citationCount: data.citationCount || 0, // Fixed Citation Count
          },
        });
      };

      try {
        return await attemptUpsert(initialSlug);
      } catch (error: any) {
        // P2002 is Prisma's Unique Constraint Violation
        // This is a defensive fallback only (e.g. arxivId is present but baseSlug collides)
        const isSlugCollision =
          error.code === "P2002" &&
          error.meta?.target &&
          (Array.isArray(error.meta.target)
            ? error.meta.target.includes("slug")
            : error.meta.target === "slug" || error.meta.target.includes("slug"));

        if (isSlugCollision) {
          let disambiguator = "";
          if (arxivId) {
            // Append last 6 chars of arxivId
            disambiguator = arxivId.slice(-6).replace(/[^a-z0-9]/gi, "");
          } else {
            // Defensive fallback if the title+paperUrl hash STILL magically collides
            disambiguator = hashDisambiguator(data.title, incomingUrl, "1");
          }

          const fallbackSlug = `${baseSlug}-${disambiguator}`;
          return await attemptUpsert(fallbackSlug); // 2nd attempt, will throw if it fails
        }

        throw error; // Re-throw if it's not a slug collision
      }
    },
  );
};

let cachedLatestPaperDate: { date: Date; timestamp: number } | null = null;

export const getPapers = async (
  queryRouter: QueryRouter,
  queryOrLimit: GetPapersQuery | number = {},
  legacySkip: number = 0,
): Promise<any> => {
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

  const where: any = {};
  const andConditions: any[] = [];

  if (query.task) andConditions.push({ tasks: { some: { task: { slug: query.task } } } });
  if (query.method)
    andConditions.push({ methods: { some: { method: { slug: query.method } } } });
  if (query.model) andConditions.push({ models: { some: { model: { slug: query.model } } } });
  if (query.organization) {
    andConditions.push({
      OR: [
        { organization: { equals: query.organization, mode: "insensitive" } },
        { models: { some: { model: { vendor: { equals: query.organization, mode: "insensitive" } } } } },
      ],
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  // Enforce papers must have at least one task/method
  // Only enforce sotaClaim/ranking on the general feed to avoid flooding
  const mandatoryConditions: any[] = [
    {
      OR: [
        { tasks: { some: {} } },
        { methods: { some: {} } }
      ]
    }
  ];

  if (!query.task && !query.method && !query.model && !query.organization) {
    mandatoryConditions.push({
      OR: [
        { sotaClaims: { some: {} } },
        { rankings: { some: {} } }
      ]
    });
  }

  where.AND = [
    ...(where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : []),
    ...mandatoryConditions
  ];

  let baseDate = new Date();
  if (period !== "all") {
    let latestDbDate = new Date();
    if (cachedLatestPaperDate && Date.now() - cachedLatestPaperDate.timestamp < 3600000) {
      latestDbDate = cachedLatestPaperDate.date;
    } else {
      const latestPaper = await queryRouter.routeQuery<any>(async (prisma: PrismaClient) => {
        return prisma.paper.findFirst({
          where: { publicationDate: { not: null } },
          orderBy: { publicationDate: "desc" },
          select: { publicationDate: true },
        });
      });
      const now = new Date();
      const rawDate = latestPaper?.publicationDate ? new Date(latestPaper.publicationDate) : now;
      latestDbDate = (rawDate.getTime() > 0 && rawDate.getTime() <= now.getTime()) ? rawDate : now;
      cachedLatestPaperDate = { date: latestDbDate, timestamp: Date.now() };
    }
    baseDate = latestDbDate;

    const publicationCutoff = new Date(baseDate);

    if (period === "today") {
      // 48-hour window from latest paper date to cover arXiv weekend release gaps and timezones
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

  const orderBy =
    sort === "latest" || sort === "recent"
      ? [
        { publicationDate: "desc" as const },
        { githubStars: "desc" as const },
        { slug: "asc" as const },
      ]
      : sort === "citations"
        ? [
          { citationCount: "desc" as const },
          { githubStars: "desc" as const },
          { publicationDate: "desc" as const },
          { slug: "asc" as const },
        ]
        : sort === "trending" || sort === "popular" || sort === "stars"
          ? [
            { githubStars: "desc" as const },
            { citationCount: "desc" as const },
            { publicationDate: "desc" as const },
            { slug: "asc" as const },
          ]
          : sort === "alphabetical"
            ? [
              { title: "asc" as const },
              { slug: "asc" as const }
            ]
            : [
              // Failsafe Default (Popularity oriented)
              { githubStars: "desc" as const },
              { citationCount: "desc" as const },
              { publicationDate: "desc" as const },
              { slug: "asc" as const },
            ];
  let papers = await queryRouter.routeQuery<any>(
    async (prisma: PrismaClient) => {
      return prisma.paper.findMany({
        where,
        orderBy,
        take: limit + 1, // Fetch one extra to determine hasMore
        skip,
        select: paperSelect,
      });
    },
  );

  let activeWhere = where;
  // ADDED: Cascading fallback to guarantee papers are always shown while keeping new papers (2026) first
  if (papers.length === 0 && skip === 0) {
    if (period !== "all") {
      // Fallback 1: Expand date window progressively while preserving date filter
      const fallbackCutoff = new Date(baseDate);
      const lookbackDays = period === "today" ? 7 : period === "week" ? 30 : 90;
      fallbackCutoff.setDate(fallbackCutoff.getDate() - lookbackDays);

      activeWhere = { ...where, publicationDate: { gte: fallbackCutoff } };
    } else {
      // Fallback for period === "all"
      activeWhere = { ...where, publicationDate: { not: null } };
    }

    papers = await queryRouter.routeQuery<any>(
      async (prisma: PrismaClient) => {
        return prisma.paper.findMany({
          where: activeWhere,
          orderBy,
          take: limit + 1,
          skip,
          select: paperSelect,
        });
      },
    );
  }

  const hasMore = papers.length > limit;
  const pagePapers = hasMore ? papers.slice(0, limit) : papers;

  const totalCount = await queryRouter.routeQuery<number>(
    async (prisma: PrismaClient) => {
      return prisma.paper.count({ where: activeWhere });
    },
  ).catch(() => (hasMore ? skip + limit + 1 : skip + pagePapers.length));

  return {
    papers: pagePapers.map((paper: any) => ({
      ...exposeThumbnailUrl(paper),
      repositories: paper.repositories.map(
        ({ repository }: any) => repository
      ),

      authors: parseAuthors(paper.authors),
      tasks: paper.tasks.map(({ task }: any) => task),
      methods: paper.methods.map(({ method }: any) => method),

    })),
    total: typeof totalCount === "number" && totalCount > 0 ? totalCount : (hasMore ? skip + limit + 1 : skip + pagePapers.length),
    page,
    hasMore,
    nextCursor: null, // Legacy cursor unused now
  };
};

export const getPaperBySlug = async (
  queryRouter: QueryRouter,
  slug: string,
) => {
  const paper = await queryRouter.routeQuery(
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
      if (resolvedThumb && resolvedThumb.includes("cloudinary.com/xipefqle")) {
        resolvedThumb = paperData.arxivId
          ? `https://pub-c9b7a41de3434a4ab7c7f137edbec13b.r2.dev/papers/real_page1_gcp/${paperData.arxivId}.webp`
          : null;
      }

      // Use data already fetched by findUnique — no extra DB queries needed
      return {
        ...paperData,
        thumbnailUrl: resolvedThumb,
        thumbnail_url: resolvedThumb,
        authors: parseAuthors(paperData.authors),
        models: paperData.models.map((r: any) => ({
          role: r.role,
          model: r.model,
        })),
        datasets: paperData.datasets.map((r: any) => r.dataset),
        tasks: paperData.tasks.map((r: any) => r.task),
        methods: paperData.methods.map((r: any) => r.method),
        conferences: paperData.conferences.map((r: any) => r.conference),
        rankings: paperData.rankings,
        sotaClaims: paperData.sotaClaims,
        repositories: (paperData as any).repositories?.map((r: any) => r.repository) || [],
      };
    },
  );

  return paper;
};


export const getPaperById = async (
  queryRouter: QueryRouter,
  id: string,
) => {
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
  data: any,
) => {
  const paper = await queryRouter.routeQuery(
    async (prisma: PrismaClient) => {
      const { thumbnail_url, ...rest } = data;
      return prisma.paper.update({
        where: { slug },
        data: {
          ...rest,
          ...(thumbnail_url !== undefined
            ? { thumbnailUrl: thumbnail_url }
            : {}),
        },
      });
    },
  );

  return paper ? exposeThumbnailUrl(paper) : null;
};

export const deletePaper = async (queryRouter: QueryRouter, slug: string) => {
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

  const searchWhere: Prisma.PaperWhereInput = {
    AND: [
      {
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { abstract: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      {
        OR: [
          { sotaClaims: { some: {} } },
          { rankings: { some: {} } },
        ],
      },
      {
        OR: [
          { tasks: { some: {} } },
          { methods: { some: {} } },
        ],
      },
    ],
  };

  const [papers, totalCount] = await queryRouter.routeQuery(
    async (prisma: PrismaClient) => {
      return Promise.all([
        prisma.paper.findMany({
          where: searchWhere,
          orderBy:
            sort === "latest"
              ? [{ publicationDate: "desc" }, { githubStars: "desc" }]
              : [{ githubStars: "desc" }, { publicationDate: "desc" }],
          take: limit,
          skip,
          select: paperSelect,
        }),
        prisma.paper.count({ where: searchWhere }),
      ]);
    },
  );

  return {
    papers: papers.map((paper: any) => ({
      ...exposeThumbnailUrl(paper),
      repositories: paper.repositories?.map(
        ({ repository }: any) => repository
      ) || [],
      authors: parseAuthors(paper.authors),
      tasks: paper.tasks?.map(({ task }: any) => task) || [],
      methods: paper.methods?.map(({ method }: any) => method) || [],
    })),
    total: typeof totalCount === "number" ? totalCount : papers.length,
    page,
    hasMore: skip + papers.length < totalCount,
    query: searchTerm,
  };
};

export interface OrganizationMetricResult {
  organization: string;
  paperCount: number;
  citations: number;
  stars: number;
  trendingScore: number;
}

export const getOrganizationMetrics = async (
  queryRouter: QueryRouter,
  organization?: string,
): Promise<OrganizationMetricResult[]> => {
  return queryRouter.routeQuery(async (prisma: PrismaClient) => {
    const orgFilter = organization?.trim().toLowerCase();

    try {
      let rows: {
        org_name: string;
        paper_count: number | bigint;
        total_citations: number | bigint;
        total_stars: number | bigint;
        total_trending: number | bigint;
      }[];

      if (orgFilter) {
        rows = await prisma.$queryRaw`
          WITH org_papers AS (
            SELECT LOWER(TRIM(p.organization)) AS org_name, p.id AS paper_id, p.citation_count, p.github_stars, p.trending_score
            FROM papers p
            WHERE p.organization IS NOT NULL AND TRIM(p.organization) <> ''
            UNION
            SELECT LOWER(TRIM(m.vendor)) AS org_name, pm.paper_id, p.citation_count, p.github_stars, p.trending_score
            FROM paper_models pm
            JOIN models m ON pm.model_id = m.id
            JOIN papers p ON pm.paper_id = p.id
            WHERE m.vendor IS NOT NULL AND TRIM(m.vendor) <> ''
          )
          SELECT 
            org_name,
            COUNT(DISTINCT paper_id)::int AS paper_count,
            COALESCE(SUM(citation_count), 0)::int AS total_citations,
            COALESCE(SUM(github_stars), 0)::int AS total_stars,
            COALESCE(SUM(trending_score), 0)::float AS total_trending
          FROM org_papers
          WHERE org_name = ${orgFilter}
          GROUP BY org_name;
        `;
      } else {
        rows = await prisma.$queryRaw`
          WITH org_papers AS (
            SELECT LOWER(TRIM(p.organization)) AS org_name, p.id AS paper_id, p.citation_count, p.github_stars, p.trending_score
            FROM papers p
            WHERE p.organization IS NOT NULL AND TRIM(p.organization) <> ''
            UNION
            SELECT LOWER(TRIM(m.vendor)) AS org_name, pm.paper_id, p.citation_count, p.github_stars, p.trending_score
            FROM paper_models pm
            JOIN models m ON pm.model_id = m.id
            JOIN papers p ON pm.paper_id = p.id
            WHERE m.vendor IS NOT NULL AND TRIM(m.vendor) <> ''
          )
          SELECT 
            org_name,
            COUNT(DISTINCT paper_id)::int AS paper_count,
            COALESCE(SUM(citation_count), 0)::int AS total_citations,
            COALESCE(SUM(github_stars), 0)::int AS total_stars,
            COALESCE(SUM(trending_score), 0)::float AS total_trending
          FROM org_papers
          GROUP BY org_name;
        `;
      }

      return rows.map((r) => ({
        organization: r.org_name,
        paperCount: Number(r.paper_count || 0),
        citations: Number(r.total_citations || 0),
        stars: Number(r.total_stars || 0),
        trendingScore: Number(r.total_trending || 0),
      }));
    } catch (rawErr) {
      console.warn("Raw SQL getOrganizationMetrics failed, falling back to prisma groupBy:", rawErr);
      const where: Prisma.PaperWhereInput = {
        organization: orgFilter
          ? { equals: orgFilter, mode: "insensitive" }
          : { not: null },
      };

      const groups = await prisma.paper.groupBy({
        by: ["organization"],
        where,
        _count: { id: true },
        _sum: { citationCount: true, githubStars: true, trendingScore: true },
      });

      return groups
        .filter((g) => g.organization && g.organization.trim())
        .map((g) => ({
          organization: g.organization!.trim().toLowerCase(),
          paperCount: g._count.id || 0,
          citations: g._sum.citationCount || 0,
          stars: g._sum.githubStars || 0,
          trendingScore: g._sum.trendingScore || 0,
        }));
    }
  });
};
