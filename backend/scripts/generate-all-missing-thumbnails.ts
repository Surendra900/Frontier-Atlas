import "dotenv/config";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "@napi-rs/canvas";
import { prisma } from "../src/lib/prisma.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STANDARD_FONT_DIR = path.resolve(
  __dirname,
  "../node_modules/pdfjs-dist/standard_fonts"
);

const THUMB_DIR = path.resolve(__dirname, "../../frontend/public/thumbnails");
const THUMB_WIDTH = 400;
const THUMB_SCALE = 1.0;

function pathToFileURL(p: string): string {
  return "file://" + p.replace(/\\/g, "/");
}

function cleanArxivId(id?: string | null): string | null {
  if (!id) return null;
  const match = id.match(/(?:arxiv\.org\/(?:abs|pdf)\/|arxiv:\s*|^)([a-z\-]+(?:\.[a-z\-]+)?\/\d+|\d{4}\.\d{4,5}(?:v\d+)?)/i);
  if (match && match[1]) return match[1].replace(/\.pdf$/i, "");
  return id.replace(/^arxiv:/i, "").replace(/\.pdf$/i, "");
}

async function generateThumbnail(
  pdfUrl: string,
  slug: string
): Promise<string | null> {
  const outPath = path.join(THUMB_DIR, `${slug}.jpg`);
  if (fs.existsSync(outPath)) {
    try {
      const stats = fs.statSync(outPath);
      if (stats.size > 1000) {
        return `/thumbnails/${slug}.jpg`;
      }
    } catch {}
  }

  try {
    const resp = await fetch(pdfUrl, { 
      signal: AbortSignal.timeout(25000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!resp.ok) {
      return null;
    }

    const pdfData = await resp.arrayBuffer();
    if (pdfData.byteLength < 1000) {
      return null;
    }

    const pdf = await getDocument({
      data: pdfData,
      standardFontDataUrl: pathToFileURL(STANDARD_FONT_DIR + "/"),
    }).promise;

    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: THUMB_SCALE });
    const scale = THUMB_WIDTH / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const canvas = createCanvas(scaledViewport.width, scaledViewport.height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;

    if (!fs.existsSync(THUMB_DIR)) {
      fs.mkdirSync(THUMB_DIR, { recursive: true });
    }

    const buf = canvas.toBuffer("image/jpeg");
    fs.writeFileSync(outPath, buf);
    try { (pdf as any).destroy(); } catch {}
    return `/thumbnails/${slug}.jpg`;
  } catch (err: any) {
    return null;
  }
}

async function main() {
  if (!fs.existsSync(THUMB_DIR)) {
    fs.mkdirSync(THUMB_DIR, { recursive: true });
  }

  console.log("Finding papers needing thumbnails...");
  const papers = await prisma.paper.findMany({
    where: {
      OR: [
        { thumbnailUrl: null },
        { thumbnailUrl: "" },
        { thumbnailUrl: { contains: "thum.io" } }
      ],
      AND: [
        {
          OR: [
            { arxivId: { not: null } },
            { pdfUrl: { not: null } },
            { paperUrl: { not: null } }
          ]
        }
      ]
    },
    select: { id: true, slug: true, title: true, arxivId: true, pdfUrl: true, paperUrl: true }
  });

  console.log(`Found ${papers.length} papers to process.`);

  const CONCURRENCY = 6;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < papers.length; i += CONCURRENCY) {
    const batch = papers.slice(i, i + CONCURRENCY);
    
    await Promise.all(
      batch.map(async (p) => {
        let pdf = p.pdfUrl;
        const arxiv = cleanArxivId(p.arxivId || p.paperUrl);
        if (!pdf && arxiv) {
          pdf = `https://arxiv.org/pdf/${arxiv}.pdf`;
        }

        if (!pdf) {
          failCount++;
          return;
        }

        const thumbUrl = await generateThumbnail(pdf, p.slug);
        if (thumbUrl) {
          await prisma.paper.update({
            where: { id: p.id },
            data: { thumbnailUrl: thumbUrl }
          });
          successCount++;
          console.log(`[${successCount + failCount}/${papers.length}]  Generated for: ${p.title.slice(0, 50)}...`);
        } else {
          // If PDF render failed, check if HF social thumbnail is available
          if (arxiv) {
            const hfId = arxiv.replace(/v\d+$/i, "");
            const hfUrl = `https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/${hfId}.png`;
            try {
              const hfRes = await fetch(hfUrl, { method: "HEAD", signal: AbortSignal.timeout(5000) });
              if (hfRes.ok) {
                await prisma.paper.update({
                  where: { id: p.id },
                  data: { thumbnailUrl: hfUrl }
                });
                successCount++;
                console.log(`[${successCount + failCount}/${papers.length}]  HF Thumbnail used for: ${p.title.slice(0, 50)}...`);
                return;
              }
            } catch {}
          }
          failCount++;
          console.log(`[${successCount + failCount}/${papers.length}] ❌ Failed for: ${p.title.slice(0, 50)}...`);
        }
      })
    );
  }

  console.log(`\nCompleted! Total Succeeded: ${successCount}, Failed: ${failCount}`);
  await prisma.$disconnect();
}

main().catch(console.error);
