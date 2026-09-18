import type { PrismaClient } from "../generated/prisma/client.js";
import { QueryRouter } from "../routing/index.js";

export const globalSearch = async (
  queryRouter: QueryRouter,
  query: string,
  limit: number = 5
) => {
  const searchTerm = query.trim();

  if (!searchTerm) {
    return {
      papers: [],
      authors: [],
      methods: [],
      tasks: [],
      models: [],
      datasets: [],
    };
  }

  return queryRouter.routeQuery(async (prisma: PrismaClient) => {
    const [papers, methods, tasks, models, datasets, authorPapers] =
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

              // Search paper's linked models
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

              // Search paper's linked tasks
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

              // Search paper's linked methods
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

              // Search paper's linked datasets
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

        // Query papers matching authors to extract and aggregate distinct authors
        prisma.paper.findMany({
          where: {
            authors: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          take: 60,
          select: {
            authors: true,
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

    // Extract, match and deduplicate individual authors
    const authorMap = new Map<string, { name: string; slug: string; paperCount: number }>();
    const lowerSearch = searchTerm.toLowerCase();

    for (const ap of authorPapers) {
      if (!ap.authors) continue;
      const names = Array.from(new Set(ap.authors.split(",").map((n: string) => n.trim()).filter(Boolean)));
      for (const name of names) {
        if (name.toLowerCase().includes(lowerSearch)) {
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          if (!slug) continue;
          const existing = authorMap.get(slug);
          if (existing) {
            existing.paperCount += 1;
          } else {
            authorMap.set(slug, { name, slug, paperCount: 1 });
          }
        }
      }
    }

    const matchedAuthors = Array.from(authorMap.values())
      .sort((a, b) => b.paperCount - a.paperCount)
      .slice(0, limit)
      .map((a) => ({
        type: "authors",
        id: a.slug,
        title: a.name,
        slug: a.slug,
        subtitle: `${a.paperCount} paper${a.paperCount !== 1 ? "s" : ""}`,
      }));

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

      authors: matchedAuthors,

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
};

export const getSearchSuggestions = async (
  queryRouter: QueryRouter,
  query: string,
  limit: number = 8
) => {
  const searchTerm = query.trim();
  if (!searchTerm) return [];

  const results = await globalSearch(queryRouter, searchTerm, Math.max(3, Math.ceil(limit / 2)));

  const combined = [
    ...(results.papers || []).slice(0, 3),
    ...(results.models || []).slice(0, 2),
    ...(results.tasks || []).slice(0, 2),
    ...(results.methods || []).slice(0, 2),
    ...(results.authors || []).slice(0, 2),
    ...(results.datasets || []).slice(0, 1),
  ];

  return combined.slice(0, limit);
};