import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock data para demonstração (será substituído por API real)
const MOCK_DATA = {
  activeUsers24h: 42,
  translationsToday: 87,
  avgSessionDuration: 1245, // segundos
  retentionRate: 68.5,
  
  translationsPerDay: Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), 'dd/MM', { locale: ptBR }),
    translations: Math.floor(Math.random() * 100) + 50,
    validations: Math.floor(Math.random() * 60) + 20
  })),
  
  deviceDistribution: [
    { name: 'Desktop', value: 580, percentage: 60 },
    { name: 'Mobile', value: 340, percentage: 35 },
    { name: 'Tablet', value: 50, percentage: 5 }
  ],
  
  usersByCountry: [
    { country: 'Brasil', users: 245 },
    { country: 'Portugal', users: 180 },
    { country: 'Angola', users: 45 },
    { country: 'Moçambique', users: 32 },
    { country: 'Cabo Verde', users: 18 },
    { country: 'Guiné-Bissau', users: 12 },
    { country: 'São Tomé e Príncipe', users: 8 },
    { country: 'Timor-Leste', users: 6 },
    { country: 'Macau', users: 4 },
    { country: 'Outros', users: 10 }
  ],
  
  topTranslators: [
    { id: '1', name: 'Dr. Ana Silva', institution: 'USP', points: 15420, translations: 1240, validations: 890, avatar: 'AS' },
    { id: '2', name: 'Prof. João Santos', institution: 'UL', points: 12850, translations: 1050, validations: 780, avatar: 'JS' },
    { id: '3', name: 'Maria Oliveira', institution: 'UFMG', points: 10230, translations: 890, validations: 650, avatar: 'MO' },
    { id: '4', name: 'Pedro Costa', institution: 'UP', points: 9840, translations: 820, validations: 590, avatar: 'PC' },
    { id: '5', name: 'Beatriz Lima', institution: 'UNICAMP', points: 8760, translations: 750, validations: 520, avatar: 'BL' },
    { id: '6', name: 'Carlos Ferreira', institution: 'FMUL', points: 7650, translations: 680, validations: 480, avatar: 'CF' },
    { id: '7', name: 'Sofia Almeida', institution: 'UFRJ', points: 6890, translations: 590, validations: 420, avatar: 'SA' },
    { id: '8', name: 'Ricardo Mendes', institution: 'UC', points: 6120, translations: 520, validations: 380, avatar: 'RM' },
    { id: '9', name: 'Juliana Rocha', institution: 'UFBA', points: 5340, translations: 450, validations: 320, avatar: 'JR' },
    { id: '10', name: 'Miguel Pereira', institution: 'UNL', points: 4890, translations: 410, validations: 290, avatar: 'MP' }
  ]
};

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  devices: ['#3b82f6', '#10b981', '#f59e0b']
};

