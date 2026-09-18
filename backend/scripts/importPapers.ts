import XLSX from "xlsx";
import path from "path";
import slugify from "slugify";
import { prisma } from "../src/lib/prisma";

const workbook = XLSX.readFile(
  path.join(process.cwd(), "data", "papers.xlsx")
);

const papers = XLSX.utils.sheet_to_json<any>(
  workbook.Sheets["papers"],
  { defval: null }
);

const enriched = XLSX.utils.sheet_to_json<any>(
  workbook.Sheets["research_paper_enriched"],
  { defval: null }
);

const github = XLSX.utils.sheet_to_json<any>(
  workbook.Sheets["papers_with_github"],
  { defval: null }
);

// Lookup maps
const enrichedMap = new Map(
  enriched.map(row => [String(row.arxiv_id), row])
);

const githubMap = new Map(
  github.map(row => [String(row.arxiv_id), row])
);

// Merge everything
const merged = papers.map((paper) => {

  const id = String(paper.arxiv_id);

  const e = enrichedMap.get(id);
  const g = githubMap.get(id);

  return {

    slug:
      slugify(
        e?.title ?? paper.title,
        {
          lower: true,
          strict: true
        }
      ) +
      "-" +
      id.replace(".", "-"),

    title:
      e?.title ??
      paper.title,

    arxivId: id,

    publicationDate:
  e?.published_date ??
  paper.published_date ??
  g?.published ??
  null,

    paperUrl:
  e?.paper_url ??
  paper.arxiv_url,

    sourceUrl:
      paper.arxiv_url,

    pdfUrl:
      e?.pdf_url ??
      paper.pdf_url,

    thumbnailUrl:
      e?.thumbnail_url ??
      paper.thumbnail_url ??
      null,

    githubUrl:
      g?.github_url ??
      e?.github_url ??
      null,

    githubStars:
      Number(
        g?.github_stars ??
        e?.github_stars ??
        0
      ),

    githubForks:
      Number(
        g?.github_forks ??
        e?.github_forks ??
        0
      ),

    language:
      g?.language ??
      e?.language ??
      null,

    thumbnailUrl:
      e?.thumbnail_url ??
      null,

    isOfficialCode:
      e?.is_official_code ??
      null,

    hfUpvotes:
      Number(
        e?.hf_upvotes ??
        0
      ),

    trendingScore:
      Number(
        e?.trending_score ??
        0
      ),

    discoverySource:
      e?.discovery_source ??
      null

  };

});

const githubMatched = merged.filter(p => p.githubUrl).length;
const languageMatched = merged.filter(p => p.language).length;

console.log("GitHub matches:", githubMatched);
console.log("Language matches:", languageMatched);

const paperRecords = merged.map((paper) => ({
  slug: paper.slug,
  title: paper.title,
  arxivId: paper.arxivId,

  publicationDate: paper.publicationDate
    ? new Date(paper.publicationDate)
    : null,

  paperUrl: paper.paperUrl,

  sourceUrl: paper.sourceUrl,

  pdfUrl: paper.pdfUrl,

  thumbnailUrl: paper.thumbnailUrl,

  githubUrl: paper.githubUrl,

  githubStars: paper.githubStars,

  githubForks: paper.githubForks,

  language: paper.language,

  thumbnailUrl: paper.thumbnailUrl,

  isOfficialCode: paper.isOfficialCode,

  hfUpvotes: paper.hfUpvotes,

  trendingScore: paper.trendingScore,

  discoverySource: paper.discoverySource
}));

console.log("Prepared records:", paperRecords.length);

console.log();

console.log("Sample Record:");

console.dir(paperRecords[0], { depth: null });



async function main() {
  const batchSize = 1000;

  console.log(`Starting import of ${paperRecords.length} papers...`);

  for (let i = 0; i < paperRecords.length; i += batchSize) {
    const batch = paperRecords.slice(i, i + batchSize);

await prisma.paper.createMany({
  data: batch,
});

    console.log(
      `Imported ${Math.min(i + batch.length, paperRecords.length)} / ${paperRecords.length}`
    );
  }

  console.log("\n✅ Import completed successfully!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
