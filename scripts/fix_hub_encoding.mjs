import fs from 'fs';

const filePath = 'frontend/app/models/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace any sequence starting with â
content = content.replace(/â†\s*/g, '← ');
content = content.replace(/â[^\s]+/g, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed remaining â occurrences.');
