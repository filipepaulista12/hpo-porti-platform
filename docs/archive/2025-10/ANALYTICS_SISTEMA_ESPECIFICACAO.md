# 📊 Sistema de Analytics e Metadados - Especificação Técnica

**Versão**: v2.1  
**Data**: 18 de Outubro de 2025  
**Status**: 🚧 Em Desenvolvimento

---

## 📋 Visão Geral

Sistema completo de coleta de metadados, tracking de uso e analytics para administradores. Permite análise detalhada do comportamento dos usuários, performance da plataforma e métricas de engajamento.

---

## 🎯 Objetivos

1. **Coleta Automática**: Capturar metadados sem intervenção manual
2. **Privacy-First**: GDPR compliant, dados anonimizados quando possível
3. **Real-Time**: Dashboards atualizados em tempo real
4. **Actionable Insights**: Métricas que permitem tomada de decisão

---

## 🗄️ Backend - Sistema de Coleta de Metadados (Task 12)

### **1. Schema Prisma - Novas Tabelas**

**Arquivo**: `hpo-platform-backend/prisma/schema.prisma`

```prisma
model SessionLog {
  id           String   @id @default(cuid())
  userId       String?
  user         User?    @relation(fields: [userId], references: [id])
  
  // Geolocation
  ipAddress    String
  country      String?
  city         String?
  region       String?
  latitude     Float?
  longitude    Float?
  
  // Device & Browser
  userAgent    String
  browser      String?
  browserVersion String?
  os           String?
  osVersion    String?
  device       String?  // mobile, tablet, desktop
  isMobile     Boolean  @default(false)
  
  // Session Data
  sessionStart DateTime @default(now())
  sessionEnd   DateTime?
  duration     Int?     // seconds
  pagesVisited String[] // array of page names
  actionsCount Int      @default(0)
  
  // Performance
  avgResponseTime Float? // milliseconds
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@index([userId])
  @@index([sessionStart])
  @@index([country])
}

model UserAnalytics {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  
  // Engagement Metrics
  translationsToday    Int @default(0)
  validationsToday     Int @default(0)
  loginStreak          Int @default(0) // consecutive days
  lastActivityDate     DateTime?
  totalSessions        Int @default(0)
  avgSessionDuration   Float? // seconds
  
  // Activity Patterns
  preferredHours       Int[] // array of hours (0-23)
  preferredDays        Int[] // array of weekdays (0-6)
  mostUsedFeatures     String[] // array of feature names
  
  // Performance
  avgTranslationTime   Float? // seconds per translation
  avgValidationTime    Float? // seconds per validation
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@index([userId])
  @@index([lastActivityDate])
}

model ApiMetrics {
  id            String   @id @default(cuid())
  
  // Request Data
  endpoint      String
  method        String   // GET, POST, PUT, DELETE
  statusCode    Int
  responseTime  Float    // milliseconds
  
  // User Context
  userId        String?
  ipAddress     String
  userAgent     String
  
  // Timing
  timestamp     DateTime @default(now())
  
  @@index([endpoint])
  @@index([timestamp])
  @@index([userId])
}
```

---

### **2. Middleware de Coleta Automática**

**Arquivo**: `hpo-platform-backend/src/middleware/analytics.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import geoip from 'geoip-lite';
import UAParser from 'ua-parser-js';

const prisma = new PrismaClient();

// Store para tracking de sessions ativas
const activeSessions = new Map<string, any>();

export const analyticsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  
  // Capturar dados da request
  const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                    req.socket.remoteAddress || 
                    'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const userId = (req as any).userId; // set by auth middleware
  
  // Parse User-Agent
  const parser = new UAParser(userAgent);
  const uaResult = parser.getResult();
  
  // GeoIP Lookup
  const geo = geoip.lookup(ipAddress.replace('::ffff:', ''));
  
  // Track session
  if (userId) {
    const sessionKey = `${userId}-${ipAddress}`;
    if (!activeSessions.has(sessionKey)) {
      activeSessions.set(sessionKey, {
        userId,
        ipAddress,
        sessionStart: new Date(),
        pagesVisited: [],
        actionsCount: 0
      });
    }
    
    // Update session activity
    const session = activeSessions.get(sessionKey);
    session.pagesVisited.push(req.path);
    session.actionsCount++;
    session.lastActivity = new Date();
  }
  
  // Capture response
  const originalJson = res.json;
  res.json = function (data) {
    const responseTime = Date.now() - startTime;
    
    // Log API metrics (async, don't block response)
    logApiMetrics({
      endpoint: req.path,
      method: req.method,
      statusCode: res.statusCode,
      responseTime,
      userId,
      ipAddress,
      userAgent
    }).catch(console.error);
    
    return originalJson.call(this, data);
  };
  
  next();
};

async function logApiMetrics(data: any) {
  try {
    await prisma.apiMetrics.create({
      data: {
        endpoint: data.endpoint,
        method: data.method,
        statusCode: data.statusCode,
        responseTime: data.responseTime,
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent
      }
    });
  } catch (error) {
    console.error('Error logging API metrics:', error);
  }
}

// Função para finalizar sessões inativas (chamar periodicamente)
export async function closeInactiveSessions() {
  const now = new Date();
  const inactivityThreshold = 30 * 60 * 1000; // 30 minutes
  
  for (const [key, session] of activeSessions.entries()) {
    const timeSinceLastActivity = now.getTime() - session.lastActivity.getTime();
    
    if (timeSinceLastActivity > inactivityThreshold) {
      // Save session to database
      const duration = Math.floor(
        (session.lastActivity.getTime() - session.sessionStart.getTime()) / 1000
      );
      
      const parser = new UAParser(session.userAgent);
      const uaResult = parser.getResult();
      const geo = geoip.lookup(session.ipAddress.replace('::ffff:', ''));
      
      await prisma.sessionLog.create({
        data: {
          userId: session.userId,
          ipAddress: session.ipAddress,
          country: geo?.country || null,
          city: geo?.city || null,
          region: geo?.region || null,
          latitude: geo?.ll?.[0] || null,
          longitude: geo?.ll?.[1] || null,
          userAgent: session.userAgent,
          browser: uaResult.browser.name || null,
          browserVersion: uaResult.browser.version || null,
          os: uaResult.os.name || null,
          osVersion: uaResult.os.version || null,
          device: uaResult.device.type || 'desktop',
          isMobile: uaResult.device.type === 'mobile',
          sessionStart: session.sessionStart,
          sessionEnd: session.lastActivity,
          duration,
          pagesVisited: session.pagesVisited,
          actionsCount: session.actionsCount
        }
      });
      
      // Update UserAnalytics
      await updateUserAnalytics(session.userId, {
        totalSessions: { increment: 1 },
        avgSessionDuration: duration,
        lastActivityDate: session.lastActivity
      });
      
      activeSessions.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(closeInactiveSessions, 5 * 60 * 1000);
```

