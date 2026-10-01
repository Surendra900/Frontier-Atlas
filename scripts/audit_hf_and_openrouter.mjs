import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DB_URL);

async function run() {
  const nullHF = await sql`
    SELECT id, name, category, description, architecture
    FROM models
    WHERE source_catalog = 'huggingface' AND (architecture->>'pipeline_tag' IS NULL OR architecture->>'pipeline_tag' = '')
  `;
  console.log('Null pipeline tag HF models:');
  console.table(nullHF);

  // Check pricing and context window for HF models
  const hfDefaults = await sql`
    SELECT 
      COUNT(*)::int as total_hf,
      COUNT(*) FILTER (WHERE context_window = 128000)::int as ctx_128k,
      COUNT(*) FILTER (WHERE context_window IS NULL)::int as ctx_null,
      COUNT(*) FILTER (WHERE input_cost_per_mtoken = 0)::int as price_0,
      COUNT(*) FILTER (WHERE input_cost_per_mtoken IS NULL)::int as price_null
    FROM models
    WHERE source_catalog = 'huggingface'
  `;
  console.log('HF defaults:');
  console.table(hfDefaults);

  // Check OpenRouter image output models
  const imgOutModels = await sql`
    SELECT id, name, category, architecture->'output_modalities' as out_mod, capabilities
    FROM models
    WHERE architecture->'output_modalities' @> '["image"]'::jsonb
  `;
  console.log('OpenRouter image output models:');
  console.table(imgOutModels);

  // Check Open vs Proprietary
  const qwenCheck = await sql`
    SELECT id, name, vendor, openness_type, license, access_type
    FROM models
    WHERE name ILIKE '%Qwen%Max%' OR name ILIKE '%Qwen%Plus%' OR id ILIKE '%qwen-max%' OR id ILIKE '%qwen-plus%'
  `;
  console.log('Qwen Max / Plus:');
  console.table(qwenCheck);

  const kimiCheck = await sql`
    SELECT id, name, vendor, openness_type, license, access_type
    FROM models
    WHERE name ILIKE '%Kimi%' OR name ILIKE '%Inkling%' OR id ILIKE '%kimi%' OR id ILIKE '%inkling%'
  `;
  console.log('Kimi / Inkling:');
  console.table(kimiCheck);

  // Check Paper Mappings
  const paperCheck = await sql`
    SELECT pm.paper_id, p.title, p.arxiv_id, pm.model_id, pm.role, m.vendor, m.name
    FROM paper_models pm
    JOIN papers p ON p.id = pm.paper_id
    JOIN models m ON m.id = pm.model_id
    WHERE pm.model_id ILIKE '%persian%' 
       OR pm.model_id ILIKE '%gguf%' 
       OR pm.model_id ILIKE '%tts%' 
       OR pm.model_id ILIKE '%embedding%'
       OR pm.model_id ILIKE '%openvla%spatial%'
    ORDER BY p.title
  `;
  console.log('Paper mappings needing cleanup:');
  console.table(paperCheck);
}

run().catch(console.error);
