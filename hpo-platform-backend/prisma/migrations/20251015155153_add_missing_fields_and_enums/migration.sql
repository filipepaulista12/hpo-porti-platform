/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'ROLE_PROMOTION';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AdminAction" ADD VALUE 'VOTE_ON_CONFLICT';
ALTER TYPE "AdminAction" ADD VALUE 'DEACTIVATE_STRIKE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'ACCOUNT_SUSPENDED';
ALTER TYPE "NotificationType" ADD VALUE 'ACCOUNT_RESTORED';
ALTER TYPE "NotificationType" ADD VALUE 'ROLE_PROMOTION';

-- AlterEnum
ALTER TYPE "TranslationStatus" ADD VALUE 'NEEDS_REVISION';

-- AlterTable
ALTER TABLE "admin_audit_logs" ADD COLUMN     "details" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "approvedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "promotedAt" TIMESTAMP(3),
ADD COLUMN     "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
