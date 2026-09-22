import { Redis } from "@upstash/redis";

// Graceful no-op Redis proxy for environments without Upstash Redis credentials (e.g. local dev)
const nullRedisProxy = new Proxy({} as Redis, {
  get: (_target, prop: string) => {
    if (prop === "get") {
      return async () => null;
    }
    if (prop === "set") {
      return async () => "OK";
    }
    if (prop === "del") {
      return async () => 0;
    }
    if (prop === "exists") {
      return async () => 0;
    }
    // Generic fallback for any other Redis command
    return async () => null;
  },
});

class RedisManager {
  private client: Redis | null = null;
  private fallbackLogged: boolean = false;

  connect(url?: string, token?: string) {
    if (!this.client && url && token) {
      try {
        this.client = new Redis({
          url,
          token,
        });

        console.log("✅ Redis Connected");
      } catch (err) {
        console.warn("⚠️ Failed to initialize Upstash Redis:", err);
        this.client = null;
      }
    }
  }

  isConnected(): boolean {
    return this.client !== null;
  }

  getClient(): Redis {
    if (!this.client) {
      if (!this.fallbackLogged) {
        console.warn("ℹ️ Redis not configured or offline. Operating in graceful fallback mode (direct DB).");
        this.fallbackLogged = true;
      }
      return nullRedisProxy;
    }

    return this.client;
  }
}

export const redisManager = new RedisManager();