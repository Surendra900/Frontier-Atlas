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

const repositories = new Map<
  string,
  {
    url: string;
    owner: string;
    name: string;
  }
>();

for (const row of githubSheet) {

  if (!row.github_url) continue;

  try {

    const url = new URL(row.github_url);

    const parts = url.pathname
      .split("/")
      .filter(Boolean);

    if (parts.length < 2) continue;

    const owner = parts[0];
    const repo = parts[1];

    repositories.set(row.github_url, {
      url: row.github_url,
      owner,
      name: repo
    });

  } catch {}

}

const repoRecords = [...repositories.values()];

console.log("Repositories:", repoRecords.length);

async function main() {

  const batchSize = 500;

  for (let i = 0; i < repoRecords.length; i += batchSize) {

    await prisma.repository.createMany({
      data: repoRecords.slice(i, i + batchSize),
    });

    console.log(
      `Imported ${Math.min(i + batchSize, repoRecords.length)} / ${repoRecords.length}`
    );

  }

  console.log("\n✅ Repository import completed!");

}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });