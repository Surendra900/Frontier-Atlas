import { QueryRouter } from '../routing/index.js';
import { QueryIntent, QueryType } from '../routing/types.js';

interface TaskSelect {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

interface TaskCountSelect {
  slug: string;
  _count?: {
    papers?: number;
  };
}

interface PaperItem {
  id: string;
  title: string;
  slug: string;
  citationCount: number;
  githubStars: number | null;
}

interface TaskPaperRelation {
  paper: PaperItem;
}

interface TaskWithPapersResult extends TaskSelect {
  papers?: TaskPaperRelation[];
}

export const getTasks = async (
  queryRouter: QueryRouter,
  limit: number = 50,
  skip: number = 0
): Promise<TaskSelect[]> => {
  const safeLimit = Math.max(Number(limit) || 50, 1);
  const safeSkip = Math.max(Number(skip) || 0, 0);

  const intent: QueryIntent = {
    type: QueryType.READ,
    entity: 'task',
    operation: 'findMany',
  };

  const routingResult = await queryRouter.routeQuery(intent, async (prisma) => {
    return prisma.task.findMany({
      take: safeLimit,
      skip: safeSkip,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, color: true },
    });
  });

  const allTasks: TaskSelect[] = [];
  const seenIds = new Set<string>();

  for (const result of routingResult.results) {
    if (!Array.isArray(result)) continue;
    for (const task of result) {
      if (task && task.id && !seenIds.has(task.id)) {
        seenIds.add(task.id);
        allTasks.push({
          id: task.id,
          name: task.name || '',
          slug: task.slug || '',
          color: task.color ?? null,
        });
      }
    }
  }

  allTasks.sort((a, b) => a.name.localeCompare(b.name));
  return allTasks.slice(0, safeLimit);
};

export const getTaskPaperCounts = async (
  queryRouter: QueryRouter
): Promise<Record<string, number>> => {
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
    if (!Array.isArray(result)) continue;
    for (const task of result as TaskCountSelect[]) {
      if (task && task.slug) {
        const currentCount = counts[task.slug] || 0;
        const paperCount = task._count?.papers || 0;
        counts[task.slug] = currentCount + paperCount;
      }
    }
  }

  return counts;
};

export const getTaskBySlug = async (
  queryRouter: QueryRouter,
  slug: string
) => {
  if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
    return null;
  }

  const cleanSlug = slug.trim();

  const intent: QueryIntent = {
    type: QueryType.READ,
    entity: 'task',
    operation: 'findUnique',
    filters: { slug: cleanSlug },
  };

  const routingResult = await queryRouter.routeQuery(intent, async (prisma) => {
    return prisma.task.findUnique({
      where: { slug: cleanSlug },
      include: {
        papers: {
          take: 100, // Capped to prevent frontend freeze from massive relations
          include: {
            paper: {
              select: {
                id: true,
                title: true,
                slug: true,
                citationCount: true,
                githubStars: true,
              },
            },
          },
          orderBy: { paper: { githubStars: 'desc' } },
        },
      },
    });
  });

  let baseTask: TaskSelect | null = null;
  const allPapers: TaskPaperRelation[] = [];

  for (const result of routingResult.results) {
    if (result && typeof result === 'object') {
      const taskResult = result as TaskWithPapersResult;
      if (!baseTask) {
        baseTask = {
          id: taskResult.id,
          name: taskResult.name,
          slug: taskResult.slug,
          color: taskResult.color ?? null,
        };
      }
      if (Array.isArray(taskResult.papers)) {
        allPapers.push(...taskResult.papers);
      }
    }
  }

  if (!baseTask) return null;

  const seenPaperIds = new Set<string>();
  const dedupPapers: TaskPaperRelation[] = [];

  for (const p of allPapers) {
    if (p && p.paper && p.paper.id && !seenPaperIds.has(p.paper.id)) {
      seenPaperIds.add(p.paper.id);
      dedupPapers.push(p);
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
    papers: dedupPapers.slice(0, 100),
  };
};