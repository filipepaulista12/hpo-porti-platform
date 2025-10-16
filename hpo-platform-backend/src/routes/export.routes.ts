import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Helper function to escape CSV values
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Helper function to escape TSV values
function escapeTSV(value: string): string {
  return value.replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '');
}

// GET /api/export/translations - Export translations in various formats
router.get('/translations', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { format, status, userId, startDate, endDate, onlyApproved } = req.query;
    
    // Build query filters
    const where: any = {};
    
    if (status) {
      where.translationStatus = status;
    }
    
    if (userId) {
      where.userId = parseInt(userId as string);
    }
    
    if (onlyApproved === 'true') {
      where.translationStatus = 'APPROVED';
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }
    
    // Fetch translations with related data
    const translations = await prisma.translation.findMany({
      where,
      include: {
        term: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            orcidId: true
          }
        },
        validations: {
          include: {
            validator: {
              select: {
                username: true,
                orcidId: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Generate export based on format
    let output: string;
    let contentType: string;
    let filename: string;
    
    switch (format) {
      case 'csv':
        output = generateCSV(translations);
        contentType = 'text/csv; charset=utf-8';
        filename = `hpo-translations-${Date.now()}.csv`;
        break;
        
      case 'json':
        output = generateJSON(translations);
        contentType = 'application/json; charset=utf-8';
        filename = `hpo-translations-${Date.now()}.json`;
        break;
        
      case 'xliff':
        output = generateXLIFF(translations);
        contentType = 'application/x-xliff+xml; charset=utf-8';
        filename = `hpo-translations-${Date.now()}.xlf`;
        break;
        
      case 'babelon':
        output = generateBabelon(translations);
        contentType = 'text/tab-separated-values; charset=utf-8';
        filename = `hp-pt.babelon.tsv`;
        break;
        
      case 'fivestars':
        output = generateFiveStars(translations);
        contentType = 'text/tab-separated-values; charset=utf-8';
        filename = `hpo-translations-fivestars-${Date.now()}.tsv`;
        break;
        
      default:
        throw new AppError('Invalid format. Supported: csv, json, xliff, babelon, fivestars', 400);
    }
    
    // Set response headers for download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(output);
    
  } catch (error) {
    next(error);
  }
});

// CSV Format - Excel compatible
function generateCSV(translations: any[]): string {
  const headers = [
    'HPO ID',
    'Termo Original (EN)',
    'Tradução (PT)',
    'Definição Original (EN)',
    'Definição Traduzida (PT)',
    'Status',
    'Confiança Termo',
    'Confiança Definição',
    'Categoria',
    'Dificuldade',
    'Tradutor',
    'Email Tradutor',
    'ORCID',
    'Data Criação',
    'Data Atualização',
    'Número de Validações',
    'Validações Positivas',
    'Validações Negativas',
    'Rating Médio'
  ].map(escapeCSV).join(',');
  
  const rows = translations.map(t => {
    const approvedCount = t.validations.filter((v: any) => v.decision === 'APPROVED').length;
    const rejectedCount = t.validations.filter((v: any) => v.decision === 'REJECTED').length;
    const avgRating = t.validations.length > 0
      ? t.validations.reduce((sum: number, v: any) => sum + (v.rating || 0), 0) / t.validations.length
      : 0;
    
    return [
      escapeCSV(t.hpoTerm.hpoId),
      escapeCSV(t.hpoTerm.labelEn),
      escapeCSV(t.labelPt),
      escapeCSV(t.hpoTerm.definitionEn || ''),
      escapeCSV(t.definitionPt || ''),
      escapeCSV(t.translationStatus),
      escapeCSV(t.confidenceLabel?.toString() || ''),
      escapeCSV(t.confidenceDefinition?.toString() || ''),
      escapeCSV(t.hpoTerm.category || ''),
      escapeCSV(t.hpoTerm.difficulty?.toString() || ''),
      escapeCSV(t.user.username),
      escapeCSV(t.user.email),
      escapeCSV(t.user.orcid || ''),
      escapeCSV(new Date(t.createdAt).toISOString()),
      escapeCSV(new Date(t.updatedAt).toISOString()),
      escapeCSV(t.validations.length.toString()),
      escapeCSV(approvedCount.toString()),
      escapeCSV(rejectedCount.toString()),
      escapeCSV(avgRating.toFixed(2))
    ].join(',');
  });
  
  return [headers, ...rows].join('\n');
}

// JSON Format - API friendly
function generateJSON(translations: any[]): string {
  const formatted = translations.map(t => ({
    hpoId: t.hpoTerm.hpoId,
    original: {
      label: t.hpoTerm.labelEn,
      definition: t.hpoTerm.definitionEn
    },
    translation: {
      label: t.labelPt,
      definition: t.definitionPt,
      confidenceLabel: t.confidenceLabel,
      confidenceDefinition: t.confidenceDefinition
    },
    metadata: {
      category: t.hpoTerm.category,
      difficulty: t.hpoTerm.difficulty,
      status: t.translationStatus,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    },
    translator: {
      username: t.user.username,
      email: t.user.email,
      orcid: t.user.orcid
    },
    validations: t.validations.map((v: any) => ({
      decision: v.decision,
      rating: v.rating,
      comment: v.comment,
      validator: {
        username: v.validator.username,
        orcid: v.validator.orcid
      },
      createdAt: v.createdAt
    }))
  }));
  
  return JSON.stringify({
    exportDate: new Date().toISOString(),
    totalTranslations: translations.length,
    translations: formatted
  }, null, 2);
}

// XLIFF Format - International standard for translations
function generateXLIFF(translations: any[]): string {
  const transUnits = translations.map((t, index) => {
    return `    <trans-unit id="${index + 1}" resname="${t.hpoTerm.hpoId}">
      <source xml:lang="en">${escapeXML(t.hpoTerm.labelEn)}</source>
      <target xml:lang="pt" state="${mapStatusToXLIFFState(t.translationStatus)}">${escapeXML(t.labelPt)}</target>
      <note>${escapeXML(t.hpoTerm.definitionEn || '')}</note>
      <note from="translator">${escapeXML(t.user.username)}</note>
      ${t.user.orcid ? `<note from="orcid">${escapeXML(t.user.orcid)}</note>` : ''}
      <note from="confidence">${t.confidenceLabel}/5</note>
    </trans-unit>`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file original="HPO" source-language="en" target-language="pt" datatype="plaintext">
    <header>
      <note>Human Phenotype Ontology Translations - Portuguese (Brazil)</note>
      <note>Export Date: ${new Date().toISOString()}</note>
      <note>Total Translations: ${translations.length}</note>
    </header>
    <body>
${transUnits}
    </body>
  </file>
</xliff>`;
}

// Babelon TSV Format - Official HPO format for contribution
function generateBabelon(translations: any[]): string {
  const headers = [
    'source_language',
    'translation_language',
    'subject_id',
    'predicate_id',
    'source_value',
    'translation_value',
    'translation_status',
    'translator',
    'confidence_label',
    'confidence_definition',
    'validations_count',
    'avg_rating'
  ].join('\t');
  
  const rows = translations.map(t => {
    const avgRating = t.validations.length > 0
      ? t.validations.reduce((sum: number, v: any) => sum + (v.rating || 0), 0) / t.validations.length
      : 0;
    
    // Map internal status to HPO status
    let hpoStatus = 'CANDIDATE';
    if (t.translationStatus === 'APPROVED') hpoStatus = 'OFFICIAL';
    else if (t.translationStatus === 'NEEDS_REVISION') hpoStatus = 'CANDIDATE';
    
    const translator = t.user.orcid ? `orcid:${t.user.orcid}` : t.user.email;
    
    return [
      'en',
      'pt',
      escapeTSV(t.hpoTerm.hpoId),
      'rdfs:label',
      escapeTSV(t.hpoTerm.labelEn),
      escapeTSV(t.labelPt),
      hpoStatus,
      escapeTSV(translator),
      t.confidenceLabel?.toString() || '',
      t.confidenceDefinition?.toString() || '',
      t.validations.length.toString(),
      avgRating.toFixed(2)
    ].join('\t');
  });
  
  return [headers, ...rows].join('\n');
}

// Five Stars TSV Format - Confidence and quality metrics
function generateFiveStars(translations: any[]): string {
  const headers = [
    'hpo_id',
    'term_en',
    'term_pt',
    'confidence_label',
    'confidence_definition',
    'validations_count',
    'approved_count',
    'rejected_count',
    'needs_revision_count',
    'avg_rating',
    'quality_score',
    'status',
    'translator',
    'translator_orcid',
    'created_at',
    'last_updated'
  ].join('\t');
  
  const rows = translations.map(t => {
    const approvedCount = t.validations.filter((v: any) => v.decision === 'APPROVED').length;
    const rejectedCount = t.validations.filter((v: any) => v.decision === 'REJECTED').length;
    const needsRevisionCount = t.validations.filter((v: any) => v.decision === 'NEEDS_REVISION').length;
    
    const avgRating = t.validations.length > 0
      ? t.validations.reduce((sum: number, v: any) => sum + (v.rating || 0), 0) / t.validations.length
      : 0;
    
    // Calculate quality score (0-5)
    const qualityScore = calculateQualityScore(
      t.confidenceLabel || 0,
      t.confidenceDefinition || 0,
      avgRating,
      approvedCount,
      rejectedCount,
      t.validations.length
    );
    
    return [
      escapeTSV(t.hpoTerm.hpoId),
      escapeTSV(t.hpoTerm.labelEn),
      escapeTSV(t.labelPt),
      t.confidenceLabel?.toString() || '0',
      t.confidenceDefinition?.toString() || '0',
      t.validations.length.toString(),
      approvedCount.toString(),
      rejectedCount.toString(),
      needsRevisionCount.toString(),
      avgRating.toFixed(2),
      qualityScore.toFixed(2),
      escapeTSV(t.translationStatus),
      escapeTSV(t.user.username),
      escapeTSV(t.user.orcid || ''),
      new Date(t.createdAt).toISOString(),
      new Date(t.updatedAt).toISOString()
    ].join('\t');
  });
  
  return [headers, ...rows].join('\n');
}

// Helper: Calculate quality score based on multiple factors
function calculateQualityScore(
  confidenceLabel: number,
  confidenceDefinition: number,
  avgRating: number,
  approvedCount: number,
  rejectedCount: number,
  totalValidations: number
): number {
  // Base score from confidence (40% weight)
  const avgConfidence = (confidenceLabel + confidenceDefinition) / 2;
  const confidenceScore = (avgConfidence / 5) * 2; // 0-2 points
  
  // Validation rating score (30% weight)
  const ratingScore = (avgRating / 5) * 1.5; // 0-1.5 points
  
  // Peer review score (30% weight)
  let reviewScore = 0;
  if (totalValidations > 0) {
    const approvalRate = approvedCount / totalValidations;
    reviewScore = approvalRate * 1.5; // 0-1.5 points
  }
  
  // Total: 0-5 stars
  return Math.min(5, confidenceScore + ratingScore + reviewScore);
}

// Helper: Map internal status to XLIFF state
function mapStatusToXLIFFState(status: string): string {
  switch (status) {
    case 'APPROVED': return 'final';
    case 'PENDING_REVIEW': return 'needs-review-translation';
    case 'NEEDS_REVISION': return 'needs-adaptation';
    case 'REJECTED': return 'needs-translation';
    default: return 'new';
  }
}

// Helper: Escape XML special characters
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default router;
