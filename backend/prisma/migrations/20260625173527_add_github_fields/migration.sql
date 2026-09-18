-- AlterTable
ALTER TABLE "papers" ADD COLUMN     "github_forks" INTEGER DEFAULT 0,
ADD COLUMN     "github_stars" INTEGER DEFAULT 0,
ADD COLUMN     "github_url" TEXT;
