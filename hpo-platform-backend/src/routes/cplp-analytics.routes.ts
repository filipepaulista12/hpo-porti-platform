import { Router } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

// Helper: CPLP Countries mapping
const CPLP_COUNTRIES = {
  BR: { name: 'Brasil', variant: 'PT_BR', flag: '🇧🇷' },
  PT: { name: 'Portugal', variant: 'PT_PT', flag: '🇵🇹' },
  AO: { name: 'Angola', variant: 'PT_AO', flag: '🇦🇴' },
  MZ: { name: 'Moçambique', variant: 'PT_MZ', flag: '🇲🇿' },
  GW: { name: 'Guiné-Bissau', variant: 'PT_GW', flag: '🇬🇼' },
  CV: { name: 'Cabo Verde', variant: 'PT_CV', flag: '🇨🇻' },
  ST: { name: 'São Tomé e Príncipe', variant: 'PT_ST', flag: '🇸🇹' },
  TL: { name: 'Timor-Leste', variant: 'PT_TL', flag: '🇹🇱' },
  GQ: { name: 'Guiné Equatorial', variant: 'PT_GQ', flag: '🇬🇶' }
};

const PORTUGUESE_VARIANTS = [
  'PT_BR', 'PT_PT', 'PT_AO', 'PT_MZ', 'PT_GW', 
  'PT_CV', 'PT_ST', 'PT_TL', 'PT_GQ'
] as const;

