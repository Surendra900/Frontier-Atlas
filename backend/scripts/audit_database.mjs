import { neon } from '@neondatabase/serverless';

const SHARDS = {
  SHARD_1: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-floral-cherry-aorpwovy-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_2: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_3: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-damp-bar-aofs3cnt-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_4: "postgresql://neondb_owner:npg_le9RfJEbAa7I@ep-odd-night-atgpapcg-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require",
};

async function audit() {
  console.log('=== AUDITING NEON DATABASE SHARDS ===');
  for (const [name, url] of Object.entries(SHARDS)) {
    try {
      const sql = neon(url);
      const [{ count: modelCount }] = await sql`SELECT COUNT(*)::int as count FROM models`;
      const [{ count: paperCount }] = await sql`SELECT COUNT(*)::int as count FROM papers`;
      let mapCount = 0;
      try {
        const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM paper_models`;
        mapCount = count;
      } catch (e) {
        mapCount = -1;
      }
      console.log(`${name}: models=${modelCount}, papers=${paperCount}, paper_models=${mapCount}`);
    } catch (err) {
      console.error(`${name} ERROR:`, err.message);
    }
  }

  const sql = neon(SHARDS.SHARD_2);
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
  console.log('Tables in SHARD_2:', tables.map(t => t.table_name));

  let paperMapTable = tables.find(t => t.table_name.includes('model') && t.table_name.includes('paper'));
  if (paperMapTable) {
    console.log('Found model paper table:', paperMapTable.table_name);
    const count = await sql`SELECT COUNT(*)::int as c FROM paper_models`;
    console.log('Count in paper_models:', count[0].c);
    const sample = await sql`SELECT * FROM paper_models LIMIT 5`;
    console.log('Sample in paper_models:', sample);
  }
}

audit().catch(console.error);
