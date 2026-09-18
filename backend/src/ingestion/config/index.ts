import dotenv from 'dotenv';

dotenv.config();

export const config = {
  sync: {
    lookbackHours: parseInt(process.env.SYNC_LOOKBACK_HOURS || '24', 10),
    batchSize: parseInt(process.env.SYNC_BATCH_SIZE || '100', 10),
  },
  http: {
    maxRetries: parseInt(process.env.HTTP_MAX_RETRIES || '3', 10),
    timeoutMs: parseInt(process.env.HTTP_TIMEOUT_MS || '10000', 10),
    initialRetryDelayMs: parseInt(process.env.HTTP_INITIAL_RETRY_DELAY_MS || '1000', 10),
  },
  apiKeys: {
    huggingface: process.env.HUGGINGFACE_API_KEY,
  },
};
