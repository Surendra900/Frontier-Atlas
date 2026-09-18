import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  // Check actual columns in rankings table
  const cols = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'rankings'
  `);
  console.log("--- RANKINGS TABLE COLUMNS ---");
  console.log(cols.rows);

  // Check actual data in one row
  const row = await pool.query(`SELECT * FROM rankings LIMIT 1`);
  console.log("--- SAMPLE ROW ---");
  console.log(row.rows[0]);

  await pool.end();
}

main();
