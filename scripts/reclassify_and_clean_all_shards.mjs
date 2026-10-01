import { neon } from '@neondatabase/serverless';

const SHARDS = {
  SHARD_2: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_3: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-damp-bar-aofs3cnt-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_1: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-floral-cherry-aorpwovy-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_4: "postgresql://neondb_owner:npg_le9RfJEbAa7I@ep-odd-night-atgpapcg-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require",
};

async function cleanShard(shardName, shardUrl) {
  console.log(`\n======================================================`);
  console.log(`CLEANING AND RECLASSIFYING SHARD: ${shardName}`);
  console.log(`======================================================`);

  const sql = neon(shardUrl);

  // 1. Remove Invented Placeholder Context & Price for HuggingFace models
  console.log(`[1] Clearing placeholder context_window and pricing on Hugging Face models...`);
  const r1 = await sql`
    UPDATE models
    SET context_window = NULL
    WHERE source_catalog = 'huggingface'
      AND (context_window = 128000 OR context_window = 0)
  `;
  const r2 = await sql`
    UPDATE models
    SET input_cost_per_mtoken = NULL,
        output_cost_per_mtoken = NULL
    WHERE source_catalog = 'huggingface'
      AND (input_cost_per_mtoken = 0 OR input_cost_per_mtoken IS NULL)
  `;
  console.log(`  Updated placeholder context & price on HF models.`);

  // 2. Classify Qwen Max / Plus as Proprietary / Commercial API
  console.log(`[2] Setting Qwen Max / Plus to Proprietary...`);
  const r3 = await sql`
    UPDATE models
    SET openness_type = 'Proprietary',
        license = 'Proprietary',
        access_type = 'Commercial API'
    WHERE (name ILIKE '%Qwen%Max%' OR name ILIKE '%Qwen%Plus%' OR id ILIKE '%qwen%max%' OR id ILIKE '%qwen%plus%')
      AND id NOT ILIKE '%coder%'
  `;
  console.log(`  Updated Qwen Max/Plus to Proprietary.`);

  // 3. Image-output models banned from Chat and Reasoning
  console.log(`[3] Reclassifying image-output models (banning from Chat and Reasoning)...`);
  const r4 = await sql`
    UPDATE models
    SET category = CASE WHEN category = 'Reasoning' THEN 'Vision' ELSE category END,
        capabilities = '["image_generation", "computer_vision", "multimodal"]'::jsonb
    WHERE architecture->'output_modalities' @> '["image"]'::jsonb
  `;
  console.log(`  Reclassified image-output models.`);

  // 4. Hugging Face Models Strict Classification based on pipeline_tag
  console.log(`[4] Strictly isolating Hugging Face models by pipeline_tag...`);
  
  // Image Classification
  await sql`
    UPDATE models
    SET category = 'Vision',
        modality = 'image',
        capabilities = '["computer_vision", "classification"]'::jsonb
    WHERE source_catalog = 'huggingface' AND architecture->>'pipeline_tag' = 'image-classification'
  `;

  // Sentence Similarity / Embeddings
  await sql`
    UPDATE models
    SET category = 'Embeddings',
        modality = 'text',
        capabilities = '["embeddings", "search"]'::jsonb
    WHERE source_catalog = 'huggingface' AND architecture->>'pipeline_tag' = 'sentence-similarity'
  `;

  // Document QA / OCR
  await sql`
    UPDATE models
    SET category = 'Document AI',
        modality = 'multimodal',
        capabilities = '["document_ai", "ocr"]'::jsonb
    WHERE source_catalog = 'huggingface' AND architecture->>'pipeline_tag' = 'document-question-answering'
  `;

  // TTS
  await sql`
    UPDATE models
    SET category = 'Audio',
        modality = 'audio',
        capabilities = '["audio", "speech"]'::jsonb
    WHERE source_catalog = 'huggingface' AND architecture->>'pipeline_tag' = 'text-to-speech'
  `;

  // ASR (Speech Recognition)
  await sql`
    UPDATE models
    SET category = 'Audio',
        modality = 'audio',
        capabilities = '["audio", "speech"]'::jsonb
    WHERE source_catalog = 'huggingface' AND architecture->>'pipeline_tag' = 'automatic-speech-recognition'
  `;

  // Robotics
  await sql`
    UPDATE models
    SET category = 'Robotics',
        modality = 'multimodal',
        capabilities = '["robotics"]'::jsonb
    WHERE source_catalog = 'huggingface' AND architecture->>'pipeline_tag' = 'robotics'
  `;

  // Text to Image
  await sql`
    UPDATE models
    SET category = 'Vision',
        modality = 'image',
        capabilities = '["image_generation", "computer_vision"]'::jsonb
    WHERE source_catalog = 'huggingface' AND architecture->>'pipeline_tag' = 'text-to-image'
  `;

  // 6 specific HF models without pipeline_tag
  await sql`
    UPDATE models
    SET category = 'General LLM', modality = 'text', capabilities = '["chat", "text_generation", "general_purpose"]'::jsonb
    WHERE id = 'speakleash/bielik-7b-v0.1' OR id = 'pllum/pllum-7b-chat'
  `;

  await sql`
    UPDATE models
    SET category = 'Reasoning', modality = 'text', capabilities = '["chat", "reasoning", "coding", "general_purpose"]'::jsonb
    WHERE id = 'internlm/internlm2_5-7b-chat'
  `;

  await sql`
    UPDATE models
    SET category = 'Code Generation', modality = 'text', capabilities = '["coding", "code"]'::jsonb
    WHERE id = 'salesforce/codegen-16b-mono'
  `;

  await sql`
    UPDATE models
    SET category = 'Vision', modality = 'image', capabilities = '["computer_vision"]'::jsonb
    WHERE id = 'hustvl/yolos-small'
  `;

  await sql`
    UPDATE models
    SET category = 'Reasoning', modality = 'text', capabilities = '["agents", "planning", "reasoning"]'::jsonb
    WHERE id = 'ilessio/aiflowlab-agent-7b'
  `;

  console.log(`  Hugging Face models strictly classified.`);

  // 5. Paper Mapping Cleanup: remove 3rd party fine tunes and cross-modal mappings
  console.log(`[5] Cleaning paper mappings (removing 3rd-party fine-tunes & cross-modal links)...`);
  const delPapers = await sql`
    DELETE FROM paper_models
    WHERE model_id = 'zpm/Llama-3.1-PersianQA'
       OR model_id = 'abenzerps/Qwen-Image-2.1-Uncensored-GGUF'
       OR model_id = 'moojink/openvla-7b-oft-finetuned-libero-spatial'
       OR model_id = 'google/embeddinggemma-300m'
       OR model_id LIKE 'Qwen/Qwen3-TTS%'
  `;
  console.log(`  Removed invalid paper mappings.`);

  // 6. Paper counts refresh on models
  console.log(`[6] Refreshing paper counts on models...`);
  await sql`
    UPDATE models m
    SET paper_count = (
      SELECT COUNT(*)::int
      FROM paper_models pm
      WHERE pm.model_id = m.id
    )
  `;
  console.log(`  Refreshed paper counts.`);

  // 7. Verify stats
  const chatCount = await sql`
    SELECT COUNT(*)::int as cnt
    FROM models
    WHERE is_canonical = true AND capabilities @> '["chat"]'::jsonb
  `;
  console.log(`  Canonical models with 'chat' capability now: ${chatCount[0].cnt}`);
}

async function run() {
  for (const [shardName, shardUrl] of Object.entries(SHARDS)) {
    try {
      await cleanShard(shardName, shardUrl);
    } catch (err) {
      console.error(`Error on shard ${shardName}:`, err.message);
    }
  }
  console.log(`\nAll shards successfully cleaned and reclassified!`);
}

run().catch(console.error);
