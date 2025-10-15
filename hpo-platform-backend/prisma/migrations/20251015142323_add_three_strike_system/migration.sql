-- CreateEnum
CREATE TYPE "StrikeReason" AS ENUM ('LOW_QUALITY_TRANSLATION', 'SPAM_SUBMISSIONS', 'INAPPROPRIATE_CONTENT', 'PLAGIARISM', 'MANIPULATION_SYSTEM', 'DISRESPECTFUL_BEHAVIOR', 'VIOLATION_GUIDELINES', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'STRIKE_RECEIVED';
ALTER TYPE "NotificationType" ADD VALUE 'STRIKE_WARNING';

-- CreateTable
CREATE TABLE "strikes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "reason" "StrikeReason" NOT NULL,
    "detailedReason" TEXT NOT NULL,
    "translationId" TEXT,
    "severity" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strikes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "strikes_userId_isActive_idx" ON "strikes"("userId", "isActive");

-- CreateIndex
CREATE INDEX "strikes_createdAt_idx" ON "strikes"("createdAt");

-- CreateIndex
CREATE INDEX "strikes_severity_idx" ON "strikes"("severity");

-- AddForeignKey
ALTER TABLE "strikes" ADD CONSTRAINT "strikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strikes" ADD CONSTRAINT "strikes_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strikes" ADD CONSTRAINT "strikes_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "translations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
