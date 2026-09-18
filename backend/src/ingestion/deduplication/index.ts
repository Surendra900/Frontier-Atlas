import { NormalizedPaper } from '../types/index';
import { PrismaClient } from '@prisma/client';
import { logger } from '../logger/index';

export class Deduplicator {
  constructor(private prisma: PrismaClient) {}

  async filterNewPapers(papers: NormalizedPaper[]): Promise<NormalizedPaper[]> {
    if (papers.length === 0) return [];

    const arxivIds = papers.map(p => p.arxivId).filter(id => id !== null) as string[];
    const slugs = papers.map(p => p.slug);

    logger.info(`Deduplicating ${papers.length} merged papers against the database.`);

    const existingPapers = await this.prisma.paper.findMany({
      where: {
        OR: [
          { arxivId: { in: arxivIds } },
          { slug: { in: slugs } }
        ]
      },
      select: {
        arxivId: true,
        slug: true
      }
    });

    const existingArxivIds = new Set(existingPapers.map((p: any) => p.arxivId).filter((id: any) => id !== null));
    const existingSlugs = new Set(existingPapers.map((p: any) => p.slug));

    const newPapers = papers.filter(paper => {
      if (paper.arxivId && existingArxivIds.has(paper.arxivId)) {
        return false;
      }
      if (existingSlugs.has(paper.slug)) {
        return false;
      }
      return true;
    });

    logger.info(`Found ${newPapers.length} new papers out of ${papers.length} merged papers.`);
    
    return newPapers;
  }
}
