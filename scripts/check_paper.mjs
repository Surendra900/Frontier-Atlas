import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

async function run() {
  const gpt4 = await sql`
    SELECT id, name, vendor, model_family, capabilities, is_canonical
    FROM models 
    WHERE (id ILIKE '%gpt-4%' OR name ILIKE '%gpt-4%')
  `;
  console.log('GPT-4 models count:', gpt4.length);
  console.log('Sample GPT-4 models:', gpt4.slice(0, 5));
}
run();
