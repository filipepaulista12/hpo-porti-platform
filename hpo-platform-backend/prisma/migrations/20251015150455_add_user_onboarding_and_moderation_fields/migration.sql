-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bannedBy" TEXT,
ADD COLUMN     "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastWarningAt" TIMESTAMP(3),
ADD COLUMN     "warningCount" INTEGER NOT NULL DEFAULT 0;
