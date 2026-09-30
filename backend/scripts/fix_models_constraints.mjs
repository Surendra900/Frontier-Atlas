import pg from "pg";

const shards = {
  SHARD_2: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_3: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-damp-bar-aofs3cnt-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_4: "postgresql://neondb_owner:npg_le9RfJEbAa7I@ep-odd-night-atgpapcg-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require",
};

// Fix column constraints on SHARD_4 if any
for (const [name, url] of Object.entries(shards)) {
  const pool = new pg.Pool({ connectionString: url });
  try {
    await pool.query('ALTER TABLE models ALTER COLUMN "updatedAt" DROP NOT NULL;');
    await pool.query('ALTER TABLE models ALTER COLUMN "createdAt" DROP NOT NULL;');
    console.log(`✓ ${name}: Dropped NOT NULL constraints on createdAt / updatedAt`);
  } catch (e) {
    console.log(`${name}: ${e.message}`);
  } finally {
    await pool.end();
  }
}
