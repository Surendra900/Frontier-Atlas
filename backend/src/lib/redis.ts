import { Redis } from "@upstash/redis";

class RedisManager {
  private client: Redis | null = null;

  connect(url?: string, token?: string) {
    if (!this.client && url && token) {
      this.client = new Redis({
        url,
        token,
      });

      console.log("✅ Redis Connected");
    }
  }

  getClient() {
    if (!this.client) {
      throw new Error("Redis is not connected.");
    }

    return this.client;
  }
}

export const redisManager = new RedisManager()