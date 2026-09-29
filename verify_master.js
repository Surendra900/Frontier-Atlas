const https = require('https');

function get(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: data.slice(0, 200) });
        }
      });
    });
    req.on('error', (err) => resolve({ status: 500, error: err.message }));
    req.setTimeout(15000, () => {
      req.destroy();
      resolve({ status: 408, error: 'Timeout' });
    });
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runAudit(targetName, baseUrl) {
  console.log(`\n============================================================`);
  console.log(` AUDITING TARGET: ${targetName} (${baseUrl})`);
  console.log(`============================================================\n`);

  const tests = [
    // Feed sortings
    { section: 'Feeds', name: 'Trending Papers', url: '/api/v1/research-papers?sort=trending&period=all' },
    { section: 'Feeds', name: 'Most GitHub Stars', url: '/api/v1/research-papers?sort=stars&period=all' },
    { section: 'Feeds', name: 'Latest Papers', url: '/api/v1/research-papers?sort=latest&period=all' },
    
    // Tasks
    { section: 'Tasks', name: 'Large Language Models', url: '/api/v1/research-papers?task=large-language-models&period=all' },
    { section: 'Tasks', name: 'Agents', url: '/api/v1/research-papers?task=agents&period=all' },
    { section: 'Tasks', name: 'Reasoning Models', url: '/api/v1/research-papers?task=reasoning-models&period=all' },
    { section: 'Tasks', name: 'Vision-Language Models', url: '/api/v1/research-papers?task=vision-language-models&period=all' },
    { section: 'Tasks', name: 'Multimodal Models', url: '/api/v1/research-papers?task=multimodal-models&period=all' },
    { section: 'Tasks', name: 'World Models', url: '/api/v1/research-papers?task=world-models&period=all' },
    { section: 'Tasks', name: 'Robotics', url: '/api/v1/research-papers?task=robotics&period=all' },
    { section: 'Tasks', name: 'Small Language Models', url: '/api/v1/research-papers?task=small-language-models&period=all' },

    // Methods
    { section: 'Methods', name: 'Transformers', url: '/api/v1/research-papers?method=transformer&period=all' },
    { section: 'Methods', name: 'Diffusion Models', url: '/api/v1/research-papers?method=diffusion-models&period=all' },
    { section: 'Methods', name: 'Mixture of Experts', url: '/api/v1/research-papers?method=mixture-of-experts&period=all' },
    { section: 'Methods', name: 'Reinforcement Learning', url: '/api/v1/research-papers?method=policy-learning&period=all' },
    { section: 'Methods', name: 'Chain of Thought', url: '/api/v1/research-papers?method=chain-of-thought&period=all' },
    { section: 'Methods', name: 'LoRA', url: '/api/v1/research-papers?method=lora&period=all' },
    { section: 'Methods', name: 'RLHF', url: '/api/v1/research-papers?method=rlhf&period=all' },
  ];

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    let res = await get(baseUrl + t.url);
    if (res.status !== 200 && res.error) {
      await sleep(1500);
      res = await get(baseUrl + t.url);
    }
    const papers = res.json?.data?.papers || [];
    const count = papers.length;
    const ok = res.status === 200 && count > 0;
    if (ok) passed++;
    else failed++;

    const topTitle = count > 0 ? `"${papers[0].title.slice(0, 45)}..." (${papers[0].githubStars || 0}★)` : 'None';
    console.log(`[${t.section}] ${t.name.padEnd(25)} | HTTP ${res.status} | Papers: ${String(count).padStart(2)} | Top: ${topTitle}`);
    await sleep(200);
  }

  // HTML Routes
  console.log(`\n--- SSR Page Routes ---`);
  const pages = [
    '/',
    '/?task=large-language-models',
    '/?task=reasoning',
    '/?sort=trending',
    '/?sort=stars',
    '/?sort=latest',
    '/tasks',
    '/tasks/large-language-models',
    '/tasks/reasoning',
    '/tasks/agents',
    '/tasks/small-language-models',
    '/methods',
    '/benchmarks',
    '/models',
    '/organizations',
  ];

  for (const p of pages) {
    const res = await get(baseUrl + p);
    const ok = res.status === 200;
    if (ok) passed++;
    else failed++;
    console.log(`Route ${p.padEnd(35)} | HTTP ${res.status}`);
    await sleep(150);
  }

  console.log(`\nTARGET SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  return failed === 0;
}

async function main() {
  const vercelOk = await runAudit('VERCEL PRODUCTION', 'https://frontend-httplocalhost5173planner.vercel.app');
  const tunnelOk = await runAudit('CLOUDFLARE LIVE TUNNEL', 'https://gsm-informal-familiar-infections.trycloudflare.com');

  console.log(`\n============================================================`);
  console.log(` FINAL MASTER AUDIT RESULT`);
  console.log(` Vercel Status:     ${vercelOk ? '100% OPERATIONAL (ALL TESTS PASSED)' : 'SOME FAILED'}`);
  console.log(` Cloudflare Status: ${tunnelOk ? '100% OPERATIONAL (ALL TESTS PASSED)' : 'SOME FAILED'}`);
  console.log(`============================================================\n`);
}

main().catch(console.error);
