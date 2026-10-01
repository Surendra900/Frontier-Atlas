import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DB_URL);

async function inspect() {
  const chatCaps = await sql`
    SELECT m.source_catalog, m.architecture->>'pipeline_tag' as tag, m.name, m.category, m.capabilities
    FROM models m
    WHERE m.capabilities @> '["chat"]'::jsonb
      AND (m.source_catalog = 'huggingface' OR m.architecture->'output_modalities' @> '["image"]'::jsonb)
    LIMIT 20
  `;
  console.log('Non-chat models that currently have ["chat"] in capabilities:');
  console.table(chatCaps);

  const totalChat = await sql`
    SELECT COUNT(*)::int as total
    FROM models m
    WHERE m.is_canonical = true AND (m.capabilities @> '["chat"]'::jsonb OR m.capabilities @> '["general_purpose"]'::jsonb)
  `;
  console.log('Total canonical models matching (chat OR general_purpose):', totalChat[0].total);

  const totalCanonical = await sql`
    SELECT COUNT(*)::int as total
    FROM models m
    WHERE m.is_canonical = true
  `;
  console.log('Total canonical models:', totalCanonical[0].total);
}

inspect().catch(console.error);
