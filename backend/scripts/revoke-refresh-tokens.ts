import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const result = await prisma.refreshToken.deleteMany();
  console.log(`Revoked ${result.count} refresh token(s). Users will need to sign in again.`);
}

main()
  .catch((error) => {
    console.error("Failed to revoke refresh tokens:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
