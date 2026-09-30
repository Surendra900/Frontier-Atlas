import http from 'http';
import https from 'https';

async function fetchArxivMeta(arxivId) {
  const url = `https://export.arxiv.org/api/query?id_list=${arxivId}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        // Parse basic XML fields
        const titleMatch = data.match(/<entry>[\s\S]*?<title>([\s\S]*?)<\/title>/);
        const summaryMatch = data.match(/<summary>([\s\S]*?)<\/summary>/);
        const publishedMatch = data.match(/<published>([\s\S]*?)<\/published>/);
        
        const authors = [];
        const authorRegex = /<author>\s*<name>([\s\S]*?)<\/name>/g;
        let match;
        while ((match = authorRegex.exec(data)) !== null) {
          authors.push(match[1].trim());
        }

        resolve({
          arxivId,
          title: titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : null,
          abstract: summaryMatch ? summaryMatch[1].trim().replace(/\s+/g, ' ') : null,
          publishedDate: publishedMatch ? publishedMatch[1].trim() : null,
          authors: authors.length > 0 ? authors : ['Author']
        });
      });
    }).on('error', reject);
  });
}

async function test() {
  const gpt4 = await fetchArxivMeta('2303.08774');
  console.log('Fetched arXiv 2303.08774 (GPT-4):', gpt4);
  const r1 = await fetchArxivMeta('2501.12948');
  console.log('Fetched arXiv 2501.12948 (DeepSeek-R1):', r1.title, r1.authors.slice(0, 3));
}

test().catch(console.error);
