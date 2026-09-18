import "dotenv/config";

import { PrismaClient } from "../generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { neonConfig } from "@neondatabase/serverless";

if (typeof WebSocket !== "undefined") {
  neonConfig.webSocketConstructor = WebSocket;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing from .env");
}

// Strip quotes if they were included in the .env file
const cleanUrl = connectionString.replace(/^"|"$/g, "");

const isNeon = cleanUrl.includes("neon.tech");

export const prisma = isNeon
  ? new PrismaClient({
      adapter: new PrismaNeon({ connectionString: cleanUrl }),
    })
  : new PrismaClient({
      adapter: new PrismaPg(new Pool({ connectionString: cleanUrl })),
    });