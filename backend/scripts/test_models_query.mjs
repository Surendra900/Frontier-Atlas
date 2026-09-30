import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function testQuery(testName, cardSlug, filters = {}) {
  const conditions = ['m.is_canonical = true'];
  const params = [];
  let pIdx = 1;

  // Simulate contract resolution
  const slug = (cardSlug || 'all').toLowerCase().trim();
  if (slug === 'chat') {
    conditions.push(`(m.capabilities @> '["chat"]'::jsonb OR m.capabilities @> '["general_purpose"]'::jsonb)`);
  } else if (slug === 'coding' || slug === 'code') {
    conditions.push(`(m.capabilities @> '["code"]'::jsonb OR m.capabilities @> '["coding"]'::jsonb)`);
  } else if (slug === 'reasoning') {
    conditions.push(`(m.category = 'Reasoning' OR m.capabilities @> '["reasoning"]'::jsonb)`);
  } else if (slug === 'computer-vision' || slug === 'vision') {
    conditions.push(`(m.category = 'Vision' OR m.capabilities @> '["vision"]'::jsonb)`);
  } else if (slug === 'open-weights' || slug === 'open') {
    conditions.push(`m.openness_type = 'Open Weights'`);
  } else if (slug === 'proprietary') {
    conditions.push(`m.openness_type = 'Proprietary'`);
  } else if (slug === 'openai') {
    conditions.push(`LOWER(m.vendor) = 'openai'`);
  } else if (slug === 'deepseek') {
    conditions.push(`LOWER(m.vendor) = 'deepseek'`);
  } else if (slug !== 'all' && slug !== 'models') {
    conditions.push(`(
      LOWER(m.vendor) = $${pIdx} OR
      LOWER(REPLACE(m.vendor, ' ', '-')) = $${pIdx} OR
      LOWER(m.model_family) = $${pIdx} OR
      LOWER(REPLACE(m.model_family, ' ', '-')) = $${pIdx} OR
      LOWER(m.category) = $${pIdx} OR
      m.capabilities @> to_jsonb(ARRAY[$${pIdx}]::text[]) OR
      m.slug = $${pIdx} OR
      LOWER(m.name) LIKE '%' || $${pIdx} || '%'
    )`);
    params.push(slug);
    pIdx++;
  }

  // Filter overrides:
  if (filters.capability && filters.capability !== 'all') {
    if (filters.capability.toLowerCase() === 'reasoning') {
      conditions.push(`(m.capabilities @> '["reasoning"]'::jsonb OR m.category = 'Reasoning')`);
    } else if (filters.capability.toLowerCase() === 'coding' || filters.capability.toLowerCase() === 'code') {
      conditions.push(`(m.capabilities @> '["code"]'::jsonb OR m.capabilities @> '["coding"]'::jsonb)`);
    } else {
      conditions.push(`m.capabilities @> to_jsonb(ARRAY[$${pIdx}]::text[])`);
      params.push(filters.capability.toLowerCase());
      pIdx++;
    }
  }

  const whereClause = conditions.join(' AND ');
  const [countRes] = await sql.query(`SELECT COUNT(*)::int as cnt FROM models m WHERE ${whereClause}`, params);
  const dataRows = await sql.query(`
    SELECT m.name, m.slug, m.vendor, m.parameter_count, m.context_window, m.input_cost_per_mtoken,
           m.variants, COUNT(pm.paper_id) as paper_count
    FROM models m
    LEFT JOIN paper_models pm ON pm.model_id = m.id
    WHERE ${whereClause}
    GROUP BY m.id
    ORDER BY m.trending_score DESC NULLS LAST
    LIMIT 3
  `, params);

  console.log(`[${testName}] card='${cardSlug}' filters=${JSON.stringify(filters)} => Count: ${countRes.cnt}, Sample: ${dataRows.map(r => r.name).join(', ')}`);
}

async function run() {
  console.log('=== TESTING QUERY LOGIC ===');
  await testQuery('Test 1: All', 'all');
  await testQuery('Test 2: Chat', 'chat');
  await testQuery('Test 3: Coding', 'coding');
  await testQuery('Test 4: Reasoning', 'reasoning');
  await testQuery('Test 5: Computer Vision', 'computer-vision');
  await testQuery('Test 6: OpenAI', 'openai');
  await testQuery('Test 7: DeepSeek', 'deepseek');
  await testQuery('Test 8: Open Weights', 'open-weights');
  // CRITICAL REVIEWER FAILURE A TEST:
  await testQuery('Test 9: Chat with capability=reasoning', 'chat', { capability: 'reasoning' });
  await testQuery('Test 10: Coding with capability=reasoning', 'coding', { capability: 'reasoning' });
}

run().catch(console.error);
