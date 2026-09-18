
import { ArxivCollector } from '../src/ingestion/collectors/arxiv';
import { HuggingFaceCollector } from '../src/ingestion/collectors/huggingface';
import { normalizeArxiv } from '../src/ingestion/normalizers/arxiv';
import { normalizeHuggingFace } from '../src/ingestion/normalizers/huggingface';
import { validatePaper } from '../src/ingestion/validators/paper';
import { logger } from '../src/ingestion/logger/index';

// Use a 48-hour window to guarantee results
const endTime = new Date();
const startTime = new Date(endTime.getTime() - 48 * 60 * 60 * 1000);

async function testCollector(
  name: string,
  fetchFn: () => Promise<any[]>,
  normalizeFn: (raw: any) => any
) {
  logger.info(`\n=== Testing ${name} ===`);
  try {
    const rawPapers = await fetchFn();
    logger.info(`Fetched ${rawPapers.length} raw papers`);

    if (rawPapers.length === 0) {
      logger.warn(`No papers returned for window — the API may return no results for this date range.`);
      return;
    }

    const firstRaw = rawPapers[0];
    const normalized = normalizeFn(firstRaw);
    const validated = validatePaper(normalized);

    if (validated) {
      logger.info(`✅ First paper normalizes and validates correctly:`);
      console.log(JSON.stringify({
        arxivId: validated.arxivId,
        title: validated.title?.slice(0, 80),
        authors: validated.authors?.slice(0, 3),
        publicationDate: validated.publicationDate,
        source: validated.source,
      }, null, 2));
    } else {
      logger.warn(`❌ First paper failed validation — check normalizer output:`);
      console.log(JSON.stringify(normalized, null, 2));
    }
  } catch (err: any) {
    logger.error(`${name} threw an error: ${err.message}`);
  }
}

async function main() {
  logger.info(`Dry-run smoke test: ${startTime.toISOString()} → ${endTime.toISOString()}`);

  const arxiv = new ArxivCollector();
  await testCollector(
    'arXiv',
    () => arxiv.fetchLatest(startTime, endTime),
    normalizeArxiv
  );

  const hf = new HuggingFaceCollector();
  await testCollector(
    'HuggingFace',
    () => hf.fetchLatest(startTime, endTime),
    normalizeHuggingFace
  );

  logger.info('\n✅ Smoke test complete.');
}

main().catch((err) => {
  logger.error('Smoke test failed', err);
  process.exit(1);
});
