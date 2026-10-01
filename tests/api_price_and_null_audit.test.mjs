const TARGET_URL = process.env.TEST_URL || 'https://frontend-p3rz9drg1-httplocalhost5173planner.vercel.app';

async function runApiTests() {
  console.log(`\n===============================================================`);
  console.log(`RUNNING API TESTS: PRICE SORTING, FILTERING & NULL INTEGRITY`);
  console.log(`TARGET: ${TARGET_URL}`);
  console.log(`===============================================================\n`);

  let failures = 0;
  let tests = 0;

  function assert(name, condition, detail = '') {
    tests++;
    if (condition) {
      console.log(`  [PASS] ${name} ${detail ? '(' + detail + ')' : ''}`);
    } else {
      failures++;
      console.error(`  [FAIL] ${name}: ${detail}`);
    }
  }

  // 1. Test Price Filter: maxPrice=5
  console.log('\n[TEST 1] Testing Price Filter (maxPrice=5) - NULLs must be excluded...');
  const res1 = await fetch(`${TARGET_URL}/api/v1/models?card=chat&maxPrice=5&limit=100`);
  const data1 = await res1.json();
  const models1 = data1.data || [];
  
  const hasNullInPriceFilter = models1.some(m => m.inputCostPerMtoken === null || m.inputCostPerMtoken === undefined);
  const allUnder5 = models1.every(m => m.inputCostPerMtoken !== null && m.inputCostPerMtoken <= 5);
  assert('Price Filter Excludes NULLs', !hasNullInPriceFilter, `Returned ${models1.length} models, NULL count: ${models1.filter(m => m.inputCostPerMtoken == null).length}`);
  assert('Price Filter Strictly <= 5', allUnder5, `Max price found: ${Math.max(...models1.map(m => m.inputCostPerMtoken || 0))}`);

  // 2. Test Price Sorting: price_asc (NULLS LAST)
  console.log('\n[TEST 2] Testing Price Sorting (sort=price_asc) - NULLS LAST...');
  const res2 = await fetch(`${TARGET_URL}/api/v1/models?card=chat&sort=price_asc&limit=100`);
  const data2 = await res2.json();
  const models2 = data2.data || [];

  // In price_asc, numbers must be non-decreasing, and once null appears, only nulls follow
  let seenNull = false;
  let sortedCorrectly = true;
  let lastPrice = -1;

  for (const m of models2) {
    if (m.inputCostPerMtoken === null) {
      seenNull = true;
    } else {
      if (seenNull) {
        sortedCorrectly = false; // number after null -> fail!
        break;
      }
      if (m.inputCostPerMtoken < lastPrice) {
        sortedCorrectly = false;
        break;
      }
      lastPrice = m.inputCostPerMtoken;
    }
  }
  assert('Price ASC Order & NULLS LAST', sortedCorrectly, `First model price: ${models2[0]?.inputCostPerMtoken}, Seen nulls correctly at end: ${seenNull}`);

  // 3. Test Price Sorting: price_desc (NULLS LAST)
  console.log('\n[TEST 3] Testing Price Sorting (sort=price_desc) - NULLS LAST...');
  const res3 = await fetch(`${TARGET_URL}/api/v1/models?card=chat&sort=price_desc&limit=100`);
  const data3 = await res3.json();
  const models3 = data3.data || [];

  seenNull = false;
  sortedCorrectly = true;
  lastPrice = Infinity;

  for (const m of models3) {
    if (m.inputCostPerMtoken === null) {
      seenNull = true;
    } else {
      if (seenNull) {
        sortedCorrectly = false; // number after null -> fail!
        break;
      }
      if (m.inputCostPerMtoken > lastPrice) {
        sortedCorrectly = false;
        break;
      }
      lastPrice = m.inputCostPerMtoken;
    }
  }
  assert('Price DESC Order & NULLS LAST', sortedCorrectly, `Top price: ${models3[0]?.inputCostPerMtoken}, Seen nulls correctly at end: ${seenNull}`);

  // 4. Test HuggingFace Model Integrity: price must be NULL (not 0), context must NOT be 128000
  console.log('\n[TEST 4] Testing HuggingFace Model Data Integrity...');
  const res4 = await fetch(`${TARGET_URL}/api/v1/models?card=all&limit=200`);
  const data4 = await res4.json();
  const allModels = data4.data || [];
  const hfModels = allModels.filter(m => m.sourceCatalog === 'huggingface' || m.huggingFaceId);

  console.log(`Found ${hfModels.length} HuggingFace models in sample`);
  const hfWithZeroPrice = hfModels.filter(m => m.inputCostPerMtoken === 0);
  const hfWith128k = hfModels.filter(m => m.contextWindow === 128000);

  assert('Zero HuggingFace models with price = 0', hfWithZeroPrice.length === 0, `Count with price=0: ${hfWithZeroPrice.length}`);
  assert('Zero HuggingFace models with default context = 128000', hfWith128k.length === 0, `Count with 128000: ${hfWith128k.length}`);

  // 5. Verify only OpenRouter models have Free price (0)
  const freeModels = allModels.filter(m => m.inputCostPerMtoken === 0);
  const nonOrFree = freeModels.filter(m => m.sourceCatalog !== 'openrouter' && !m.slug.includes(':free') && !m.name.includes('(free)'));
  assert('All Free models are legitimate OpenRouter free tiers', nonOrFree.length === 0, `Total free models: ${freeModels.length}, Suspicious free: ${nonOrFree.length}`);

  console.log(`\n===============================================================`);
  console.log(`API TESTS SUMMARY: ${failures === 0 ? '✅ ALL PASSED' : '❌ SOME FAILED'}`);
  console.log(`Passed: ${tests - failures}/${tests}`);
  console.log(`===============================================================\n`);

  if (failures > 0) process.exit(1);
}

runApiTests().catch(err => {
  console.error('API Test Error:', err);
  process.exit(1);
});
