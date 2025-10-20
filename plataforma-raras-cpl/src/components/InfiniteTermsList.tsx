// 🚀 Infinite Scroll List - Carrega 16.942 termos HPO de forma eficiente
// Lazy Loading + Debounced Search + Intersection Observer

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Term {
  id: string;
  hpoId: string;
  labelEn: string;
  labelPt?: string;
  translationStatus: string;
  category?: string;
  difficulty?: number;
  recommendationScore?: number;
  recommendationReasons?: string[];
}

interface TermsListProps {
  onTermSelect: (term: Term) => void;
  selectedTermId?: string;
}

export const InfiniteTermsList: React.FC<TermsListProps> = ({ onTermSelect, selectedTermId }) => {
  const [terms, setTerms] = useState<Term[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // 🔍 Novos filtros
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  // 🚀 Carregar categorias disponíveis
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_BASE_URL}/api/terms/categories`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar categorias:', error);
      }
    };
    
    fetchCategories();
  }, []);

  // Debounce search (espera 500ms após parar de digitar)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search
      setTerms([]); // Clear terms
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);
  
  // Reset page quando filtros mudarem
  useEffect(() => {
    setPage(1);
    setTerms([]);
  }, [categoryFilter, statusFilter]);

  // Fetch terms
  const fetchTerms = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50', // Carrega 50 por vez
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { status: statusFilter })
      });

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(
        `${API_BASE_URL}/api/terms?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        setTerms(prev => 
          page === 1 ? data.terms : [...prev, ...data.terms]
        );
        
        setHasMore(data.pagination.page < data.pagination.totalPages);
        
        console.log(`✅ Carregados ${data.terms.length} termos (página ${page}/${data.pagination.totalPages})`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar termos:', error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, categoryFilter, statusFilter, loading, hasMore]);

  // Fetch on page change
  useEffect(() => {
    fetchTerms();
  }, [page, debouncedSearch, categoryFilter, statusFilter]);

  // Intersection Observer para scroll infinito
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading]);

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Buscar por HPO ID ou nome em inglês... (ex: HP:0000001 ou Seizure)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <svg 
            className="absolute left-4 top-4 h-5 w-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        
        {debouncedSearch && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            🔍 Buscando por: <strong>{debouncedSearch}</strong>
          </p>
        )}
        
        {/* 🎯 Botão Toggle Filtros */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="mt-3 w-full flex items-center justify-between px-4 py-2 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-semibold">Filtros Avançados</span>
            {(categoryFilter || statusFilter) && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {[categoryFilter, statusFilter].filter(Boolean).length}
              </span>
            )}
          </span>
          <svg 
            className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* 🎯 Painel de Filtros */}
        {showFilters && (
          <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filtro por Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📂 Categoria HPO
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                >
                  <option value="">Todas as categorias ({categories.length})</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Filtro por Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🎯 Status da Tradução
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                >
                  <option value="">Todos os status</option>
                  <option value="NOT_TRANSLATED">❌ Não Traduzido</option>
                  <option value="PENDING">⏳ Pendente</option>
                  <option value="APPROVED">✅ Aprovado</option>
                  <option value="CONFLICTING">⚠️ Em Conflito</option>
                </select>
              </div>
            </div>
            
            {/* Botão Limpar Filtros */}
            {(categoryFilter || statusFilter) && (
              <button
                onClick={() => {
                  setCategoryFilter('');
                  setStatusFilter('');
                }}
                className="w-full px-4 py-2 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors font-medium"
              >
                🗑️ Limpar Todos os Filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Terms List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {terms.map(term => (
            <div
              key={term.id}
              data-testid="term-card"
              onClick={() => onTermSelect(term)}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md dark:border-gray-700 ${
                selectedTermId === term.id 
                  ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 border-2 shadow-lg' 
                  : 'hover:bg-blue-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">
                    {term.hpoId}
                  </span>
                  
                  {/* Recommendation Score Badge */}
                  {term.recommendationScore !== undefined && (
                    <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                      🎯 {term.recommendationScore}
                    </span>
                  )}
                  
                  <h3 className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {term.labelEn}
                  </h3>
                  
                  {term.labelPt && (
                    <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                      ✅ PT: {term.labelPt}
                    </p>
                  )}
                  
                  {/* Recommendation Reasons */}
                  {term.recommendationReasons && term.recommendationReasons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {term.recommendationReasons.map((reason, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900 text-amber-700 dark:text-amber-200 border border-amber-200 dark:border-amber-700"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {term.category && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {term.category}
                    </p>
                  )}
                </div>
                
                {/* Status Badge */}
                <span className={`
                  ml-2 px-2 py-1 text-xs rounded-full
                  ${term.translationStatus === 'APPROVED' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                    term.translationStatus === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}
                `}>
                  {term.translationStatus === 'APPROVED' ? '✅' :
                   term.translationStatus === 'PENDING' ? '⏳' : '❌'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">Carregando mais termos...</span>
          </div>
        )}

        {/* Observer Target for Infinite Scroll */}
        <div ref={observerTarget} className="h-4" />

        {/* No More Results */}
        {!hasMore && terms.length > 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            🎉 Todos os termos carregados! ({terms.length} total)
          </div>
        )}

        {/* No Results */}
        {!loading && terms.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg">😔 Nenhum termo encontrado</p>
            {debouncedSearch && (
              <p className="mt-2 text-sm">
                Tente buscar por outro termo ou HPO ID
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfiniteTermsList;
