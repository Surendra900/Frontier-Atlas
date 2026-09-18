import XLSX from "xlsx";
import path from "path";
import { prisma } from "../src/lib/prisma";

const workbook = XLSX.readFile(
  path.join(process.cwd(), "data", "papers.xlsx")
);

const papersExcel = XLSX.utils.sheet_to_json<any>(
  workbook.Sheets["papers"],
  { defval: null }
);

async function main() {

  console.log("Loading papers from database...");

  const papers = await prisma.paper.findMany({
    select: {
      id: true,
      arxivId: true,
    },
  });

  console.log("Loading authors from database...");

  const authors = await prisma.author.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  const paperMap = new Map(
    papers.map(p => [p.arxivId, p.id])
  );

  const authorMap = new Map(
    authors.map(a => [a.name.toLowerCase(), a.id])
  );

  const relations: {
  paper_id: string;
  author_id: string;
}[] = [];

const relationSet = new Set<string>();

  console.log("Building relations...");

  for (const row of papersExcel) {

    const paperId = paperMap.get(String(row.arxiv_id));

    if (!paperId) continue;

    if (!row.authors) continue;

    const authorNames = row.authors
      .split(";")
      .map((a: string) => a.trim())
      .filter(Boolean);

    for (const author of authorNames) {

      const authorId = authorMap.get(author.toLowerCase());

      if (!authorId) continue;

      const key = `${paperId}-${authorId}`;

if (!relationSet.has(key)) {
  relationSet.add(key);

  relations.push({
    paper_id: paperId,
    author_id: authorId,
  });
}

    }

  }

  console.log("Relations:", relations.length);

  const batchSize = 1000;

  console.log("Importing...");

  for (let i = 0; i < relations.length; i += batchSize) {

    await prisma.paperAuthor.createMany({
      data: relations.slice(i, i + batchSize),
    });

    console.log(
      `Imported ${Math.min(i + batchSize, relations.length)} / ${relations.length}`
    );

  }

  console.log("\n✅ Paper-Author relations imported!");

}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });