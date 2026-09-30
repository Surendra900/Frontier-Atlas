import { neon } from '@neondatabase/serverless';

const dbUrl = "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(dbUrl);

async function testPaperResolution(slug) {
  const arxivId = '2303.08774';
  const rows = await sql`
    SELECT * FROM papers 
    WHERE slug = ${slug} OR arxiv_id = ${arxivId} 
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  const raw = rows[0];

  const authorRows = await sql`
    SELECT a.id, a.name, a.slug 
    FROM authors a 
    JOIN paper_authors pa ON pa.author_id = a.id 
    WHERE pa.paper_id = ${raw.id}
  `;

  const modelRows = await sql`
    SELECT m.id, m.name, m.slug, m.vendor, pm.role 
    FROM models m 
    JOIN paper_models pm ON pm.model_id = m.id 
    WHERE pm.paper_id = ${raw.id}
  `;

  return {
    title: raw.title,
    date: raw.publication_date,
    arxivId: raw.arxiv_id,
    authors: authorRows.map(a => a.name),
    models: modelRows.map(m => ({ name: m.name, role: m.role })),
  };
}

async function run() {
  const res = await testPaperResolution('gpt-4-technical-report---2303.08774');
  console.log('Resolved Paper:', JSON.stringify(res, null, 2));
}
run();
