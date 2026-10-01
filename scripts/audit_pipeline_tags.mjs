import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DB_URL);

async function main() {
  const hfTags = await sql`
    SELECT architecture->>'pipeline_tag' as pipeline_tag, count(*)::int as count 
    FROM models 
    WHERE source_catalog = 'huggingface' OR architecture ? 'pipeline_tag'
    GROUP BY architecture->>'pipeline_tag'
    ORDER BY count DESC
  `;
  console.log('HuggingFace pipeline tags:');
  console.table(hfTags);

  const orOutputModalities = await sql`
    SELECT jsonb_array_elements_text(architecture->'output_modalities') as out_mod, count(*)::int as count
    FROM models
    WHERE architecture ? 'output_modalities'
    GROUP BY out_mod
    ORDER BY count DESC
  `;
  console.log('\nOpenRouter output modalities:');
  console.table(orOutputModalities);

  // Check image output models
  const imageOut = await sql`
    SELECT id, name, category, capabilities, architecture->'output_modalities' as out_mod
    FROM models
    WHERE architecture->'output_modalities' ? 'image'
  `;
  console.log('\nImage output models:');
  console.table(imageOut);
}

main().catch(console.error);
