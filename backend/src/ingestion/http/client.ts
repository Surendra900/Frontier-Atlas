import { withRetry } from './retry';
import { RateLimiter } from './rateLimiter';
import { config } from '../config/index';

export class HttpClient {
  private rateLimiter: RateLimiter | null;

  constructor(requestsPerSecond?: number) {
    this.rateLimiter = requestsPerSecond ? new RateLimiter(requestsPerSecond) : null;
  }

  async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
    const operation = async () => {
      if (this.rateLimiter) {
        await this.rateLimiter.acquireToken();
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.http.timeoutMs);

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} url: ${url}`);
        }

        return await response.json() as T;
      } finally {
        clearTimeout(timeout);
      }
    };

    return withRetry(operation, `GET ${url}`);
  }
  
  async getText(url: string, headers?: Record<string, string>): Promise<string> {
    const operation = async () => {
      if (this.rateLimiter) {
        await this.rateLimiter.acquireToken();
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.http.timeoutMs);

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            ...headers,
          },
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} url: ${url}`);
        }

        return await response.text();
      } finally {
        clearTimeout(timeout);
      }
    };

    return withRetry(operation, `GET (Text) ${url}`);
  }
  
  stop() {
      if (this.rateLimiter) {
          this.rateLimiter.stop();
      }
  }
}

export const defaultHttpClient = new HttpClient();
