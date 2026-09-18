import { PrismaClient } from '../generated/prisma/client';
import { QueryRouter } from '../routing/index.js';
import { QueryIntent, QueryType } from '../routing/types.js';
import { staticTaxonomy } from '../constants/taxonomy.js';

type GetMethodsQuery = {
  sort?: 'name' | 'papers' | string;
  search?: string;
  page?: number | string;
  limit?: number | string;
  skip?: number | string;
};

export const getMethods = async (
  queryRouter: QueryRouter,
  queryOrLimit: GetMethodsQuery | number = {},
  legacySkip: number = 0
) => {
  const query: GetMethodsQuery =
    typeof queryOrLimit === 'number'
      ? { limit: queryOrLimit, skip: legacySkip, page: Math.floor(legacySkip / queryOrLimit) + 1 }
      : queryOrLimit;

  const limit = Math.max(Number(query.limit) || 20, 1);
  const page = Math.max(Number(query.page) || 1, 1);
  const skip = Number(query.skip) || (page - 1) * limit;
  const sort = query.sort || 'name';
  const search = query.search || '';

  const where: any = {};
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const orderBy =
    sort === 'papers'
      ? { papers: { _count: 'desc' as const } }
      : { name: 'asc' as const };

  const intent: QueryIntent = {
    type: QueryType.READ,
    entity: 'method',
    operation: 'findMany',
    filters: { search, sort }
  };

  const routingResult = await queryRouter.routeQuery(intent, async (prisma) => {
    return Promise.all([
      prisma.method.findMany({
        where,
        orderBy,
        take: limit,
        skip,
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: { papers: true },
          },
        },
      }),
      prisma.method.count({ where }),
    ]);
  });

  const allMethods: any[] = [];
  const seenIds = new Set<string>();
  let total = 0;

  for (const result of routingResult.results) {
    for (const method of result[0]) {
      if (!seenIds.has(method.id)) {
        seenIds.add(method.id);
        allMethods.push(method);
      } else {
        // If the method already exists, add the paper count
        const existing = allMethods.find(m => m.id === method.id);
        if (existing) {
          existing._count.papers += method._count.papers;
        }
      }
    }
    total += result[1]; // Note: Total count won't be perfectly deduplicated without complex merging
  }

  if (sort === 'papers') {
    allMethods.sort((a, b) => b._count.papers - a._count.papers);
  } else {
    allMethods.sort((a, b) => a.name.localeCompare(b.name));
  }

  return {
    methods: allMethods.slice(0, limit).map(({ _count, ...rest }) => ({
      ...rest,
      paperCount: _count.papers,
    })),
    total,
    page,
    hasMore: skip + allMethods.length < total,
  };
};

const ICON_MAP: Record<string, string> = {
  "General": "Settings",
  "Language": "MessageSquare",
  "Vision": "Eye",
  "Audio & Speech": "Mic",
  "Agents": "Bot",
  "Reasoning": "Brain",
  "Training": "Activity",
  "Optimization": "TrendingUp",
  "Inference": "Zap",
  "Retrieval": "Search",
  "Reinforcement Learning": "Target",
  "Diffusion & Generation": "Sparkles",
  "Multimodal": "Layers",
  "Architectures": "Box",
  "Evaluation": "CheckSquare",
  "Embeddings": "Hash"
};

export const getGroupedMethods = async (queryRouter: QueryRouter) => {
  const intent: QueryIntent = {
    type: QueryType.READ,
    entity: 'method',
    operation: 'findMany',
  };

  const routingResult = await queryRouter.routeQuery(intent, async (prisma) => {
    return prisma.method.findMany({
      select: {
        slug: true,
        _count: { select: { papers: true } },
      }
    });
  });

  const dbCounts: Record<string, number> = {};
  for (const result of routingResult.results) {
    for (const method of result) {
      if (!dbCounts[method.slug]) dbCounts[method.slug] = 0;
      dbCounts[method.slug] += method._count.papers;
    }
  }

  return staticTaxonomy.map(category => ({
    id: category.id,
    name: category.name,
    iconName: category.iconName,
    methods: category.methods.map(method => {
      const slug = method.slug || method.id;
      return {
        id: method.id,
        name: method.name,
        slug: slug,
        paperCount: dbCounts[slug] || 0,
      };
    })
  }));
};

