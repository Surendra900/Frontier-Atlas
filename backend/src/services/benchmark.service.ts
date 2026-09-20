import { PrismaClient } from '../generated/prisma/client';

export const getBenchmarks = async (prisma: PrismaClient, limit: number = 50, skip: number = 0) => {
  return prisma.benchmark.findMany({
    take: limit,
    skip: skip,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: {
        select: {
          rankings: true,
          claims: true,
        },
      },
    },
  });
};

const fetchMatchingPapers = async (prisma: PrismaClient, searchName: string) => {
  return prisma.paper.findMany({
    where: {
      OR: [
        { title: { contains: searchName, mode: 'insensitive' } },
        { abstract: { contains: searchName, mode: 'insensitive' } },
      ],
    },
    take: 10,
    orderBy: { citationCount: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      githubStars: true,
      citationCount: true,
      publicationDate: true,
    },
  });
};

export const getBenchmarkBySlug = async (prisma: PrismaClient, slug: string) => {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase();
  const searchName = cleanSlug.replace(/-/g, ' ');

  const benchmark = await prisma.benchmark.findFirst({
    where: {
      OR: [
        { slug: cleanSlug },
        { slug: { contains: cleanSlug } },
        { name: { contains: searchName, mode: 'insensitive' } },
      ],
    },
    include: {
      rankings: {
        include: {
          paper: {
            select: {
              id: true,
              title: true,
              slug: true,
              githubStars: true,
              citationCount: true,
              publicationDate: true,
            },
          },
        },
      },
      claims: {
        include: {
          paper: {
            select: {
              id: true,
              title: true,
              slug: true,
              githubStars: true,
              citationCount: true,
              publicationDate: true,
            },
          },
        },
      },
    },
  });

  // Handle case where benchmark record does not exist
  if (!benchmark) {
    const matchingPapers = await fetchMatchingPapers(prisma, searchName);

    // FIX 1: Return null if no matching papers exist to trigger 404 in controller
    if (matchingPapers.length === 0) {
      return null;
    }

    const formattedName = searchName
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return {
      id: `benchmark-${cleanSlug}`,
      name: formattedName,
      slug: cleanSlug,
      description: `Automated dynamic benchmark for ${formattedName}`,
      rankings: matchingPapers.map((p, idx) => ({
        id: `r-${p.id}`,
        rank: idx + 1,
        previous_rank: null, // FIX 2: Do not fabricate rank history
        paper: p,
      })),
      claims: matchingPapers.slice(0, 2).map((p) => ({
        id: `c-${p.id}`,
        paper: p,
      })),
    };
  }

  // Handle case where benchmark exists but has no linked rankings
  if (benchmark.rankings.length === 0) {
    const matchingPapers = await fetchMatchingPapers(prisma, searchName);

    return {
      ...benchmark,
      rankings: matchingPapers.map((p, idx) => ({
        id: `r-${p.id}`,
        rank: idx + 1,
        previous_rank: null, // FIX 2: Do not fabricate rank history
        paper: p,
      })),
    };
  }

  const sortedRankings = [...benchmark.rankings].sort((a, b) => {
    const scoreA = (a as { score?: number }).score;
    const scoreB = (b as { score?: number }).score;
    const rankA = (a as { rank?: number }).rank;
    const rankB = (b as { rank?: number }).rank;

    if (scoreA != null && scoreB != null) return scoreB - scoreA;
    return (rankA ?? 999) - (rankB ?? 999);
  });

  const fixedRankings = sortedRankings.map((r, idx) => ({
    ...r,
    rank: idx + 1,
  }));

  return {
    ...benchmark,
    rankings: fixedRankings,
  };
};