import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DB_URL);

async function sampleChat() {
  const models = await sql`
    SELECT id, name, vendor, category, modality, capabilities, architecture->>'pipeline_tag' as tag
    FROM models m
    WHERE is_canonical = true 
      AND (m.capabilities @> '["chat"]'::jsonb AND NOT (COALESCE(m.architecture->'output_modalities', '[]'::jsonb) @> '["image"]'::jsonb) AND m.category NOT IN ('Audio', 'Robotics', 'Embeddings', 'Document AI') AND (m.architecture->>'pipeline_tag' IS NULL OR m.architecture->>'pipeline_tag' IN ('text-generation', 'conversational')))
    ORDER BY trending_score DESC
    LIMIT 20
  `;
  console.log('Top 20 Chat Models:');
  console.table(models);
}

sampleChat().catch(console.error);
