import { neon } from '@neondatabase/serverless';

const SHARD_1 = "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-floral-cherry-aorpwovy-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(SHARD_1);

async function run() {
  console.log('Running on SHARD_1 with explicit jsonb casts...');
  await sql`
    UPDATE models
    SET context_window = NULL
    WHERE source_catalog = 'huggingface'
      AND (context_window::text = '128000' OR context_window::text = '0')
  `;

  await sql`
    UPDATE models
    SET input_cost_per_mtoken = NULL,
        output_cost_per_mtoken = NULL
    WHERE source_catalog = 'huggingface'
      AND (input_cost_per_mtoken = 0 OR input_cost_per_mtoken IS NULL)
  `;

  await sql`
    UPDATE models
    SET openness_type = 'Proprietary',
        license = 'Proprietary',
        access_type = 'Commercial API'
    WHERE (name ILIKE '%Qwen%Max%' OR name ILIKE '%Qwen%Plus%' OR id ILIKE '%qwen%max%' OR id ILIKE '%qwen%plus%')
      AND id NOT ILIKE '%coder%'
  `;

  await sql`
    UPDATE models
    SET category = CASE WHEN category = 'Reasoning' THEN 'Vision' ELSE category END,
        capabilities = '["image_generation", "computer_vision", "multimodal"]'::jsonb
    WHERE architecture::jsonb->'output_modalities' @> '["image"]'::jsonb
  `;

  await sql`
    UPDATE models
    SET category = 'Vision',
        modality = 'image',
        capabilities = '["computer_vision", "classification"]'::jsonb
    WHERE source_catalog = 'huggingface' AND architecture::jsonb->>'pipeline_tag' = 'image-classification'
  `;

  await sql`
    UPDATE models
    SET category = 'Embeddings',
        modality = 'text',
        capabilities = '["embeddings", "search"]'::jsonb
    WHERE source_catalog = 'huggingface' AND architecture::jsonb->>'pipeline_tag' = 'sentence-similarity'
  `;

  await sql`
    UPDATE models
    SET category = 'Document AI',
        modality = 'multimodal',
        capabilities = '["document_ai", "ocr"]'::jsonb
    WHERE source_catalog = 'huggingface' AND architecture::jsonb->>'pipeline_tag' = 'document-question-answering'
  `;

  await sql`
    UPDATE models
    SET category = 'Audio',
        modality = 'audio',
        capabilities = '["audio", "speech"]'::jsonb
    WHERE source_catalog = 'huggingface' AND (architecture::jsonb->>'pipeline_tag' = 'text-to-speech' OR architecture::jsonb->>'pipeline_tag' = 'automatic-speech-recognition')
  `;

  await sql`
    UPDATE models
    SET category = 'Robotics',
        modality = 'multimodal',
        capabilities = '["robotics"]'::jsonb
    WHERE source_catalog = 'huggingface' AND architecture::jsonb->>'pipeline_tag' = 'robotics'
  `;

  await sql`
    UPDATE models
    SET category = 'Vision',
        modality = 'image',
        capabilities = '["image_generation", "computer_vision"]'::jsonb
    WHERE source_catalog = 'huggingface' AND architecture::jsonb->>'pipeline_tag' = 'text-to-image'
  `;

  await sql`
    DELETE FROM paper_models
    WHERE model_id = 'zpm/Llama-3.1-PersianQA'
       OR model_id = 'abenzerps/Qwen-Image-2.1-Uncensored-GGUF'
       OR model_id = 'moojink/openvla-7b-oft-finetuned-libero-spatial'
       OR model_id = 'google/embeddinggemma-300m'
       OR model_id LIKE 'Qwen/Qwen3-TTS%'
  `;

  console.log('SHARD_1 successfully updated!');
}

run().catch(console.error);
