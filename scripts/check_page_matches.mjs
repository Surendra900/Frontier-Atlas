import fs from 'fs';

const c = fs.readFileSync('frontend/app/models/page.tsx', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('â€”') || l.includes('â€¦') || l.includes('âš¡') || l.includes('â†') || l.includes('Â·') || l.includes('â€')) {
    console.log((i+1) + ':', l);
  }
});
