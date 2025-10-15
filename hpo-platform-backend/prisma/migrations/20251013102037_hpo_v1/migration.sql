-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('TRANSLATOR', 'REVIEWER', 'VALIDATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "TranslationStatus" AS ENUM ('NOT_TRANSLATED', 'DRAFT', 'PENDING_REVIEW', 'IN_REVIEW', 'PENDING_VALIDATION', 'LEGACY_PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TranslationSource" AS ENUM ('MANUAL', 'AI_ASSISTED', 'IMPORTED', 'LEGACY');

-- CreateEnum
CREATE TYPE "ValidationDecision" AS ENUM ('APPROVED', 'NEEDS_REVISION', 'REJECTED');

-- CreateEnum
CREATE TYPE "BadgeRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('TRANSLATION_CREATED', 'TRANSLATION_APPROVED', 'TRANSLATION_REJECTED', 'VALIDATION_COMPLETED', 'BADGE_EARNED', 'LEVEL_UP', 'STREAK_MILESTONE', 'COMMENT_ADDED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "orcidId" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'TRANSLATOR',
    "institution" TEXT,
    "specialty" TEXT,
    "country" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hpo_terms" (
    "id" TEXT NOT NULL,
    "hpoId" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "definitionEn" TEXT,
    "synonymsEn" TEXT[],
    "category" TEXT,
    "parentId" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 3,
    "translationStatus" "TranslationStatus" NOT NULL DEFAULT 'NOT_TRANSLATED',
    "hpoVersion" TEXT,
    "isObsolete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hpo_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translations" (
    "id" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "labelPt" TEXT NOT NULL,
    "definitionPt" TEXT,
    "synonymsPt" TEXT[],
    "status" "TranslationStatus" NOT NULL DEFAULT 'DRAFT',
    "confidence" INTEGER NOT NULL DEFAULT 3,
    "source" "TranslationSource" NOT NULL DEFAULT 'MANUAL',
    "isLegacy" BOOLEAN NOT NULL DEFAULT false,
    "aiSuggestion" TEXT,
    "aiConfidence" DOUBLE PRECISION,
    "approvalCount" INTEGER NOT NULL DEFAULT 0,
    "rejectionCount" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validations" (
    "id" TEXT NOT NULL,
    "translationId" TEXT NOT NULL,
    "validatorId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "decision" "ValidationDecision" NOT NULL,
    "comments" TEXT,
    "suggestions" TEXT,
    "accuracyScore" INTEGER,
    "clarityScore" INTEGER,
    "consistencyScore" INTEGER,
    "timeSpentSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "translationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "rarity" "BadgeRarity" NOT NULL DEFAULT 'COMMON',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_orcidId_key" ON "users"("orcidId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_orcidId_idx" ON "users"("orcidId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_points_idx" ON "users"("points");

-- CreateIndex
CREATE UNIQUE INDEX "hpo_terms_hpoId_key" ON "hpo_terms"("hpoId");

-- CreateIndex
CREATE INDEX "hpo_terms_hpoId_idx" ON "hpo_terms"("hpoId");

-- CreateIndex
CREATE INDEX "hpo_terms_category_idx" ON "hpo_terms"("category");

-- CreateIndex
CREATE INDEX "hpo_terms_translationStatus_idx" ON "hpo_terms"("translationStatus");

-- CreateIndex
CREATE INDEX "hpo_terms_difficulty_idx" ON "hpo_terms"("difficulty");

-- CreateIndex
CREATE INDEX "translations_termId_idx" ON "translations"("termId");

-- CreateIndex
CREATE INDEX "translations_userId_idx" ON "translations"("userId");

-- CreateIndex
CREATE INDEX "translations_status_idx" ON "translations"("status");

-- CreateIndex
CREATE INDEX "translations_isLegacy_idx" ON "translations"("isLegacy");

-- CreateIndex
CREATE INDEX "validations_translationId_idx" ON "validations"("translationId");

-- CreateIndex
CREATE INDEX "validations_validatorId_idx" ON "validations"("validatorId");

-- CreateIndex
CREATE INDEX "validations_decision_idx" ON "validations"("decision");

-- CreateIndex
CREATE UNIQUE INDEX "validations_translationId_validatorId_key" ON "validations"("translationId", "validatorId");

-- CreateIndex
CREATE INDEX "comments_translationId_idx" ON "comments"("translationId");

-- CreateIndex
CREATE INDEX "comments_userId_idx" ON "comments"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "badges_code_key" ON "badges"("code");

-- CreateIndex
CREATE INDEX "user_badges_userId_idx" ON "user_badges"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");

-- CreateIndex
CREATE INDEX "user_activities_userId_idx" ON "user_activities"("userId");

-- CreateIndex
CREATE INDEX "user_activities_createdAt_idx" ON "user_activities"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- AddForeignKey
ALTER TABLE "hpo_terms" ADD CONSTRAINT "hpo_terms_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "hpo_terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translations" ADD CONSTRAINT "translations_termId_fkey" FOREIGN KEY ("termId") REFERENCES "hpo_terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translations" ADD CONSTRAINT "translations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validations" ADD CONSTRAINT "validations_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "translations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validations" ADD CONSTRAINT "validations_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "translations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
