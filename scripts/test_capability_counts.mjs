import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DB_URL);

const CAPABILITY_SQL_CONDITIONS = {
  chat: `(m.capabilities @> '["chat"]'::jsonb AND NOT (COALESCE(m.architecture->'output_modalities', '[]'::jsonb) @> '["image"]'::jsonb) AND m.category NOT IN ('Audio', 'Robotics', 'Embeddings', 'Document AI') AND (m.architecture->>'pipeline_tag' IS NULL OR m.architecture->>'pipeline_tag' IN ('text-generation', 'conversational')))`,
  reasoning: `((m.category = 'Reasoning' OR m.capabilities @> '["reasoning"]'::jsonb) AND NOT (COALESCE(m.architecture->'output_modalities', '[]'::jsonb) @> '["image"]'::jsonb) AND m.category NOT IN ('Audio', 'Robotics', 'Embeddings', 'Document AI'))`,
  coding: `(m.category IN ('Code Generation', 'Code') OR m.capabilities @> '["coding"]'::jsonb OR m.capabilities @> '["code"]'::jsonb)`,
  "computer-vision": `(m.category = 'Vision' OR m.capabilities @> '["computer_vision"]'::jsonb OR m.capabilities @> '["vision"]'::jsonb OR m.architecture->>'pipeline_tag' IN ('image-classification', 'text-to-image'))`,
  multimodal: `(m.modality = 'multimodal' OR m.capabilities @> '["multimodal"]'::jsonb OR COALESCE(m.architecture->'output_modalities', '[]'::jsonb) @> '["image"]'::jsonb)`,
  audio: `(m.category = 'Audio' OR m.capabilities @> '["audio"]'::jsonb OR m.capabilities @> '["speech"]'::jsonb OR m.architecture->>'pipeline_tag' IN ('text-to-speech', 'automatic-speech-recognition'))`,
  "document-ai": `(m.category = 'Document AI' OR m.capabilities @> '["document_ai"]'::jsonb OR m.capabilities @> '["ocr"]'::jsonb OR m.architecture->>'pipeline_tag' = 'document-question-answering')`,
  robotics: `(m.category = 'Robotics' OR m.capabilities @> '["robotics"]'::jsonb OR m.architecture->>'pipeline_tag' = 'robotics')`,
  embeddings: `(m.category = 'Embeddings' OR m.capabilities @> '["embeddings"]'::jsonb OR m.capabilities @> '["search"]'::jsonb OR m.architecture->>'pipeline_tag' = 'sentence-similarity')`,
  "tool-use": `(m.capabilities @> '["tools"]'::jsonb OR m.capabilities @> '["tool_use"]'::jsonb)`,
  "agentic-ai": `(m.capabilities @> '["agents"]'::jsonb OR m.capabilities @> '["planning"]'::jsonb)`,
  mathematics: `(m.capabilities @> '["math"]'::jsonb)`,
  translation: `(m.capabilities @> '["translation"]'::jsonb)`,
  "instruction-following": `(m.capabilities @> '["instruction_following"]'::jsonb)`,
  "general-purpose": `(m.capabilities @> '["general_purpose"]'::jsonb AND m.category NOT IN ('Audio', 'Robotics', 'Embeddings', 'Document AI') AND NOT (COALESCE(m.architecture->'output_modalities', '[]'::jsonb) @> '["image"]'::jsonb))`,
};

async function testCounts() {
  console.log('Testing Capability SQL conditions:');
  const results = [];
  for (const [slug, cond] of Object.entries(CAPABILITY_SQL_CONDITIONS)) {
    const query = `SELECT COUNT(*)::int as cnt FROM models m WHERE is_canonical = true AND ${cond}`;
    const [res] = await sql.query(query);
    results.push({ slug, count: res.cnt });
  }
  console.table(results);
}

testCounts().catch(console.error);
