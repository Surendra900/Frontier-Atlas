import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, ".dev.vars") });

const { prisma } = await import("./src/lib/prisma.js");

async function checkDb() {
  try {
    const paperCount = await prisma.paper.count();
    const authorCount = await prisma.author.count();
    const methodCount = await prisma.method.count();
    const taskCount = await prisma.task.count();
    const datasetCount = await prisma.dataset.count();
    const modelCount = await prisma.model.count();
    
    console.log("--- TABLE COUNTS ---");
    console.log(`Papers: ${paperCount}`);
    console.log(`Authors: ${authorCount}`);
    console.log(`Methods: ${methodCount}`);
    console.log(`Tasks: ${taskCount}`);
    console.log(`Datasets: ${datasetCount}`);
    console.log(`Models: ${modelCount}`);
  } catch (err) {
    console.error("Database check failed:", err);
  } finally {
    process.exit(0);
  }
}

checkDb();
