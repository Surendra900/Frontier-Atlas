import { NormalizedPaper } from '../types/index';
import { PaperMerger } from '../merger/index';
import { logger } from '../logger/index';

export async function processPapers(papers: NormalizedPaper[]): Promise<NormalizedPaper[]> {
  logger.info(`Starting process phase with ${papers.length} papers`);

  const merger = new PaperMerger();
  const mergedPapers = merger.merge(papers);
  const deduplicatedCount = papers.length - mergedPapers.length;
  logger.info(`Merged down to ${mergedPapers.length} unique papers across sources (${deduplicatedCount} intra-batch duplicates collapsed)`);

  return mergedPapers;
}

