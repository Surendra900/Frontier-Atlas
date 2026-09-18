import { PrismaClient } from '../../generated/prisma/client';
import { NormalizedPaper } from '../types/index';
import { logger } from '../logger/index.js';

export interface SyncStats {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
}

function formatAuthors(authors: string[] | undefined | null): string | null {
  if (!authors || !Array.isArray(authors)) return null;
  const valid = Array.from(new Set(authors.filter(a => typeof a === 'string' && a.trim().length > 0))).map(a => a.trim());
  return valid.length > 0 ? valid.join(', ') : null;
}

function buildUpdatePayload(paper: NormalizedPaper): Record<string, any> {
  const updateData: Record<string, any> = {};

  if (paper.title && paper.title.trim().length > 0) {
    updateData.title = paper.title.trim();
  }
  if (paper.abstract && paper.abstract.trim().length > 0) {
    updateData.abstract = paper.abstract.trim();
  }
  if (paper.arxivId && paper.arxivId.trim().length > 0) {
    updateData.arxivId = paper.arxivId.trim();
  }
  if (paper.doi && paper.doi.trim().length > 0) {
    updateData.doi = paper.doi.trim();
  }
  if (paper.publicationDate instanceof Date && !isNaN(paper.publicationDate.getTime())) {
    updateData.publicationDate = paper.publicationDate;
  }
  if (paper.paperUrl && paper.paperUrl.trim().length > 0) {
    updateData.paperUrl = paper.paperUrl.trim();
  }
  if (paper.pdfUrl && paper.pdfUrl.trim().length > 0) {
    updateData.pdfUrl = paper.pdfUrl.trim();
  }
  if (paper.thumbnailUrl && paper.thumbnailUrl.trim().length > 0) {
    updateData.thumbnailUrl = paper.thumbnailUrl.trim();
  }
  if (paper.sourceUrl && paper.sourceUrl.trim().length > 0) {
    updateData.sourceUrl = paper.sourceUrl.trim();
  }
  if (paper.projectUrl && paper.projectUrl.trim().length > 0) {
    updateData.projectUrl = paper.projectUrl.trim();
  }
  if (paper.githubUrl && paper.githubUrl.trim().length > 0) {
    updateData.githubUrl = paper.githubUrl.trim();
  }
  const authorsString = formatAuthors(paper.authors);
  if (authorsString) {
    updateData.authors = authorsString;
  }

  return updateData;
}

export class DatabaseSyncer {
  constructor(private prisma: PrismaClient) {}

  async syncPapers(papers: NormalizedPaper[]): Promise<SyncStats> {
    const stats: SyncStats = {
      total: papers.length,
      inserted: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
    };

    if (papers.length === 0) return stats;

    const BATCH_SIZE = 10;
    for (let i = 0; i < papers.length; i += BATCH_SIZE) {
      const batch = papers.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (paper, batchIdx) => {
          const index = i + batchIdx;
          const identifier = paper.arxivId || paper.slug;

          try {
            logger.info(`[${index + 1}/${papers.length}] Syncing paper: ${identifier}`);

            // Find existing row by arxivId (if non-null/non-empty) or slug
            const existing = await this.prisma.paper.findFirst({
              where: (paper.arxivId && paper.arxivId.trim().length > 0)
                ? {
                    OR: [
                      { arxivId: paper.arxivId.trim() },
                      { slug: paper.slug },
                    ],
                  }
                : {
                    slug: paper.slug,
                  },
            });

            if (existing) {
              // UPDATE EXISTING ROW
              const updatePayload = buildUpdatePayload(paper);
              if (Object.keys(updatePayload).length > 0) {
                try {
                  await this.prisma.paper.update({
                    where: { id: existing.id },
                    data: updatePayload,
                  });
                  stats.updated++;
                } catch (updateErr: any) {
                  if (updateErr?.code === 'P2002') {
                    logger.warn(`P2002 on update for paper "${paper.title}" (target: ${JSON.stringify(updateErr.meta?.target)}). Resolving conflict...`);
                    // If arxivId collided with another existing row, update that row or retry without arxivId
                    if (paper.arxivId && paper.arxivId.trim().length > 0) {
                      const targetRow = await this.prisma.paper.findFirst({
                        where: { arxivId: paper.arxivId.trim() },
                      });
                      if (targetRow && targetRow.id !== existing.id) {
                        logger.warn(`P2002 on update: paper "${paper.title}" with arxivId "${paper.arxivId}" collided. Updating targetRow (id: ${targetRow.id}, arxivId: ${targetRow.arxivId || 'null'}, slug: ${targetRow.slug}) while leaving matched row (id: ${existing.id}, arxivId: ${existing.arxivId || 'null'}, slug: ${existing.slug}) intact.`);
                        await this.prisma.paper.update({
                          where: { id: targetRow.id },
                          data: updatePayload,
                        });
                        stats.updated++;
                      } else {
                        const { arxivId: _, ...safePayload } = updatePayload;
                        if (Object.keys(safePayload).length > 0) {
                          await this.prisma.paper.update({
                            where: { id: existing.id },
                            data: safePayload,
                          });
                          stats.updated++;
                        } else {
                          stats.skipped++;
                        }
                      }
                    } else {
                      throw updateErr;
                    }
                  } else {
                    throw updateErr;
                  }
                }
              } else {
                // Row matched but no new non-empty fields to update
                stats.skipped++;
              }
            } else {
              // INSERT NEW ROW
              const authorsString = formatAuthors(paper.authors);
              const createData = {
                title: paper.title,
                slug: paper.slug,
                abstract: paper.abstract || null,
                arxivId: (paper.arxivId && paper.arxivId.trim().length > 0) ? paper.arxivId.trim() : null,
                doi: paper.doi || null,
                publicationDate: paper.publicationDate || null,
                paperUrl: paper.paperUrl || null,
                pdfUrl: paper.pdfUrl || null,
                thumbnailUrl: paper.thumbnailUrl || null,
                sourceUrl: paper.sourceUrl || null,
                projectUrl: paper.projectUrl || null,
                githubUrl: paper.githubUrl || null,
                authors: authorsString,
                discoverySource: paper.source || null,
              };

              try {
                await this.prisma.paper.create({
                  data: createData,
                });
                stats.inserted++;
              } catch (createErr: any) {
                if (createErr?.code === 'P2002') {
                  logger.warn(`P2002 on create for paper "${paper.title}" (target: ${JSON.stringify(createErr.meta?.target)}). Falling back to update...`);
                  const conflicting = await this.prisma.paper.findFirst({
                    where: (paper.arxivId && paper.arxivId.trim().length > 0)
                      ? {
                          OR: [
                            { arxivId: paper.arxivId.trim() },
                            { slug: paper.slug },
                          ],
                        }
                      : {
                          slug: paper.slug,
                        },
                  });

                  if (conflicting) {
                    const updatePayload = buildUpdatePayload(paper);
                    if (Object.keys(updatePayload).length > 0) {
                      await this.prisma.paper.update({
                        where: { id: conflicting.id },
                        data: updatePayload,
                      });
                      stats.updated++;
                    } else {
                      stats.skipped++;
                    }
                  } else {
                    throw createErr;
                  }
                } else {
                  throw createErr;
                }
              }
            }
          } catch (err: any) {
            stats.failed++;
            logger.error(`Failed to sync paper "${paper.title}" (${identifier}): ${err?.message || err}`);
          }
        })
      );
    }

    return stats;
  }
}