// GET /api/cplp-analytics/variant-progress - Get translation progress by variant
router.get('/variant-progress', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // Get total number of HPO terms
    const totalTerms = await prisma.hpoTerm.count({
      where: { isObsolete: false }
    });

    // Calculate progress for each variant
    const progressByVariant = await Promise.all(
      PORTUGUESE_VARIANTS.map(async (variant) => {
        // Count unique terms translated in this variant
        const translations = await prisma.translation.groupBy({
          by: ['termId'],
          where: {
            variant: variant as any,
            status: { in: ['APPROVED', 'PENDING_REVIEW', 'IN_REVIEW'] }
          }
        });
        const translatedTermsCount = translations.length;

        // Count active translators (translated in last 30 days)
        const activeTranslatorsCount = await prisma.translation.findMany({
          where: {
            variant: variant as any,
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          },
          distinct: ['userId'],
          select: { userId: true }
        });

        // Count total translators for this variant
        const totalTranslatorsCount = await prisma.translation.findMany({
          where: { variant: variant as any },
          distinct: ['userId'],
          select: { userId: true }
        });

        // Count native translations
        const nativeTranslationsCount = await prisma.translation.count({
          where: {
            variant: variant as any,
            isNativeTranslation: true
          }
        });

        // Count native validations
        const nativeValidations = await prisma.translation.aggregate({
          where: {
            variant: variant as any,
            isNativeTranslation: true
          },
          _sum: { nativeValidations: true }
        });

        // Calculate average quality (from validations)
        const qualityData = await prisma.validation.aggregate({
          where: {
            translation: { variant: variant as any }
          },
          _avg: { rating: true }
        });

        const progressPercentage = totalTerms > 0 
          ? (translatedTermsCount / totalTerms) * 100 
          : 0;

        return {
          variant,
          totalTerms,
          translatedTerms: translatedTermsCount,
          progressPercentage: Math.round(progressPercentage * 10) / 10,
          activeTranslators: activeTranslatorsCount.length,
          totalTranslators: totalTranslatorsCount.length,
          nativeTranslations: nativeTranslationsCount,
          nativeValidations: nativeValidations._sum.nativeValidations || 0,
          avgQualityScore: qualityData._avg.rating 
            ? Math.round(qualityData._avg.rating * 10) / 10 
            : null
        };
      })
    );

    // Sort by progress percentage (descending)
    progressByVariant.sort((a, b) => b.progressPercentage - a.progressPercentage);

    res.json({
      success: true,
      totalTerms,
      variants: progressByVariant,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/cplp-analytics/country-ranking - Get ranking by country
router.get('/country-ranking', async (req, res, next) => {
  try {
    const variantFilter = req.query.variant as string | undefined;

    // Validate variant if provided
    if (variantFilter && !PORTUGUESE_VARIANTS.includes(variantFilter as any)) {
      return res.status(400).json({
        error: 'Invalid variant code',
        validVariants: PORTUGUESE_VARIANTS
      });
    }

    // Build rankings for each CPLP country
    const rankings = await Promise.all(
      Object.entries(CPLP_COUNTRIES).map(async ([countryCode, countryData]) => {
        const variant = countryData.variant;

        // Skip if filtering by specific variant
        if (variantFilter && variant !== variantFilter) {
          return null;
        }

        // Count translators from this country
        const translators = await prisma.user.findMany({
          where: { countryCode },
          select: { 
            id: true, 
            points: true, 
            name: true,
            lastActiveAt: true 
          }
        });

        // Count active translators (active in last 30 days)
        const activeTranslators = translators.filter(t => {
          if (!t.lastActiveAt) return false;
          const daysSinceActive = (Date.now() - t.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceActive <= 30;
        });

        // Count translations from this country's users
        const translationsCount = await prisma.translation.count({
          where: {
            user: { countryCode },
            variant: variant as any
          }
        });

        // Count approved translations
        const approvedTranslationsCount = await prisma.translation.count({
          where: {
            user: { countryCode },
            variant: variant as any,
            status: 'APPROVED'
          }
        });

        // Count validations done by users from this country
        const validationsCount = await prisma.validation.count({
          where: {
            validator: { countryCode }
          }
        });

        // Calculate total points
        const totalPoints = translators.reduce((sum, t) => sum + t.points, 0);

        // Get top contributor
        const topContributor = translators.sort((a, b) => b.points - a.points)[0];

        // Calculate average quality
        const qualityData = await prisma.validation.aggregate({
          where: {
            translation: {
              user: { countryCode },
              variant: variant as any
            }
          },
          _avg: { rating: true }
        });

        return {
          countryCode,
          countryName: countryData.name,
          flag: countryData.flag,
          variant,
          totalTranslators: translators.length,
          activeTranslators: activeTranslators.length,
          totalTranslations: translationsCount,
          approvedTranslations: approvedTranslationsCount,
          totalValidations: validationsCount,
          totalPoints,
          averageQuality: qualityData._avg.rating 
            ? Math.round(qualityData._avg.rating * 10) / 10 
            : null,
          topContributor: topContributor ? {
            id: topContributor.id,
            name: topContributor.name,
            points: topContributor.points
          } : null
        };
      })
    );

    // Filter out nulls (from variant filtering) and sort by total points
    const validRankings = rankings
      .filter(r => r !== null)
      .sort((a, b) => b!.totalPoints - a!.totalPoints)
      .map((r, index) => ({
        ...r,
        rank: index + 1
      }));

    res.json({
      success: true,
      rankings: validRankings,
      totalCountries: validRankings.length,
      variantFilter: variantFilter || 'ALL',
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/cplp-analytics/variant-comparison/:termId - Compare translations across variants
router.get('/variant-comparison/:termId', async (req, res, next) => {
  try {
    const { termId } = req.params;

    // Get term (accept both UUID and HP:XXXXX)
    const isHpoId = termId.startsWith('HP:');
    const term = await prisma.hpoTerm.findFirst({
      where: isHpoId ? { hpoId: termId } : { id: termId },
      select: {
        id: true,
        hpoId: true,
        labelEn: true,
        definitionEn: true
      }
    });

    if (!term) {
      throw new AppError('Term not found', 404);
    }

    // Get all translations for this term across all variants
    const translations = await prisma.translation.findMany({
      where: {
        termId: term.id,
        status: { in: ['APPROVED', 'PENDING_REVIEW'] }
      },
      select: {
        id: true,
        variant: true,
        labelPt: true,
        definitionPt: true,
        confidence: true,
        isNativeTranslation: true,
        nativeValidations: true,
        status: true,
        user: {
          select: {
            name: true,
            nativeVariant: true
          }
        },
        validations: {
          select: {
            rating: true,
            decision: true
          }
        }
      },
      orderBy: { variant: 'asc' }
    });

    // Group translations by variant
    const translationsByVariant = translations.map(t => {
      const avgRating = t.validations.length > 0
        ? t.validations.reduce((sum, v) => sum + v.rating, 0) / t.validations.length
        : null;

      return {
        variant: t.variant,
        labelPt: t.labelPt, // Use labelPt for consistency with API
        definition: t.definitionPt,
        confidence: t.confidence,
        isNativeTranslation: t.isNativeTranslation,
        nativeValidations: t.nativeValidations,
        status: t.status,
        avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        translator: t.user.name ? { name: t.user.name } : null, // Return object with name property
        translatorVariant: t.user.nativeVariant
      };
    });

    // Detect divergences (different translations for same term)
    const uniqueTexts = new Set(translations.map(t => t.labelPt.toLowerCase().trim()));
    const hasDivergences = uniqueTexts.size > 1;

    res.json({
      success: true,
      termId: term.id,
      termName: term.labelEn,
      term: {
        id: term.id,
        hpoId: term.hpoId,
        labelEn: term.labelEn,
        definitionEn: term.definitionEn
      },
      translations: translationsByVariant,
      hasDivergences,
      divergenceCount: uniqueTexts.size,
      variantsCount: translations.length,
      notes: hasDivergences 
        ? 'Este termo tem traduções diferentes em algumas variantes' 
        : 'Tradução consistente em todas as variantes disponíveis'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/cplp-analytics/user-contribution/:userId - Get user's contribution by variant
router.get('/user-contribution/:userId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { userId } = req.params;

    // Get user data first to check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        nativeVariant: true,
        secondaryVariants: true,
        countryCode: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check authorization (users can only view their own stats, or admins can view anyone)
    if (req.user?.id !== userId && req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      throw new AppError('Not authorized to view this user\'s stats', 403);
    }

    // Get contributions by variant
    const contributionsByVariant = await Promise.all(
      PORTUGUESE_VARIANTS.map(async (variant) => {
        const translationsCount = await prisma.translation.count({
          where: { userId, variant }
        });

        const approvedCount = await prisma.translation.count({
          where: { userId, variant, status: 'APPROVED' }
        });

        const nativeTranslationsCount = await prisma.translation.count({
          where: { userId, variant, isNativeTranslation: true }
        });

        return {
          variant,
          total: translationsCount,
          approved: approvedCount,
          native: nativeTranslationsCount,
          isNativeVariant: user.nativeVariant === variant,
          isSecondaryVariant: user.secondaryVariants?.includes(variant as any) || false
        };
      })
    );

    // Filter out variants with 0 contributions
    const activeContributions = contributionsByVariant.filter(c => c.total > 0);

    res.json({
      success: true,
      userId: user.id,
      userName: user.name,
      countryCode: user.countryCode,
      nativeVariant: user.nativeVariant,
      user: {
        id: user.id,
        name: user.name,
        nativeVariant: user.nativeVariant,
        secondaryVariants: user.secondaryVariants,
        countryCode: user.countryCode
      },
      contributions: activeContributions,
      totalContributions: activeContributions.reduce((sum, c) => sum + c.total, 0),
      variantsContributed: activeContributions.length
    });
  } catch (error) {
    next(error);
  }
});

export default router;
