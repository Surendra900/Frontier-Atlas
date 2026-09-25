import { PrismaClient } from './src/generated/prisma/client/index.js';

const prisma = new PrismaClient();

async function main() {
  const papers = await prisma.paper.findMany({
    orderBy: {
      githubStars: 'desc'
    },
    take: 10,
    select: {
      id: true,
      title: true,
      tasks: {
        select: {
          task: {
            select: { name: true }
          }
        }
      },
      methods: {
        select: {
          method: {
            select: { name: true }
          }
        }
      },
      sotaClaims: {
        select: {
          benchmark: {
            select: { name: true }
          }
        }
      },
      rankings: {
        select: {
          rank: true,
          benchmark: {
            select: { name: true }
          }
        }
      }
    }
  });

  console.log(JSON.stringify(papers, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
