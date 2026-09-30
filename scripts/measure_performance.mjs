import https from 'https';

const BASE_URL = 'https://frontend-1y4s17f3m-httplocalhost5173planner.vercel.app';

function measure(urlPath) {
  return new Promise((resolve) => {
    const start = performance.now();
    let ttfb = 0;
    https.get(BASE_URL + urlPath, (res) => {
      res.once('data', () => {
        ttfb = performance.now() - start;
      });
      res.on('data', () => {});
      res.on('end', () => {
        const total = performance.now() - start;
        resolve({
          path: urlPath,
          status: res.statusCode,
          ttfb: Math.round(ttfb || total),
          total: Math.round(total)
        });
      });
    }).on('error', (err) => {
      resolve({ path: urlPath, error: err.message });
    });
  });
}

async function run() {
  const paths = [
    '/models',
    '/models/chat',
    '/models/chat?capability=reasoning',
    '/api/v1/models?limit=50',
    '/api/v1/models/card-meta?slug=chat',
    '/api/v1/models/facets'
  ];

  console.log('--- COLD RUN ---');
  const coldResults = [];
  for (const p of paths) {
    const r = await measure(p);
    coldResults.push(r);
    console.log(`${p.padEnd(35)} => Status ${r.status} | TTFB ${r.ttfb}ms | Total ${r.total}ms`);
  }

  console.log('\n--- WARM RUN ---');
  const warmResults = [];
  for (const p of paths) {
    const r = await measure(p);
    warmResults.push(r);
    console.log(`${p.padEnd(35)} => Status ${r.status} | TTFB ${r.ttfb}ms | Total ${r.total}ms`);
  }

  return { coldResults, warmResults };
}

run().catch(console.error);
