-- Comprehensive Database Schema Synchronization
-- Covers all remaining tables, columns, relations, and constraints across the entire Prisma schema

-- 1. Papers Table (Remaining GitHub repository statistics)
ALTER TABLE "papers"
ADD COLUMN IF NOT EXISTS "github_forks" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "github_stars" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "github_url" TEXT;

-- 2. PaperModels Table (Role column)
ALTER TABLE "paper_models"
ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'referenced';

-- 3. Users Table (Auth, profile, and social columns)
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "password" TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS "displayName" TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS "avatar" TEXT,
ADD COLUMN IF NOT EXISTS "bio" TEXT,
ADD COLUMN IF NOT EXISTS "github" TEXT,
ADD COLUMN IF NOT EXISTS "twitter" TEXT,
ADD COLUMN IF NOT EXISTS "website" TEXT,
ADD COLUMN IF NOT EXISTS "reputationScore" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "linkedin" TEXT,
ADD COLUMN IF NOT EXISTS "display_name" TEXT,
ADD COLUMN IF NOT EXISTS "reputation_score" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;

-- 4. Refresh Tokens Table (Complete table creation)
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    "expires_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "refresh_tokens_token_key" UNIQUE ("token"),
    CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. Saved Papers Table (Complete table creation)
CREATE TABLE IF NOT EXISTS "saved_papers" (
    "paper_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_papers_pkey" PRIMARY KEY ("user_id", "paper_id"),
    CONSTRAINT "saved_papers_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "saved_papers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 6. Datasets Table (Timestamp columns)
ALTER TABLE "datasets"
ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;

-- 7. Labs Table (Timestamp columns)
ALTER TABLE "labs"
ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;

-- 8. Universities Table (Timestamp columns)
ALTER TABLE "universities"
ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;

-- 9. Conferences Table (Timestamp columns)
ALTER TABLE "conferences"
ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;

-- 10. Journals Table (Timestamp columns)
ALTER TABLE "journals"
ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;

-- 11. Repositories Table (Timestamp columns)
ALTER TABLE "repositories"
ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;

-- 12. Summaries Table (Timestamp columns)
ALTER TABLE "summaries"
ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;

-- 13. Startups Table (Timestamp columns)
ALTER TABLE "startups"
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;

-- 14. Rankings Table (Ensure rank is nullable matching schema.prisma)
DO $$
BEGIN
    ALTER TABLE "rankings" ALTER COLUMN "rank" DROP NOT NULL;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
