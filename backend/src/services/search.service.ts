import type { PrismaClient } from "../generated/prisma/client.js";
import { QueryRouter } from "../routing/index.js";
import { redisManager } from "../lib/redis.js";

export const globalSearch = async (
  queryRouter: QueryRouter,
  query: string,
  limit: number = 5
) => {
  const searchTerm = query.trim().toLowerCase();

  if (!searchTerm) {
    return {
      papers: [],
      methods: [],
      tasks: [],
      models: [],
      datasets: [],
    };
  }

  const redis = redisManager.getClient();
  const cacheKey = `search:global:${searchTerm}:${limit}`;

  // 1. Check Redis cache first for instant response
  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("⚡ GLOBAL SEARCH CACHE HIT", searchTerm);
      return typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;
    }
  } catch (err) {
    console.warn("⚠️ Redis get failed, falling back to database:", err);
  }

  const results = await queryRouter.routeQuery(async (prisma: PrismaClient) => {
    console.log("🔥 GLOBAL SEARCH DB HIT", searchTerm);
    const [papers, methods, tasks, models, datasets] =
      await Promise.all([
        // Search papers by title, authors, linked models, tasks, methods, datasets
        prisma.paper.findMany({
          where: {
            OR: [
              {
                title: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
              {
                authors: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
              {
                abstract: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
              {
                models: {
                  some: {
                    model: {
                      name: {
                        contains: searchTerm,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              },
              {
                tasks: {
                  some: {
                    task: {
                      name: {
                        contains: searchTerm,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              },
              {
                methods: {
                  some: {
                    method: {
                      name: {
                        contains: searchTerm,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              },
              {
                datasets: {
                  some: {
                    dataset: {
                      name: {
                        contains: searchTerm,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              },
            ],
          },
          take: limit * 3,
          select: {
            id: true,
            slug: true,
            title: true,
            githubStars: true,
            citationCount: true,
            authors: true,
            thumbnailUrl: true,
            projectUrl: true,
          },
        }),

        prisma.method.findMany({
          where: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          take: limit,
          select: {
            id: true,
            slug: true,
            name: true,
          },
        }),

        prisma.task.findMany({
          where: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          take: limit,
          select: {
            id: true,
            slug: true,
            name: true,
          },
        }),

        prisma.model.findMany({
          where: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          take: limit,
          select: {
            id: true,
            slug: true,
            name: true,
          },
        }),

        prisma.dataset.findMany({
          where: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          take: limit,
          select: {
            id: true,
            slug: true,
            name: true,
          },
        }),
      ]);

    const uniquePapers = Array.from(
      new Map(
        papers.map((paper) => [
          paper.slug,
          paper,
        ])
      ).values()
    );

    return {
      papers: uniquePapers.slice(0, limit).map((p) => ({
        type: "papers",
        id: p.id,
        title: p.title,
        slug: p.slug,
        subtitle: p.authors
          ? `${p.authors} • ${p.citationCount} citations`
          : `${p.citationCount} citations`,
      })),

      methods: methods.map((m) => ({
        type: "methods",
        id: m.id,
        title: m.name,
        slug: m.slug,
      })),

      tasks: tasks.map((t) => ({
        type: "tasks",
        id: t.id,
        title: t.name,
        slug: t.slug,
      })),

      models: models.map((m) => ({
        type: "models",
        id: m.id,
        title: m.name,
        slug: m.slug,
      })),

      datasets: datasets.map((d) => ({
        type: "datasets",
        id: d.id,
        title: d.name,
        slug: d.slug,
      })),
    };
  });

  // 2. Save the formatted results to Redis cache with a 5-minute TTL
  try {
    await redis.set(cacheKey, JSON.stringify(results), { ex: 300 });
  } catch (err) {
    console.warn("⚠️ Redis set failed:", err);
  }

  return results;
};