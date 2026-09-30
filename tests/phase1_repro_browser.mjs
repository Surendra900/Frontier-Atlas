import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const DEPLOYED_URL = 'https://frontend-1y4s17f3m-httplocalhost5173planner.vercel.app';
const ORIGINAL_PROD_URL = 'https://frontieratlas.co';

const SCREENSHOT_DIR = path.resolve('docs/screenshots-before');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function auditPage(page, url, pageName) {
  console.log(`\n======================================================`);
  console.log(`AUDITING IN BROWSER: ${url}`);
  console.log(`======================================================`);

  const consoleLogs = [];
  const failedRequests = [];
  const networkRequests = [];

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleLogs.push({ type, text });
    if (type === 'error' || text.includes('Hydration') || text.includes('Warning')) {
      console.log(`[Browser Console ${type}]:`, text.slice(0, 150));
    }
  });

  page.on('response', resp => {
    networkRequests.push({ url: resp.url(), status: resp.status() });
    if (resp.status() >= 400) {
      failedRequests.push({ url: resp.url(), status: resp.status() });
      console.log(`[Failed Network Request]: HTTP ${resp.status} - ${resp.url()}`);
    }
  });

  const start = performance.now();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  const domLoadedTime = performance.now() - start;

  // Wait for network idle plus 3 seconds as required by prompt
  try {
    await page.waitForLoadState('networkidle', { timeout: 15000 });
  } catch (e) {
    console.log('Network idle timed out, waiting 3s anyway');
  }
  await page.waitForTimeout(3000);
  const totalSettledTime = performance.now() - start;

  const screenshotPath = path.join(SCREENSHOT_DIR, `${pageName}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Saved screenshot to ${screenshotPath}`);

  // Extract page content details
  const pageDetails = await page.evaluate(() => {
    const text = document.body.innerText;
    const hasGarbled = text.includes('â€”') || text.includes('â€') || text.includes('Ã');
    const heroStats = Array.from(document.querySelectorAll('.stat, [class*="stat"], [class*="Hero"]'))
      .map(el => el.innerText.trim()).filter(Boolean);
    
    // Check cards in capability, family, org, research sections
    const capabilityCards = document.querySelectorAll('#section-capability a, [id*="capability"] a').length;
    const familyCards = document.querySelectorAll('#section-family a, [id*="family"] a').length;
    const orgCards = document.querySelectorAll('#section-organization a, [id*="org"] a').length;
    const researchCards = document.querySelectorAll('#section-research a, [id*="research"] a').length;
    const trendingCards = document.querySelectorAll('#section-trending a, [id*="trending"] a').length;

    // Check directory count
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => h.innerText.trim());

    return {
      title: document.title,
      textSnippet: text.slice(0, 500).replace(/\n+/g, ' '),
      hasGarbled,
      capabilityCards,
      familyCards,
      orgCards,
      researchCards,
      trendingCards,
      headings: headings.slice(0, 15)
    };
  });

  return {
    url,
    domLoadedTime: Math.round(domLoadedTime),
    totalSettledTime: Math.round(totalSettledTime),
    pageDetails,
    failedRequests,
    consoleErrors: consoleLogs.filter(l => l.type === 'error' || l.text.includes('Hydration'))
  };
}

async function runPhase1() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const results = {};

  // 1. Auditing Deployed Hub: /models
  results.deployedHub = await auditPage(page, `${DEPLOYED_URL}/models`, 'deployed-hub-models');

  // 2. Auditing Original Production Hub: https://frontieratlas.co/models
  results.originalHub = await auditPage(page, `${ORIGINAL_PROD_URL}/models`, 'original-prod-hub-models');

  // 3. Auditing Deployed Listing: /models/chat
  results.deployedChat = await auditPage(page, `${DEPLOYED_URL}/models/chat`, 'deployed-models-chat');

  // 4. Auditing Deployed Listing with Filter: /models/chat?capability=reasoning
  results.deployedChatReasoning = await auditPage(page, `${DEPLOYED_URL}/models/chat?capability=reasoning`, 'deployed-chat-reasoning');

  // 5. Test Filters and Interaction on /models/chat
  console.log(`\n--- INTERACTION TEST ON /models/chat ---`);
  await page.goto(`${DEPLOYED_URL}/models/chat`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Click Table / Grid toggle
  const viewToggleButtons = await page.$$('button:has-text("Table"), button:has-text("Grid")');
  console.log(`Found view toggle buttons: ${viewToggleButtons.length}`);
  if (viewToggleButtons.length > 0) {
    await viewToggleButtons[0].click();
    await page.waitForTimeout(500);
  }

  // Click first model row to open drawer
  const firstRow = await page.$('table tbody tr, [class*="ModelCard"]');
  let drawerOpened = false;
  if (firstRow) {
    await firstRow.click();
    await page.waitForTimeout(1000);
    drawerOpened = await page.evaluate(() => {
      return !!document.querySelector('[role="dialog"], [class*="drawer"], [class*="Drawer"], aside');
    });
    console.log(`Drawer opened on model row click: ${drawerOpened}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'drawer-opened.png') });
  }

  // Check paper link: gpt-4-technical-report
  console.log(`\n--- PAPER PAGE TEST IN BROWSER ---`);
  results.paperPage = await auditPage(page, `${DEPLOYED_URL}/papers/gpt-4-technical-report---2303.08774`, 'paper-gpt4-corrupted');

  await browser.close();

  fs.writeFileSync('docs/phase1_raw_results.json', JSON.stringify(results, null, 2));
  console.log(`\nPhase 1 browser audit raw results saved to docs/phase1_raw_results.json`);
}

runPhase1().catch(console.error);
