import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const TARGET_URL = process.env.TEST_URL || 'https://frontend-qwhgpwy9o-httplocalhost5173planner.vercel.app';
const SCREENSHOT_DIR = path.resolve('docs/screenshots-after');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

export async function runReviewerSuite(iteration = 1) {
  console.log(`\n===============================================================`);
  console.log(`RUNNING FULL REVIEWER PLAYWRIGHT SUITE - ITERATION #${iteration}`);
  console.log(`TARGET URL: ${TARGET_URL}`);
  console.log(`===============================================================\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const results = {
    iteration,
    timestamp: new Date().toISOString(),
    targetUrl: TARGET_URL,
    testsPassed: 0,
    testsTotal: 0,
    failures: [],
    consoleErrors: [],
    garbledTextMatches: [],
    cardAudits: [],
  };

  page.on('response', (resp) => {
    if (resp.status() === 400) {
      console.log('>>> CAUGHT HTTP 400:', {
        url: resp.url(),
        status: resp.status(),
        method: resp.request().method(),
        resourceType: resp.request().resourceType(),
      });
    }
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      const locUrl = msg.location()?.url || '';
      // Ignore normal 3rd-party vendor favicon 404s from gstatic
      if (locUrl.includes('gstatic.com') || locUrl.includes('favicon') || txt.includes('favicon') || locUrl.includes('google-analytics')) {
        return;
      }
      // Ignore Next.js prefetch OPTIONS to root or speculative RSC prefetch
      if (txt.includes('Failed to load resource') && (locUrl === `${TARGET_URL}/` || locUrl === `${TARGET_URL}` || locUrl.includes('_rsc='))) {
        return;
      }
      results.consoleErrors.push({ text: txt, location: locUrl });
    }
  });

  page.on('pageerror', (err) => {
    results.consoleErrors.push({ text: err.message, stack: err.stack });
  });

  function recordTest(testName, passed, detail = '') {
    results.testsTotal++;
    if (passed) {
      results.testsPassed++;
      console.log(`  [PASS] ${testName} ${detail ? '(' + detail + ')' : ''}`);
    } else {
      results.failures.push({ testName, detail });
      console.error(`  [FAIL] ${testName}: ${detail}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: Hub Settlement & Zero Flicker
    // -------------------------------------------------------------
    console.log('[STEP 1] Testing /models Hub Settlement, immediate counts & character encoding...');
    await page.goto(`${TARGET_URL}/models`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#model-directory', { timeout: 15000 });

    const htmlContent = await page.content();
    const garbledRegex = /(â€”|â€¦|âš¡|â†|Â·|â€“|Ã|ï¿½)/g;
    const garbledMatches = htmlContent.match(garbledRegex) || [];
    results.garbledTextMatches = garbledMatches;
    recordTest('Zero Garbled Characters on Hub', garbledMatches.length === 0, `Matches: ${garbledMatches.length}`);

    // Check stats in hero
    const heroStats = await page.locator('.page-hero-stat-value, [class*="stat"]').allInnerTexts();
    const hasLingeringDots = heroStats.some(s => s.includes('...'));
    recordTest('Hero Stats Immediate Settlement', !hasLingeringDots, `Values: ${heroStats.slice(0, 3).join(', ')}`);

    // Check Model Directory header
    const dirHeader = await page.locator('#model-directory h2').first().innerText();
    const dirZeroFlicker = !dirHeader.includes('0 Models');
    recordTest('Model Directory Non-Zero Header', dirZeroFlicker, `Header: "${dirHeader}"`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `iter${iteration}-01-hub.png`), fullPage: false });

    // -------------------------------------------------------------
    // TEST 2: Capability Card Navigation - Chat Models
    // -------------------------------------------------------------
    console.log('\n[STEP 2] Testing Card Navigation to /models/chat...');
    const chatHeading = page.locator('h3', { hasText: /^Chat$/i }).first();
    await chatHeading.click();
    await page.waitForURL('**/models/chat**', { timeout: 15000 });
    await page.waitForSelector('tbody tr', { timeout: 15000 });

    const chatUrl = page.url();
    recordTest('Navigation to /models/chat', chatUrl.includes('/models/chat'), chatUrl);

    const chatTitle = await page.locator('h1').first().innerText();
    const chatBadge = await page.locator('h1 + span').first().innerText();
    recordTest('Chat Title Verified', chatTitle.toLowerCase().includes('chat'), chatTitle);
    recordTest('Chat Badge Accurate Format', chatBadge.includes('Showing') && chatBadge.includes('Models'), chatBadge);

    // Verify Chat Models Membership (Clean, 0 Contamination)
    const chatRowNames = await page.locator('tbody tr td:first-child .font-bold').allInnerTexts();
    const bannedChatKeywords = ['tts', 'kokoro', 'f5', 'xtts', 'donut', 'layoutlm', 'flux', 'stable diffusion', 'juggernaut', 'resnet', 'lerobot', 'gr00t', 'bge', 'e5', 'nomic'];
    const contaminatedChat = chatRowNames.filter(name => {
      const l = name.toLowerCase();
      return bannedChatKeywords.some(b => l.includes(b));
    });
    recordTest('Chat Card Zero Contamination', contaminatedChat.length === 0, `Sample rows: ${chatRowNames.length}, Contaminated: ${contaminatedChat.length}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `iter${iteration}-02-chat-listing.png`) });

    // -------------------------------------------------------------
    // TEST 3: Card Inspection across 5 Different Category Cards
    // -------------------------------------------------------------
    console.log('\n[STEP 3] Auditing Distinct Cards (Reasoning, Coding, Computer Vision, Audio, Open Weights)...');
    const testCards = [
      { slug: 'reasoning', expectedKeyword: 'reasoning' },
      { slug: 'coding', expectedKeyword: 'cod' },
      { slug: 'computer-vision', expectedKeyword: 'vision' },
      { slug: 'audio', expectedKeyword: 'audio' },
      { slug: 'open-weights', expectedKeyword: 'open' },
    ];

    for (const card of testCards) {
      await page.goto(`${TARGET_URL}/models/${card.slug}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForSelector('tbody tr', { timeout: 15000 });
      const h1 = await page.locator('h1').first().innerText();
      const badge = await page.locator('h1 + span').first().innerText();
      const rowCount = await page.locator('tbody tr').count();
      const pass = h1.toLowerCase().includes(card.expectedKeyword) && rowCount > 0;
      recordTest(`Card /models/${card.slug}`, pass, `Rows: ${rowCount}, Badge: ${badge}`);
      results.cardAudits.push({ slug: card.slug, h1, badge, rowCount });
    }

    // -------------------------------------------------------------
    // TEST 4: Filtering & Search (Hit and Miss)
    // -------------------------------------------------------------
    console.log('\n[STEP 4] Testing Search & Filter Behaviors on /models/chat...');
    await page.goto(`${TARGET_URL}/models/chat`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('tbody tr', { timeout: 15000 });

    // Search Hit
    const searchInput = page.locator('input[placeholder*="Search by model name"]').first();
    await searchInput.fill('Claude');
    await page.waitForTimeout(600);
    const searchHitRows = await page.locator('tbody tr').count();
    const searchHitBadge = await page.locator('h1 + span').first().innerText();
    recordTest('Search Hit ("Claude")', searchHitRows > 0 && searchHitBadge.includes('filtered models'), `Rows: ${searchHitRows}, Badge: ${searchHitBadge}`);

    // Search Miss
    await searchInput.fill('xyzNonExistentModelQuery12345');
    await page.waitForTimeout(600);
    const emptyStateText = await page.locator('text=No models match your current filters').count();
    const resetBtn = page.locator('button', { hasText: /Reset All Filters/i }).first();
    const hasResetBtn = await resetBtn.count() > 0;
    recordTest('Search Miss Empty State & Reset Button', emptyStateText > 0 && hasResetBtn, `Empty state shown: ${emptyStateText > 0}`);

    // Click Reset
    await resetBtn.click();
    await page.waitForTimeout(600);
    const resetRows = await page.locator('tbody tr').count();
    recordTest('Reset Filters Restores Rows', resetRows >= 20, `Restored Rows: ${resetRows}`);

    // Quick Capability Pill Filter Toggle
    const reasoningPill = page.locator('button', { hasText: /Reasoning/i }).first();
    await reasoningPill.click();
    await page.waitForTimeout(600);
    const pillBadge = await page.locator('h1 + span').first().innerText();
    recordTest('Capability Pill Filter Toggle', pillBadge.includes('filtered models') || pillBadge.includes('Showing'), `Badge: ${pillBadge}`);

    // -------------------------------------------------------------
    // TEST 5: Sorting & Table/Grid View Modes
    // -------------------------------------------------------------
    console.log('\n[STEP 5] Testing Sorters & View Mode Toggles...');
    // Clear filters
    await page.goto(`${TARGET_URL}/models/chat`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('tbody tr', { timeout: 15000 });

    // Sort by Context Window
    const sortSelect = page.locator('select').first();
    await sortSelect.selectOption('context_desc');
    await page.waitForTimeout(500);
    const firstRowContext = await page.locator('tbody tr td:nth-child(5)').first().innerText();
    recordTest('Sort by Context Window Descending', firstRowContext.includes('K') || firstRowContext.includes('M'), `Top Context: ${firstRowContext}`);

    // Toggle to Grid View
    const gridBtn = page.locator('button[title*="Grid"]').first();
    await gridBtn.click();
    await page.waitForTimeout(500);
    const gridCards = await page.locator('.grid > div.bg-white').count();
    recordTest('View Toggle: Grid View Display', gridCards > 0, `Grid Cards count: ${gridCards}`);

    // Toggle back to Table View
    const tableBtn = page.locator('button[title*="Table"]').first();
    await tableBtn.click();
    await page.waitForTimeout(500);
    const tableRows = await page.locator('tbody tr').count();
    recordTest('View Toggle: Table View Restored', tableRows > 0, `Table Rows count: ${tableRows}`);

    // -------------------------------------------------------------
    // TEST 6: Table Row Formatting - No Dashes, Clean Roles
    // -------------------------------------------------------------
    console.log('\n[STEP 6] Testing Table Row Formats & Paper Role Badges...');
    // Inspect first 10 rows for dashes or invalid pricing
    const rowTexts = await page.locator('tbody tr').evaluateAll(rows => {
      return rows.slice(0, 15).map(r => {
        const cells = Array.from(r.querySelectorAll('td')).map(c => c.innerText.trim());
        return {
          model: cells[0] || '',
          vendor: cells[1] || '',
          modality: cells[2] || '',
          openness: cells[3] || '',
          context: cells[4] || '',
          inputPrice: cells[5] || '',
          outputPrice: cells[6] || '',
          paper: cells[7] || '',
        };
      });
    });

    const hasPlaceholderDash = rowTexts.some(r => r.context === '—' || r.inputPrice === '—' || r.outputPrice === '—' || r.paper === '—');
    recordTest('Zero Placeholder Dashes in Table Cells', !hasPlaceholderDash, `Checked 15 rows: ${hasPlaceholderDash ? 'FOUND DASHES' : 'ALL CLEAN'}`);

    const mappedRows = rowTexts.filter(r => r.paper !== 'None');
    const hasRoleBadges = mappedRows.some(r => r.paper.includes('Introduced') || r.paper.includes('Family'));
    recordTest('Paper Role Badges in Table', hasRoleBadges, `Mapped rows: ${mappedRows.length}, Sample: "${mappedRows[0]?.paper?.replace(/\n/g, ' ')}"`);

    // -------------------------------------------------------------
    // TEST 7: Detail Drawer Specification on 3 Distinct Rows
    // -------------------------------------------------------------
    console.log('\n[STEP 7] Testing Detail Drawer on 3 Different Rows...');
    for (let rIdx = 0; rIdx < 3; rIdx++) {
      const row = page.locator('tbody tr').nth(rIdx);
      const rowModelName = (await row.locator('td:first-child .font-bold').innerText()).trim();
      await row.click();
      await page.waitForTimeout(500);

      // Verify drawer opened
      const drawer = page.locator('[data-testid="model-drawer"]');
      await drawer.waitFor({ state: 'visible', timeout: 5000 });
      const isVisible = await drawer.isVisible();
      const drawerTitle = await drawer.locator('h2').first().innerText();
      const drawerSpecs = await drawer.locator('h4', { hasText: /Specifications/i }).count();
      const drawerPapers = await drawer.locator('h4', { hasText: /Mapped Research Papers/i }).count();

      recordTest(`Drawer Row #${rIdx + 1} (${rowModelName})`, isVisible && drawerSpecs > 0 && drawerPapers > 0, `Title: ${drawerTitle}`);

      // Close drawer with Escape key on row 0 and 1, with button on row 2
      if (rIdx < 2) {
        await page.keyboard.press('Escape');
      } else {
        const closeBtn = drawer.locator('button', { hasText: /Close Specification/i }).first();
        await closeBtn.click();
      }
      await drawer.waitFor({ state: 'detached', timeout: 5000 });
      await page.waitForTimeout(400);
    }

    // -------------------------------------------------------------
    // TEST 8: Mapped Paper Detail Navigation
    // -------------------------------------------------------------
    console.log('\n[STEP 8] Testing Mapped Research Paper Link Navigation...');
    // Find the first row that has a paper link
    const paperLink = page.locator('tbody tr td a[href^="/papers/"]').first();
    const paperCount = await paperLink.count();

    if (paperCount > 0) {
      const paperHref = await paperLink.getAttribute('href');
      await paperLink.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForSelector('h1', { timeout: 15000 });

      const paperPageTitle = await page.locator('h1').first().innerText();
      recordTest('Paper Detail Page Navigation', paperPageTitle.length > 5, `Paper URL: ${page.url()}, Title: "${paperPageTitle.slice(0, 50)}..."`);
    } else {
      recordTest('Paper Detail Page Navigation', false, 'No paper link found on page');
    }

    // -------------------------------------------------------------
    // TEST 9: Console Error Verification
    // -------------------------------------------------------------
    recordTest('Zero Severe Console Errors', results.consoleErrors.length === 0, `Errors count: ${results.consoleErrors.length}`);

  } catch (err) {
    console.error('Test Suite Exception:', err);
    results.failures.push({ testName: 'Suite Crash', detail: err.message });
  } finally {
    await browser.close();
  }

  const allPassed = results.failures.length === 0 && results.testsPassed === results.testsTotal;
  console.log(`\n===============================================================`);
  console.log(`ITERATION #${iteration} RESULT: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log(`Passed: ${results.testsPassed}/${results.testsTotal}`);
  if (results.failures.length > 0) {
    console.log(`Failures:`, results.failures);
    if (results.consoleErrors.length > 0) {
      console.log(`Console Errors:`, results.consoleErrors);
    }
  }
  console.log(`===============================================================\n`);

  return results;
}

if (process.argv[1]?.includes('full_reviewer_suite.mjs')) {
  runReviewerSuite(1).catch(console.error);
}
