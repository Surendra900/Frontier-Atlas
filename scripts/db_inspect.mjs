import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DATABASE_URL);

async function main() {
  const rows = await sql`
    SELECT id, slug, title, arxiv_id
    FROM papers
    WHERE arxiv_id = '2310.06825'
  `;
  console.log('Exact 2310.06825 row in DB:', rows);
}

main().catch(console.error);
