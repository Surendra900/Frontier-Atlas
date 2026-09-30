import assert from "node:assert";
import { neon } from "@neondatabase/serverless";

const DATABASE_URL = "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DATABASE_URL);

async function runTests() {
  console.log("=== RUNNING AUTOMATED AUDIT & VERIFICATION SUITE ===");

  // Test 1: Models table has complete set of models with required specification columns
  console.log("\n[Test 1] Verifying models count and columns...");
  const modelCountRes = await sql.query("SELECT COUNT(*) as count FROM models");
  const totalModels = parseInt(modelCountRes[0].count, 10);
  console.log(`Total models in database: ${totalModels}`);
  assert(totalModels >= 400, `Expected at least 400 models, found ${totalModels}`);

  const sampleModel = await sql.query(`
    SELECT id, name, slug, vendor, context_window, input_cost_per_mtoken, 
           output_cost_per_mtoken, openness_type, modality, capabilities 
    FROM models 
    WHERE slug = 'gpt-4o' OR slug = 'gpt-4' OR slug ILIKE '%gpt-4%' 
    LIMIT 1
  `);
  assert(sampleModel.length > 0, "Expected to find GPT-4/GPT-4o model");
  console.log(`Sample model: ${sampleModel[0].name} (vendor: ${sampleModel[0].vendor}, context: ${sampleModel[0].context_window}, openness: ${sampleModel[0].openness_type})`);

  // Test 2: Paper mapping coverage numbers
  console.log("\n[Test 2] Computing paper mapping coverage metrics...");
  const mappingStats = await sql.query(`
    SELECT 
      COUNT(DISTINCT m.id) as total_models,
      COUNT(DISTINCT pm.model_id) as models_with_papers,
      COUNT(pm.model_id) as total_mappings
    FROM models m
    LEFT JOIN paper_models pm ON pm.model_id = m.id
  `);
  const modelsWithPapers = parseInt(mappingStats[0].models_with_papers, 10);
  const modelsWithoutPapers = totalModels - modelsWithPapers;
  console.log(`Models with >= 1 paper: ${modelsWithPapers}`);
  console.log(`Models without paper: ${modelsWithoutPapers}`);
  console.log(`Total model-paper relationships: ${mappingStats[0].total_mappings}`);
  assert(modelsWithPapers >= 50, `Expected at least 50 models mapped to papers, found ${modelsWithPapers}`);

  // Test 3: Landmark paper resolution
  console.log("\n[Test 3] Verifying landmark research papers in database...");
  const gpt4Paper = await sql.query(
    "SELECT id, slug, title, arxiv_id FROM papers WHERE slug = $1 OR arxiv_id = $2",
    ["gpt-4-technical-report---2303.08774v27", "2303.08774"]
  );
  assert(gpt4Paper.length > 0, "Expected GPT-4 technical report to exist in database");
  console.log(`GPT-4 Paper verified: "${gpt4Paper[0].title}" (arxiv: ${gpt4Paper[0].arxiv_id})`);

  // Test 4: Marco-o1 v2 paper resolution (User's specific bug fix)
  console.log("\n[Test 4] Verifying Marco-o1 v2 paper resolution...");
  const marcoPaper = await sql.query(
    "SELECT id, slug, title, arxiv_id FROM papers WHERE slug = $1",
    ["marco-o1-v2-towards-widening-the-distillation-bottleneck-for-reasoning-models-2503.01461"]
  );
  assert(marcoPaper.length > 0, "Expected Marco-o1 v2 paper to exist in database");
  console.log(`Marco-o1 v2 Paper verified: "${marcoPaper[0].title}" (arxiv: ${marcoPaper[0].arxiv_id})`);

  // Test 5: Verify paper detail mapped models relationship
  console.log("\n[Test 5] Verifying mapped models linkage...");
  const mappedModels = await sql.query(`
    SELECT m.name, pm.role, p.title 
    FROM paper_models pm 
    JOIN models m ON m.id = pm.model_id 
    JOIN papers p ON p.id = pm.paper_id 
    LIMIT 5
  `);
  assert(mappedModels.length > 0, "Expected mapped models to exist");
  for (const mm of mappedModels) {
    console.log(`  -> Model "${mm.name}" linked to Paper "${mm.title?.slice(0, 45)}..." [${mm.role}]`);
  }

  // Test 6: Verify 404 on nonexistent slug
  console.log("\n[Test 6] Verifying nonexistent slug returns empty...");
  const nonExistent = await sql.query("SELECT id FROM papers WHERE slug = $1", ["completely-fake-slug-xyz-99999"]);
  assert.strictEqual(nonExistent.length, 0, "Nonexistent paper slug must return 0 rows");
  console.log("Verified nonexistent paper correctly yields 0 rows (404)");

  console.log("\n=======================================================");
  console.log(" ALL 6 AUDIT & INTEGRATION TESTS PASSED WITH 100% SUCCESS!");
  console.log("=======================================================\n");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
