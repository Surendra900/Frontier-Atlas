import { defaultHttpClient } from '../http/client';
import { PaperCollector, ArxivRawModel } from '../types/index';
import { parseStringPromise } from 'xml2js';
import { logger } from '../logger/index';

export class ArxivCollector implements PaperCollector {
  getSourceName(): string {
    return 'arxiv';
  }

  async fetchLatest(startTime: Date, endTime: Date): Promise<ArxivRawModel[]> {
    logger.info(`Fetching arXiv papers between ${startTime.toISOString()} and ${endTime.toISOString()}`);
    const startStr = startTime.toISOString().replace(/[-:T]/g, '').slice(0, 12);
    const endStr = endTime.toISOString().replace(/[-:T]/g, '').slice(0, 12);
    const query = `(cat:cs.AI OR cat:cs.LG OR cat:cs.CL OR cat:cs.CV OR cat:cs.NE OR cat:cs.RO OR cat:cs.IR OR cat:cs.MA OR cat:stat.ML) AND lastUpdatedDate:[${startStr} TO ${endStr}]`;
    const url = `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(query)}&sortBy=lastUpdatedDate&sortOrder=descending&max_results=500`;
    logger.info(`arXiv URL: ${url}`);

    try {
      const xml = await defaultHttpClient.getText(url);
      const result = await parseStringPromise(xml);
      const entries = result.feed.entry || [];
      return entries as ArxivRawModel[];
    } catch (error) {
      logger.error(`Failed to fetch arXiv papers`, error);
      return [];
    }
  }
}
