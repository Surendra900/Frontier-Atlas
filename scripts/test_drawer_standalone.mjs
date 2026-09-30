import { chromium } from 'playwright';

async function testSearch() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://frontend-gejrxvih2-httplocalhost5173planner.vercel.app/models/chat', { waitUntil: 'networkidle' });

  const input = page.getByPlaceholder(/Search by model name/i);
  await input.fill('Llama');
  await page.waitForTimeout(1000);

  const badge = await page.locator('h1 + span').first().innerText();
  console.log('Badge after searching "Llama":', badge);

  const rowTexts = await page.locator('tbody tr').allInnerTexts();
  console.log('Results count:', rowTexts.length);
  console.log('First 3 rows:\n', rowTexts.slice(0, 3).map(t => t.replace(/\n/g, ' ')));

  await browser.close();
}
testSearch();
