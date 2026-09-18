import { SourceManager } from '../source-manager';
import { NormalizedPaper } from '../types/index';
import { logger } from '../logger/index';

export async function fetchPapers(startTime: Date, endTime: Date): Promise<NormalizedPaper[]> {
  logger.info(`Starting fetch phase for window: ${startTime.toISOString()} to ${endTime.toISOString()}`);
  const sourceManager = new SourceManager();
  
  const papers = await sourceManager.fetchAll(startTime, endTime);
  logger.info(`Fetch phase completed. Total raw valid papers: ${papers.length}`);
  
  return papers;
}
