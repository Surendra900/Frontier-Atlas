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

const authorsMap = new Map<string, { name: string; slug: string }>();
const usedSlugs = new Set<string>();

for (const paper of papers) {
  if (!paper.authors) continue;

  const authors = paper.authors
    .split(";")
    .map((a: string) => a.trim())
    .filter(Boolean);

  for (const author of authors) {
    const key = author.toLowerCase();

    if (!authorsMap.has(key)) {

      let slug = slugify(author, {
        lower: true,
        strict: true,
      });

      let uniqueSlug = slug;
      let counter = 1;

      while (usedSlugs.has(uniqueSlug)) {
        uniqueSlug = `${slug}-${counter++}`;
      }

      usedSlugs.add(uniqueSlug);

      authorsMap.set(key, {
        name: author,
        slug: uniqueSlug,
      });
    }
  }
}

const authors = [...authorsMap.values()];

console.log("Unique authors:", authors.length);

async function main() {
  const batchSize = 1000;

  console.log("Starting author import...\n");

  for (let i = 0; i < authors.length; i += batchSize) {
    const batch = authors.slice(i, i + batchSize);

    await prisma.author.createMany({
      data: batch,
    });

    console.log(
      `Imported ${Math.min(i + batch.length, authors.length)} / ${authors.length}`
    );
  }

  console.log("\n✅ Authors imported successfully!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });