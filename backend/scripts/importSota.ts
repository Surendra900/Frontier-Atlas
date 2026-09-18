/**
 * importSota.ts
 *
 * Imports Benchmarks, Rankings, and SOTA Claims from the "sota_backend_v2" sheet
 * of papers_with_github.xlsx.
 *
 * Run with:
 *   npx tsx scripts/importSota.ts
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
function resolveXlsx(): string {
  const candidates = [
    path.join(__dirname, "..", "papers_with_github.xlsx"),
    path.join(__dirname, "..", "data", "papers_with_github.xlsx"),
  ];
  for (const p of candidates) {
    try {
      XLSX.readFile(p);
      return p;
    } catch {
      // try next
    }
  }
  throw new Error("papers_with_github.xlsx not found.");
}

async function getOrCreatePaper(arxivId: string | null, title: string) {
  if (arxivId) {
    const existing = await prisma.paper.findUnique({
      where: { arxivId },
    });
    if (existing) return existing;
  }

  let attempts = 0;
  while (attempts < 5) {
    const slugBase = arxivId
      ? `${slugify(title, { lower: true, strict: true }).slice(0, 60)}-${arxivId.replace(".", "-")}`
      : `ref-${slugify(title, { lower: true, strict: true }).slice(0, 60)}`;
    
    const slug = attempts === 0 ? slugBase : `${slugBase}-${Math.random().toString(36).substring(2, 6)}`;

    try {
      return await prisma.paper.create({
        data: {
          arxivId,
          title,
          slug,
        },
      });
    } catch (err: any) {
      if (err.code === "P2002") {
        if (arxivId) {
          const existing = await prisma.paper.findUnique({
            where: { arxivId },
          });
          if (existing) return existing;
        }
        attempts++;
      } else {
        throw err;
      }
    }
  }
  throw new Error(`Failed to create paper "${title}" after 5 attempts`);
}

async function main() {
  const xlsxPath = resolveXlsx();
  console.log(`Reading: ${xlsxPath}`);
  const workbook = XLSX.readFile(xlsxPath);

  const sheetName = "sota_backend_v2";
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found in workbook.`);
  }

  const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: null });
  console.log(`Loaded ${rows.length} rows from "${sheetName}".`);

  // 1. Gather and Upsert Unique Benchmarks
  const uniqueBenchmarkNames = Array.from(
    new Set(rows.map((r) => String(r.benchmark_name).trim()).filter(Boolean))
  );
  console.log(`Found ${uniqueBenchmarkNames.length} unique benchmarks.`);

  const benchmarkNameToIdMap = new Map<string, string>();
  const benchmarkSlugs = new Set<string>();

  for (const name of uniqueBenchmarkNames) {
    let slug = slugify(name, { lower: true, strict: true }).slice(0, 80);
    let finalSlug = slug;
    let count = 1;
    while (benchmarkSlugs.has(finalSlug)) {
      finalSlug = `${slug}-${count}`;
      count++;
    }
    benchmarkSlugs.add(finalSlug);

    const benchmark = await prisma.benchmark.upsert({
      where: { name },
      create: {
        name,
        slug: finalSlug,
      },
      update: {},
    });
    benchmarkNameToIdMap.set(name, benchmark.id);
  }
  console.log("✔ Upserted all benchmarks.");

  // 2. Process each row for Paper, Ranking and SOTA Claim
  let rankingCreated = 0;
  let sotaClaimsCreated = 0;
  let fallbackPapersCreated = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const arxivIdRaw = row.paper_arxiv_id ? String(row.paper_arxiv_id).trim() : null;
    const paperTitle = row.paper_title ? String(row.paper_title).trim() : "Untitled Reference";
    const benchmarkName = row.benchmark_name ? String(row.benchmark_name).trim() : null;
    const rank = parseInt(row.rank, 10);

    if (!benchmarkName) continue;

    const benchmarkId = benchmarkNameToIdMap.get(benchmarkName);
    if (!benchmarkId) continue;

    // A. Find or create Paper robustly
    const paper = await getOrCreatePaper(arxivIdRaw, paperTitle);

    // B. Upsert Ranking
    const rankData = {
      paper_id: paper.id,
      benchmark_id: benchmarkId,
      rank: isNaN(rank) ? 1 : rank,
    };

    try {
      await prisma.ranking.upsert({
        where: {
          paper_id_benchmark_id: {
            paper_id: paper.id,
            benchmark_id: benchmarkId,
          },
        },
        create: rankData,
        update: rankData,
      });
      rankingCreated++;
    } catch (err: any) {
      // Handle duplicate entries if any
    }

    // C. Upsert SOTA Claim if rank is 1
    if (rank === 1) {
      try {
        await prisma.sotaClaim.upsert({
          where: {
            paper_id_benchmark_id: {
              paper_id: paper.id,
              benchmark_id: benchmarkId,
            },
          },
          create: {
            paper_id: paper.id,
            benchmark_id: benchmarkId,
          },
          update: {},
        });
        sotaClaimsCreated++;
      } catch (err: any) {
        // Handle constraint issues gracefully
      }
    }

    if ((i + 1) % 500 === 0) {
      console.log(`Processed ${i + 1} / ${rows.length} rows...`);
    }
  }

  console.log("\n✅ Import Complete!");
  console.log(`- Created fallback papers: ${fallbackPapersCreated}`);
  console.log(`- Upserted rankings: ${rankingCreated}`);
  console.log(`- Upserted SOTA claims (Rank 1): ${sotaClaimsCreated}`);
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
