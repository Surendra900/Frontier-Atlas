import https from 'https';
import http from 'http';

const BASE_URL = 'https://frontend-httplocalhost5173planner.vercel.app';

function request(urlPath) {
  const fullUrl = BASE_URL + urlPath;
  const start = performance.now();
  return new Promise((resolve) => {
    https.get(fullUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let ttfb = performance.now() - start;
      let data = '';
      res.on('data', chunk => {
        if (!data) ttfb = performance.now() - start;
        data += chunk;
      });
      res.on('end', () => {
        const totalTime = performance.now() - start;
        resolve({
          path: urlPath,
          status: res.statusCode,
          ttfb: Math.round(ttfb),
          totalTime: Math.round(totalTime),
          size: data.length,
          data
        });
      });
    }).on('error', (err) => {
      resolve({
        path: urlPath,
        status: 0,
        error: err.message
      });
    });
  });
}

async function runLiveVerification() {
  console.log(`=======================================================`);
  console.log(`VERIFYING LIVE VERCEL DEPLOYMENT:`);
  console.log(`URL: ${BASE_URL}`);
  console.log(`=======================================================\n`);

  // 1. Critical Failure A
  console.log(`--- [1] CRITICAL REVIEWER FAILURE A ---`);
  const critA = await request('/models/chat?capability=reasoning');
  console.log(`Route: /models/chat?capability=reasoning`);
  console.log(`Status: ${critA.status}`);
  console.log(`TTFB: ${critA.ttfb}ms | Total Time: ${critA.totalTime}ms | Size: ${critA.size} bytes`);
  const hasEmptyA = critA.data.includes('No models found');
  const has0ModelsA = critA.data.includes('>0 models<') || critA.data.includes('>0 Models<');
  console.log(`Has "No models found": ${hasEmptyA}`);
  console.log(`Has "0 models": ${has0ModelsA}`);
  console.log(`Contains DeepSeek: ${critA.data.includes('DeepSeek') || critA.data.includes('deepseek')}`);

  // Also API route for A
  const apiA = await request('/api/v1/models?card=chat&capability=reasoning');
  const apiAJson = JSON.parse(apiA.data);
  console.log(`API /api/v1/models?card=chat&capability=reasoning => total: ${apiAJson.total}, count: ${apiAJson.count}`);

  // 2. Hub Page Visual Check
  console.log(`\n--- [2] /models HUB PAGE ---`);
  const hub = await request('/models');
  console.log(`Status: ${hub.status} | TTFB: ${hub.ttfb}ms | Size: ${hub.size} bytes`);
  console.log(`Contains "Trending Models": ${hub.data.includes('Trending Models')}`);
  console.log(`Contains "Top Vendors": ${hub.data.includes('Top Vendors')}`);
  console.log(`Contains "Capabilities": ${hub.data.includes('Capabilities')}`);

  // 3. Sample of Major Hub Cards
  console.log(`\n--- [3] AUDIT OF KEY REVIEWER CARDS ---`);
  const cardsToTest = [
    '/models/chat',
    '/models/openai',
    '/models/deepseek',
    '/models/anthropic',
    '/models/meta',
    '/models/google',
    '/models/coding',
    '/models/vision',
    '/models/open-weights',
    '/models/small-models',
    '/models/flagship-models',
    '/models/text-generation',
    '/models/multimodal',
    '/models/audio'
  ];

  let passedCards = 0;
  for (const card of cardsToTest) {
    const res = await request(card);
    const hasEmpty = res.data.includes('No models found');
    const isSuccess = res.status === 200 && !hasEmpty;
    if (isSuccess) passedCards++;
    console.log(`${card.padEnd(28)} => HTTP ${res.status} | TTFB ${String(res.ttfb).padStart(3)}ms | Size: ${String(res.size).padStart(7)} bytes | Empty: ${hasEmpty}`);
  }
  console.log(`Key Cards Passed: ${passedCards}/${cardsToTest.length}`);

  // 4. Mapped Academic Papers
  console.log(`\n--- [4] VERIFY MAPPED PAPERS IN DRAWER DATA ---`);
  const apiModels = await request('/api/v1/models?limit=100');
  const apiModelsJson = JSON.parse(apiModels.data);
  const modelsWithPapers = apiModelsJson.data.filter(m => m.papers && m.papers.length > 0);
  console.log(`Models in top 100 with mapped papers: ${modelsWithPapers.length}/100`);
  modelsWithPapers.slice(0, 5).forEach(m => {
    console.log(`- ${m.name} (${m.vendor}): ${m.papers.map(p => p.title.slice(0, 40) + '... (' + p.arxiv_id + ')').join(', ')}`);
  });

  // 5. Drawer and deep link
  console.log(`\n--- [5] DEEP LINKING TEST ---`);
  const deepLink = await request('/models/chat?model=deepseek-ai%2FDeepSeek-R1');
  console.log(`/models/chat?model=deepseek-ai%2FDeepSeek-R1 => Status: ${deepLink.status} | Size: ${deepLink.size}`);
  console.log(`Contains DeepSeek-R1 text: ${deepLink.data.includes('DeepSeek-R1')}`);

  console.log(`\n=======================================================`);
  console.log(`LIVE VERIFICATION COMPLETE`);
  console.log(`=======================================================`);
}

runLiveVerification().catch(console.error);
