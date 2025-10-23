import { Router } from 'express';
import prisma from '../config/database';
import { AuthRequest, authenticate } from '../middleware/auth';
import { getPromotionProgress } from '../services/promotion.service';

const router = Router();

// GET /api/users/profile/complete - MUST BE BEFORE /profile/:id TO AVOID MATCHING :id
router.get('/profile/complete', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        institution: true,
        specialty: true,
        country: true,
        bio: true,
        avatarUrl: true,
        orcidId: true,
        profileJson: true,
        points: true,
        level: true,
        streak: true,
        role: true,
        hasCompletedOnboarding: true,
        createdAt: true
      }
    });

    console.log('📋 user.routes - Found user:', user ? 'YES' : 'NO');
    console.log('📋 user.routes - User data:', user ? `${user.email} (${user.id})` : 'null');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        ...user,
        professionalProfile: user.profileJson || {}
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/profile/:id
router.get('/profile/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        institution: true,
        specialty: true,
        country: true,
        bio: true,
        avatarUrl: true,
        points: true,
        level: true,
        streak: true,
        createdAt: true,
        _count: {
          select: {
            translations: true,
            validations: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/promotion-progress - Get user's promotion progress
router.get('/promotion-progress', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const progress = await getPromotionProgress(req.user.id);

    if (!progress) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id/stats - Get user stats
router.get('/:id/stats', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        points: true,
        level: true,
        streak: true,
        _count: {
          select: {
            translations: true,
            validations: true,
            comments: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate level from points
    const calculatedLevel = Math.floor(user.points / 100) + 1;

    res.json({
      totalXp: user.points,
      level: calculatedLevel,
      streak: user.streak,
      translationsCount: user._count.translations,
      validationsCount: user._count.validations,
      commentsCount: user._count.comments
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/me - Get current user (alias for /api/auth/me)
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        points: true,
        level: true,
        institution: true,
        specialty: true,
        country: true,
        orcidId: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            translations: true,
            validations: true,
            comments: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate level from points
    const calculatedLevel = Math.floor(user.points / 100) + 1;

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      points: user.points,
      level: calculatedLevel,
      institution: user.institution,
      specialty: user.specialty,
      country: user.country,
      orcidId: user.orcidId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      stats: {
        translationsCount: user._count.translations,
        validationsCount: user._count.validations,
        commentsCount: user._count.comments
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id - Get user by ID (alias for /api/users/profile/:id)
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        institution: true,
        specialty: true,
        country: true,
        bio: true,
        avatarUrl: true,
        points: true,
        level: true,
        streak: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            translations: true,
            validations: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Fetch user badges
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: req.params.id },
      include: {
        badge: {
          select: {
            id: true,
            name: true,
            description: true,
            iconUrl: true,
            rarity: true,
            points: true
          }
        }
      },
      orderBy: {
        earnedAt: 'desc'
      }
    });
    
    // Transform badges to expected format
    const badges = userBadges.map(ub => ({
      id: ub.badge.id,
      name: ub.badge.name,
      description: ub.badge.description,
      iconUrl: ub.badge.iconUrl,
      rarity: ub.badge.rarity,
      points: ub.badge.points,
      earnedAt: ub.earnedAt
    }));
    
    res.json({
      ...user,
      badges // Add badges to response
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id/badges - Get user badges
router.get('/:id/badges', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: req.params.id },
      include: {
        badge: {
          select: {
            id: true,
            name: true,
            description: true,
            iconUrl: true,
            rarity: true,
            points: true
          }
        }
      },
      orderBy: {
        earnedAt: 'desc'
      }
    });

    // Transform to expected format
    const badges = userBadges.map(ub => ({
      id: ub.badge.id,
      name: ub.badge.name,
      description: ub.badge.description,
      iconUrl: ub.badge.iconUrl,
      rarity: ub.badge.rarity,
      points: ub.badge.points,
      earnedAt: ub.earnedAt
    }));

    res.json({
      badges
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/complete-onboarding - Mark user's onboarding as completed
router.post('/complete-onboarding', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Update user's onboarding status
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        hasCompletedOnboarding: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        hasCompletedOnboarding: true
      }
    });

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      user
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/profile/professional - Update professional profile
router.put('/profile/professional', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const {
      academicDegree,
      fieldOfStudy,
      professionalRole,
      yearsOfExperience,
      institution,
      medicalSpecialty,
      researchArea,
      englishProficiency,
      ehealsScore,
      ehealsAnswers
    } = req.body;

    // Validate academicDegree if provided
    const validDegrees = ['high_school', 'bachelor', 'master', 'phd', 'postdoc', 'other'];
    if (academicDegree && !validDegrees.includes(academicDegree)) {
      return res.status(400).json({ 
        error: 'Invalid academic degree. Must be one of: ' + validDegrees.join(', ') 
      });
    }

    // Validate professionalRole if provided
    const validRoles = ['researcher', 'clinician', 'student', 'professor', 'translator', 'other'];
    if (professionalRole && !validRoles.includes(professionalRole)) {
      return res.status(400).json({ 
        error: 'Invalid professional role. Must be one of: ' + validRoles.join(', ') 
      });
    }

    // Validate englishProficiency if provided
    const validProficiency = ['basic', 'intermediate', 'advanced', 'fluent', 'native'];
    if (englishProficiency && !validProficiency.includes(englishProficiency)) {
      return res.status(400).json({ 
        error: 'Invalid English proficiency. Must be one of: ' + validProficiency.join(', ') 
      });
    }

    // Validate ehealsScore if provided
    if (ehealsScore !== undefined && (ehealsScore < 8 || ehealsScore > 40)) {
      return res.status(400).json({ 
        error: 'Invalid eHEALS score. Must be between 8 and 40.' 
      });
    }

    // Validate ehealsAnswers if provided
    if (ehealsAnswers) {
      if (!Array.isArray(ehealsAnswers) || ehealsAnswers.length !== 8) {
        return res.status(400).json({ 
          error: 'eHEALS answers must be an array of 8 numbers.' 
        });
      }
      if (ehealsAnswers.some((ans: number) => ans < 1 || ans > 5)) {
        return res.status(400).json({ 
          error: 'Each eHEALS answer must be between 1 and 5.' 
        });
      }
    }

    // Build profile object (only include non-undefined fields)
    const profileData: Record<string, any> = {};
    if (academicDegree !== undefined) profileData.academicDegree = academicDegree;
    if (fieldOfStudy !== undefined) profileData.fieldOfStudy = fieldOfStudy;
    if (professionalRole !== undefined) profileData.professionalRole = professionalRole;
    if (yearsOfExperience !== undefined) profileData.yearsOfExperience = yearsOfExperience;
    if (institution !== undefined) profileData.institution = institution;
    if (medicalSpecialty !== undefined) profileData.medicalSpecialty = medicalSpecialty;
    if (researchArea !== undefined) profileData.researchArea = researchArea;
    if (englishProficiency !== undefined) profileData.englishProficiency = englishProficiency;
    if (ehealsScore !== undefined) profileData.ehealsScore = ehealsScore;
    if (ehealsAnswers !== undefined) profileData.ehealsAnswers = ehealsAnswers;

    // Get current profile to merge with new data
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileJson: true }
    });

    // Merge existing profile with new data
    const mergedProfile = {
      ...(currentUser?.profileJson as Record<string, any> || {}),
      ...profileData
    };

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profileJson: mergedProfile
      },
      select: {
        id: true,
        email: true,
        name: true,
        orcidId: true,
        profileJson: true
      }
    });

    res.json({
      success: true,
      message: 'Professional profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/users/profile - Update user CPLP preferences (Sprint 2.0)
router.patch('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        nativeVariant: true,
        secondaryVariants: true
      }
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const {
      countryCode,
      nativeVariant,
      secondaryVariants,
      preferredVariants,
      countriesOfInterest
    } = req.body;

    // Validate countryCode if provided
    const validCountryCodes = ['BR', 'PT', 'AO', 'MZ', 'GW', 'CV', 'ST', 'TL', 'GQ'];
    if (countryCode && !validCountryCodes.includes(countryCode)) {
      return res.status(400).json({
        error: 'Invalid country code'
      });
    }

    // Validate secondaryVariants doesn't include nativeVariant
    const finalNativeVariant = nativeVariant !== undefined ? nativeVariant : currentUser.nativeVariant;
    const finalSecondaryVariants = secondaryVariants !== undefined ? secondaryVariants : currentUser.secondaryVariants;

    if (finalNativeVariant && finalSecondaryVariants?.includes(finalNativeVariant)) {
      return res.status(400).json({
        error: 'Secondary variants cannot include native variant'
      });
    }

    // Auto-fill preferredVariants if not provided: combine native + secondary
    const autoPreferredVariants = preferredVariants || [
      ...(finalNativeVariant ? [finalNativeVariant] : []),
      ...(finalSecondaryVariants || [])
    ].filter(Boolean);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        countryCode: countryCode !== undefined ? countryCode : undefined,
        nativeVariant: nativeVariant !== undefined ? nativeVariant : undefined,
        secondaryVariants: secondaryVariants !== undefined ? secondaryVariants : undefined,
        preferredVariants: autoPreferredVariants,
        countriesOfInterest: countriesOfInterest !== undefined ? countriesOfInterest : undefined
      },
      select: {
        id: true,
        email: true,
        name: true,
        countryCode: true,
        nativeVariant: true,
        secondaryVariants: true,
        preferredVariants: true,
        countriesOfInterest: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

export default router;
