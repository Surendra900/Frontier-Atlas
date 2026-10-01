import { neon } from '@neondatabase/serverless';

const SHARDS = [
  { name: 'SHARD_1 (floral-cherry)', url: 'postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-floral-cherry-aorpwovy-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require' },
  { name: 'SHARD_2 (jolly-dust)', url: 'postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require' },
  { name: 'SHARD_3 (damp-bar)', url: 'postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-damp-bar-aofs3cnt-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require' },
  { name: 'SHARD_4 (odd-night)', url: 'postgresql://neondb_owner:npg_le9RfJEbAa7I@ep-odd-night-atgpapcg-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require' },
];

async function checkAndCleanShard(shard) {
  console.log(`\n======================================================`);
  console.log(`Auditing & Cleaning ${shard.name}`);
  console.log(`======================================================`);
  const sql = neon(shard.url);

  // 1. Audit before
  const [aBefore] = await sql`
    SELECT COUNT(*)::int as count 
    FROM models 
    WHERE (input_cost_per_mtoken::text = '0' OR input_cost_per_mtoken::text = '0.0') AND (source_catalog != 'openrouter' OR source_catalog IS NULL)
  `;
  const [bBefore] = await sql`
    SELECT COUNT(*)::int as count 
    FROM models 
    WHERE context_window::text = '128000' AND (source_catalog = 'huggingface' OR hugging_face_id IS NOT NULL)
  `;
  console.log(`  BEFORE CLEANUP:`);
  console.log(`  (a) input_cost_per_mtoken = 0 where source != openrouter: ${aBefore.count}`);
  console.log(`  (b) context_window = 128000 from Hugging Face: ${bBefore.count}`);

  // 2. Perform backfill to NULL
  // For price: If source is NOT openrouter and price is 0, set to NULL
  await sql`
    UPDATE models 
    SET input_cost_per_mtoken = NULL, output_cost_per_mtoken = NULL
    WHERE (source_catalog != 'openrouter' OR source_catalog IS NULL) AND (input_cost_per_mtoken::text = '0' OR output_cost_per_mtoken::text = '0' OR input_cost_per_mtoken::text = '0.0' OR output_cost_per_mtoken::text = '0.0')
  `;

  // For HF models: set placeholder context_window = 128000 to NULL
  await sql`
    UPDATE models 
    SET context_window = NULL
    WHERE (source_catalog = 'huggingface' OR hugging_face_id IS NOT NULL) AND context_window::text = '128000'
  `;

  // Also check if any model has variants with 0 price or 128000 context from non-openrouter
  // In addition, if a model is source_catalog = 'openrouter' but is NOT a free tier model (slug doesn't end in :free and prompt pricing is null in raw), ensure only true free models have 0.
  // Let's verify openrouter models with price = 0:
  const openRouterFree = await sql`
    SELECT slug, name, input_cost_per_mtoken, source_catalog
    FROM models
    WHERE input_cost_per_mtoken = 0
    LIMIT 10
  `;
  console.log(`  Sample valid Free models on shard:`, openRouterFree.map(m => `${m.slug} (${m.name})`));

  // 3. Audit after
  const [aAfter] = await sql`
    SELECT COUNT(*)::int as count 
    FROM models 
    WHERE (input_cost_per_mtoken::text = '0' OR input_cost_per_mtoken::text = '0.0') AND (source_catalog != 'openrouter' OR source_catalog IS NULL)
  `;
  const [bAfter] = await sql`
    SELECT COUNT(*)::int as count 
    FROM models 
    WHERE context_window::text = '128000' AND (source_catalog = 'huggingface' OR hugging_face_id IS NOT NULL)
  `;
  console.log(`  AFTER CLEANUP:`);
  console.log(`  (a) input_cost_per_mtoken = 0 where source != openrouter: ${aAfter.count} (MUST BE 0)`);
  console.log(`  (b) context_window = 128000 from Hugging Face: ${bAfter.count} (MUST BE 0)`);

  return {
    shard: shard.name,
    aBefore: aBefore.count,
    bBefore: bBefore.count,
    aAfter: aAfter.count,
    bAfter: bAfter.count
  };
}

async function main() {
  const summary = [];
  for (const shard of SHARDS) {
    try {
      const res = await checkAndCleanShard(shard);
      summary.push(res);
    } catch (e) {
      console.error(`Error on ${shard.name}:`, e.message);
      summary.push({ shard: shard.name, error: e.message });
    }
  }

  console.log(`\n======================================================`);
  console.log(`FINAL SHARDS PROOF SUMMARY`);
  console.log(`======================================================`);
  console.table(summary);
}

main().catch(console.error);
