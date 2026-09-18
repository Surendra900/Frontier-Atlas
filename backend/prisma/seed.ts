import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from 'dotenv';
import fs from 'fs';
import csv from 'csv-parser';

config();

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  ),
});

async function importPapers() {
  const papers: any[] = [];

  console.log('Loading papers.csv...');

  fs.createReadStream('./papers.csv')
    .pipe(csv())
    .on('data', (row) => papers.push(row))
    .on('end', async () => {
      console.log(`Importing ${papers.length} papers...\n`);

      for (const paper of papers) {
        const slug = paper.title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        try {
          await prisma.paper.create({
            data: {
              title: paper.title,
              slug,
              arxivId: paper.arxiv_id || null,
            },
          });

          console.log(`✔ ${paper.title}`);
        } catch (err: any) {
          console.log(`✖ ${paper.title}`);
          console.error(err.message);
        }
      }

      await prisma.$disconnect();
      console.log('\nSeeding completed.');
    });
}

importPapers().catch(async (err) => {
  console.error('Unexpected Error:', err);
  await prisma.$disconnect();
  process.exit(1);
});

async function upsertTasksAndMethods() {
  const tasks = [
    { name: 'Agents', slug: 'agents' },
    { name: 'Reasoning', slug: 'reasoning' },
    { name: 'Language Modeling', slug: 'language-modeling' },
    { name: 'Coding Agents', slug: 'coding-agents' },
    { name: 'Computer Use', slug: 'computer-use' },
    { name: 'World Models', slug: 'world-models' },
    { name: 'Robotics', slug: 'robotics' },
    { name: 'Text Generation', slug: 'text-generation' },
    { name: 'Image Generation', slug: 'image-generation' },
    { name: 'Video Generation', slug: 'video-generation' },
    { name: 'Audio Generation', slug: 'audio-generation' },
  ];

  const methods = [
    { name: 'Transformer', slug: 'transformer' },
    { name: 'Chain of Thought', slug: 'chain-of-thought' },
    { name: 'ReAct', slug: 'react' },
    { name: 'LoRA', slug: 'lora' },
    { name: 'RLHF', slug: 'rlhf' },
    { name: 'DPO', slug: 'dpo' },
    { name: 'MCP', slug: 'mcp' },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { slug: task.slug },
      update: { name: task.name },
      create: task,
    });
  }

  for (const method of methods) {
    await prisma.method.upsert({
      where: { slug: method.slug },
      update: { name: method.name },
      create: method,
    });
  }
}

upsertTasksAndMethods().catch(async (err) => {
  console.error('Unexpected Taxonomy Seed Error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
