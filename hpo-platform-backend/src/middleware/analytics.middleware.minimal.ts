import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Analytics Middleware - VERSÃO MINIMALISTA
 * Apenas loga requisições no banco de dados de forma completamente assíncrona
 * Zero impacto no fluxo da requisição
 */
export const analyticsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Paths a ignorar
  const skipPaths = ['/health', '/static', '/socket.io', '/api/analytics'];
  const shouldSkip = skipPaths.some(path => req.path.startsWith(path));
  
  if (shouldSkip) {
    return next();
  }

  const startTime = Date.now();
  const ipAddress = ((req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                     req.socket.remoteAddress || 
                     'unknown').replace('::ffff:', '');
  const userAgent = req.headers['user-agent'] || 'unknown';
  const userId = (req as any).userId;
  const endpoint = req.path;
  const method = req.method;
  
  // Captura quando resposta termina (não intercepta, apenas observa)
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    // Fire and forget - completamente assíncrono
    process.nextTick(() => {
      saveMetrics({
        endpoint,
        method,
        statusCode: res.statusCode,
        responseTime,
        userId,
        ipAddress,
        userAgent
      });
    });
  });
  
  // IMPORTANTE: Continua IMEDIATAMENTE
  next();
};

/**
 * Salva metrics no banco (fire and forget)
 */
function saveMetrics(data: {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  userId?: string;
  ipAddress: string;
  userAgent: string;
}) {
  // Não usa await - completamente fire and forget
  prisma.apiMetrics.create({
    data: {
      endpoint: data.endpoint,
      method: data.method,
      statusCode: data.statusCode,
      responseTime: data.responseTime,
      userId: data.userId || null,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      errorMessage: data.statusCode >= 400 ? `HTTP ${data.statusCode}` : null
    }
  }).catch(() => {
    // Silencia TODOS os erros - analytics nunca deve afetar aplicação
  });
}

export default analyticsMiddleware;
