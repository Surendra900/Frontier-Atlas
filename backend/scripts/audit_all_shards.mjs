import { neon } from "@neondatabase/serverless";

const shards = {
  SHARD_1: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-floral-cherry-aorpwovy-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_2: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_3: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-damp-bar-aofs3cnt-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_4: "postgresql://neondb_owner:npg_le9RfJEbAa7I@ep-odd-night-atgpapcg-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_5: "postgresql://neondb_owner:npg_f3iNsgdFSb8V@ep-little-breeze-atfb005n-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require",
};

async function audit() {
  const results = {};
  for (const [name, url] of Object.entries(shards)) {
    console.log(`Auditing ${name}...`);
    try {
      const sql = neon(url);
      const papersCnt = await sql.query("SELECT COUNT(*) as cnt FROM papers").then(r => r[0]?.cnt).catch(e => "ERR: " + e.message);
      
      let modelsCnt = "N/A";
      let cols = [];
      try {
        const cRes = await sql.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'models'
          ORDER BY ordinal_position
        `);
        cols = cRes.map(r => r.column_name);
        modelsCnt = await sql.query("SELECT COUNT(*) as cnt FROM models").then(r => r[0]?.cnt).catch(e => "ERR: " + e.message);
      } catch (e) {
        modelsCnt = "ERR: " + e.message;
      }

      let paperModelsCnt = "N/A";
      let pmCols = [];
      try {
        const pmColRes = await sql.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'paper_models'
        `);
        pmCols = pmColRes.map(r => r.column_name);
        paperModelsCnt = await sql.query("SELECT COUNT(*) as cnt FROM paper_models").then(r => r[0]?.cnt).catch(e => "ERR: " + e.message);
      } catch (e) {
        paperModelsCnt = "ERR: " + e.message;
      }

      results[name] = {
        papers: papersCnt,
        models: modelsCnt,
        paperModels: paperModelsCnt,
        columnsCount: cols.length,
        hasVendor: cols.includes("vendor"),
        hasPricing: cols.includes("input_cost_per_mtoken"),
        hasMatchSource: pmCols.includes("match_source"),
        hasConfidence: pmCols.includes("confidence")
      };
      console.log(name, results[name]);
    } catch (err) {
      console.error(name, "Connection FAILED:", err.message);
      results[name] = { error: err.message };
    }
  }
  console.log("\n--- COMPLETE AUDIT SUMMARY ---");
  console.table(results);
}

audit().catch(console.error);
