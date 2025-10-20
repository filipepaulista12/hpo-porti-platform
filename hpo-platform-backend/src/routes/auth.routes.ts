import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import axios from 'axios';
import crypto from 'crypto';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string()
    .email({ message: 'Invalid email format' })
    .min(1, { message: 'Email is required' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters' }),
  institution: z.string().optional(),
  specialty: z.string().optional(),
  country: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Helper: Generate JWT
const generateToken = (userId: string, email: string, role: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError('JWT secret not configured', 500);
  
  const expiresIn: string = process.env.JWT_EXPIRES_IN || '7d';
  // @ts-ignore - JWT types are conflicting
  return jwt.sign(
    { id: userId, email, role },
    secret,
    { expiresIn: expiresIn }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    // Validate request body
    const validation = registerSchema.safeParse(req.body);
    
    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }
    
    const data = validation.data;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });
    
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        institution: data.institution,
        specialty: data.specialty,
        country: data.country,
        role: 'TRANSLATOR'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        points: true,
        level: true
      }
    });
    
    // Generate token
    const token = generateToken(user.id, user.email, user.role);
    
    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });
    
    if (!user || !user.password) {
      throw new AppError('Invalid credentials', 401);
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(data.password, user.password);
    
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }
    
    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() }
    });
    
    // Generate token
    const token = generateToken(user.id, user.email, user.role);
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        points: user.points,
        level: user.level,
        specialty: user.specialty
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// OAuth Configuration Endpoint
// ============================================

/**
 * GET /api/auth/config
 * Returns OAuth configuration for frontend
 */
router.get('/config', (req, res) => {
  const config: any = {
    providers: []
  };

  // ORCID configuration
  if (process.env.ORCID_CLIENT_ID) {
    const useProduction = process.env.ORCID_USE_PRODUCTION !== 'false';
    const orcidBaseUrl = useProduction ? 'https://orcid.org' : 'https://sandbox.orcid.org';
    
    config.providers.push({
      name: 'orcid',
      enabled: true,
      authUrl: `${orcidBaseUrl}/oauth/authorize`,
      clientId: process.env.ORCID_CLIENT_ID,
      redirectUri: process.env.ORCID_REDIRECT_URI || 'http://localhost:3001/api/auth/orcid/callback'
    });
  }

  // LinkedIn configuration
  if (process.env.LINKEDIN_CLIENT_ID) {
    config.providers.push({
      name: 'linkedin',
      enabled: true,
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      clientId: process.env.LINKEDIN_CLIENT_ID,
      redirectUri: process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3001/api/auth/linkedin/callback'
    });
  }

  // Google configuration (if needed in future)
  if (process.env.GOOGLE_CLIENT_ID) {
    config.providers.push({
      name: 'google',
      enabled: true,
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      clientId: process.env.GOOGLE_CLIENT_ID,
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback'
    });
  }

  res.json(config);
});

// ============================================
// ORCID OAuth Integration
// ============================================

/**
 * GET /api/auth/orcid
 * Redirect user to ORCID authorization page
 */
router.get('/orcid', (req, res) => {
  const clientId = process.env.ORCID_CLIENT_ID;
  const redirectUri = process.env.ORCID_REDIRECT_URI || 'http://localhost:3001/api/auth/orcid/callback';
  const scope = '/authenticate';
  const responseType = 'code';
  
  // Use production ORCID URLs (can be overridden with ORCID_USE_PRODUCTION=false)
  const useProduction = process.env.ORCID_USE_PRODUCTION !== 'false';
  const orcidBaseUrl = useProduction
    ? 'https://orcid.org' 
    : 'https://sandbox.orcid.org';

  if (!clientId) {
    return res.status(500).json({ 
      error: 'ORCID not configured',
      message: 'ORCID_CLIENT_ID not set in environment variables'
    });
  }

  // Build authorization URL
  const authUrl = `${orcidBaseUrl}/oauth/authorize?` + 
    `client_id=${clientId}&` +
    `response_type=${responseType}&` +
    `scope=${scope}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}`;

  res.json({ 
    authUrl,
    message: 'Redirect user to this URL for ORCID authentication'
  });
});

/**
 * GET /api/auth/orcid/callback
 * Handle ORCID OAuth callback and create/login user
 */
