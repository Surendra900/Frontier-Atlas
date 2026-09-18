import { PrismaClient } from '../generated/prisma/client';
import { QueryRouter } from '../routing/index.js';
import { QueryIntent, QueryType } from '../routing/types.js';

export const getTasks = async (queryRouter: QueryRouter, limit: number = 50, skip: number = 0) => {
  const intent: QueryIntent = {
    type: QueryType.READ,
    entity: 'task',
    operation: 'findMany',
  };

  const routingResult = await queryRouter.routeQuery(intent, async (prisma) => {
    return prisma.task.findMany({
      take: limit,
      skip: skip,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, color: true }
    });
  });

  const allTasks: any[] = [];
  const seenIds = new Set<string>();

  for (const result of routingResult.results) {
    for (const task of result) {
      if (!seenIds.has(task.id)) {
        seenIds.add(task.id);
        allTasks.push(task);
      }
    }
  }

  allTasks.sort((a, b) => a.name.localeCompare(b.name));
  return allTasks.slice(0, limit);
};

export const getTaskPaperCounts = async (queryRouter: QueryRouter) => {
  const intent: QueryIntent = {
    type: QueryType.READ,
    entity: 'task',
    operation: 'findMany',
  };

  const routingResult = await queryRouter.routeQuery(intent, async (prisma) => {
    return prisma.task.findMany({
      select: {
        slug: true,
        _count: { select: { papers: true } },
      },
    });
  });

  const counts: Record<string, number> = {};
  for (const result of routingResult.results) {
    for (const task of result) {
      counts[task.slug] = (counts[task.slug] || 0) + task._count.papers;
    }
  }

  return counts;
};

export const getTaskBySlug = async (queryRouter: QueryRouter, slug: string) => {
  const intent: QueryIntent = {
    type: QueryType.READ,
    entity: 'task',
    operation: 'findUnique',
    filters: { slug }
  };

  const routingResult = await queryRouter.routeQuery(intent, async (prisma) => {
    return prisma.task.findUnique({
      where: { slug },
      include: {
        papers: {
          take: 100, // Capped to prevent frontend freeze from massive relations
          include: { paper: { select: { id: true, title: true, slug: true, citationCount: true, githubStars: true } } },
          orderBy: { paper: { githubStars: 'desc' } }
        }
      }
    });
  });

  let baseTask: any = null;
  const allPapers: any[] = [];

  for (const result of routingResult.results) {
    if (result) {
      if (!baseTask) {
        const { papers, ...rest } = result;
        baseTask = { ...rest };
      }
      allPapers.push(...result.papers);
    }
  }

  if (!baseTask) return null;

  const seenPaperIds = new Set<string>();
  const dedupPapers = [];
  for (const p of allPapers) {
    if (!seenPaperIds.has(p.paper.id)) {
      seenPaperIds.add(p.paper.id);
      dedupPapers.push(p);
    }
  }

  // Fallback to title/abstract/task search if no relational papers found
  if (dedupPapers.length === 0 && baseTask) {
    const taskKeywords = baseTask.name || slug.replace(/-/g, " ");
    const fallbackIntent: QueryIntent = {
      type: QueryType.READ,
      entity: 'paper',
      operation: 'findMany',
    };
    const fallbackResult = await queryRouter.routeQuery(fallbackIntent, async (prisma: PrismaClient) => {
      return prisma.paper.findMany({
        where: {
          OR: [
            { title: { contains: taskKeywords, mode: 'insensitive' } },
            { abstract: { contains: taskKeywords, mode: 'insensitive' } },
            { task: { contains: slug, mode: 'insensitive' } },
          ],
        },
        take: 50,
        orderBy: { githubStars: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          citationCount: true,
          githubStars: true,
        },
      });
    });

    for (const res of fallbackResult.results) {
      if (Array.isArray(res)) {
        for (const p of res) {
          if (!seenPaperIds.has(p.id)) {
            seenPaperIds.add(p.id);
            dedupPapers.push({ paper: p });
          }
        }
      }
    }
  }

  // Sort by githubStars fallback to citationCount
  dedupPapers.sort((a, b) => {
     const scoreA = Math.max(a.paper.githubStars || 0, a.paper.citationCount || 0);
     const scoreB = Math.max(b.paper.githubStars || 0, b.paper.citationCount || 0);
     return scoreB - scoreA;
  });

  return {
    ...baseTask,
    papers: dedupPapers.slice(0, 100)
  };
};
