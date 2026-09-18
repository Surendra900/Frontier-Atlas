import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, "..", ".env") });

const { prisma } = await import("../src/lib/prisma");

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1-pRh7qYCVKbKDTBP6RiT6NBtzlChWOiY7jrfKJS3x5w/export?format=csv&gid=1187046619";

const columns = [
  "arxiv_id",
  "title",
  "authors",
  "published_date",
  "paper_url",
  "pdf_url",
  "github_url",
  "github_stars",
  "github_forks",
  "language",
] as const;

type SheetRow = Record<(typeof columns)[number], string>;

function parseCsvLine(line: string) {
  const values: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      value += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(value);
      value = "";
    } else {
      value += char;
    }
  }

  values.push(value);
  return values;
}

function parseCsv(csv: string): SheetRow[] {
  const rows: string[][] = [];
  let line = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const nextChar = csv[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      line += char + nextChar;
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
      line += char;
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (line.trim()) {
        rows.push(parseCsvLine(line));
      }

      line = "";

      if (char === "\r" && nextChar === "\n") {
        i += 1;
      }
    } else {
      line += char;
    }
  }

  if (line.trim()) {
    rows.push(parseCsvLine(line));
  }

  return rows.slice(1).map((values) => {
    return columns.reduce((row, column, index) => {
      row[column] = values[index]?.trim() ?? "";
      return row;
    }, {} as SheetRow);
  });
}

function nullable(value: string) {
  return value || null;
}

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function main() {
  const response = await fetch(SHEET_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
  }

  const csv = await response.text();
  const rows = parseCsv(csv).filter((row) => row.arxiv_id);
  const batchSize = 100;
  let totalImported = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    await Promise.all(
      batch.map((row) => {
        const data = {
          arxivId: row.arxiv_id,
          slug: row.arxiv_id,
          title: row.title,
          publicationDate: parseDate(row.published_date),
          paperUrl: nullable(row.paper_url),
          pdfUrl: nullable(row.pdf_url),
          githubUrl: nullable(row.github_url),
          githubStars: parseInt(row.github_stars, 10) || 0,
          githubForks: parseInt(row.github_forks, 10) || 0,
          language: nullable(row.language),
        };

        return prisma.paper.upsert({
          where: { arxivId: row.arxiv_id },
          create: data,
          update: data,
        });
      })
    );

    totalImported += batch.length;
    console.log(`Imported batch ${Math.floor(i / batchSize) + 1} - total so far: ${totalImported} papers`);
  }

  console.log(`Done! Total papers imported: ${totalImported}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