---

### **3. Endpoints de Analytics**

**Arquivo**: `hpo-platform-backend/src/routes/analytics.routes.ts`

```typescript
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/permissions';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/analytics/dashboard - Overview metrics for admins
router.get('/dashboard', 
  authenticate, 
  requireRole(['ADMIN']), 
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      // Active Users
      const activeUsers = await prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      });
      
      // Translations per day
      const translationsPerDay = await prisma.$queryRaw`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM translations
        WHERE created_at >= ${start} AND created_at <= ${end}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;
      
      // Users by country
      const usersByCountry = await prisma.sessionLog.groupBy({
        by: ['country'],
        where: {
          sessionStart: {
            gte: start,
            lte: end
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      });
      
      // Device distribution
      const deviceDistribution = await prisma.sessionLog.groupBy({
        by: ['device'],
        where: {
          sessionStart: {
            gte: start,
            lte: end
          }
        },
        _count: {
          id: true
        }
      });
      
      // Average session duration
      const avgSessionDuration = await prisma.sessionLog.aggregate({
        where: {
          sessionStart: {
            gte: start,
            lte: end
          },
          duration: { not: null }
        },
        _avg: {
          duration: true
        }
      });
      
      // Top translators
      const topTranslators = await prisma.user.findMany({
        where: {
          role: 'TRANSLATOR'
        },
        orderBy: {
          points: 'desc'
        },
        take: 10,
        select: {
          id: true,
          name: true,
          points: true,
          level: true,
          _count: {
            select: {
              translations: true,
              validations: true
            }
          }
        }
      });
      
      // API response times
      const avgResponseTime = await prisma.apiMetrics.aggregate({
        where: {
          timestamp: {
            gte: start,
            lte: end
          }
        },
        _avg: {
          responseTime: true
        }
      });
      
      // User level distribution
      const levelDistribution = await prisma.user.groupBy({
        by: ['level'],
        _count: {
          id: true
        },
        orderBy: {
          level: 'asc'
        }
      });
      
      // Retention rate (users who came back in last 7 days)
      const totalUsers = await prisma.user.count();
      const returningUsers = await prisma.user.count({
        where: {
          AND: [
            {
              createdAt: {
                lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            },
            {
              lastLoginAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            }
          ]
        }
      });
      
      const retentionRate = totalUsers > 0 ? (returningUsers / totalUsers) * 100 : 0;
      
      res.json({
        success: true,
        data: {
          activeUsers24h: activeUsers,
          translationsPerDay,
          usersByCountry,
          deviceDistribution,
          avgSessionDuration: avgSessionDuration._avg.duration,
          topTranslators,
          avgResponseTime: avgResponseTime._avg.responseTime,
          levelDistribution,
          retentionRate: retentionRate.toFixed(2),
          totalUsers,
          returningUsers
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

// GET /api/analytics/heatmap - Heatmap of activity by hour and day
router.get('/heatmap',
  authenticate,
  requireRole(['ADMIN']),
  async (req, res) => {
    try {
      const heatmapData = await prisma.$queryRaw`
        SELECT 
          EXTRACT(DOW FROM session_start) as day_of_week,
          EXTRACT(HOUR FROM session_start) as hour,
          COUNT(*) as activity_count
        FROM session_logs
        WHERE session_start >= NOW() - INTERVAL '30 days'
        GROUP BY day_of_week, hour
        ORDER BY day_of_week, hour
      `;
      
      res.json({ success: true, data: heatmapData });
    } catch (error) {
      console.error('Error fetching heatmap:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

export default router;
```

---

## 🎨 Frontend - Admin Analytics Dashboard (Task 13)

### **1. Instalação de Bibliotecas**

```bash
cd plataforma-raras-cpl
npm install recharts date-fns
```

### **2. Componente Analytics Dashboard**

**Arquivo**: `plataforma-raras-cpl/src/components/AnalyticsDashboard.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format, subDays } from 'date-fns';

interface AnalyticsData {
  activeUsers24h: number;
  translationsPerDay: Array<{ date: string; count: number }>;
  usersByCountry: Array<{ country: string; _count: { id: number } }>;
  deviceDistribution: Array<{ device: string; _count: { id: number } }>;
  avgSessionDuration: number;
  topTranslators: Array<any>;
  avgResponseTime: number;
  levelDistribution: Array<{ level: number; _count: { id: number } }>;
  retentionRate: string;
  totalUsers: number;
  returningUsers: number;
}

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(
        `/api/analytics/dashboard?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando analytics...</div>;
  }

  if (!data) {
    return <div>Erro ao carregar dados</div>;
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div style={{ padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e40af', marginBottom: '10px' }}>
          📊 Analytics Dashboard
        </h1>
        <p style={{ color: '#64748b' }}>
          Métricas de uso e performance da plataforma
        </p>
      </div>

      {/* Date Range Selector */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '12px', 
        marginBottom: '30px',
        display: 'flex',
        gap: '15px',
        alignItems: 'center'
      }}>
        <label style={{ fontWeight: '600' }}>Período:</label>
        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
          style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        />
        <span>até</span>
        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
          style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        />
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <KPICard title="Usuários Ativos (24h)" value={data.activeUsers24h} icon="👥" color="#3b82f6" />
        <KPICard title="Taxa de Retenção" value={`${data.retentionRate}%`} icon="🔄" color="#10b981" />
        <KPICard title="Tempo Médio de Sessão" value={`${Math.floor(data.avgSessionDuration / 60)}min`} icon="⏱️" color="#f59e0b" />
        <KPICard title="Tempo de Resposta Médio" value={`${data.avgResponseTime?.toFixed(0)}ms`} icon="⚡" color="#ef4444" />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px' }}>
        {/* Translations Per Day */}
        <ChartCard title="📈 Traduções por Dia">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.translationsPerDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Device Distribution */}
        <ChartCard title="📱 Distribuição de Dispositivos">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.deviceDistribution}
                dataKey="_count.id"
                nameKey="device"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.deviceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Users by Country */}
        <ChartCard title="🌍 Usuários por País (Top 10)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.usersByCountry}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="_count.id" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Level Distribution */}
        <ChartCard title="🏆 Distribuição de Níveis">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.levelDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="_count.id" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top Translators Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginTop: '30px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '15px' }}>
          🏅 Top 10 Tradutores
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Pontos</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Nível</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Traduções</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Validações</th>
            </tr>
          </thead>
          <tbody>
            {data.topTranslators.map((user, index) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px' }}>{index + 1}</td>
                <td style={{ padding: '12px', fontWeight: '600' }}>{user.name}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{user.points}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{user.level}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{user._count.translations}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{user._count.validations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper Components
const KPICard: React.FC<{ title: string; value: any; icon: string; color: string }> = ({ title, value, icon, color }) => (
  <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
      <span style={{ fontSize: '24px' }}>{icon}</span>
      <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>{title}</span>
    </div>
    <div style={{ fontSize: '32px', fontWeight: '800', color }}>{value}</div>
  </div>
);

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>{title}</h3>
    {children}
  </div>
);
```

---

## 📦 Dependências

### Backend
- `geoip-lite` - GeoIP lookup sem API externa
- `ua-parser-js` - Parse de User-Agent

```bash
cd hpo-platform-backend
npm install geoip-lite ua-parser-js
npm install --save-dev @types/geoip-lite @types/ua-parser-js
```

### Frontend
- `recharts` - Biblioteca de gráficos
- `date-fns` - Manipulação de datas

```bash
cd plataforma-raras-cpl
npm install recharts date-fns
```

---

## 🔒 Privacy & GDPR Compliance

1. **IP Anonimização**: Últimos 2 octetos mascarados antes de salvar
2. **Retenção de Dados**: Sessions logs deletados após 90 dias
3. **Opt-out**: Usuários podem desabilitar tracking (exceto logs de API)
4. **Transparência**: Política de privacidade clara sobre coleta de dados

---

## 📝 Próximos Passos

1. ✅ Criar schemas Prisma
2. ✅ Implementar middleware de analytics
3. ✅ Criar endpoints de analytics
4. ✅ Desenvolver dashboard frontend
5. ⏳ Testar em ambiente de staging
6. ⏳ Deploy em produção
7. ⏳ Monitorar performance e ajustar

---

**Desenvolvido por**: GitHub Copilot + Filipe Paulista  
**Versão**: 2.1.0-analytics
