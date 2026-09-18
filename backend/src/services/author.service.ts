 import { PrismaClient } from '../generated/prisma/client';
// import { QueryRouter } from '../routing/index.js';
// import { QueryIntent, QueryType } from '../routing/types.js';

// export const getAuthors = async (queryRouter: QueryRouter, limit: number = 50, skip: number = 0) => {
//   const intent: QueryIntent = {
//     type: QueryType.READ,
//     entity: 'author',
//     operation: 'findMany',
//   };

//   const routingResult = await queryRouter.routeQuery(intent, async (prisma) => {
//     return prisma.author.findMany({
//       take: limit,
//       skip: skip,
//       orderBy: { name: 'asc' },
//       select: { id: true, name: true, slug: true, createdAt: true }
//     });
//   });

//   const allAuthors: any[] = [];
//   const seenIds = new Set<string>();

//   for (const result of routingResult.results) {
//     for (const author of result) {
//       if (!seenIds.has(author.id)) {
//         seenIds.add(author.id);
//         allAuthors.push(author);
//       }
//     }
//   }

//   allAuthors.sort((a, b) => a.name.localeCompare(b.name));
//   return allAuthors.slice(0, limit);
// };

// export const getAuthorBySlug = async (queryRouter: QueryRouter, slug: string) => {
//   const intent: QueryIntent = {
//     type: QueryType.READ,
//     entity: 'author',
//     operation: 'findUnique',
//     filters: { slug }
//   };

//   const routingResult = await queryRouter.routeQuery(intent, async (prisma) => {
//     return prisma.author.findUnique({
//       where: { slug },
//       include: {
//         papers: {
//           take: 100, // Capped to prevent frontend freeze
//           include: { paper: { select: { id: true, title: true, slug: true, citationCount: true, githubStars: true } } },
//           orderBy: { paper: { githubStars: 'desc' } }
//         }
//       }
//     });
//   });

//   let baseAuthor: any = null;
//   const allPapers: any[] = [];

//   for (const result of routingResult.results) {
//     if (result) {
//       if (!baseAuthor) {
//         const { papers, ...rest } = result;
//         baseAuthor = { ...rest };
//       }
//       allPapers.push(...result.papers);
//     }
//   }

//   if (!baseAuthor) return null;

//   const seenPaperIds = new Set<string>();
//   const dedupPapers = [];
//   for (const p of allPapers) {
//     if (!seenPaperIds.has(p.paper.id)) {
//       seenPaperIds.add(p.paper.id);
//       dedupPapers.push(p);
//     }
//   }

//   dedupPapers.sort((a, b) => {
//      const scoreA = Math.max(a.paper.githubStars || 0, a.paper.citationCount || 0);
//      const scoreB = Math.max(b.paper.githubStars || 0, b.paper.citationCount || 0);
//      return scoreB - scoreA;
//   });

//   return {
//     ...baseAuthor,
//     papers: dedupPapers.slice(0, 100)
//   };
// };

export const getAuthors = async (queryRouter: any, limit: number = 50, skip: number = 0) => {
  return queryRouter.routeQuery(async (prisma: PrismaClient) => {
    const papers = await prisma.paper.findMany({
      where: { authors: { not: null } },
      select: { authors: true },
      take: 300,
    });
    const authorMap = new Map<string, { id: string; name: string; slug: string; createdAt: string }>();
    for (const p of papers) {
      if (!p.authors) continue;
      const names = p.authors.split(",").map((n: string) => n.trim()).filter(Boolean);
      for (const name of names) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        if (!authorMap.has(slug)) {
          authorMap.set(slug, {
            id: slug,
            name,
            slug,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
    return Array.from(authorMap.values()).sort((a, b) => a.name.localeCompare(b.name)).slice(skip, skip + limit);
  });
};

export const getAuthorBySlug = async (queryRouter: any, slug: string) => {
  if (!slug) return null;
  const authorName = slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return queryRouter.routeQuery(async (prisma: PrismaClient) => {
    const papers = await prisma.paper.findMany({
      where: {
        authors: {
          contains: authorName,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        citationCount: true,
        githubStars: true,
      },
      take: 100,
      orderBy: { citationCount: "desc" },
    });

    if (papers.length === 0) {
      const words = slug.split("-").filter((w) => w.length > 2);
      if (words.length > 0) {
        const fallbackPapers = await prisma.paper.findMany({
          where: {
            OR: words.map((w) => ({
              authors: { contains: w, mode: "insensitive" },
            })),
          },
          select: {
            id: true,
            title: true,
            slug: true,
            citationCount: true,
            githubStars: true,
          },
          take: 100,
          orderBy: { citationCount: "desc" },
        });

        if (fallbackPapers.length > 0) {
          return {
            id: slug,
            name: authorName,
            slug,
            createdAt: new Date().toISOString(),
            papers: fallbackPapers.map((p: any) => ({ paper: p })),
          };
        }
      }
      return null;
    }

    return {
      id: slug,
      name: authorName,
      slug,
      createdAt: new Date().toISOString(),
      papers: papers.map((p: any) => ({ paper: p })),
    };
  });
};
