import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = 'postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

// Helper from page.tsx:
const toCardSlug = (str) => str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

async function getFacets() {
  const res = await fetch('https://frontieratlas-backend.morningsignal-india.workers.dev/api/v1/models/facets');
  return await res.json();
}

// Current query logic in frontend/app/api/v1/models/route.ts
async function countModelsForCard(cardSlug) {
  const cleanSlug = cardSlug.toLowerCase().trim();
  const query = `
    SELECT COUNT(*)::int as count FROM models m
    WHERE (
      LOWER(m.vendor) = $1 OR
      LOWER(REPLACE(m.vendor, ' ', '-')) = $1 OR
      LOWER(m.model_family) = $1 OR
      LOWER(REPLACE(m.model_family, ' ', '-')) = $1 OR
      LOWER(m.category) = $1 OR
      LOWER(REPLACE(m.category, ' ', '-')) = $1 OR
      m.capabilities @> to_jsonb(ARRAY[$1]::text[]) OR
      m.slug = $1 OR
      LOWER(m.name) LIKE '%' || $1 || '%'
    )
  `;
  const [row] = await sql.query(query, [cleanSlug]);
  return row ? row.count : 0;
}

async function run() {
  console.log('Fetching facets from backend...');
  const facetData = await getFacets();
  const facets = facetData.data;

  const cardList = [];

  // 1. Capabilities
  for (const c of facets.capabilities) {
    cardList.push({
      section: 'Capability',
      label: c.name,
      slug: toCardSlug(c.name),
      facetReportedCount: c.count,
    });
  }

  // 2. Model Families
  for (const f of facets.modelFamilies.slice(0, 30)) {
    cardList.push({
      section: 'Model Family',
      label: f.name,
      slug: toCardSlug(f.name),
      facetReportedCount: f.count,
    });
  }

  // 3. Organizations (Vendors)
  for (const v of facets.vendors) {
    cardList.push({
      section: 'Organization',
      label: v.name,
      slug: toCardSlug(v.name),
      facetReportedCount: v.count,
    });
  }

  // 4. Research Areas
  for (const r of facets.researchAreas) {
    cardList.push({
      section: 'Research Area',
      label: r.name,
      slug: toCardSlug(r.name),
      facetReportedCount: r.count,
    });
  }

  // 5. Special curated cards on /models
  const specialCards = [
    { section: 'Curated', label: 'Trending', slug: 'trending' },
    { section: 'Curated', label: 'Recently Released', slug: 'recent' },
    { section: 'Curated', label: 'Reasoning', slug: 'reasoning' },
    { section: 'Curated', label: 'Multimodal', slug: 'multimodal' },
    { section: 'Curated', label: 'Open Weights', slug: 'open-weights' },
    { section: 'Curated', label: 'Proprietary', slug: 'proprietary' },
  ];
  for (const sc of specialCards) {
    cardList.push(sc);
  }

  console.log(`Auditing ${cardList.length} cards...`);

  let markdown = `# Models Module Audit (Before)\n\n`;
  markdown += `**Audit Timestamp**: ${new Date().toISOString()}\n`;
  markdown += `**Database Tested**: SHARD_2 (Primary Neon Pooler)\n`;
  markdown += `**Total Unique Cards Audited**: ${cardList.length}\n\n`;
  markdown += `| Section | Card Label | Card Slug | Reported Facet Count | DB Query Result Count | Status |\n`;
  markdown += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  let zeroCount = 0;
  let populatedCount = 0;

  for (const card of cardList) {
    const dbCount = await countModelsForCard(card.slug);
    const status = dbCount > 0 ? 'POPULATED' : 'FAIL (ZERO)';
    if (dbCount === 0) zeroCount++;
    else populatedCount++;

    markdown += `| ${card.section} | ${card.label} | \`${card.slug}\` | ${card.facetReportedCount ?? 'N/A'} | ${dbCount} | **${status}** |\n`;
  }

  markdown += `\n## Summary\n\n`;
  markdown += `- **Total Cards Audited**: ${cardList.length}\n`;
  markdown += `- **Populated Cards**: ${populatedCount}\n`;
  markdown += `- **Failing / Empty Cards (0 models)**: ${zeroCount} (${((zeroCount / cardList.length) * 100).toFixed(1)}%)\n`;

  const docsDir = path.join(__dirname, '../../docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const outPath = path.join(docsDir, 'models-audit-before.md');
  fs.writeFileSync(outPath, markdown, 'utf-8');
  console.log(`Saved audit matrix to ${outPath}`);
  console.log(`Summary: Populated: ${populatedCount}, Empty: ${zeroCount}`);
}

run().catch(console.error);
