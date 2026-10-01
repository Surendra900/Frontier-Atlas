import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

const CAPABILITY_SQL_CONDITIONS = {
  chat: `(m.capabilities @> '["chat"]'::jsonb AND NOT (COALESCE(m.architecture->'output_modalities', '[]'::jsonb) @> '["image"]'::jsonb) AND m.category NOT IN ('Audio', 'Robotics', 'Embeddings', 'Document AI') AND (m.architecture->>'pipeline_tag' IS NULL OR m.architecture->>'pipeline_tag' IN ('text-generation', 'conversational')))`,
  reasoning: `((m.category = 'Reasoning' OR m.capabilities @> '["reasoning"]'::jsonb) AND NOT (COALESCE(m.architecture->'output_modalities', '[]'::jsonb) @> '["image"]'::jsonb) AND m.category NOT IN ('Audio', 'Robotics', 'Embeddings', 'Document AI'))`,
  coding: `(m.category IN ('Code Generation', 'Code') OR m.capabilities @> '["coding"]'::jsonb OR m.capabilities @> '["code"]'::jsonb)`,
  'computer-vision': `(m.category = 'Vision' OR m.capabilities @> '["computer_vision"]'::jsonb OR m.capabilities @> '["vision"]'::jsonb OR m.architecture->>'pipeline_tag' IN ('image-classification', 'text-to-image'))`,
  multimodal: `(m.modality = 'multimodal' OR m.capabilities @> '["multimodal"]'::jsonb OR COALESCE(m.architecture->'output_modalities', '[]'::jsonb) @> '["image"]'::jsonb)`,
  audio: `(m.category = 'Audio' OR m.capabilities @> '["audio"]'::jsonb OR m.capabilities @> '["speech"]'::jsonb OR m.architecture->>'pipeline_tag' IN ('text-to-speech', 'automatic-speech-recognition'))`,
  'document-ai': `(m.category = 'Document AI' OR m.capabilities @> '["document_ai"]'::jsonb OR m.capabilities @> '["ocr"]'::jsonb OR m.architecture->>'pipeline_tag' = 'document-question-answering')`,
  robotics: `(m.category = 'Robotics' OR m.capabilities @> '["robotics"]'::jsonb OR m.architecture->>'pipeline_tag' = 'robotics')`,
  embeddings: `(m.category = 'Embeddings' OR m.capabilities @> '["embeddings"]'::jsonb OR m.capabilities @> '["search"]'::jsonb OR m.architecture->>'pipeline_tag' = 'sentence-similarity')`,
  'tool-use': `(m.capabilities @> '["tools"]'::jsonb OR m.capabilities @> '["tool_use"]'::jsonb)`,
  'agentic-ai': `(m.capabilities @> '["agents"]'::jsonb OR m.capabilities @> '["planning"]'::jsonb)`,
  mathematics: `(m.capabilities @> '["math"]'::jsonb)`,
  translation: `(m.capabilities @> '["translation"]'::jsonb)`,
  'instruction-following': `(m.capabilities @> '["instruction_following"]'::jsonb)`,
  'general-purpose': `(m.capabilities @> '["general_purpose"]'::jsonb AND m.category NOT IN ('Audio', 'Robotics', 'Embeddings', 'Document AI') AND NOT (COALESCE(m.architecture->'output_modalities', '[]'::jsonb) @> '["image"]'::jsonb))`,
  healthcare: `(m.capabilities @> '["healthcare"]'::jsonb)`,
  'image-generation': `(m.capabilities @> '["image_generation"]'::jsonb OR m.architecture->>'pipeline_tag' = 'text-to-image' OR COALESCE(m.architecture->'output_modalities', '[]'::jsonb) @> '["image"]'::jsonb)`
};

const CAPABILITY_FACET_LIST = [
  { name: 'Chat', slug: 'chat' },
  { name: 'Reasoning', slug: 'reasoning' },
  { name: 'Computer Vision', slug: 'computer-vision' },
  { name: 'Coding', slug: 'coding' },
  { name: 'Multimodal', slug: 'multimodal' },
  { name: 'Agentic AI', slug: 'agentic-ai' },
  { name: 'Tool Use', slug: 'tool-use' },
  { name: 'Audio', slug: 'audio' },
  { name: 'Document AI', slug: 'document-ai' },
  { name: 'Robotics', slug: 'robotics' },
  { name: 'Embeddings', slug: 'embeddings' },
  { name: 'Mathematics', slug: 'mathematics' },
  { name: 'Translation', slug: 'translation' },
  { name: 'Instruction Following', slug: 'instruction-following' },
  { name: 'General Purpose', slug: 'general-purpose' },
  { name: 'Healthcare', slug: 'healthcare' },
  { name: 'Image Generation', slug: 'image-generation' }
];

async function main() {
  const t0 = Date.now();
  const capSelectClauses = CAPABILITY_FACET_LIST.map(
    (item, idx) => `COUNT(*) FILTER (WHERE ${CAPABILITY_SQL_CONDITIONS[item.slug]})::int as cap_${idx}`
  ).join(',\n');

  const [capRow] = await sql.query(`SELECT ${capSelectClauses} FROM models m WHERE m.is_canonical = true`);
  
  const result = CAPABILITY_FACET_LIST.map((item, idx) => ({
    name: item.name,
    slug: item.slug,
    count: Number(capRow['cap_' + idx] || 0)
  }));

  console.log(`Executed in ${Date.now() - t0}ms`);
  console.log(JSON.stringify(result, null, 2));

  // Check cardSlug = chat count
  const [chatCard] = await sql.query(`SELECT COUNT(*)::int as total FROM models m WHERE m.is_canonical = true AND ${CAPABILITY_SQL_CONDITIONS.chat}`);
  console.log('Chat card count:', chatCard.total);
}

main().catch(console.error);