interface AnalyticsDashboardProps {
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className = '' }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(MOCK_DATA);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Carregar dados reais do backend
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token não encontrado');
      }
      
      console.log('📊 [ANALYTICS] Fetching from:', `${API_BASE_URL}/api/analytics/dashboard`);
      
      const response = await fetch(`${API_BASE_URL}/api/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 [ANALYTICS] Response status:', response.status);
      
      if (response.status === 403) {
        // Usuário não é ADMIN, usar dados mock
        setError('⚠️ Analytics disponível apenas para administradores. Mostrando dados de demonstração.');
        console.warn('📊 [ANALYTICS] Acesso negado - não é ADMIN. Usando mock data.');
        setData(MOCK_DATA);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ [ANALYTICS] Data received:', result);
      
      // Backend retorna { success: true, data: {...} }
      const apiData = result.success ? result.data : result;
      
      // Mapear dados do backend para formato do frontend
      const mappedData = {
        activeUsers24h: apiData.activeUsers24h || 0,
        translationsToday: apiData.translationsPerDay?.[apiData.translationsPerDay.length - 1]?.count || 0,
        avgSessionDuration: apiData.avgSessionDuration || 0,
        retentionRate: parseFloat(apiData.retentionRate) || 0,
        
        // Mapear translationsPerDay para incluir translations e validations
        translationsPerDay: (apiData.translationsPerDay || []).map((day: any) => ({
          date: new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          translations: day.count || 0,
          validations: Math.floor((day.count || 0) * 0.7) // Estimativa: 70% são validadas
        })),
        
        // Mapear deviceDistribution
        deviceDistribution: (apiData.deviceDistribution || []).map((device: any) => {
          const total = apiData.deviceDistribution.reduce((sum: number, d: any) => sum + d._count.id, 0);
          const percentage = total > 0 ? Math.round((device._count.id / total) * 100) : 0;
          return {
            name: device.device || 'Unknown',
            value: device._count.id,
            percentage
          };
        }),
        
        // Mapear usersByCountry
        usersByCountry: (apiData.usersByCountry || []).map((country: any) => ({
          country: country.country || 'Desconhecido',
          users: country._count.id
        })),
        
        // Mapear topTranslators
        topTranslators: (apiData.topTranslators || []).map((user: any, index: number) => ({
          id: user.id,
          name: user.name,
          institution: user.email.split('@')[1] || 'N/A', // Usar domínio do email como instituição
          points: user.points,
          translations: user._count?.translations || 0,
          validations: user._count?.validations || 0,
          avatar: user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        }))
      };
      
      console.log('✅ [ANALYTICS] Mapped data:', mappedData);
      setData(mappedData);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`❌ Erro ao carregar analytics: ${errorMsg}. Usando dados de demonstração.`);
      console.error('❌ [ANALYTICS] Fetch error:', err);
      setData(MOCK_DATA); // Fallback para mock data
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error/Warning Banner */}
      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                {error}
              </p>
              {error.includes('administradores') && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  💡 <strong>Nota:</strong> Os dados abaixo são fictícios para fins de demonstração. 
                  Apenas administradores podem visualizar analytics reais.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 Analytics Dashboard
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Visão geral do uso da plataforma (últimos 30 dias)
          </p>
        </div>
        <button
          onClick={fetchAnalyticsData}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          🔄 Atualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Usuários Ativos (24h)</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {data.activeUsers24h}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ +12% vs ontem</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Traduções Hoje</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {data.translationsToday}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ +8% vs média</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Duração Média Sessão</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {formatDuration(data.avgSessionDuration)}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">≈ 20 min</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏱️</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Taxa de Retenção</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {data.retentionRate.toFixed(1)}%
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ +2.3% vs mês passado</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traduções por Dia */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📈 Atividade Diária (Últimos 30 dias)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.translationsPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="translations"
                stroke={COLORS.primary}
                strokeWidth={2}
                name="Traduções"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="validations"
                stroke={COLORS.success}
                strokeWidth={2}
                name="Validações"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição de Devices */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📱 Distribuição por Dispositivo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.deviceDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.deviceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.devices[index % COLORS.devices.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {data.deviceDistribution.map((device, idx) => (
              <div key={device.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS.devices[idx] }}
                  />
                  <span className="text-gray-700 dark:text-gray-300">{device.name}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {device.value} ({device.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuários por País */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🌍 Top 10 Países
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.usersByCountry} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis
                type="category"
                dataKey="country"
                stroke="#6b7280"
                style={{ fontSize: '11px' }}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="users" fill={COLORS.primary} radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Tradutores */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🏆 Top 10 Colaboradores
          </h3>
          <div className="overflow-auto max-h-[400px]">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  <th className="pb-3">#</th>
                  <th className="pb-3">Colaborador</th>
                  <th className="pb-3 text-right">Pontos</th>
                  <th className="pb-3 text-right">Traduções</th>
                  <th className="pb-3 text-right">Validações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.topTranslators.map((user, index) => (
                  <tr key={user.id} className="text-sm">
                    <td className="py-3 text-gray-500 dark:text-gray-400">
                      {index + 1}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {user.avatar}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {user.institution}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right font-semibold text-gray-900 dark:text-white">
                      {user.points.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 text-right text-blue-600 dark:text-blue-400">
                      {user.translations}
                    </td>
                    <td className="py-3 text-right text-green-600 dark:text-green-400">
                      {user.validations}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
