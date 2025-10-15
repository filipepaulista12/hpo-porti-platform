-- CreateEnum
CREATE TYPE "ConflictType" AS ENUM ('MULTIPLE_TRANSLATIONS', 'QUALITY_DISPUTE', 'TERMINOLOGY_CONFLICT');

-- CreateEnum
CREATE TYPE "ConflictStatus" AS ENUM ('PENDING_COMMITTEE', 'IN_VOTING', 'RESOLVED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('APPROVE_THIS', 'CREATE_NEW', 'ABSTAIN');

-- CreateEnum
CREATE TYPE "RejectionReason" AS ENUM ('INCORRECT_TRANSLATION', 'POOR_GRAMMAR', 'NOT_MEDICAL_TERM', 'DUPLICATE', 'OFFENSIVE_CONTENT', 'SPAM', 'INCONSISTENT', 'OTHER');

-- CreateEnum
CREATE TYPE "AdminAction" AS ENUM ('APPROVE_TRANSLATION', 'REJECT_TRANSLATION', 'DELETE_TRANSLATION', 'BAN_USER', 'UNBAN_USER', 'PROMOTE_USER', 'DEMOTE_USER', 'SYNC_TO_HPO', 'RESOLVE_CONFLICT', 'EDIT_TERM', 'SYSTEM_CONFIG', 'BULK_APPROVE', 'BULK_REJECT');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'GENERATING_FILE', 'CREATING_PR', 'PR_CREATED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TRANSLATION_APPROVED', 'TRANSLATION_REJECTED', 'VALIDATION_RECEIVED', 'CONFLICT_VOTE_NEEDED', 'LEVEL_UP', 'BADGE_EARNED', 'COMMENT_RECEIVED', 'SYSTEM_ANNOUNCEMENT', 'CONFLICT_RESOLVED', 'SYNC_COMPLETED', 'USER_SUSPENDED', 'USER_PROMOTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'MODERATOR';
ALTER TYPE "UserRole" ADD VALUE 'COMMITTEE_MEMBER';
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- CreateTable
CREATE TABLE "conflict_reviews" (
    "id" TEXT NOT NULL,
    "hpoTermId" TEXT NOT NULL,
    "type" "ConflictType" NOT NULL,
    "status" "ConflictStatus" NOT NULL DEFAULT 'PENDING_COMMITTEE',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "winningTranslationId" TEXT,
    "resolution" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conflict_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee_votes" (
    "id" TEXT NOT NULL,
    "conflictReviewId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "translationId" TEXT,
    "voteType" "VoteType" NOT NULL,
    "comment" TEXT,
    "votedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "committee_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rejections" (
    "id" TEXT NOT NULL,
    "translationId" TEXT NOT NULL,
    "rejectedBy" TEXT NOT NULL,
    "reasonCode" "RejectionReason" NOT NULL,
    "detailedReason" TEXT NOT NULL,
    "suggestions" TEXT,
    "canResubmit" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rejections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" "AdminAction" NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "changes" JSONB,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL,
    "syncDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "initiatedBy" TEXT NOT NULL,
    "translationsCount" INTEGER NOT NULL,
    "babelonFilePath" TEXT,
    "githubPrUrl" TEXT,
    "status" "SyncStatus" NOT NULL,
    "errorMessage" TEXT,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ConflictTranslations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "conflict_reviews_hpoTermId_idx" ON "conflict_reviews"("hpoTermId");

-- CreateIndex
CREATE INDEX "conflict_reviews_status_idx" ON "conflict_reviews"("status");

-- CreateIndex
CREATE INDEX "conflict_reviews_priority_idx" ON "conflict_reviews"("priority");

-- CreateIndex
CREATE INDEX "committee_votes_conflictReviewId_idx" ON "committee_votes"("conflictReviewId");

-- CreateIndex
CREATE INDEX "committee_votes_voterId_idx" ON "committee_votes"("voterId");

-- CreateIndex
CREATE UNIQUE INDEX "committee_votes_conflictReviewId_voterId_key" ON "committee_votes"("conflictReviewId", "voterId");

-- CreateIndex
CREATE UNIQUE INDEX "rejections_translationId_key" ON "rejections"("translationId");

-- CreateIndex
CREATE INDEX "rejections_translationId_idx" ON "rejections"("translationId");

-- CreateIndex
CREATE INDEX "rejections_rejectedBy_idx" ON "rejections"("rejectedBy");

-- CreateIndex
CREATE INDEX "rejections_reasonCode_idx" ON "rejections"("reasonCode");

-- CreateIndex
CREATE INDEX "admin_audit_logs_adminId_idx" ON "admin_audit_logs"("adminId");

-- CreateIndex
CREATE INDEX "admin_audit_logs_action_idx" ON "admin_audit_logs"("action");

-- CreateIndex
CREATE INDEX "admin_audit_logs_createdAt_idx" ON "admin_audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "admin_audit_logs_targetType_targetId_idx" ON "admin_audit_logs"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "sync_logs_syncDate_idx" ON "sync_logs"("syncDate");

-- CreateIndex
CREATE INDEX "sync_logs_status_idx" ON "sync_logs"("status");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE UNIQUE INDEX "_ConflictTranslations_AB_unique" ON "_ConflictTranslations"("A", "B");

-- CreateIndex
CREATE INDEX "_ConflictTranslations_B_index" ON "_ConflictTranslations"("B");

-- AddForeignKey
ALTER TABLE "conflict_reviews" ADD CONSTRAINT "conflict_reviews_hpoTermId_fkey" FOREIGN KEY ("hpoTermId") REFERENCES "hpo_terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conflict_reviews" ADD CONSTRAINT "conflict_reviews_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_votes" ADD CONSTRAINT "committee_votes_conflictReviewId_fkey" FOREIGN KEY ("conflictReviewId") REFERENCES "conflict_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_votes" ADD CONSTRAINT "committee_votes_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_votes" ADD CONSTRAINT "committee_votes_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "translations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rejections" ADD CONSTRAINT "rejections_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "translations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rejections" ADD CONSTRAINT "rejections_rejectedBy_fkey" FOREIGN KEY ("rejectedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_initiatedBy_fkey" FOREIGN KEY ("initiatedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConflictTranslations" ADD CONSTRAINT "_ConflictTranslations_A_fkey" FOREIGN KEY ("A") REFERENCES "conflict_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConflictTranslations" ADD CONSTRAINT "_ConflictTranslations_B_fkey" FOREIGN KEY ("B") REFERENCES "translations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
