import { defaultHttpClient } from '../http/client';
import { PaperCollector, HuggingFaceRawModel } from '../types/index';
import { logger } from '../logger/index';
import { config } from '../config/index';

export class HuggingFaceCollector implements PaperCollector {
  getSourceName(): string {
    return 'huggingface';
  }

  async fetchLatest(startTime: Date, endTime: Date): Promise<HuggingFaceRawModel[]> {
    logger.info(`Fetching HuggingFace papers between ${startTime.toISOString()} and ${endTime.toISOString()}`);
    const papers: HuggingFaceRawModel[] = [];

    try {

      for (let page = 1; page <= 3; page++) {
        const url = `https://huggingface.co/api/papers?limit=100`;
        const headers: Record<string, string> = {};
        if (config.apiKeys.huggingface) {
          headers['Authorization'] = `Bearer ${config.apiKeys.huggingface}`;
        }
        const data = await defaultHttpClient.get<any[]>(url, headers);

        if (!data || data.length === 0) break;

        let foundOlderThanWindow = false;
        for (const paper of data) {
          const pubDate = new Date(paper.publishedAt);
          if (pubDate >= startTime && pubDate <= endTime) {
            papers.push(paper as HuggingFaceRawModel);
          } else if (pubDate < startTime) {
            // Older than our window — stop paginating
            foundOlderThanWindow = true;
            break;
          }
        }
        // HF API has no pagination cursor — all requests return the same batch.
        // One fetch is sufficient.
        break;
      }
    } catch (error) {
      logger.error(`Failed to fetch HuggingFace papers`, error);
    }

    logger.info(`HuggingFace: ${papers.length} papers in time window`);
    return papers;
  }
}
