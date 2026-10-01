import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DB_URL);

async function findIds() {
  const claude = await sql`SELECT id, name, openness_type, license FROM models WHERE name ILIKE '%claude%'`;
  console.log('Claude models:');
  console.table(claude);

  const deepseek = await sql`SELECT id, name, openness_type, license FROM models WHERE name ILIKE '%deepseek%' LIMIT 10`;
  console.log('Deepseek models:');
  console.table(deepseek);

  const mistral = await sql`SELECT id, name, openness_type, license FROM models WHERE name ILIKE '%mistral%' LIMIT 10`;
  console.log('Mistral models:');
  console.table(mistral);
}

findIds().catch(console.error);
