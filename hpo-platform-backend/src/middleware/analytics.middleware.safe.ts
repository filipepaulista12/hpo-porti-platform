import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

/**
 * Middleware analytics ULTRA-DEFENSIVO
 * - Apenas logs API metrics
 * - Usa setImmediate() para garantir não bloqueio
 * - ZERO awaits no fluxo principal
 * - Tudo é fire-and-forget com catch silencioso
 */

export const analyticsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip desnecessários
  const skipPaths = ['/health', '/static', '/socket.io', '/api/analytics'];
  if (skipPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  const startTime = Date.now();
  
  // Capturar dados básicos (SINCRONO)
  const ipAddress = (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
    req.socket.remoteAddress || 
    'unknown'
  ).replace('::ffff:', '');
  
  const userAgent = req.headers['user-agent'] || 'unknown';
  const userId = (req as any).userId;
  const endpoint = req.path;
  const method = req.method;
  
  // Observar resposta (NÃO INTERCEPTA)
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    // CRÍTICO: setImmediate() + fire-and-forget
    setImmediate(() => {
      prisma.apiMetrics.create({
        data: {
          endpoint,
          method,
          statusCode: res.statusCode,
          responseTime,
          userId: userId || null,
          ipAddress,
          userAgent,
          errorMessage: res.statusCode >= 400 ? `HTTP ${res.statusCode}` : null
        }
      }).catch(() => {
        // Silenciar TODOS os erros
      });
    });
  });
  
  // IMPORTANTE: Continua IMEDIATAMENTE
  next();
};

export default analyticsMiddleware;
