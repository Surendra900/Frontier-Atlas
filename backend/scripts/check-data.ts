import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { neonConfig } from "@neondatabase/serverless";

neonConfig.webSocketConstructor = WebSocket;

const connectionString = process.env.DATABASE_URL!;
const isNeon = connectionString.includes("neon.tech");

let prisma: PrismaClient;

if (isNeon) {
  const adapter = new PrismaNeon({ connectionString });
  prisma = new PrismaClient({ adapter });
} else {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
}

async function main() {
  console.log("Connecting to database...");
  const paperCount = await prisma.paper.count();
  const benchmarkCount = await prisma.benchmark.count();
  const rankingCount = await prisma.ranking.count();
  const sotaClaimCount = await prisma.sotaClaim.count();
  const taskCount = await prisma.task.count();

  console.log({ paperCount, benchmarkCount, rankingCount, sotaClaimCount, taskCount });
}

main()
  .catch((e) => console.error("DB Error:", e))
  .finally(() => prisma.$disconnect());
