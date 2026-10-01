import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DB_URL);

async function checkPapers() {
  console.log('=== PAPER MAPPINGS AUDIT ===');
  
  const papers = await sql`
    SELECT 
      p.id, 
      p.title, 
      p.arxiv_id, 
      p.slug,
      COUNT(pm.model_id) FILTER (WHERE pm.role = 'introduced')::int as introduced_count,
      COUNT(pm.model_id) FILTER (WHERE pm.role = 'family')::int as family_count,
      COUNT(pm.model_id)::int as total_mapped
    FROM papers p
    LEFT JOIN paper_models pm ON pm.paper_id = p.id
    GROUP BY p.id, p.title, p.arxiv_id, p.slug
    ORDER BY total_mapped DESC
  `;
  console.table(papers);

  const [introducedTotal] = await sql`SELECT COUNT(DISTINCT model_id)::int as cnt FROM paper_models WHERE role = 'introduced'`;
  const [familyTotal] = await sql`SELECT COUNT(DISTINCT model_id)::int as cnt FROM paper_models WHERE role = 'family'`;
  const [totalMapped] = await sql`SELECT COUNT(DISTINCT model_id)::int as cnt FROM paper_models`;
  const [totalCanonical] = await sql`SELECT COUNT(*)::int as cnt FROM models WHERE is_canonical = true`;
  
  const unmapped = totalCanonical.cnt - totalMapped.cnt;

  console.log(`\nExact Paper Mapping Counts:`);
  console.log(`Total Canonical Models: ${totalCanonical.cnt}`);
  console.log(`Models with 'Introduced' paper: ${introducedTotal.cnt}`);
  console.log(`Models with 'Family' paper: ${familyTotal.cnt}`);
  console.log(`Total Unique Mapped Models: ${totalMapped.cnt}`);
  console.log(`Total Unmapped Models: ${unmapped}`);

  // List all mapped models with their paper title and role
  const sampleMapped = await sql`
    SELECT m.id, m.name, m.vendor, pm.role, p.arxiv_id, p.title
    FROM paper_models pm
    JOIN models m ON m.id = pm.model_id
    JOIN papers p ON p.id = pm.paper_id
    ORDER BY p.arxiv_id, pm.role, m.name
  `;
  console.log(`\nAll Mapped Models (${sampleMapped.length} links):`);
  console.table(sampleMapped);
}

checkPapers().catch(console.error);
