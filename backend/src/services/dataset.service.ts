import { PrismaClient } from '../generated/prisma/client';
import { QueryRouter } from '../routing/index.js';
import { QueryIntent, QueryType } from '../routing/types.js';

export const getDatasets = async (queryRouter: QueryRouter, limit: number = 50, skip: number = 0) => {
  const intent: QueryIntent = {
    type: QueryType.READ,
    entity: 'dataset',
    operation: 'findMany',
  };

  const routingResult = await queryRouter.routeQuery(intent, async (prisma) => {
    return prisma.dataset.findMany({
      take: limit,
      skip: skip,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, createdAt: true }
    });
  });

  const allDatasets: any[] = [];
  const seenIds = new Set<string>();

  for (const result of routingResult.results) {
    for (const dataset of result) {
      if (!seenIds.has(dataset.id)) {
        seenIds.add(dataset.id);
        allDatasets.push(dataset);
      }
    }
  }

  allDatasets.sort((a, b) => a.name.localeCompare(b.name));
  return allDatasets.slice(0, limit);
};

export const getDatasetBySlug = async (queryRouter: QueryRouter, slug: string) => {
  const intent: QueryIntent = {
    type: QueryType.READ,
    entity: 'dataset',
    operation: 'findUnique',
    filters: { slug }
  };

  const routingResult = await queryRouter.routeQuery(intent, async (prisma) => {
    return prisma.dataset.findUnique({
      where: { slug },
      include: {
        papers: {
          take: 100, // Capped to prevent frontend freeze
          include: { paper: { select: { id: true, title: true, slug: true, citationCount: true, githubStars: true } } },
          orderBy: { paper: { githubStars: 'desc' } }
        }
      }
    });
  });

  let baseDataset: any = null;
  const allPapers: any[] = [];

  for (const result of routingResult.results) {
    if (result) {
      if (!baseDataset) {
        const { papers, ...rest } = result;
        baseDataset = { ...rest };
      }
      allPapers.push(...result.papers);
    }
  }

  if (!baseDataset) return null;

  const seenPaperIds = new Set<string>();
  const dedupPapers = [];
  for (const p of allPapers) {
    if (!seenPaperIds.has(p.paper.id)) {
      seenPaperIds.add(p.paper.id);
      dedupPapers.push(p);
    }
  }

  dedupPapers.sort((a, b) => {
     const scoreA = Math.max(a.paper.githubStars || 0, a.paper.citationCount || 0);
     const scoreB = Math.max(b.paper.githubStars || 0, b.paper.citationCount || 0);
     return scoreB - scoreA;
  });

  return {
    ...baseDataset,
    papers: dedupPapers.slice(0, 100)
  };
};
