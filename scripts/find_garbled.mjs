import fs from 'fs';
import path from 'path';

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === 'node_modules' || f === '.next' || f === '.git' || f === 'docs') continue;
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (/\.(tsx|ts|js|jsx|json)$/.test(f)) {
      const c = fs.readFileSync(full, 'utf8');
      if (c.includes('â€”') || c.includes('â€¦') || c.includes('âš¡') || c.includes('â†') || c.includes('Â·') || c.includes('â€')) {
        console.log('Matches in:', full);
      }
    }
  }
}

walk('frontend');
walk('scripts');
