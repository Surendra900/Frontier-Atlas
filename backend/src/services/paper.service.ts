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

let cachedLatestPaperDate: { date: Date; timestamp: number } | null = null;

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

  if (query.task) {
    const rawTask = query.task.toLowerCase().trim();
    const taskSlugs = [rawTask];
    if (rawTask === "reasoning") taskSlugs.push("reasoning-models");
    if (rawTask === "reasoning-models") taskSlugs.push("reasoning");
    if (rawTask === "ss1" || rawTask === "ssl") taskSlugs.push("small-language-models");
    where.tasks = { some: { task: { slug: { in: taskSlugs } } } };
  }
  if (query.method) {
    const rawMethod = query.method.toLowerCase().trim();
    const methodSlugs = [rawMethod];
    if (rawMethod === "policy-learning" || rawMethod === "reinforcement-learning") {
      methodSlugs.push("reinforcement-learning", "policy-learning");
    }
    if (rawMethod === "diffusion-models" || rawMethod === "diffusion") {
      methodSlugs.push("diffusion", "diffusion-models");
    }
    if (rawMethod === "transformer" || rawMethod === "transformers") {
      methodSlugs.push("transformer", "transformers");
    }
    if (rawMethod === "rag" || rawMethod === "retrieval-augmented-generation") {
      methodSlugs.push("retrieval-augmented-generation", "rag");
    }
    where.methods = { some: { method: { slug: { in: methodSlugs } } } };
  }
  if (query.model) where.models = { some: { model: { slug: query.model } } };
  if (query.organization) {
    const orgName = query.organization.trim();
    where.OR = [
      { organization: { equals: orgName, mode: "insensitive" } },
      { models: { some: { model: { vendor: { equals: orgName, mode: "insensitive" } } } } },
    ];
  }

  // Enforce papers must have at least one task or method tag
  const mandatoryConditions: any[] = [
    {
      OR: [
        { tasks: { some: {} } },
        { methods: { some: {} } }
      ]
    }
  ];

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
      latestDbDate = rawDate.getTime() > 0 && rawDate.getTime() <= now.getTime() ? rawDate : now;
      cachedLatestPaperDate = { date: latestDbDate, timestamp: Date.now() };
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

  let papers = await queryRouter.routeQuery<any[]>(
    async (prisma: PrismaClient) => {
      return prisma.paper.findMany({
        where,
        orderBy,
        take: limit + 1,
        skip,
        select: paperSelect,
      });
    },
  );

  let activeWhere = where;
  if ((!papers || papers.length === 0) && skip === 0) {
    if (period !== "all") {
      const fallbackCutoff = new Date(baseDate);
      const lookbackDays = period === "today" ? 7 : period === "week" ? 30 : 90;
      fallbackCutoff.setDate(fallbackCutoff.getDate() - lookbackDays);

      activeWhere = { ...where, publicationDate: { gte: fallbackCutoff } };
    } else {
      activeWhere = { ...where, publicationDate: { not: null } };
    }

    papers = await queryRouter.routeQuery<any[]>(
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

    // If still 0 papers and period was restricted, gracefully fallback to all dates
    if ((!papers || papers.length === 0) && period !== "all") {
      activeWhere = { ...where, publicationDate: { not: null } };
      papers = await queryRouter.routeQuery<any[]>(
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
  }

  const safePapers = Array.isArray(papers) ? papers : [];
  const hasMore = safePapers.length > limit;
  const pagePapers = hasMore ? safePapers.slice(0, limit) : safePapers;

  const totalCount = await queryRouter.routeQuery<number>(
    async (prisma: PrismaClient) => {
      return prisma.paper.count({ where: activeWhere });
    },
  ).catch(() => (hasMore ? skip + limit + 1 : skip + pagePapers.length));

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
  const decodedSlug = decodeURIComponent(slug);

  const paperSelect = {
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
  } as const;

  return queryRouter.routeQuery(
    async (prisma: PrismaClient) => {
      let paperData = await prisma.paper.findUnique({
        where: { slug: decodedSlug },
        select: paperSelect,
      });

      if (!paperData && decodedSlug !== slug) {
        paperData = await prisma.paper.findUnique({
          where: { slug },
          select: paperSelect,
        });
      }

      if (!paperData) {
        paperData = await prisma.paper.findFirst({
          where: {
            OR: [
              { id: decodedSlug },
              { arxivId: decodedSlug },
            ],
          },
          select: paperSelect,
        });
      }

      if (!paperData) return null;

      let resolvedThumb = paperData.thumbnailUrl === "FAILED_404" ? null : paperData.thumbnailUrl;
      if (resolvedThumb && resolvedThumb.includes("cloudinary.com/xipefqle")) {
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
          ? paperData.models
              .filter(Boolean)
              .map((r: any) => ({
                id: r.model?.id || r.model_id,
                name: r.model?.name || "",
                slug: r.model?.slug || "",
                role: r.role || "referenced",
                model: r.model,
              }))
          : [],
        datasets: Array.isArray(paperData.datasets)
          ? paperData.datasets.map((r: any) => r?.dataset).filter(Boolean)
          : [],
        tasks: Array.isArray(paperData.tasks)
          ? paperData.tasks.map((r: any) => r?.task).filter(Boolean)
          : [],
        methods: Array.isArray(paperData.methods)
          ? paperData.methods.map((r: any) => r?.method).filter(Boolean)
          : [],
        conferences: Array.isArray(paperData.conferences)
          ? paperData.conferences.map((r: any) => r?.conference).filter(Boolean)
          : [],
        rankings: Array.isArray(paperData.rankings) ? paperData.rankings.filter(Boolean) : [],
        sotaClaims: Array.isArray(paperData.sotaClaims) ? paperData.sotaClaims.filter(Boolean) : [],
        repositories: Array.isArray(paperData.repositories)
          ? paperData.repositories.map((r: any) => r?.repository).filter(Boolean)
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

  const papers = await queryRouter.routeQuery<any[]>(
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

  const safePapers = Array.isArray(papers) ? papers : [];

  return {
    papers: safePapers.map((paper) => ({
      ...exposeThumbnailUrl(paper),
      repositories: paper.repositories?.map(
        ({ repository }: any) => repository
      ) || [],
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
    // Fetch all papers with their associated models and vendors to aggregate metrics
    const papers = await prisma.paper.findMany({
      select: {
        citationCount: true,
        githubStars: true,
        github_hourly_increase: true,
        models: {
          select: {
            model: {
              select: {
                vendor: true,
              },
            },
          },
        },
      },
    });

    const metricsMap = new Map<string, { paperCount: number; citations: number; stars: number; trendingScore: number }>();

    papers.forEach((paper) => {
      const vendors = new Set<string>();
      paper.models?.forEach((m) => {
        if (m?.model?.vendor && typeof m.model.vendor === "string") {
          const v = m.model.vendor.trim();
          if (v) vendors.add(v);
        }
      });

      vendors.forEach((vendor) => {
        const key = vendor.toLowerCase();
        const current = metricsMap.get(key) || { paperCount: 0, citations: 0, stars: 0, trendingScore: 0 };
        
        current.paperCount += 1;
        current.citations += Number(paper.citationCount || 0);
        current.stars += Number(paper.githubStars || 0);
        current.trendingScore += Number(paper.github_hourly_increase || 0);
        
        metricsMap.set(key, current);
      });
    });

    const data = Array.from(metricsMap.entries()).map(([orgKey, stats]) => ({
      organization: orgKey,
      paperCount: stats.paperCount,
      citations: stats.citations,
      stars: stats.stars,
      trendingScore: stats.trendingScore,
    }));

    return {
      status: "success",
      count: data.length,
      data,
    };
  });
}