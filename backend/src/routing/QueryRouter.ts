import { PrismaClient } from "../generated/prisma/client.js";
import { DatabaseManager } from "../database/DatabaseManager.js";
import { QueryIntent } from "./types.js";

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Database query timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
};

export class QueryRouter {
  private readonly databaseManager: DatabaseManager;
  private readonly queryTimeout: number;
  private static loggedTimeout = false;

  constructor(databaseManager: DatabaseManager, queryTimeoutMs?: string) {
    this.databaseManager = databaseManager;
    const parsedTimeout = queryTimeoutMs ? parseInt(queryTimeoutMs, 10) : undefined;
    const isDevelopment = process.env.NODE_ENV !== "production";
    this.queryTimeout = parsedTimeout && !isNaN(parsedTimeout) 
      ? parsedTimeout 
      : isDevelopment 
        ? 30000 
        : 5000;
    
    if (isDevelopment && !QueryRouter.loggedTimeout) {
      console.log(`⏱️ Query timeout configured to ${this.queryTimeout}ms`);
      QueryRouter.loggedTimeout = true;
    }
  }

  async routeQuery<T>(
    arg1: any,
    arg2?: (client: PrismaClient, shardId?: number) => Promise<T>,
  ): Promise<any> {
    const prisma = this.databaseManager.getClient();
    
    // New calling convention: callback passed directly
    if (typeof arg1 === 'function') {
      return withTimeout(arg1(prisma), this.queryTimeout);
    }
    
    // Old calling convention: intent passed as arg1, callback as arg2
    if (arg2) {
      const result = await withTimeout(arg2(prisma), this.queryTimeout);
      return { results: [result], success: true };
    }

    throw new Error("Invalid routeQuery arguments");
  }
}

export default QueryRouter;