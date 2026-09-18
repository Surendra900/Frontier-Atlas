import { PrismaClient } from "../generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { neonConfig } from "@neondatabase/serverless";


interface DatabaseUrls {
  DATABASE_URL: string;
}

export class DatabaseManager {
  private readonly urls: DatabaseUrls;
  private pool?: Pool;
  private client?: PrismaClient;

  constructor(urls: DatabaseUrls) {
    this.urls = urls;

    neonConfig.webSocketConstructor = WebSocket;
  }


public getClient(): PrismaClient {
  if (this.client) {
    return this.client;
  }

  const connectionString = this.urls.DATABASE_URL;
  const isNeon = connectionString.includes("neon.tech");

  if (isNeon) {
    const adapter = new PrismaNeon({ connectionString });
    this.client = new PrismaClient({ adapter });
  } else {
    if (!this.pool) {
      this.pool = new Pool({ connectionString });
    }

    const adapter = new PrismaPg(this.pool);
    this.client = new PrismaClient({ adapter });
  }

  return this.client;
}


 public async checkDatabase(): Promise<boolean> {
  const prisma = this.getClient();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

 public async getHealthStatus() {
  return {
    database: await this.checkDatabase(),
  };
}

 public async disconnectAll(): Promise<void> {
  if (this.client) {
    await this.client.$disconnect();
    this.client = undefined;
  }

  if (this.pool) {
    await this.pool.end();
    this.pool = undefined;
  }
}
}