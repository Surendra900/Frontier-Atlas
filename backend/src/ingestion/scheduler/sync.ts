import { NormalizedPaper } from '../types/index';
import { DatabaseSyncer, SyncStats } from '../database/index';
import { PrismaClient } from '../../generated/prisma/client';
import { logger } from '../logger/index';

export async function syncPapers(papers: NormalizedPaper[], prisma: PrismaClient): Promise<SyncStats> {
  logger.info(`Starting sync phase for ${papers.length} papers`);
  
  const syncer = new DatabaseSyncer(prisma);
  const stats = await syncer.syncPapers(papers);
  
  logger.info(`Sync phase completed. Results: ${stats.inserted} inserted, ${stats.updated} updated, ${stats.failed} failed out of ${stats.total} total`);
  
  return stats;
}