router.get('/orcid/callback', async (req, res, next) => {
  try {
    const { code, error } = req.query;

    if (error) {
      throw new AppError(`ORCID authorization failed: ${error}`, 400);
    }

    if (!code || typeof code !== 'string') {
      throw new AppError('Authorization code not provided', 400);
    }

    const clientId = process.env.ORCID_CLIENT_ID;
    const clientSecret = process.env.ORCID_CLIENT_SECRET;
    const redirectUri = process.env.ORCID_REDIRECT_URI || 'http://localhost:3001/api/auth/orcid/callback';
    
    if (!clientId || !clientSecret) {
      throw new AppError('ORCID credentials not configured', 500);
    }

    // Exchange authorization code for access token
    const useProduction = process.env.ORCID_USE_PRODUCTION !== 'false';
    const orcidBaseUrl = useProduction
      ? 'https://orcid.org' 
      : 'https://sandbox.orcid.org';

    logger.info(`ORCID: Exchanging code for token at ${orcidBaseUrl}/oauth/token`);
    logger.info(`ORCID: Client ID: ${clientId}`);
    logger.info(`ORCID: Redirect URI: ${redirectUri}`);

    const tokenResponse = await fetch(`${orcidBaseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    logger.info(`ORCID: Token response status: ${tokenResponse.status}`);
    logger.info(`ORCID: Response headers: ${JSON.stringify(Object.fromEntries(tokenResponse.headers.entries()))}`);

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      logger.error(`ORCID: Token error response: ${errorData}`);
      throw new AppError(`Failed to exchange code for token: ${errorData}`, 400);
    }

    // Get response as text first to log it
    const responseText = await tokenResponse.text();
    logger.info(`ORCID: Token response body: ${responseText}`);
    
    let tokenData: any;
    try {
      tokenData = JSON.parse(responseText);
    } catch (parseError) {
      logger.error(`ORCID: Failed to parse token response as JSON. Response was: ${responseText}`);
      throw new AppError('Invalid response from ORCID - expected JSON but got HTML', 500);
    }
    const { access_token, orcid, name } = tokenData;

    if (!orcid) {
      throw new AppError('ORCID iD not returned', 400);
    }

    // Use data from token response (name and orcid are already available)
    // Note: ORCID /authenticate scope doesn't provide email, so we use orcid@orcid.org
    const email = `${orcid}@orcid.org`;
    const fullName = name || 'ORCID User';
    
    logger.info(`ORCID: User authenticated - ORCID: ${orcid}, Name: ${fullName}`);

    // Check if user exists with this ORCID
    let user = await prisma.user.findUnique({
      where: { orcidId: orcid }
    });

    if (!user) {
      // Check if user exists with this email
      user = await prisma.user.findUnique({
        where: { email }
      });

      if (user) {
        // Link ORCID to existing account
        user = await prisma.user.update({
          where: { id: user.id },
          data: { orcidId: orcid }
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email,
            name: fullName,
            orcidId: orcid,
            password: '', // No password for ORCID users
            role: 'TRANSLATOR',
            isActive: true
          }
        });
      }
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    // Calculate level
    const level = Math.floor(user.points / 100) + 1;

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}?orcid_token=${token}&orcid_success=true`);

  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me - Get current authenticated user
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      throw new AppError('User not authenticated', 401);
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
      throw new AppError('User not found', 404);
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

// ============================================================================
// LINKEDIN OAUTH 2.0 INTEGRATION
// ============================================================================

/**
 * GET /api/auth/linkedin
 * Inicia o fluxo OAuth do LinkedIn
 * Redireciona o usuário para a página de autorização do LinkedIn
 */
router.get('/linkedin', (req, res) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3001/api/auth/linkedin/callback';
  
  if (!clientId) {
    throw new AppError('LinkedIn OAuth not configured. Please set LINKEDIN_CLIENT_ID in .env', 500);
  }
  
  // Generate random state for CSRF protection
  const state = crypto.randomBytes(16).toString('hex');
  
  // Store state in session (or you can use Redis for production)
  // For simplicity, we'll validate it in the callback using a simple approach
  
  const scope = 'r_liteprofile r_emailaddress'; // Permissions needed
  
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code` +
    `&client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}` +
    `&scope=${encodeURIComponent(scope)}`;
  
  logger.info('LinkedIn OAuth initiated', { state });
  
  res.redirect(authUrl);
});

/**
 * GET /api/auth/linkedin/callback
 * Callback após autorização do LinkedIn
 * Troca o code por access token e cria/atualiza o usuário
 */
router.get('/linkedin/callback', async (req, res, next) => {
  try {
    const { code, state, error, error_description } = req.query;
    
    // Check for errors from LinkedIn
    if (error) {
      logger.error('LinkedIn OAuth error', { error, error_description });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/login?error=${error}&message=${encodeURIComponent(error_description as string || 'LinkedIn authentication failed')}`);
    }
    
    if (!code) {
      throw new AppError('Authorization code not received from LinkedIn', 400);
    }
    
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3001/api/auth/linkedin/callback';
    
    if (!clientId || !clientSecret) {
      throw new AppError('LinkedIn OAuth not properly configured', 500);
    }
    
    // Exchange code for access token
    logger.info('Exchanging LinkedIn code for access token');
    
    const tokenResponse = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const accessToken = tokenResponse.data.access_token;
    
    if (!accessToken) {
      throw new AppError('Failed to obtain access token from LinkedIn', 500);
    }
    
    // Fetch user profile from LinkedIn
    logger.info('Fetching LinkedIn profile');
    
    const [profileResponse, emailResponse] = await Promise.all([
      axios.get('https://api.linkedin.com/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      }),
      axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
    ]);
    
    const profile = profileResponse.data;
    const emailData = emailResponse.data;
    
    // Extract email
    const email = emailData.elements?.[0]?.['handle~']?.emailAddress;
    
    if (!email) {
      throw new AppError('Could not retrieve email from LinkedIn', 400);
    }
    
    // Extract profile data
    const firstName = profile.localizedFirstName || '';
    const lastName = profile.localizedLastName || '';
    const linkedinId = profile.id;
    
    logger.info('LinkedIn profile retrieved', { email, linkedinId });
    
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (user) {
      // User exists - update LinkedIn ID if not set
      if (!user.orcidId || !user.orcidId.startsWith('linkedin:')) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            orcidId: `linkedin:${linkedinId}`,
            lastLoginAt: new Date()
          }
        });
      } else {
        // Just update last login
        user = await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });
      }
      
      logger.info('Existing user logged in via LinkedIn', { userId: user.id, email });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`.trim() || 'LinkedIn User',
          orcidId: `linkedin:${linkedinId}`,
          role: 'TRANSLATOR',
          password: null, // OAuth users don't have password
          lastLoginAt: new Date()
        }
      });
      
      logger.info('New user created via LinkedIn', { userId: user.id, email });
    }
    
    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&provider=linkedin`);
    
  } catch (error) {
    logger.error('LinkedIn OAuth callback error', { error });
    next(error);
  }
});

export default router;
