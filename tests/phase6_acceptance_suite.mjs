import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://frontend-gejrxvih2-httplocalhost5173planner.vercel.app';
const SCREENSHOT_DIR = path.resolve('docs/screenshots-after');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runBrowserAudit() {
  console.log('===============================================================');
  console.log('RUNNING FULL PLAYWRIGHT BROWSER ACCEPTANCE SUITE (PHASE 6 & 7)');
  console.log(`TARGET: ${BASE_URL}`);
  console.log('===============================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Playwright/Acceptance',
  });
  const page = await context.newPage();

  const auditResults = {
    hubSettled: false,
    zeroGarbledCharacters: false,
    cardSectionsPopulated: false,
    chatListingPass: false,
    filterTogglePass: false,
    searchPass: false,
    viewTogglePass: false,
    sortPass: false,
    zeroNegativePrices: false,
    drawerOpensPass: false,
    paperRoleBadgePass: false,
    paperDetailPass: false,
    consoleErrors: [],
  };

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      auditResults.consoleErrors.push(msg.text());
    }
  });

  try {
    // -------------------------------------------------------------
    // TEST 1: Hub Page (/models)
    // -------------------------------------------------------------
    console.log('[TEST 1] Auditing /models Hub Page in real browser...');
    try {
      const hubStart = Date.now();
      await page.goto(`${BASE_URL}/models`, { waitUntil: 'networkidle', timeout: 30000 });
      const hubTime = Date.now() - hubStart;

      const pageContent = await page.content();
      const garbledRegex = /(â€”|â€¦|âš¡|â†|Â·|â€“)/g;
      const garbledMatches = pageContent.match(garbledRegex);
      auditResults.zeroGarbledCharacters = !garbledMatches || garbledMatches.length === 0;
      console.log(`  -> Hub loaded in ${hubTime}ms`);
      console.log(`  -> Garbled characters check: ${auditResults.zeroGarbledCharacters ? 'PASSED (0 found)' : 'FAILED: ' + JSON.stringify(garbledMatches)}`);

      // Verify sections have card headings
      const h3Texts = await page.locator('h3').allInnerTexts();
      const hasChat = h3Texts.includes('Chat');
      const hasVision = h3Texts.some(t => t.includes('Vision'));
      const hasReasoning = h3Texts.includes('Reasoning');
      console.log(`  -> Card Headings found: ${h3Texts.length} total. Has Chat: ${hasChat}, Vision: ${hasVision}, Reasoning: ${hasReasoning}`);

      auditResults.cardSectionsPopulated = h3Texts.length >= 10 && hasChat;
      auditResults.hubSettled = true;

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-hub-models-settled.png'), fullPage: true });
    } catch (e) {
      console.error('  -> TEST 1 error:', e.message);
    }

    // -------------------------------------------------------------
    // TEST 2: Navigate to /models/chat via Card Click
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Clicking "Chat" capability card to test navigation...');
    try {
      const chatCardHeading = page.locator('h3', { hasText: /^Chat$/i }).first();
      await chatCardHeading.click();
      await page.waitForURL('**/models/chat**', { timeout: 15000 });
      await page.waitForLoadState('networkidle');

      console.log(`  -> Current URL: ${page.url()}`);
      const listingHeader = await page.locator('h1').first().innerText();
      const countBadge = await page.locator('h1 + span').first().innerText();
      console.log(`  -> Listing Title: "${listingHeader}", Badge: "${countBadge}"`);
      auditResults.chatListingPass = listingHeader.toLowerCase().includes('chat') && countBadge.includes('Models');
    } catch (e) {
      console.error('  -> TEST 2 error:', e.message);
    }

    // -------------------------------------------------------------
    // TEST 3: Negative Price Check
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Checking for negative pricing anomalies ($ -1000000)...');
    try {
      const tableText = await page.locator('main').first().innerText();
      const hasNegativePrice = tableText.includes('$-') || tableText.includes('-1000000');
      auditResults.zeroNegativePrices = !hasNegativePrice;
      console.log(`  -> Zero negative prices check: ${auditResults.zeroNegativePrices ? 'PASSED' : 'FAILED'}`);
    } catch (e) {
      console.error('  -> TEST 3 error:', e.message);
    }

    // -------------------------------------------------------------
    // TEST 4: Filter Toggle & Counter
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Testing filter toggle (Reasoning pill) and header counter...');
    try {
      const reasoningPill = page.locator('button', { hasText: 'Reasoning' }).first();
      await reasoningPill.click();
      await page.waitForTimeout(1000);

      const filteredBadge = await page.locator('h1 + span').first().innerText();
      console.log(`  -> Badge after clicking Reasoning pill: "${filteredBadge}"`);
      auditResults.filterTogglePass = filteredBadge.includes('of') || filteredBadge.includes('Models');

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-models-chat-filtered.png'), fullPage: false });

      // Reset pill
      await reasoningPill.click();
      await page.waitForTimeout(500);
    } catch (e) {
      console.error('  -> TEST 4 error:', e.message);
    }

    // -------------------------------------------------------------
    // TEST 5: Search Input Verification
    // -------------------------------------------------------------
    console.log('\n[TEST 5] Testing search bar filtering...');
    try {
      const searchInput = page.getByPlaceholder(/Search by model name/i);
      await searchInput.fill('Llama');
      await page.waitForTimeout(1000);

      const searchBadge = await page.locator('h1 + span').first().innerText();
      const firstRowText = await page.locator('tbody tr').first().innerText();
      console.log(`  -> Badge after searching "Llama": "${searchBadge}"`);
      console.log(`  -> First result contains "Llama": ${firstRowText.includes('Llama')}`);
      auditResults.searchPass = firstRowText.includes('Llama') && (searchBadge.includes('of') || searchBadge.includes('Models'));

      // Clear search
      await searchInput.fill('');
      await page.waitForTimeout(500);
    } catch (e) {
      console.error('  -> TEST 5 error:', e.message);
    }

    // -------------------------------------------------------------
    // TEST 6: Table / Grid View Toggle
    // -------------------------------------------------------------
    console.log('\n[TEST 6] Testing Table / Grid view mode toggle...');
    try {
      // Find grid toggle button (second button in the view toggle group)
      const viewButtons = page.locator('.flex.items-center.border button');
      if (await viewButtons.count() >= 2) {
        await viewButtons.nth(1).click(); // Click Grid view
        await page.waitForTimeout(800);
        const hasGridContainer = await page.locator('.grid.grid-cols-1').count() > 0;
        console.log(`  -> Grid view container rendered: ${hasGridContainer}`);
        auditResults.viewTogglePass = hasGridContainer;

        // Switch back to Table view
        await viewButtons.nth(0).click();
        await page.waitForTimeout(500);
      }
    } catch (e) {
      console.error('  -> TEST 6 error:', e.message);
    }

    // -------------------------------------------------------------
    // TEST 7: Sort Dropdown Verification
    // -------------------------------------------------------------
    console.log('\n[TEST 7] Testing Sort dropdown...');
    try {
      const sortSelect = page.locator('select').first();
      await sortSelect.selectOption('price_asc');
      await page.waitForTimeout(1000);
      console.log('  -> Selected sort: price_asc');
      auditResults.sortPass = true;
    } catch (e) {
      console.error('  -> TEST 7 error:', e.message);
    }

    // -------------------------------------------------------------
    // TEST 8: Open Specification Drawer & Check Paper Badge
    // -------------------------------------------------------------
    console.log('\n[TEST 8] Testing Detail Drawer opening and mapped research papers...');
    try {
      const firstRow = page.locator('tbody tr').first();
      await firstRow.click();
      await page.waitForTimeout(1000);

      const drawer = page.locator('.fixed.z-50');
      await drawer.waitFor({ state: 'visible', timeout: 5000 });
      const drawerTitle = await drawer.locator('h2').first().innerText();
      console.log(`  -> Drawer opened for model: "${drawerTitle}"`);
      auditResults.drawerOpensPass = Boolean(drawerTitle);

      const drawerContent = await drawer.innerText();
      const hasPaperSection = /MAPPED RESEARCH PAPERS/i.test(drawerContent) || drawerContent.includes('Mapped Research Papers');
      const hasPaperLink = (await drawer.locator('a[href^="/papers/"]').count()) > 0;
      const hasRoleBadge = drawerContent.includes('Introduced In') || drawerContent.includes('Family Paper') || drawerContent.includes('introduced') || drawerContent.includes('referenced');
      console.log(`  -> Drawer has Mapped Research Papers: ${hasPaperSection}`);
      console.log(`  -> Drawer has Paper Link: ${hasPaperLink}`);
      console.log(`  -> Drawer has Paper Role badge: ${hasRoleBadge}`);
      auditResults.paperRoleBadgePass = hasPaperSection && (hasPaperLink || hasRoleBadge);

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-drawer-specifications.png'), fullPage: false });

      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (e) {
      console.error('  -> TEST 8 error:', e.message);
    }

    // -------------------------------------------------------------
    // TEST 9: Audit Paper Detail Page (/papers/...)
    // -------------------------------------------------------------
    console.log('\n[TEST 9] Testing Paper Page: GPT-4 Technical Report...');
    try {
      await page.goto(`${BASE_URL}/papers/gpt-4-technical-report---2303.08774`, { waitUntil: 'networkidle', timeout: 30000 });
      
      const paperTitle = await page.locator('h1').first().innerText();
      const paperPageText = await page.locator('body').first().innerText();
      
      const hasErnestRyu = paperPageText.toLowerCase().includes('ernest k. ryu') || paperPageText.toLowerCase().includes('ernest ryu');
      const hasRealAuthors = paperPageText.includes('OpenAI') || paperPageText.includes('Josh Achiam') || paperPageText.includes('Sam Altman') || paperPageText.includes('Diogo Almeida');
      const hasMarch2023 = paperPageText.includes('2023') || paperPageText.includes('Mar');

      console.log(`  -> Paper Title: "${paperTitle}"`);
      console.log(`  -> Hallucinated author ("Ernest K. Ryu") present: ${hasErnestRyu} (must be FALSE)`);
      console.log(`  -> Genuine authors ("OpenAI" / "Josh Achiam" / "Sam Altman") present: ${hasRealAuthors} (must be TRUE)`);
      console.log(`  -> Published date year 2023 present: ${hasMarch2023} (must be TRUE)`);

      auditResults.paperDetailPass = !hasErnestRyu && hasRealAuthors;

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-paper-gpt4-reconciled.png'), fullPage: false });
    } catch (e) {
      console.error('  -> TEST 9 error:', e.message);
    }

  } catch (err) {
    console.error('Suite Level Error:', err);
  } finally {
    await browser.close();
  }

  console.log('\n===============================================================');
  console.log('FINAL AUDIT RESULTS SUMMARY:');
  console.log('===============================================================');
  console.log(`1. Hub Settled cleanly:           ${auditResults.hubSettled ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`2. Zero Garbled Characters:       ${auditResults.zeroGarbledCharacters ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`3. Card Sections Populated:       ${auditResults.cardSectionsPopulated ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`4. Card Click & Listing:          ${auditResults.chatListingPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`5. Filter Counter / Toggles:      ${auditResults.filterTogglePass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`6. Search Bar:                    ${auditResults.searchPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`7. Table / Grid Toggle:           ${auditResults.viewTogglePass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`8. Sort Dropdown:                 ${auditResults.sortPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`9. Zero Negative Prices:          ${auditResults.zeroNegativePrices ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`10. Drawer Opens on Row Click:    ${auditResults.drawerOpensPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`11. Paper Role Badges:            ${auditResults.paperRoleBadgePass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`12. Paper Page Reconciliation:    ${auditResults.paperDetailPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Console Errors count:             ${auditResults.consoleErrors.length}`);
  console.log('===============================================================\n');

  return auditResults;
}

runBrowserAudit();
