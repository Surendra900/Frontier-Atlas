import { PaperCollector, NormalizedPaper } from './types/index';
import { ArxivCollector } from './collectors/arxiv';
import { HuggingFaceCollector } from './collectors/huggingface';
import { normalizeArxiv } from './normalizers/arxiv';
import { normalizeHuggingFace } from './normalizers/huggingface';

import { validatePaper } from './validators/paper';
import { logger } from './logger/index';

export class SourceManager {
  private collectors: PaperCollector[] = [];

  constructor() {
    this.collectors = [
      new ArxivCollector(),
      new HuggingFaceCollector()
    ];
  }

  async fetchAll(startTime: Date, endTime: Date): Promise<NormalizedPaper[]> {
    const allNormalizedPapers: NormalizedPaper[] = [];

    for (const collector of this.collectors) {
      const sourceName = collector.getSourceName();
      try {
        const rawPapers = await collector.fetchLatest(startTime, endTime);
        logger.info(`Fetched ${rawPapers.length} papers from ${sourceName}`);

        for (const raw of rawPapers) {
          let normalized: NormalizedPaper | null = null;
          try {
            switch (sourceName) {
              case 'arxiv':
                normalized = normalizeArxiv(raw as any);
                break;
              case 'huggingface':
                normalized = normalizeHuggingFace(raw as any);
                break;
            }

            if (normalized) {
              const valid = validatePaper(normalized);
              if (valid) {
                allNormalizedPapers.push(valid);
              }
            }
          } catch (normError) {
            logger.warn(`Failed to normalize paper from ${sourceName}`, normError);
          }
        }
      } catch (error) {
        logger.error(`Error processing collector ${sourceName}`, error);
      }
    }

    return allNormalizedPapers;
  }
}
