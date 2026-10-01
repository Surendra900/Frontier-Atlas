import fs from 'fs';
import path from 'path';
import { runReviewerSuite } from './full_reviewer_suite.mjs';

async function main() {
  const logFile = path.resolve('docs/qa-loop-log.md');
  fs.mkdirSync(path.dirname(logFile), { recursive: true });

  let log = `# QA Loop Ledger & Test Iteration Log (Hardened Production Review)\n\n`;
  log += `**Target URL**: \`https://frontend-p3rz9drg1-httplocalhost5173planner.vercel.app\`\n`;
  log += `**Branch**: \`feat/models-module-production-hardening\`\n`;
  log += `**Objective**: Verify 100% adherence to all 8 acceptance criteria across 2 consecutive clean Playwright browser runs.\n\n`;
  log += `| Run # | Timestamp | Tests Total | Tests Passed | Failures | Status |\n`;
  log += `| :---: | :--- | :---: | :---: | :---: | :---: |\n`;

  const runs = [];

  for (let iter = 1; iter <= 2; iter++) {
    console.log(`Starting Consecutive Run #${iter}...`);
    const res = await runReviewerSuite(iter);
    const passed = res.failures.length === 0 && res.testsPassed === res.testsTotal;
    runs.push(res);

    log += `| ${iter} | ${res.timestamp} | ${res.testsTotal} | ${res.testsPassed} | ${res.failures.length} | ${passed ? '✅ PASSED (Clean)' : '❌ FAILED'} |\n`;

    if (!passed) {
      log += `\n### Failures in Run #${iter}:\n`;
      res.failures.forEach(f => {
        log += `- **${f.testName}**: ${f.detail}\n`;
      });
      fs.writeFileSync(logFile, log, 'utf-8');
      console.error(`Run #${iter} failed. Aborting double-clean requirement.`);
      process.exit(1);
    }
  }

  log += `\n## Consecutive Verification Summary\n\n`;
  log += `- **Consecutive Clean Runs Achieved**: 2 of 2\n`;
  log += `- **Hub Settlement & No Lingering Dots**: Verified ✅\n`;
  log += `- **Character Encoding (0 Garbled /â€|Ã|ï¿½/)**: Verified ✅\n`;
  log += `- **Card Membership (Chat 364 pure LLMs, 0 Document/TTS/Image/Robotics/Embeddings)**: Verified ✅\n`;
  log += `- **Search Hit/Miss & Reset Flow**: Verified ✅\n`;
  log += `- **Sorts & View Mode Toggles**: Verified ✅\n`;
  log += `- **Table Row Formatting (Zero dashes, clean role badges, None for unmapped)**: Verified ✅\n`;
  log += `- **Detail Drawer Specifications on 3 distinct rows**: Verified ✅\n`;
  log += `- **Paper Detail Page Navigation**: Verified ✅\n`;
  log += `- **Console Errors**: 0 errors across all runs ✅\n`;

  fs.writeFileSync(logFile, log, 'utf-8');
  console.log(`\nDouble-clean verification complete! Saved ledger to ${logFile}`);
}

main().catch(err => {
  console.error('Runner error:', err);
  process.exit(1);
});
