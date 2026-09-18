/**
 * importPapersWithGithub.ts
 *
 * Imports papers from papers_with_github.xlsx into the Neon database.
 * The sheet is expected to have the following columns:
 *   arxiv_id, title, authors, published_date, paper_url, pdf_url,
 *   github_url, github_stars, github_forks, language, thumbnail_url
 *
 * Run with:
 *   npx tsx scripts/importPapersWithGithub.ts
 */

import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";
import slugify from "slugify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
config({ path: path.join(__dirname, "..", ".env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing from .env");
}
const cleanUrl = connectionString.replace(/^"|"$/g, "");

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({
      connectionString: cleanUrl,
    })
  ),
});

// ── Resolve the xlsx file ─────────────────────────────────────────────────────
// Place papers_with_github.xlsx inside backend/ or backend/data/
function resolveXlsx(): string {
  const candidates = [
    path.join(__dirname, "..", "papers_with_github.xlsx"),
    path.join(__dirname, "..", "data", "papers_with_github.xlsx"),
  ];
  for (const p of candidates) {
    try {
      // will throw if file doesn't exist
      XLSX.readFile(p);
      return p;
    } catch {
      // try next
    }
  }
  throw new Error(
    "papers_with_github.xlsx not found. Place it in backend/ or backend/data/"
  );
}

const xlsxPath = resolveXlsx();
console.log(`Reading: ${xlsxPath}`);

const workbook = XLSX.readFile(xlsxPath);

// Try the first sheet if "papers_with_github" sheet name is not found
const sheetName =
  workbook.SheetNames.find((n) =>
    n.toLowerCase().includes("github")
  ) ?? workbook.SheetNames[0];

console.log(`Using sheet: "${sheetName}"`);

const rows = XLSX.utils.sheet_to_json<any>(workbook.Sheets[sheetName], {
  defval: null,
});

console.log(`Rows loaded: ${rows.length}`);
if (rows.length > 0) {
  console.log("Column names:", Object.keys(rows[0]));
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function str(v: unknown): string | null {
  if (v === null || v === undefined || v === "") return null;
  return String(v).trim() || null;
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

function parseDate(v: unknown): Date | null {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

function makeSlug(title: string, arxivId: string): string {
  const base = slugify(title ?? "", { lower: true, strict: true }).slice(0, 60);
  const suffix = String(arxivId).replace(".", "-");
  return base ? `${base}-${suffix}` : suffix;
}

// ── Map a raw row to a Prisma paper record ────────────────────────────────────
function mapRow(row: any) {
  // Support common column name variants from different exports
  const arxivId =
    str(row.arxiv_id) ?? str(row.arxivId) ?? str(row["Arxiv ID"]) ?? null;
  const title =
    str(row.title) ?? str(row.Title) ?? "Untitled";
  const publishedDate =
    parseDate(row.published_date) ??
    parseDate(row.publicationDate) ??
    parseDate(row.published) ??
    null;

  return {
    arxivId,
    slug: makeSlug(title, arxivId ?? String(Math.random())),
    title,
    publicationDate: publishedDate,
    paperUrl: str(row.paper_url) ?? str(row.paperUrl) ?? str(row.arxiv_url),
    pdfUrl: str(row.pdf_url) ?? str(row.pdfUrl),
    thumbnailUrl: str(row.thumbnail_url) ?? str(row.thumbnailUrl),
    githubUrl: str(row.github_url) ?? str(row.githubUrl),
    githubStars: num(row.github_stars ?? row.githubStars),
    githubForks: num(row.github_forks ?? row.githubForks),
    language: str(row.language),
    isOfficialCode: Boolean(row.is_official_code ?? row.isOfficialCode),
  };
}

// ── Main import ───────────────────────────────────────────────────────────────
async function main() {
  const records = rows
    .map(mapRow)
    .filter((r) => r.title !== "Untitled" || r.arxivId);

  console.log(`\n▶ Prepared ${records.length} records for upsert…`);

  const BATCH = 100;
  let imported = 0;
  let skipped = 0;

  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);

    await Promise.all(
      batch.map(async (data) => {
        try {
          if (data.arxivId) {
            await prisma.paper.upsert({
              where: { arxivId: data.arxivId },
              create: data,
              update: {
                githubUrl: data.githubUrl,
                githubStars: data.githubStars,
                githubForks: data.githubForks,
                language: data.language,
                thumbnailUrl: data.thumbnailUrl,
                isOfficialCode: data.isOfficialCode,
              },
            });
          } else {
            // No arxiv_id — create only (no unique key to upsert on)
            await prisma.paper.create({ data });
          }
          imported++;
        } catch (err: any) {
          // Skip duplicates (e.g. unique slug conflicts)
          if (err.code === "P2002") {
            skipped++;
          } else {
            console.warn(`  ⚠ Row skipped:`, err.message);
            skipped++;
          }
        }
      })
    );

    console.log(`  ✔ ${Math.min(i + BATCH, records.length)} / ${records.length}`);
  }

  console.log(`\n✅ Done! Imported: ${imported} | Skipped/Duplicate: ${skipped}`);
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
