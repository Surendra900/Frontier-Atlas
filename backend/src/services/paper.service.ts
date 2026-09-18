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

const exposeThumbnailUrl = <T extends { thumbnailUrl?: string | null }>(
  paper: T,
) => {
  const { thumbnailUrl, ...rest } = paper;
  const cleanUrl = thumbnailUrl === "FAILED_404" ? null : (thumbnailUrl ?? null);
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
  hf_model_url: true,
  trendingScore: true,
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
            authors: data.authors,
            paperUrl: incomingUrl,
            thumbnailUrl: data.thumbnail_url || data.thumbnailUrl,
            projectUrl: data.github_url || data.githubUrl,
            githubUrl: data.github_url || data.githubUrl,
            githubStars: data.github_stars || data.githubStars || 0, // Added Github Stars
            citationCount: data.citationCount || 0, // Fixed Citation Count
          },
          update: {
            title: data.title,
            abstract: data.abstract,
            authors: data.authors ?? undefined,
            paperUrl: incomingUrl,
            thumbnailUrl: data.thumbnail_url || data.thumbnailUrl,
            projectUrl: data.github_url || data.githubUrl,
            githubUrl: data.github_url || data.githubUrl,
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

  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 50);
  const page = Math.max(Number(query.page) || 1, 1);
  const skip = Number(query.skip) || (page - 1) * limit;
  const sort = query.sort || "trending";
  const period = query.period || "all";

  const where: any = {};

  if (query.task) {
    const rawTask = query.task.trim();
    const cleanTask = rawTask.toLowerCase().replace(/-models$/, "").replace(/-tasks?$/, "");
    const taskKeywords = cleanTask.replace(/-/g, " ");
    where.OR = [
      { tasks: { some: { task: { slug: { in: [rawTask, cleanTask, `${cleanTask}-models`, `${cleanTask}-tasks`] } } } } },
      { task: { contains: cleanTask, mode: "insensitive" } },
      { title: { contains: taskKeywords, mode: "insensitive" } },
    ];
  }
  if (query.method) {
    const rawMethod = query.method.trim();
    const cleanMethod = rawMethod.toLowerCase();
    const methodKeywords = cleanMethod.replace(/-/g, " ");
    const mcpVariants = cleanMethod.includes("mcp") || cleanMethod.includes("model-context-protocol")
      ? ["mcp", "model-context-protocol", "model-context-protocol-mcp"]
      : [rawMethod, cleanMethod];
    where.OR = [
      { methods: { some: { method: { slug: { in: mcpVariants } } } } },
      { title: { contains: methodKeywords, mode: "insensitive" } },
      { abstract: { contains: methodKeywords, mode: "insensitive" } },
    ];
  }
  if (query.model) where.models = { some: { model: { slug: query.model } } };
  if (query.organization) {
    where.OR = [
      { organization: { equals: query.organization, mode: "insensitive" } },
      { models: { some: { model: { vendor: { equals: query.organization, mode: "insensitive" } } } } },
    ];
  }

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
        : sort === "stars" || sort === "github-stars" || sort === "most-stars"
          ? [
            { githubStars: "desc" as const },
            { citationCount: "desc" as const },
            { publicationDate: "desc" as const },
            { slug: "asc" as const },
          ]
        : sort === "hourly" || sort === "stars-hourly" || sort === "velocity"
          ? [
            { github_hourly_increase: "desc" as const },
            { githubStars: "desc" as const },
            { publicationDate: "desc" as const },
            { slug: "asc" as const },
          ]
        : sort === "trending" || sort === "popular"
          ? [
            { trendingScore: "desc" as const },
            { github_hourly_increase: "desc" as const },
            { githubStars: "desc" as const },
            { publicationDate: "desc" as const },
            { slug: "asc" as const },
          ]
        : sort === "alphabetical"
          ? [
            { title: "asc" as const },
            { slug: "asc" as const }
          ]
          : [
            // Failsafe Default (Trending oriented)
            { trendingScore: "desc" as const },
            { github_hourly_increase: "desc" as const },
            { githubStars: "desc" as const },
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

  // ADDED: Cascading fallback to guarantee papers are always shown while keeping new papers (2026) first
  if (papers.length === 0 && skip === 0) {
    if (period !== "all") {
      // Fallback 1: Expand date window progressively (e.g. 7 days -> 30 days -> 90 days) while preserving date filter
      const fallbackCutoff = new Date(baseDate);
      const lookbackDays = period === "today" ? 7 : period === "week" ? 30 : 90;
      fallbackCutoff.setDate(fallbackCutoff.getDate() - lookbackDays);

      const fallbackWhere = { ...where, publicationDate: { gte: fallbackCutoff } };

      papers = await queryRouter.routeQuery<any>(
        async (prisma: PrismaClient) => {
          return prisma.paper.findMany({
            where: fallbackWhere,
            orderBy,
            take: limit + 1,
            skip,
            select: paperSelect,
          });
        },
      );
    } else {
      // Fallback for period === "all"
      const fallbackWhere = { ...where, publicationDate: { not: null } };
      papers = await queryRouter.routeQuery<any>(
        async (prisma: PrismaClient) => {
          return prisma.paper.findMany({
            where: fallbackWhere,
            orderBy,
            take: limit + 1,
            skip,
            select: paperSelect,
          });
        },
      );
    }
  }

  const hasMore = papers.length > limit;
  const pagePapers = hasMore ? papers.slice(0, limit) : papers;

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
    total: pagePapers.length, // Let the frontend use hasMore rather than a fake total
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
          hf_model_url: true,
          hfUpvotes: true,
        },
      });

      if (!paperData) return null;

      const thumbnailUrl = paperData.thumbnailUrl === "FAILED_404" ? null : paperData.thumbnailUrl;

      // Use data already fetched by findUnique — no extra DB queries needed
      return {
        ...paperData,
        thumbnailUrl,
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

  const papers = await queryRouter.routeQuery(
    async (prisma: PrismaClient) => {
      return prisma.paper.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: "insensitive" } },

          ],
        },
        orderBy:
          sort === "latest"
            ? [{ publicationDate: "desc" }, { githubStars: "desc" }]
            : [{ githubStars: "desc" }, { publicationDate: "desc" }],
        take: limit,
        skip,
        select: paperSearchSelect,
      });
    },
  );
  console.log(JSON.stringify(papers[0], null, 2));






  return {
    papers: papers.map((paper: any) => ({
      ...exposeThumbnailUrl(paper),
      authors: parseAuthors(paper.authors),

    })),
    total: papers.length,
    page,
    hasMore: papers.length >= limit,
    query: searchTerm,
  };
};
