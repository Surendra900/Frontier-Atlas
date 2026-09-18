import { logger } from '../logger/index';
import { config } from '../config/index';

export async function withRetry<T>(
  operation: () => Promise<T>,
  context: string,
  maxRetries: number = config.http.maxRetries
): Promise<T> {
  let attempt = 0;
  let delay = config.http.initialRetryDelayMs;

  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;
      logger.warn(`Operation '${context}' failed on attempt ${attempt}/${maxRetries}. Error: ${error.message}`);
      
      if (attempt >= maxRetries) {
        logger.error(`Operation '${context}' failed after ${maxRetries} attempts.`);
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  
  throw new Error('Unreachable');
}
