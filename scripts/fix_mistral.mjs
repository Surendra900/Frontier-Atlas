import { neon } from '@neondatabase/serverless';

const SHARDS = {
  SHARD_2: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_3: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-damp-bar-aofs3cnt-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_1: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-floral-cherry-aorpwovy-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_4: "postgresql://neondb_owner:npg_le9RfJEbAa7I@ep-odd-night-atgpapcg-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require",
};

async function fixMistralProprietary() {
  for (const [sName, sUrl] of Object.entries(SHARDS)) {
    const sql = neon(sUrl);
    await sql`
      UPDATE models
      SET openness_type = 'Proprietary',
          license = 'Proprietary',
          access_type = 'Commercial API'
      WHERE id ILIKE '%mistral-large%' OR id ILIKE '%mistral-medium%' OR name ILIKE '%Mistral Large%' OR name ILIKE '%Mistral Medium%'
    `;
  }
  console.log('Fixed Mistral Large and Mistral Medium as Proprietary across all shards!');
}

fixMistralProprietary().catch(console.error);
