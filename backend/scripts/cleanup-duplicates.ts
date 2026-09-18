import { config } from "dotenv";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { fileURLToPath } from "url";
import { PrismaClient } from "../src/generated/prisma/index.js";
import { buildDeterministicSlug, normalizeArxivId, hashDisambiguator } from "../src/utils/slug.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, "..", ".env") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const isExecute = process.argv.includes("--execute");

  if (!isExecute) {
    console.log("DRY RUN MODE. Pass --execute to actually delete duplicates.");
    console.log("Remember to take a Neon branch backup before running --execute!");
  }

  console.log("Fetching lightweight identifiers for all papers to group...");
  const lightweightPapers = await prisma.paper.findMany({
    select: {
      id: true,
      title: true,
      arxivId: true,
      slug: true,
      paperUrl: true,
    }
  });

  // Group by identity key: arxivId if present, else baseSlug + hashed paperUrl
  const groups = new Map<string, typeof lightweightPapers>();
  for (const paper of lightweightPapers) {
    const arxivId = normalizeArxivId(paper.arxivId);
    const baseSlug = buildDeterministicSlug(paper.title);
    const incomingUrl = paper.paperUrl;
    
    let identityKey = "";
    if (arxivId) {
      identityKey = `arxiv:${arxivId}`;
    } else {
      const disambiguator = hashDisambiguator(paper.title, incomingUrl);
      identityKey = `slug:${baseSlug}-${disambiguator}`;
    }

    if (!groups.has(identityKey)) {
      groups.set(identityKey, []);
    }
    groups.get(identityKey)!.push(paper);
  }

  // Collect IDs of papers that are actually part of a duplicate group
  const duplicateIdsToFetch: string[] = [];
  for (const group of groups.values()) {
    if (group.length > 1) {
      duplicateIdsToFetch.push(...group.map(p => p.id));
    }
  }

  let heavyDataMap = new Map();
  if (duplicateIdsToFetch.length > 0) {
    console.log(`Found ${duplicateIdsToFetch.length} rows involved in duplicates. Fetching heavy fields for scoring...`);
    const heavyPapers = await prisma.paper.findMany({
      where: { id: { in: duplicateIdsToFetch } },
      select: {
        id: true,
        abstract: true,
        githubUrl: true,
        citationCount: true,
        thumbnailUrl: true,
      }
    });
    for (const hp of heavyPapers) {
      heavyDataMap.set(hp.id, hp);
    }
  }

  let totalDeleted = 0;
  let totalKept = 0;
  const allIdsToDelete: string[] = [];

  for (const [title, group] of groups.entries()) {
    if (group.length > 1) {
      // Enrich with heavy data for completeness scoring
      const enrichedGroup = group.map(p => {
        const heavy = heavyDataMap.get(p.id) || {};
        return { ...p, ...heavy };
      });

      // Sort by completeness score (descending)
      enrichedGroup.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        if (a.abstract) scoreA++;
        if (a.arxivId) scoreA++;
        if (a.githubUrl) scoreA++;
        if (a.thumbnailUrl) scoreA++;
        if (a.citationCount && a.citationCount > 0) scoreA++;

        if (b.abstract) scoreB++;
        if (b.arxivId) scoreB++;
        if (b.githubUrl) scoreB++;
        if (b.thumbnailUrl) scoreB++;
        if (b.citationCount && b.citationCount > 0) scoreB++;

        return scoreB - scoreA; // highest score first
      });

      const keep = enrichedGroup[0];
      const toDelete = enrichedGroup.slice(1);

      console.log(`\nGroup: "${keep.title}"`);
      console.log(`  Keeping ID: ${keep.id} (slug: ${keep.slug})`);
      console.log(`  Flagging ${toDelete.length} duplicates for deletion.`);
      
      const idsToDelete = toDelete.map(p => p.id);
      allIdsToDelete.push(...idsToDelete);

      totalDeleted += toDelete.length;
      totalKept++;
    } else {
      totalKept++;
    }
  }

  console.log(`\n--- SUMMARY ---`);
  console.log(`Total unique papers kept: ${totalKept}`);
  console.log(`Total duplicate papers to delete: ${totalDeleted}`);

  if (isExecute && allIdsToDelete.length > 0) {
    console.log(`\nExecuting batched deletion of ${allIdsToDelete.length} rows...`);
    
    // Chunk deletions into batches of 500 to stay safely under Neon's 20-second timeout
    const CHUNK_SIZE = 500;
    let deletedCount = 0;
    
    for (let i = 0; i < allIdsToDelete.length; i += CHUNK_SIZE) {
      const chunk = allIdsToDelete.slice(i, i + CHUNK_SIZE);
      const result = await prisma.paper.deleteMany({
        where: { id: { in: chunk } }
      });
      deletedCount += result.count;
      console.log(`  -> Deleted chunk ${i / CHUNK_SIZE + 1}: ${result.count} rows`);
    }
    
    console.log(`✅ Successfully deleted ${deletedCount} duplicate rows total.`);
  } else if (!isExecute && allIdsToDelete.length > 0) {
    console.log(`\n(Skipping deletion. Pass --execute to delete ${allIdsToDelete.length} rows.)`);
  } else if (allIdsToDelete.length === 0) {
    console.log(`\nNo duplicates found! Your database is clean.`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