export const getMethodBySlug = async (queryRouter: QueryRouter, slug: string) => {
  const intent: QueryIntent = {
    type: QueryType.READ,
    entity: 'method',
    operation: 'findUnique',
    filters: { slug }
  };

  const routingResult = await queryRouter.routeQuery(intent, async (prisma) => {
    return prisma.method.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { papers: true },
        },
        papers: {
          take: 100,
          include: {
            paper: {
              select: {
                id: true,
                title: true,
                slug: true,
                abstract: true,
                citationCount: true,
                publicationDate: true,
                githubStars: true,
                thumbnailUrl: true,
                arxivId: true,
                isOfficialCode: true,
                pdfUrl: true,
                paperUrl: true,
                githubUrl: true,
                authors: true,
                tasks: { select: { task: { select: { name: true, slug: true } } } },
                methods: { select: { method: { select: { name: true, slug: true } } } },
                sotaClaims: {
                  select: {
                    benchmark: { select: { name: true, slug: true } }
                  }
                }
              },
            },
          },
          orderBy: { paper: { githubStars: 'desc' } }
        },
      },
    });
  });

  let baseMethod: any = null;
  const allPapers: any[] = [];
  let totalPaperCount = 0;

  for (const result of routingResult.results) {
    if (result) {
      if (!baseMethod) {
        const { _count, papers, ...rest } = result;
        baseMethod = { ...rest };
      }
      totalPaperCount += result._count.papers;
      allPapers.push(...result.papers);
    }
  }

  if (!baseMethod || totalPaperCount === 0 || allPapers.length === 0) {
    let staticMethod = null;
    let staticCategory = null;
    for (const cat of staticTaxonomy) {
      const m = cat.methods.find(m => (m.slug || m.id) === slug);
      if (m) {
        staticMethod = m;
        staticCategory = cat;
        break;
      }
    }

    const methodName = staticMethod?.name || baseMethod?.name || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const searchKeywords = slug === "model-context-protocol-mcp" || slug === "mcp"
      ? "model context protocol"
      : methodName;

    const fallbackIntent: QueryIntent = {
      type: QueryType.READ,
      entity: 'paper',
      operation: 'findMany',
    };

    const fallbackResult = await queryRouter.routeQuery(fallbackIntent, async (prisma: PrismaClient) => {
      return prisma.paper.findMany({
        where: {
          OR: [
            { title: { contains: searchKeywords, mode: 'insensitive' } },
            { abstract: { contains: searchKeywords, mode: 'insensitive' } },
          ],
        },
        take: 50,
        orderBy: { githubStars: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          abstract: true,
          citationCount: true,
          publicationDate: true,
          githubStars: true,
          thumbnailUrl: true,
          arxivId: true,
          isOfficialCode: true,
          pdfUrl: true,
          paperUrl: true,
          githubUrl: true,
          authors: true,
          tasks: { select: { task: { select: { name: true, slug: true } } } },
          methods: { select: { method: { select: { name: true, slug: true } } } },
          sotaClaims: {
            select: {
              benchmark: { select: { name: true, slug: true } },
            },
          },
        },
      });
    });

    const fallbackPapers: any[] = [];
    for (const result of fallbackResult.results) {
      if (Array.isArray(result)) {
        fallbackPapers.push(...result);
      }
    }

    const dedupMap = new Map<string, any>();
    for (const p of fallbackPapers) {
      if (!dedupMap.has(p.id)) dedupMap.set(p.id, p);
    }
    const finalFallbackPapers = Array.from(dedupMap.values());

    return {
      id: staticMethod?.id || baseMethod?.id || slug,
      name: methodName,
      slug: staticMethod?.slug || staticMethod?.id || baseMethod?.slug || slug,
      category: staticCategory?.name || "AI Methods",
      categoryName: staticCategory?.name || "AI Methods",
      paperCount: finalFallbackPapers.length,
      papers: finalFallbackPapers.map((paper) => ({
        ...paper,
        authors: paper.authors && typeof paper.authors === 'string'
          ? paper.authors.split(',').map((name: string) => {
              const t = name.trim();
              return { id: t, name: t, slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-') };
            })
          : [],
        sotaClaims: paper.sotaClaims?.map((c: any) => c.benchmark) || [],
      })),
    };
  }

  // Deduplicate papers across shards
  const seenPaperIds = new Set<string>();
  const dedupPapers = [];
  for (const p of allPapers) {
    if (!seenPaperIds.has(p.paper.id)) {
      seenPaperIds.add(p.paper.id);
      dedupPapers.push(p);
    }
  }

  // Sort by githubStars and take 100
  dedupPapers.sort((a, b) => (b.paper.githubStars || 0) - (a.paper.githubStars || 0));
  const topPapers = dedupPapers.slice(0, 100);

  return {
    ...baseMethod,
    paperCount: totalPaperCount,
    papers: topPapers.map(({ paper }) => ({
      ...paper,
      authors: paper.authors && typeof paper.authors === 'string' ? paper.authors.split(',').map((name: string) => { const t = name.trim(); return { id: t, name: t, slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-') }; }) : [],
      sotaClaims: paper.sotaClaims?.map((c: any) => c.benchmark) || [],
    })),
  };
};

export const createMethod = async (queryRouter: QueryRouter, data: { name: string }) => {
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);

  const intent: QueryIntent = {
    type: QueryType.WRITE,
    entity: 'method',
    operation: 'create',
  };

  const routingResult = await queryRouter.routeQuery(intent, async (prisma) => {
    return prisma.method.create({
      data: {
        name: data.name,
        slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { papers: true },
        },
      },
    });
  });

  const { _count, ...rest } = routingResult.results[0];
  return { ...rest, paperCount: _count.papers };
};

export const updateMethod = async (queryRouter: QueryRouter, slug: string, data: { name?: string }) => {
  const updateData: any = {};

  if (data.name) {
    updateData.name = data.name;
    updateData.slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 100);
  }

  const intent: QueryIntent = {
    type: QueryType.UPDATE,
    entity: 'method',
    operation: 'update',
    filters: { slug }
  };

  const routingResult = await queryRouter.routeQuery(intent, async (prisma) => {
    return prisma.method.update({
      where: { slug },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { papers: true },
        },
      },
    });
  });

  const { _count, ...rest } = routingResult.results[0];
  return { ...rest, paperCount: _count.papers };
};

export const deleteMethod = async (queryRouter: QueryRouter, slug: string) => {
  const intent: QueryIntent = {
    type: QueryType.DELETE,
    entity: 'method',
    operation: 'delete',
    filters: { slug }
  };

  const routingResult = await queryRouter.routeQuery(intent, async (prisma) => {
    return prisma.method.delete({
      where: { slug },
    });
  });

  return routingResult.results[0];
};
