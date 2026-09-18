import XLSX from "xlsx";
import path from "path";
import { prisma } from "../src/lib/prisma";

const workbook = XLSX.readFile(
  path.join(process.cwd(), "data", "papers.xlsx")
);

const githubSheet = XLSX.utils.sheet_to_json<any>(
  workbook.Sheets["papers_with_github"],
  { defval: null }
);

async function main() {

  console.log("Loading papers...");

  const papers = await prisma.paper.findMany({
    select: {
      id: true,
      arxivId: true,
    },
  });

  console.log("Loading repositories...");

  const repositories = await prisma.repository.findMany({
    select: {
      id: true,
      url: true,
    },
  });

  const paperMap = new Map(
    papers.map(p => [p.arxivId, p.id])
  );

  const repoMap = new Map(
    repositories.map(r => [r.url, r.id])
  );

  const relations: {
    paper_id: string;
    repository_id: string;
  }[] = [];

  const relationSet = new Set<string>();

  console.log("Building relations...");

  for (const row of githubSheet) {

    if (!row.github_url) continue;

    const paperId = paperMap.get(String(row.arxiv_id));

    const repositoryId = repoMap.get(row.github_url);

    if (!paperId || !repositoryId) continue;

    const key = `${paperId}-${repositoryId}`;

    if (relationSet.has(key)) continue;

    relationSet.add(key);

    relations.push({
      paper_id: paperId,
      repository_id: repositoryId,
    });

  }

  console.log("Relations:", relations.length);

  const batchSize = 500;

  console.log("Importing...");

  for (let i = 0; i < relations.length; i += batchSize) {

    await prisma.paperRepository.createMany({
      data: relations.slice(i, i + batchSize),
    });

    console.log(
      `Imported ${Math.min(i + batchSize, relations.length)} / ${relations.length}`
    );

  }

  console.log("\n✅ Paper-Repository import completed!");

}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });