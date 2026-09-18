export class RateLimiter {
  private queue: Array<() => void> = [];
  private tokens: number;
  private maxTokens: number;
  private refillRateMs: number;
  private timer: NodeJS.Timeout | null = null;

  constructor(requestsPerSecond: number) {
    this.maxTokens = requestsPerSecond;
    this.tokens = requestsPerSecond;
    this.refillRateMs = 1000;
    this.startRefill();
  }

  private startRefill() {
    this.timer = setInterval(() => {
      this.tokens = this.maxTokens;
      this.processQueue();
    }, this.refillRateMs);
  }

  private processQueue() {
    while (this.queue.length > 0 && this.tokens > 0) {
      const resolve = this.queue.shift();
      if (resolve) {
        this.tokens--;
        resolve();
      }
    }
  }

  async acquireToken(): Promise<void> {
    if (this.tokens > 0) {
      this.tokens--;
      return Promise.resolve();
    }
    
    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }
  
  stop() {
      if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
      }
  }
}
