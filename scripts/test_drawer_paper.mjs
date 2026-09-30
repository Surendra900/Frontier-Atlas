import { chromium } from 'playwright';

async function testDrawer() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://frontend-gejrxvih2-httplocalhost5173planner.vercel.app/models/chat', { waitUntil: 'networkidle' });

  // Locate the first row that has a mapped research paper
  const rowWithPaper = page.locator('tbody tr', { has: page.locator('a[href^="/papers/"]') }).first();
  const rowText = await rowWithPaper.innerText();
  console.log('Row with paper found:', rowText.replace(/\n/g, ' '));

  // Click on the row (not the paper link) to open drawer
  await rowWithPaper.locator('td').first().click();
  await page.waitForTimeout(1000);

  // Inspect drawer
  const drawer = page.locator('.fixed.inset-0').first();
  const drawerText = await drawer.innerText();
  console.log('Drawer opened:', (await drawer.locator('h2').first().innerText()));
  console.log('Drawer has Mapped Research Papers:', drawerText.includes('Mapped Research Papers'));
  console.log('Drawer has paper link:', await drawer.locator('a[href^="/papers/"]').count() > 0);
  console.log('Drawer has Paper Role badge:', drawerText.includes('Introduced In') || drawerText.includes('Family Paper') || drawerText.includes('introduced'));

  await browser.close();
}
testDrawer();
