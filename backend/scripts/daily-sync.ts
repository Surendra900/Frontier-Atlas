import { prisma } from '../src/lib/prisma';
import { config } from '../src/ingestion/config/index';
import { logger } from '../src/ingestion/logger/index';
import { fetchPapers } from '../src/ingestion/scheduler/fetch';
import { processPapers } from '../src/ingestion/scheduler/process';
import { syncPapers } from '../src/ingestion/scheduler/sync';
import { defaultHttpClient } from '../src/ingestion/http/client';


async function runDailySync(customStartTime?: Date, customEndTime?: Date) {
  logger.info('--- DAILY SYNC STARTED ---');
  
  const endTime = customEndTime || new Date();
  let startTime = customStartTime;
  
  if (!startTime) {
    startTime = new Date(endTime.getTime() - config.sync.lookbackHours * 60 * 60 * 1000);
  }

  try {
    const rawPapers = await fetchPapers(startTime, endTime);
    
    if (rawPapers.length === 0) {
      throw new Error('0 papers fetched from any source for the given time window.');
    }

    const mergedPapers = await processPapers(rawPapers);
    const intraBatchDuplicates = rawPapers.length - mergedPapers.length;
    
    const stats = await syncPapers(mergedPapers, prisma);

    logger.info('--- DAILY SYNC COMPLETED ---');
    logger.info(`Stats:
      Window: ${startTime.toISOString()} to ${endTime.toISOString()}
      Raw Valid Fetched: ${rawPapers.length}
      Intra-batch Duplicates Collapsed: ${intraBatchDuplicates}
      Merged Unique Papers: ${mergedPapers.length}
      New Papers Inserted: ${stats.inserted}
      Existing Papers Updated (Written): ${stats.updated}
      Existing Papers Skipped (No New Data): ${stats.skipped}
      Failed: ${stats.failed}
    `);

    if (stats.total > 0 && (stats.failed / stats.total) > 0.25) {
      throw new Error(`More than 25% of papers failed to persist (${stats.failed}/${stats.total} failed).`);
    }
  } catch (error) {
    logger.error('--- DAILY SYNC FAILED ---', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    defaultHttpClient.stop();
  }
}



const args = process.argv.slice(2);
let customStart: Date | undefined;
let customEnd: Date | undefined;

if (args.length >= 1) {
  customStart = new Date(args[0]);
  if (isNaN(customStart.getTime())) {
    logger.error(`Invalid start date provided: ${args[0]}`);
    process.exit(1);
  }
}
if (args.length >= 2) {
  customEnd = new Date(args[1]);
  if (isNaN(customEnd.getTime())) {
    logger.error(`Invalid end date provided: ${args[1]}`);
    process.exit(1);
  }
}

runDailySync(customStart, customEnd);
