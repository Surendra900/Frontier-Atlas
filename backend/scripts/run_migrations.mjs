import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const shards = {
  SHARD_1: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-floral-cherry-aorpwovy-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_2: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_3: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-damp-bar-aofs3cnt-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_4: "postgresql://neondb_owner:npg_le9RfJEbAa7I@ep-odd-night-atgpapcg-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require",
};

async function run() {
  const sqlPath = path.join(__dirname, "../prisma/migrations/20260930150000_models_schema_and_paper_mapping/migration.sql");
  const sqlContent = fs.readFileSync(sqlPath, "utf-8");

  // Split into individual statements
  const statements = sqlContent
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith("--"));

  console.log(`Loaded ${statements.length} migration statements from ${sqlPath}`);

  for (const [shardName, url] of Object.entries(shards)) {
    console.log(`\n========================================`);
    console.log(`Applying migration to ${shardName}...`);
    console.log(`========================================`);

    const sql = neon(url);
    let successCount = 0;
    let failCount = 0;

    for (const stmt of statements) {
      try {
        await sql.query(stmt);
        successCount++;
      } catch (err) {
        console.error(`  [${shardName}] Failed statement: ${stmt.slice(0, 60)}...`);
        console.error(`  Error: ${err.message}`);
        failCount++;
      }
    }

    console.log(`[${shardName}] Migration complete: ${successCount} succeeded, ${failCount} failed.`);
  }

  console.log("\nAll shard migrations executed.");
}

run().catch(console.error);
