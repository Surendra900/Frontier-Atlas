import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DB_URL);

async function verify() {
  console.log('=== VERIFICATION OF RECLASSIFICATION ===');

  // 1. Total Canonical Models
  const [totalRow] = await sql`SELECT COUNT(*)::int as total FROM models WHERE is_canonical = true`;
  console.log(`Total Canonical Models: ${totalRow.total}`);

  // 2. Chat count
  const [chatRow] = await sql`
    SELECT COUNT(*)::int as total 
    FROM models 
    WHERE is_canonical = true AND capabilities @> '["chat"]'::jsonb
  `;
  console.log(`Models with 'chat' capability: ${chatRow.total}`);

  // 3. Contamination check on Chat
  const contaminatedChat = await sql`
    SELECT id, name, category, capabilities, architecture->>'pipeline_tag' as tag, architecture->'output_modalities' as out_mod
    FROM models
    WHERE is_canonical = true 
      AND capabilities @> '["chat"]'::jsonb
      AND (
        architecture->>'pipeline_tag' IN ('text-to-image', 'image-classification', 'text-to-speech', 'automatic-speech-recognition', 'robotics', 'document-question-answering', 'sentence-similarity')
        OR architecture->'output_modalities' @> '["image"]'::jsonb
        OR category IN ('Audio', 'Robotics', 'Embeddings')
      )
  `;
  console.log(`Contaminated models in Chat: ${contaminatedChat.length}`);
  if (contaminatedChat.length > 0) {
    console.table(contaminatedChat);
  }

  // 4. Contamination check on Reasoning
  const contaminatedReasoning = await sql`
    SELECT id, name, category, capabilities, architecture->'output_modalities' as out_mod
    FROM models
    WHERE is_canonical = true
      AND (category = 'Reasoning' OR capabilities @> '["reasoning"]'::jsonb)
      AND architecture->'output_modalities' @> '["image"]'::jsonb
  `;
  console.log(`Image-output models in Reasoning: ${contaminatedReasoning.length}`);
  if (contaminatedReasoning.length > 0) {
    console.table(contaminatedReasoning);
  }

  // 5. Hugging Face defaults check
  const [hfDefaults] = await sql`
    SELECT
      COUNT(*)::int as total_hf,
      COUNT(*) FILTER (WHERE context_window IS NOT NULL)::int as non_null_ctx,
      COUNT(*) FILTER (WHERE input_cost_per_mtoken IS NOT NULL)::int as non_null_price
    FROM models
    WHERE source_catalog = 'huggingface'
  `;
  console.log(`HF Models: total=${hfDefaults.total_hf}, non_null_ctx=${hfDefaults.non_null_ctx}, non_null_price=${hfDefaults.non_null_price}`);

  // 6. Qwen Max / Plus Openness Check
  const qwenCheck = await sql`
    SELECT id, name, openness_type, license, access_type
    FROM models
    WHERE (name ILIKE '%Qwen%Max%' OR name ILIKE '%Qwen%Plus%' OR id ILIKE '%qwen%max%' OR id ILIKE '%qwen%plus%')
      AND id NOT ILIKE '%coder%'
  `;
  console.log('Qwen Max / Plus Status:');
  console.table(qwenCheck);

  // 7. Paper Mappings check
  const badPapers = await sql`
    SELECT pm.paper_id, p.title, pm.model_id, pm.role
    FROM paper_models pm
    JOIN papers p ON p.id = pm.paper_id
    WHERE pm.model_id ILIKE '%persian%' 
       OR pm.model_id ILIKE '%gguf%' 
       OR pm.model_id ILIKE '%tts%' 
       OR pm.model_id ILIKE '%embedding%'
       OR pm.model_id ILIKE '%openvla%spatial%'
  `;
  console.log(`Banned paper mappings remaining: ${badPapers.length}`);
  if (badPapers.length > 0) {
    console.table(badPapers);
  }
}

verify().catch(console.error);
