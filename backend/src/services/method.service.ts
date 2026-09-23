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

interface MethodCountSelect {
  id: string;
  name: string;
  slug: string;
  _count: { papers: number };
}

interface AuthorItem {
  id?: string;
  name: string;
  slug?: string;
}

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

  const where: Record<string, unknown> = {};
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

  const allMethods: MethodCountSelect[] = [];
  const seenIds = new Set<string>();
  let total = 0;

  for (const result of routingResult.results) {
    if (!result || !Array.isArray(result[0])) continue;
    const [methodsList, countVal] = result;

    for (const method of methodsList) {
      if (!seenIds.has(method.id)) {
        seenIds.add(method.id);
        allMethods.push({
          id: method.id,
          name: method.name,
          slug: method.slug,
          _count: { papers: method._count?.papers || 0 },
        });
      } else {
        const existing = allMethods.find(m => m.id === method.id);
        if (existing && existing._count && method._count) {
          existing._count.papers += method._count.papers || 0;
        }
      }
    }
    total += Number(countVal) || 0;
  }

  if (sort === 'papers') {
    allMethods.sort((a, b) => (b._count?.papers || 0) - (a._count?.papers || 0));
  } else {
    allMethods.sort((a, b) => a.name.localeCompare(b.name));
  }

  return {
    methods: allMethods.slice(0, limit).map(({ _count, ...rest }) => ({
      ...rest,
      paperCount: _count?.papers || 0,
    })),
    total,
    page,
    hasMore: skip + allMethods.length < total,
  };
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
    if (!Array.isArray(result)) continue;
    for (const method of result) {
      if (method && method.slug) {
        if (!dbCounts[method.slug]) dbCounts[method.slug] = 0;
        dbCounts[method.slug] += method._count?.papers || 0;
      }
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

  let baseMethod: Record<string, unknown> | null = null;
  const allPapers: Array<{ paper: Record<string, unknown> }> = [];
  let totalPaperCount = 0;

  for (const result of routingResult.results) {
    if (result) {
      if (!baseMethod) {
        const { _count, papers, ...rest } = result;
        baseMethod = { ...rest };
      }
      totalPaperCount += result._count?.papers || 0;
      if (Array.isArray(result.papers)) {
        allPapers.push(...result.papers);
      }
    }
  }

  if (!baseMethod) {
    let staticMethod = null;
    let staticCategory = null;
    for (const cat of staticTaxonomy) {
      const m = cat.methods.find(item => (item.slug || item.id) === slug);
      if (m) {
        staticMethod = m;
        staticCategory = cat;
        break;
      }
    }
    
    if (staticMethod && staticCategory) {
      return {
        id: staticMethod.id,
        name: staticMethod.name,
        slug: staticMethod.slug || staticMethod.id,
        category: staticCategory.name,
        categoryName: staticCategory.name,
        paperCount: 0,
        papers: [],
      };
    }
    return null;
  }

  // Deduplicate papers across shards
  const seenPaperIds = new Set<string>();
  const dedupPapers: Array<{ paper: Record<string, unknown> }> = [];
  for (const p of allPapers) {
    const paperObj = p.paper as { id?: string; githubStars?: number };
    if (paperObj && paperObj.id && !seenPaperIds.has(paperObj.id)) {
      seenPaperIds.add(paperObj.id);
      dedupPapers.push(p);
    }
  }

  // Sort by githubStars and take 100
  dedupPapers.sort((a, b) => {
    const starsA = Number((a.paper as { githubStars?: number }).githubStars) || 0;
    const starsB = Number((b.paper as { githubStars?: number }).githubStars) || 0;
    return starsB - starsA;
  });
  const topPapers = dedupPapers.slice(0, 100);

  return {
    ...baseMethod,
    paperCount: totalPaperCount,
    papers: topPapers.map(({ paper }) => {
      const p = paper as Record<string, unknown>;
      let authorsList: AuthorItem[] = [];

      if (Array.isArray(p.authors)) {
        authorsList = p.authors as AuthorItem[];
      } else if (typeof p.authors === 'string') {
        authorsList = p.authors.split(',').map((name: string) => {
          const t = name.trim();
          return { id: t, name: t, slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-') };
        });
      }

      const sotaClaimsRaw = Array.isArray(p.sotaClaims) ? p.sotaClaims : [];

      return {
        ...p,
        authors: authorsList,
        sotaClaims: sotaClaimsRaw.map((c: unknown) => (c as { benchmark?: unknown })?.benchmark).filter(Boolean),
      };
    }),
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

  const firstResult = routingResult.results[0];
  if (!firstResult) {
    throw new Error('Failed to create method on database shard');
  }

  const { _count, ...rest } = firstResult;
  return { ...rest, paperCount: _count?.papers || 0 };
};

export const updateMethod = async (queryRouter: QueryRouter, slug: string, data: { name?: string }) => {
  const updateData: Record<string, unknown> = {};

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

  const firstResult = routingResult.results[0];
  if (!firstResult) {
    throw new Error('Failed to update method or method not found');
  }

  const { _count, ...rest } = firstResult;
  return { ...rest, paperCount: _count?.papers || 0 };
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

  const firstResult = routingResult.results[0];
  if (!firstResult) {
    throw new Error('Failed to delete method or method not found');
  }

  return firstResult;
};