import { neon } from '@neondatabase/serverless';

const SHARDS = {
  SHARD_2: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_3: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-damp-bar-aofs3cnt-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_1: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-floral-cherry-aorpwovy-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_4: "postgresql://neondb_owner:npg_le9RfJEbAa7I@ep-odd-night-atgpapcg-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require",
};

async function fixAudioRoboticsEmbeddings() {
  for (const [sName, sUrl] of Object.entries(SHARDS)) {
    console.log(`Checking ${sName}...`);
    const sql = neon(sUrl);
    
    // Strip 'chat' and 'general_purpose' and 'reasoning' from Audio models
    await sql`
      UPDATE models
      SET capabilities = '["audio", "speech"]'::jsonb
      WHERE category = 'Audio' OR name ILIKE '%Voxtral%' OR id ILIKE '%voxtral%'
    `;

    // Strip from Robotics models
    await sql`
      UPDATE models
      SET capabilities = '["robotics"]'::jsonb
      WHERE category = 'Robotics'
    `;

    // Strip from Embeddings models
    await sql`
      UPDATE models
      SET capabilities = '["embeddings", "search"]'::jsonb
      WHERE category = 'Embeddings'
    `;

    // Strip from Image output models
    await sql`
      UPDATE models
      SET capabilities = '["image_generation", "computer_vision", "multimodal"]'::jsonb
      WHERE architecture::jsonb->'output_modalities' @> '["image"]'::jsonb
    `;
  }
  console.log('Finished updating audio, robotics, embeddings, and image output models across all shards!');
}

fixAudioRoboticsEmbeddings().catch(console.error);
