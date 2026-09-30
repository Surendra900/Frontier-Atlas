import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function testDbQuery() {
  const start = Date.now();

  const [countRes] = await sql`
    SELECT COUNT(*)::int as total FROM models m WHERE m.is_canonical = true
  `;

  const rows = await sql`
    SELECT 
      m.id, m.name, m.slug, m.vendor, m.vendor_logo_url, m.description,
      m.parameter_count, m.modality, m.access_type, m.openness_type,
      m.release_date, m.model_family, m.category, m.capabilities,
      m.research_areas, m.architecture, m.context_window, m.max_output_tokens,
      m.input_cost_per_mtoken, m.output_cost_per_mtoken, m.license,
      m.paper_url, m.repository_url, m.api_url, m.hugging_face_id,
      m.trending_score, m.variants, m.is_canonical,
      COUNT(pm.paper_id)::int as paper_count,
      COALESCE(
        json_agg(
          json_build_object(
            'id', p.id,
            'title', p.title,
            'slug', p.slug,
            'arxivId', p.arxiv_id,
            'citationCount', p.citation_count,
            'githubStars', p.github_stars,
            'role', pm.role,
            'confidence', pm.confidence
          )
        ) FILTER (WHERE p.id IS NOT NULL),
        '[]'::json
      ) as papers
    FROM models m
    LEFT JOIN paper_models pm ON pm.model_id = m.id
    LEFT JOIN papers p ON p.id = pm.paper_id
    WHERE m.is_canonical = true
    GROUP BY m.id
    ORDER BY m.trending_score DESC NULLS LAST
    LIMIT 10
  `;

  console.log(`Executed in ${Date.now() - start}ms. Total canonical: ${countRes.total}, returned: ${rows.length}`);
  console.log('Sample row with variants and papers:');
  const sample = rows.find(r => r.variants && r.variants.length > 0 && r.papers && r.papers.length > 0) || rows[0];
  console.log({
    name: sample.name,
    vendor: sample.vendor,
    variantsCount: sample.variants?.length || 0,
    papersCount: sample.papers?.length || 0,
    papers: sample.papers
  });
}

testDbQuery().catch(console.error);
