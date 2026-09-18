import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const tables = ["papers", "benchmarks", "rankings", "sota_claims", "tasks"];
  for (const t of tables) {
    try {
      const res = await pool.query(`SELECT COUNT(*) FROM ${t}`);
      console.log(`${t}: ${res.rows[0].count}`);
    } catch (e: any) {
      console.log(`${t}: ERROR - ${e.message}`);
    }
  }
  await pool.end();
}

main();
