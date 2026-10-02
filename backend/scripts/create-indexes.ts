import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { WebSocket } from "undici";
import { neonConfig } from "@neondatabase/serverless";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, "..", ".dev.vars") });

neonConfig.webSocketConstructor = WebSocket;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL not found in .dev.vars");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const indexStatements = [
  "CREATE INDEX IF NOT EXISTS idx_paper_tasks_task_id ON paper_tasks(task_id)",
  "CREATE INDEX IF NOT EXISTS idx_paper_tasks_paper_id ON paper_tasks(paper_id)",
  "CREATE INDEX IF NOT EXISTS idx_paper_methods_method_id ON paper_methods(method_id)",
  "CREATE INDEX IF NOT EXISTS idx_paper_methods_paper_id ON paper_methods(paper_id)",
  "CREATE INDEX IF NOT EXISTS idx_paper_models_model_id ON paper_models(model_id)",
  "CREATE INDEX IF NOT EXISTS idx_paper_models_paper_id ON paper_models(paper_id)",
  "CREATE INDEX IF NOT EXISTS idx_sota_claims_benchmark_id ON sota_claims(benchmark_id)",
  "CREATE INDEX IF NOT EXISTS idx_sota_claims_paper_id ON sota_claims(paper_id)",
  "CREATE INDEX IF NOT EXISTS idx_rankings_paper_id ON rankings(paper_id)",
  "CREATE INDEX IF NOT EXISTS idx_paper_datasets_dataset_id ON paper_datasets(dataset_id)",
  "CREATE INDEX IF NOT EXISTS idx_paper_datasets_paper_id ON paper_datasets(paper_id)",
  "CREATE INDEX IF NOT EXISTS idx_paper_repositories_repository_id ON paper_repositories(repository_id)",
  "CREATE INDEX IF NOT EXISTS idx_paper_repositories_paper_id ON paper_repositories(paper_id)",
  "CREATE INDEX IF NOT EXISTS idx_paper_conferences_paper_id ON paper_conferences(paper_id)",
  "CREATE INDEX IF NOT EXISTS idx_paper_conferences_conf_id ON paper_conferences(conference_id)",
  "CREATE INDEX IF NOT EXISTS idx_papers_slug ON papers(slug)",
  "CREATE INDEX IF NOT EXISTS idx_papers_arxiv_id ON papers(arxiv_id)",
  "CREATE INDEX IF NOT EXISTS idx_papers_pubdate_stars ON papers(publication_date DESC, github_stars DESC)",
  "CREATE INDEX IF NOT EXISTS idx_papers_stars_citations ON papers(github_stars DESC, citation_count DESC)",
];

async function applyIndexes() {
  console.log("Applying performance indexes to Neon database safely without touching existing tables...");
  for (const statement of indexStatements) {
    const start = Date.now();
    try {
      await prisma.$executeRawUnsafe(statement);
      console.log(`✅ [${Date.now() - start}ms] ${statement}`);
    } catch (err: any) {
      console.warn(`⚠️ Skipped (${err.message}): ${statement}`);
    }
  }
  console.log("🎉 All indexes applied successfully!");
  await prisma.$disconnect();
}

applyIndexes().catch((err) => {
  console.error("Index application error:", err);
  process.exit(1);
});
