import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DB_URL);

async function main() {
  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'models'
    ORDER BY ordinal_position
  `;
  console.log('Columns in models table:', cols.map(c => `${c.column_name} (${c.data_type})`));

  const total = await sql`SELECT count(*)::int as count, is_canonical FROM models GROUP BY is_canonical`;
  console.log('\nModel count by canonical:', total);

  const sources = await sql`SELECT source_catalog, count(*)::int as count FROM models GROUP BY source_catalog`;
  console.log('\nSource catalog count:', sources);

  const categories = await sql`SELECT category, count(*)::int as count FROM models GROUP BY category ORDER BY count DESC`;
  console.log('\nCategories:', categories);

  const modalities = await sql`SELECT modality, count(*)::int as count FROM models GROUP BY modality ORDER BY count DESC`;
  console.log('\nModalities:', modalities);

  const openness = await sql`SELECT openness_type, count(*)::int as count FROM models GROUP BY openness_type ORDER BY count DESC`;
  console.log('\nOpenness types:', openness);

  // Sample 3 OpenRouter models and 3 HuggingFace models
  const orSamples = await sql`SELECT id, name, vendor, category, modality, capabilities, architecture, input_cost_per_mtoken, context_window, source_catalog FROM models WHERE source_catalog = 'openrouter' LIMIT 3`;
  console.log('\nOpenRouter samples:', JSON.stringify(orSamples, null, 2));

  const hfSamples = await sql`SELECT id, name, vendor, category, modality, capabilities, architecture, input_cost_per_mtoken, context_window, source_catalog FROM models WHERE source_catalog != 'openrouter' OR source_catalog IS NULL LIMIT 3`;
  console.log('\nHuggingFace / Other samples:', JSON.stringify(hfSamples, null, 2));
}

main().catch(console.error);
