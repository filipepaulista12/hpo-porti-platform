// 🎯 Recommended Terms Component - Sistema de Recomendação Inteligente
// Usa metadados HPO + perfil do usuário para sugerir termos personalizados

import React, { useState, useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

interface Term {
  id: string;
  hpoId: string;
  labelEn: string;
  labelPt?: string;
  category?: string;
  difficulty?: number;
  translationStatus?: string;
  _count?: {
    translations: number;
  };
}

interface RecommendedTermsProps {
  onTermSelect: (term: Term) => void;
  userSpecialty?: string;
  userLevel?: number;
}

export const RecommendedTerms: React.FC<RecommendedTermsProps> = ({ 
  onTermSelect, 
  userSpecialty,
  userLevel 
}) => {
  const [recommendedTerms, setRecommendedTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [userSpecialty, userLevel]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // ✅ FIX: Usar TokenStorage.get() consistente com o resto da aplicação
      const token = localStorage.getItem('hpo_token'); // Usar a mesma key do TokenStorage
      
      if (!token) {
        setError('Você precisa estar logado para ver recomendações.');
        setLoading(false);
        return;
      }

      // ✅ FIX: Usar window.location.hostname para detectar ambiente (igual ProductionHPOApp)
      const API_BASE_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001'
        : window.location.origin;
      
      console.log('🎯 [RECOMMENDATIONS] Fetching from:', `${API_BASE_URL}/api/terms/recommended/for-me`);
      console.log('🎯 [RECOMMENDATIONS] Token exists:', !!token);
      
      const response = await fetch(
        `${API_BASE_URL}/api/terms/recommended/for-me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('🎯 [RECOMMENDATIONS] Response status:', response.status);

      if (response.status === 401) {
        setError('Sessão expirada. Por favor, faça login novamente.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        console.error('❌ [RECOMMENDATIONS] Erro da API:', errorData);
        setError(errorData.error || `Erro ao carregar recomendações (${response.status})`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('✅ [RECOMMENDATIONS] Data received:', data);
      
      setRecommendedTerms(data.terms || []);
    } catch (err) {
      const error = err as Error;
      console.error('❌ [RECOMMENDATIONS] Network error:', error);
      setError(`Erro de conexão: ${error.message}. Verifique se o backend está rodando.`);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyLabel = (difficulty?: number): string => {
    if (!difficulty) return '❓';
    if (difficulty <= 2) return '🟢 Fácil';
    if (difficulty <= 3) return '🟡 Médio';
    if (difficulty <= 4) return '🟠 Difícil';
    return '🔴 Muito Difícil';
  };

  const getDifficultyColor = (difficulty?: number): string => {
    if (!difficulty) return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    if (difficulty <= 2) return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    if (difficulty <= 3) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
    if (difficulty <= 4) return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
    return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900 dark:to-blue-900 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-700 dark:text-gray-200">Carregando recomendações personalizadas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 rounded-lg p-6 shadow-lg">
        <div className="flex items-center">
          <span className="text-2xl">⚠️</span>
          <div className="ml-3">
            <p className="text-red-800 dark:text-red-200 font-semibold">Erro ao carregar recomendações</p>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
            <button
              onClick={fetchRecommendations}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              🔄 Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (recommendedTerms.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="text-center">
          <span className="text-4xl">🎉</span>
          <p className="mt-2 text-gray-700 dark:text-gray-200 font-semibold">
            Parabéns! Você já traduziu todos os termos recomendados para o seu nível.
          </p>
          <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm">
            Continue contribuindo para aumentar seu nível e desbloquear novos desafios!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900 dark:to-blue-900 rounded-lg p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎯</span>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Recomendados para Você
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {userSpecialty ? (
                <>
                  Baseado na sua especialidade: <strong>{userSpecialty}</strong> • Nível {userLevel}
                </>
              ) : (
                'Termos personalizados para seu perfil'
              )}
            </p>
          </div>
        </div>
        <button
          onClick={fetchRecommendations}
          className="px-3 py-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm"
          title="Atualizar recomendações"
        >
          🔄
        </button>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendedTerms.map((term, index) => (
          <div
            key={term.id}
            onClick={() => onTermSelect(term)}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500"
          >
            {/* Priority Badge */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                  #{index + 1} PRIORIDADE
                </span>
                <button
                  data-tooltip-id={`recommendation-tooltip-${term.id}`}
                  className="text-blue-500 hover:text-blue-700 cursor-help text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  ℹ️
                </button>
                <Tooltip id={`recommendation-tooltip-${term.id}`} place="top" style={{ maxWidth: '350px', zIndex: 9999 }}>
                  <div className="text-sm">
                    <strong className="block mb-2">🎯 Por que este termo foi recomendado?</strong>
                    <ul className="list-none space-y-1 mb-2">
                      {userSpecialty && term.category === userSpecialty && (
                        <li className="flex items-start gap-2">
                          <span>✅</span>
                          <span>Corresponde à sua especialidade: <strong>{userSpecialty}</strong></span>
                        </li>
                      )}
                      {term.difficulty && term.difficulty <= (userLevel || 1) + 1 && (
                        <li className="flex items-start gap-2">
                          <span>✅</span>
                          <span>Nível de dificuldade adequado ao seu perfil (Nível {userLevel})</span>
                        </li>
                      )}
                      {term.translationStatus === 'NOT_TRANSLATED' && (
                        <li className="flex items-start gap-2">
                          <span>✅</span>
                          <span>Termo ainda não traduzido - alta prioridade!</span>
                        </li>
                      )}
                      {term._count && term._count.translations === 0 && (
                        <li className="flex items-start gap-2">
                          <span>✅</span>
                          <span>Nenhuma tradução existente - seja o primeiro!</span>
                        </li>
                      )}
                    </ul>
                    <div className="border-t border-gray-300 pt-2 mt-2">
                      <strong className="block mb-1">👤 Seu Perfil:</strong>
                      <ul className="list-none text-xs space-y-1">
                        <li>• Especialidade: {userSpecialty || 'Não definida'}</li>
                        <li>• Nível: {userLevel || 1}</li>
                      </ul>
                    </div>
                    <div className="border-t border-gray-300 pt-2 mt-2 text-xs">
                      <strong>💡 Dica:</strong> Atualize seu perfil em Configurações para receber 
                      recomendações ainda mais precisas!
                    </div>
                  </div>
                </Tooltip>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(term.difficulty)}`}>
                {getDifficultyLabel(term.difficulty)}
              </span>
            </div>

            {/* HPO ID */}
            <div className="mb-2">
              <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">
                {term.hpoId}
              </span>
            </div>

            {/* Term Name */}
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {term.labelEn}
            </h4>

            {/* Category */}
            {term.category && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  📂 {term.category}
                </span>
              </div>
            )}

            {/* Translation Count */}
            {term._count && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>💬 {term._count.translations} traduções</span>
              </div>
            )}

            {/* Reason Badges */}
            <div className="mt-3 flex flex-wrap gap-1">
              {userSpecialty && term.category === userSpecialty && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                  🎓 Sua especialidade
                </span>
              )}
              {term.difficulty && term.difficulty <= (userLevel || 1) + 1 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 border border-green-300 dark:border-green-700">
                  ⭐ Nível adequado
                </span>
              )}
              {term.translationStatus === 'NOT_TRANSLATED' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                  🆕 Sem tradução
                </span>
              )}
            </div>

            {/* Call to Action */}
            <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
              <button className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors">
                ✨ Traduzir Agora
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Footer */}
      <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
        <div className="flex items-start gap-2">
          <span className="text-lg">💡</span>
          <div className="text-xs text-gray-600 dark:text-gray-300">
            <strong>Dica:</strong> Estes termos foram selecionados com base na sua especialidade e nível atual.
            Traduzi-los aumentará seus pontos e experiência mais rapidamente!
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendedTerms;
