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

async function generateThumbnail(
  pdfUrl: string,
  slug: string
): Promise<string | null> {
  const outPath = path.join(THUMB_DIR, `${slug}.jpg`);
  if (fs.existsSync(outPath)) return `/thumbnails/${slug}.jpg`;

  try {
    const resp = await fetch(pdfUrl, { signal: AbortSignal.timeout(30000) });
    if (!resp.ok) {
      console.error(`  Fetch failed for ${slug}: HTTP ${resp.status}`);
      return null;
    }
    const pdfData = await resp.arrayBuffer();
    if (pdfData.byteLength < 1000) {
      console.error(`  PDF too small for ${slug}: ${pdfData.byteLength} bytes`);
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
    console.error(`  Error for ${slug}: ${err.message?.slice(0, 100) || err}`);
    return null;
  }
}

function pathToFileURL(p: string): string {
  return "file://" + p.replace(/\\/g, "/");
}

async function main() {
  console.log("Querying papers needing thumbnails...");
  // First, mark papers without pdfUrl as empty to avoid retrying
  await prisma.$executeRawUnsafe(
    `UPDATE papers SET thumbnail_url = '' WHERE (thumbnail_url IS NULL OR thumbnail_url LIKE '%thum.io%' OR thumbnail_url = '') AND pdf_url IS NULL`
  );
  console.log("Marked papers without pdfUrl as empty");

  const papers: Array<{ slug: string; pdfUrl: string | null }> =
    await prisma.$queryRawUnsafe(
      `SELECT slug::text, pdf_url::text AS "pdfUrl" FROM papers WHERE (thumbnail_url IS NULL OR thumbnail_url LIKE '%thum.io%' OR thumbnail_url = '') AND pdf_url IS NOT NULL`
    );

  console.log(`Found ${papers.length} papers to process`);

  if (!fs.existsSync(THUMB_DIR)) {
    fs.mkdirSync(THUMB_DIR, { recursive: true });
  }

  let success = 0;
  let failed = 0;
  const BATCH_SIZE = 10;

  for (let i = 0; i < papers.length; i += BATCH_SIZE) {
    const batch = papers.slice(i, i + BATCH_SIZE);
    console.log(
      `\nBatch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(papers.length / BATCH_SIZE)}`
    );

    const results = await Promise.all(
      batch.map(async (p) => {
        if (!p.pdfUrl) return { slug: p.slug, url: null };
        const url = await generateThumbnail(p.pdfUrl, p.slug);
        return { slug: p.slug, url };
      })
    );

    for (const r of results) {
      if (r.url) {
        await prisma.$executeRawUnsafe(
          `UPDATE papers SET thumbnail_url = $1 WHERE slug = $2`,
          r.url,
          r.slug
        );
        success++;
      } else {
        // Mark as empty string so we don't retry broken PDFs
        await prisma.$executeRawUnsafe(
          `UPDATE papers SET thumbnail_url = '' WHERE slug = $1 AND (thumbnail_url IS NULL OR thumbnail_url LIKE '%thum.io%')`,
          r.slug
        );
        failed++;
      }
    }

    console.log(`  Progress: ${success} succeeded, ${failed} failed`);
  }

  console.log(`\nDone! ${success} thumbnails generated, ${failed} failed`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("FATAL:", e.message || e);
  process.exit(1);
});
