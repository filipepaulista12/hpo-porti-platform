import { useState, useEffect, useRef } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ToastService from './services/toast.service';
import ErrorTranslator from './utils/ErrorTranslator';
import * as RoleHelpers from './utils/RoleHelpers';
import GuidelinesPage from './components/pages/GuidelinesPage';
import InteractiveTour from './components/InteractiveTour';
import UnauthorizedAccess from './components/UnauthorizedAccess';
import { EhealsModal } from './components/EhealsModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import RecommendedTerms from './components/RecommendedTerms';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './styles/accessibility.css';

// Configuração da API - Detecta ambiente automaticamente
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001'
  : window.location.origin; // Em produção usa https://hpo.raras-cplp.org

// ==================== CATEGORY ICONS (Task #7) ====================
const categoryIcons: Record<string, string> = {
  'Nervous system': '🧠',
  'Cardiovascular system': '❤️',
  'Skeletal system': '🦴',
  'Respiratory system': '🫁',
  'Digestive system': '🍽️',
  'Endocrine system': '⚡',
  'Immune system': '🛡️',
  'Reproductive system': '👶',
  'Eye': '👁️',
  'Ear': '👂',
  'Skin': '🏥',
  'Growth': '📈',
  'Constitutional symptom': '🌡️',
  'Metabolism': '⚗️',
  'Blood': '🩸',
  'Kidney': '🫘',
  'Liver': '🫀',
  'default': '🔬'
};

const getCategoryIcon = (category?: string): string => {
  if (!category) return categoryIcons.default;
  const key = Object.keys(categoryIcons).find(k => category.toLowerCase().includes(k.toLowerCase()));
  return key ? categoryIcons[key] : categoryIcons.default;
};

interface HPOTerm {
  id: string;
  hpoId: string;
  labelEn: string;
  definitionEn?: string;
  synonymsEn?: string[];
  category?: string;
  difficulty?: number;
  translationStatus?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  orcidId?: string;
  points: number;
  level: number;
  role: string;
  hasCompletedOnboarding?: boolean;
}

interface APIResponse {
  totalTerms: number;
  translatedTerms: number;
  translationProgress: number;
}

// Helper para armazenar/recuperar token
const TokenStorage = {
  save: (token: string) => localStorage.setItem('hpo_token', token),
  get: () => localStorage.getItem('hpo_token'),
  remove: () => localStorage.removeItem('hpo_token'),
  getAuthHeader: (): Record<string, string> => {
    const token = TokenStorage.get();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },
  isExpired: (): boolean => {
    const token = TokenStorage.get();
    if (!token) return true;
    
    try {
      // Decode JWT payload (parte do meio)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      return now >= expirationTime;
    } catch (error) {
      console.error('❌ Erro ao validar token:', error);
      return true; // Se não conseguir decodificar, considera expirado
    }
  }
};

interface PendingTranslation {
  id: string;
  labelPt: string;
  definitionPt?: string;
  confidence: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  term: {
    hpoId: string;
    labelEn: string;
    definitionEn?: string;
  };
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  email: string;
  points: number;
  level: number;
  role: string;
  stats: {
    totalTranslations: number;
    totalValidations: number;
    approvedTranslations: number;
    approvalRate: number;
  };
  badges: string[];
  memberSince: string;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  currentUser: LeaderboardEntry | null;
  period: string;
  totalUsers: number;
}

interface UserTranslation {
  id: string;
  labelPt: string;
  definitionPt?: string;
  confidence: number;
  status: string;
  createdAt: string;
  term: {
    hpoId: string;
    labelEn: string;
    definitionEn?: string;
    category?: string;
  };
  validations: Array<{
    id: string;
    decision: string;
    rating: number;
    comments?: string;
    createdAt: string;
    validator: {
      name: string;
    };
  }>;
}

interface TranslationHistory {
  translations: UserTranslation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    needsRevision: number;
    approvalRate: number;
  };
}

function ProductionHPOApp() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false); // Novo estado para controlar loading
  // Inicia em 'dashboard' se tiver token, senão 'home'
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'register' | 'dashboard' | 'translate' | 'review' | 'leaderboard' | 'history' | 'admin' | 'profile' | 'guidelines' | 'points' | 'referral'>(() => {
    const token = TokenStorage.get();
    return (token && !TokenStorage.isExpired()) ? 'dashboard' : 'home';
  });
  const [selectedTerm, setSelectedTerm] = useState<HPOTerm | null>(null);
  const [translation, setTranslation] = useState('');
  const [confidence, setConfidence] = useState(3);
  const [terms, setTerms] = useState<HPOTerm[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<APIResponse | null>(null);
  const [apiConnected, setApiConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingTranslations, setPendingTranslations] = useState<PendingTranslation[]>([]);
  const [selectedPendingTranslation, setSelectedPendingTranslation] = useState<PendingTranslation | null>(null);
  
  // 🔍 Review Page Filters
  const [reviewSearchTerm, setReviewSearchTerm] = useState('');
  const [reviewFilterCategory, setReviewFilterCategory] = useState('');
  const [reviewShowFilters, setReviewShowFilters] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'all' | 'month' | 'week'>('all');
  
  // Dark Mode State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });
  const [historyData, setHistoryData] = useState<TranslationHistory | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION'>('ALL');
  const [historyPage, setHistoryPage] = useState(1);
  
  // Interactive Tour state
  const [showTour, setShowTour] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(() => {
    return localStorage.getItem('tourCompleted') === 'true';
  });
  
  // Task #11: Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Ref para controlar se o histórico já foi carregado (evitar loop)
  const historyLoadedRef = useRef(false);
  
  // Task #4: History Page Tabs
  const [historyTab, setHistoryTab] = useState<'ALL' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'>('ALL');
  
  // ♿ WCAG 2.1 Accessibility States
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>(() => {
    const saved = localStorage.getItem('fontSize');
    return (saved === 'normal' || saved === 'large' || saved === 'xlarge') ? saved : 'normal';
  });
  const [announceMessage, setAnnounceMessage] = useState<string>('');
  
  // Task #18: Rate Limiting State
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState(0);
  
  // Search and filters for terms
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [termsPage, setTermsPage] = useState(1);
  const [totalTerms, setTotalTerms] = useState(0);
  
  // Export modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'xliff' | 'babelon' | 'fivestars'>('csv');
  const [exportOnlyApproved, setExportOnlyApproved] = useState(false);

  // Notifications
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationPage, setNotificationPage] = useState(1);

  // Accessibility Menu (Task #1)
  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState(false);

  // ==================== USE IS MOBILE HOOK (Task #16-17) ====================
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  // ==================== DARK MODE EFFECT ====================
  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // ♿ WCAG 2.1 Accessibility Functions
  const changeFontSize = (size: 'normal' | 'large' | 'xlarge') => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    
    // Apply to document
    document.documentElement.classList.remove('font-size-normal', 'font-size-large', 'font-size-xlarge');
    document.documentElement.classList.add(`font-size-${size}`);
    
    // Announce change to screen readers
    announceToScreenReader(`Tamanho da fonte alterado para ${size === 'normal' ? 'normal' : size === 'large' ? 'grande' : 'extra grande'}`);
  };

  const announceToScreenReader = (message: string) => {
    setAnnounceMessage(message);
    setTimeout(() => setAnnounceMessage(''), 3000);
  };

  // Apply font size on mount
  useEffect(() => {
    document.documentElement.classList.add(`font-size-${fontSize}`);
  }, []);

  // Keyboard navigation handler
  const handleKeyboardNavigation = (e: KeyboardEvent) => {
    // Escape key: Close modals/dropdowns
    if (e.key === 'Escape') {
      setSelectedTerm(null);
      setSelectedPendingTranslation(null);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
    
    // Ctrl/Cmd + K: Focus search (if exists)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.querySelector<HTMLInputElement>('input[type="text"], input[type="search"]');
      if (searchInput) {
        searchInput.focus();
        announceToScreenReader('Campo de busca focado');
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardNavigation);
    return () => document.removeEventListener('keydown', handleKeyboardNavigation);
  }, []);

  // ==================== RATE LIMITING COUNTDOWN (Task #18) ====================
  useEffect(() => {
    if (isRateLimited && rateLimitRetryAfter > 0) {
      const timer = setInterval(() => {
        setRateLimitRetryAfter(prev => {
          if (prev <= 1) {
            setIsRateLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRateLimited, rateLimitRetryAfter]);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const handleAuth = async () => {
      // Check for OAuth callbacks (ORCID and LinkedIn)
      const urlParams = new URLSearchParams(window.location.search);
      
      // ORCID callback
      const orcidToken = urlParams.get('orcid_token');
      const orcidSuccess = urlParams.get('orcid_success');
      
      // LinkedIn callback (formato: /auth/callback?token=xxx&provider=linkedin)
      const oauthToken = urlParams.get('token');
      const provider = urlParams.get('provider');

      if (orcidToken && orcidSuccess === 'true') {
        // ORCID authentication successful - save token and reload
        TokenStorage.save(orcidToken);
        ToastService.success('✅ Login com ORCID realizado com sucesso!');
        
        // Force full page reload to reinitialize app with token
        window.location.href = '/';
        return;
      } else if (oauthToken && provider) {
        // OAuth authentication successful (LinkedIn, etc) - save token and reload
        TokenStorage.save(oauthToken);
        const providerName = provider === 'linkedin' ? 'LinkedIn' : provider;
        ToastService.success(`✅ Login com ${providerName} realizado com sucesso!`);
        
        // Force full page reload to reinitialize app with token
        window.location.href = '/';
        return;
      } else {
        // Normal authentication check
        await checkAuth();
      }
      
      testAPIConnection();
    };
    
    handleAuth();
  }, []);

  // Timeout de 10 segundos para loading de autenticação
  useEffect(() => {
    if (!isLoadingAuth) return;

    const timeout = setTimeout(() => {
      if (isLoadingAuth && !user) {
        console.error('⏰ Timeout ao carregar usuário! Redirecionando para login...');
        TokenStorage.remove();
        setUser(null);
        setCurrentPage('login');
        setIsLoadingAuth(false);
        ToastService.error('Tempo esgotado ao carregar dados. Por favor, faça login novamente.');
      }
    }, 10000); // 10 segundos

    return () => clearTimeout(timeout);
  }, [isLoadingAuth, user]);

  // ==================== HANDLE RATE LIMITING (Task #18) ====================
  const handleRateLimit = (response: Response) => {
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const seconds = retryAfter ? parseInt(retryAfter) : 60;
      setIsRateLimited(true);
      setRateLimitRetryAfter(seconds);
      ToastService.warning(`Muitas requisições! Aguarde ${seconds} segundos antes de tentar novamente.`);
      return true;
    }
    return false;
  };

  const checkAuth = async () => {
    const token = TokenStorage.get();
    if (!token) {
      setIsLoadingAuth(false);
      return; // Se não tem token, fica na página atual
    }

    setIsLoadingAuth(true); // Inicia loading
    
    // ✅ Task #19: Verificar se token está expirado
    if (TokenStorage.isExpired()) {
      console.warn('⏰ Token expirado! Fazendo logout...');
      TokenStorage.remove();
      setUser(null);
      setCurrentPage('home'); // Volta pra home, não pro login direto
      setIsLoadingAuth(false);
      ToastService.error('Sua sessão expirou. Por favor, faça login novamente.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: TokenStorage.getAuthHeader()
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📦 RESPOSTA COMPLETA DO BACKEND:', data);
        
        // ✅ FIX: Backend pode retornar data.user OU data diretamente
        const userData = data.user || data;
        
        console.log('✅ User carregado com sucesso:', userData);
        console.log('📍 CurrentPage atual:', currentPage);
        
        // VERIFICAR SE USER EXISTE
        if (!userData || !userData.id) {
          console.error('❌ ERRO: Backend retornou resposta OK mas sem user válido!');
          console.error('❌ Data recebida:', JSON.stringify(data));
          TokenStorage.remove();
          setUser(null);
          setCurrentPage('login');
          setIsLoadingAuth(false);
          ToastService.error('Erro ao carregar dados do usuário. Faça login novamente.');
          return;
        }
        
        setUser(userData);
        setIsLoadingAuth(false); // Termina loading com sucesso
        console.log('✅ isLoadingAuth setado para false');
        console.log('✅ User state atualizado com:', userData.name);
        // NÃO REDIRECIONA AUTOMATICAMENTE - deixa na página atual
        loadStats();
        loadUnreadCount(); // Load initial notification count
      } else {
        console.error('❌ Falha na autenticação:', response.status);
        TokenStorage.remove();
        setUser(null);
        setCurrentPage('login');
        setIsLoadingAuth(false);
        ToastService.error('Sessão inválida. Por favor, faça login novamente.');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
      TokenStorage.remove();
      setUser(null);
      setCurrentPage('login');
      setIsLoadingAuth(false);
      ToastService.error('Erro ao conectar com servidor. Por favor, faça login novamente.');
    }
  };

  // Periodically refresh unread count (every 30 seconds)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const testAPIConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      
      if (data.status === 'ok') {
        setApiConnected(true);
        console.log('✅ API conectada:', data);
      }
    } catch (error) {
      console.warn('⚠️ API offline:', error);
      setApiConnected(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats/overview`);
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        console.log('📊 Estatísticas carregadas:', data);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar estatísticas:', error);
    }
  };

  const loadTerms = async (page: number = 1, search?: string, category?: string, status?: string, difficulty?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (status) params.append('status', status);
      if (difficulty) params.append('difficulty', difficulty);

      const response = await fetch(`${API_BASE_URL}/api/terms?${params.toString()}`, {
        headers: TokenStorage.getAuthHeader()
      });
      
      if (response.ok) {
        const data = await response.json();
        setTerms(data.terms || []);
        setTotalTerms(data.pagination?.total || 0);
        setTermsPage(page);
        console.log(`✅ ${data.terms?.length || 0} termos carregados (página ${page})`);
      } else {
        throw new Error('Erro ao carregar termos');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar termos:', error);
      setError('Não foi possível carregar os termos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/terms/categories`, {
        headers: TokenStorage.getAuthHeader()
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
        console.log(`✅ ${data.categories?.length || 0} categorias carregadas`);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar categorias:', error);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append('format', exportFormat);
      
      if (exportOnlyApproved) {
        params.append('onlyApproved', 'true');
      }
      
      if (user) {
        params.append('userId', user.id.toString());
      }
      
      const url = `${API_BASE_URL}/api/export/translations?${params.toString()}`;
      
      // Create a temporary link and trigger download
      const response = await fetch(url, {
        headers: TokenStorage.getAuthHeader()
      });
      
      if (!response.ok) {
        throw new Error('Erro ao exportar traduções');
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `hpo-translations-${Date.now()}.${exportFormat}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      setShowExportModal(false);
      ToastService.success(`Arquivo ${filename} baixado com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao exportar:', error);
      ToastService.error('Erro ao exportar traduções');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingTranslations = async (search?: string, category?: string, statusFilter?: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        status: 'PENDING_REVIEW',
        limit: '50'
      });
      
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`${API_BASE_URL}/api/translations?${params}`, {
        headers: TokenStorage.getAuthHeader()
      });

      if (response.ok) {
        const data = await response.json();
        setPendingTranslations(data.translations || []);
        console.log(`✅ ${data.translations?.length || 0} traduções pendentes carregadas`);
      } else {
        throw new Error('Erro ao carregar traduções pendentes');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar traduções:', error);
      setError('Não foi possível carregar traduções pendentes.');
    } finally {
      setLoading(false);
    }
  };

  const submitValidation = async (decision: 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED', rating: number, comments: string) => {
    if (!selectedPendingTranslation) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/validations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...TokenStorage.getAuthHeader()
        },
        body: JSON.stringify({
          translationId: selectedPendingTranslation.id,
          decision,
          rating,
          comments
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Remover tradução validada da lista
        setPendingTranslations(prev => prev.filter(t => t.id !== selectedPendingTranslation.id));
        setSelectedPendingTranslation(null);

        ToastService.success(`Validação enviada com sucesso! +${data.pointsEarned || 0} pontos 🎉`);
        
        // Atualizar pontos do usuário
        if (user) {
          setUser({
            ...user,
            points: user.points + (data.pointsEarned || 0)
          });
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar validação');
      }
    } catch (error: any) {
      console.error('❌ Erro ao validar:', error);
      const translatedError = ErrorTranslator.translate(error);
      setError(translatedError);
      ToastService.error('Erro ao validar: ' + translatedError);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async (period: 'all' | 'month' | 'week' = 'all') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/leaderboard?period=${period}&limit=10`, {
        headers: TokenStorage.getAuthHeader()
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data);
        setLeaderboardPeriod(period);
        console.log(`✅ Leaderboard carregado (${data.leaderboard?.length || 0} usuários)`);
      } else {
        throw new Error('Erro ao carregar leaderboard');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar leaderboard:', error);
      setError('Não foi possível carregar o ranking.');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (status?: string, page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const statusParam = status && status !== 'ALL' ? `&status=${status}` : '';
      const response = await fetch(
        `${API_BASE_URL}/api/translations/my-history?page=${page}&limit=20${statusParam}`,
        {
          headers: TokenStorage.getAuthHeader()
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHistoryData(data);
        setHistoryPage(page);
        console.log(`✅ Histórico carregado: ${data.translations?.length || 0} traduções`);
      } else {
        throw new Error('Erro ao carregar histórico');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
      setError('Não foi possível carregar seu histórico.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // NOTIFICATION FUNCTIONS
  // ============================================
  
  const loadUnreadCount = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/unread-count`,
        { headers: TokenStorage.getAuthHeader() }
      );
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadNotifications = async (page: number = 1) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications?page=${page}&limit=20`,
        { headers: TokenStorage.getAuthHeader() }
      );
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
        setNotificationPage(page);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: TokenStorage.getAuthHeader()
        }
      );
      
      if (response.ok) {
        // Update local state
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/read-all`,
        {
          method: 'PATCH',
          headers: TokenStorage.getAuthHeader()
        }
      );
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: TokenStorage.getAuthHeader()
        }
      );
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const submitTranslation = async () => {
    if (!selectedTerm || !translation.trim()) return;
    if (isRateLimited) {
      ToastService.warning(`Aguarde ${rateLimitRetryAfter} segundos antes de enviar outra tradução.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/translations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...TokenStorage.getAuthHeader()
        },
        body: JSON.stringify({
          termId: selectedTerm.id,
          labelPt: translation,
          confidence: confidence
        })
      });

      if (handleRateLimit(response)) {
        setLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        
        // Atualizar pontos do usuário
        if (user) {
          setUser({
            ...user,
            points: user.points + (data.pointsEarned || 0)
          });
        }

        // Limpar formulário
        setTranslation('');
        setSelectedTerm(null);
        
        // Remover termo da lista
        setTerms(prev => prev.filter(t => t.id !== selectedTerm.id));

        ToastService.success(`Tradução enviada com sucesso! +${data.pointsEarned} pontos 🎉`);
        
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar tradução');
      }
    } catch (error: any) {
      console.error('❌ Erro ao salvar tradução:', error);
      const translatedError = ErrorTranslator.translate(error);
      setError(translatedError);
      ToastService.error('Erro ao salvar tradução: ' + translatedError);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // COMPONENTE DE REGISTRO
  // ============================================
  const RegisterPage = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    const [registerLoading, setRegisterLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (formData.password !== formData.confirmPassword) {
        ToastService.error('As senhas não coincidem!');
        return;
      }

      if (formData.password.length < 8) {
        ToastService.error('A senha deve ter pelo menos 8 caracteres!');
        return;
      }

      setRegisterLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password
          })
        });

        if (response.ok) {
          const data = await response.json();
          TokenStorage.save(data.token);
          setUser(data.user);
          setCurrentPage('dashboard');
          loadStats();
          // Show interactive tour for new users
          if (!data.user.hasCompletedOnboarding && !tourCompleted) {
            setShowTour(true);
          }
          ToastService.success('Cadastro realizado com sucesso!');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao cadastrar');
        }
      } catch (error: any) {
        console.error('❌ Erro ao registrar:', error);
        ToastService.error(ErrorTranslator.translateRegisterError(error));
      } finally {
        setRegisterLoading(false);
      }
    };

    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f0f9ff',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          width: '450px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🧬</div>
            <h1 style={{ color: '#1e40af', fontSize: '2rem', margin: '0 0 10px 0', fontWeight: '700' }}>
              Criar Conta
            </h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
              Junte-se à comunidade HPO-PT
            </p>
          </div>

          {/* ORCID Registration */}
          <div style={{ marginBottom: '25px' }}>
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`${API_BASE_URL}/api/auth/orcid`);
                  if (response.ok) {
                    const data = await response.json();
                    window.location.href = data.authUrl;
                  } else {
                    throw new Error('Erro ao conectar com ORCID');
                  }
                } catch (error: any) {
                  ToastService.error(ErrorTranslator.translate(error));
                }
              }}
              type="button"
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '20px' }}>🔬</span>
              Registrar com ORCID
            </button>
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
              Recomendado para pesquisadores e profissionais da saúde
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '25px 0',
            color: '#9ca3af',
            fontSize: '14px'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
            <span style={{ padding: '0 15px' }}>ou</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                Nome Completo:
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  fontSize: '14px'
                }}
                placeholder="Seu nome completo"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                Email:
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  fontSize: '14px'
                }}
                placeholder="seu@email.com"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                Senha:
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  fontSize: '14px'
                }}
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                Confirmar Senha:
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  fontSize: '14px'
                }}
                placeholder="Digite a senha novamente"
              />
            </div>

            <button
              type="submit"
              disabled={registerLoading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: registerLoading ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: registerLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {registerLoading ? '⏳ Criando conta...' : '✅ Criar Conta'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', color: '#64748b', fontSize: '14px' }}>
            Já tem uma conta?{' '}
            <button
              onClick={() => setCurrentPage('login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '14px'
              }}
            >
              Fazer login
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // COMPONENTE DE LOGIN
  // ============================================
  const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      
      setLoginLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (response.ok) {
          const data = await response.json();
          TokenStorage.save(data.token);
          setUser(data.user);
          setCurrentPage('dashboard');
          loadStats();
          // Show interactive tour for new users
          if (!data.user.hasCompletedOnboarding && !tourCompleted) {
            setShowTour(true);
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Credenciais inválidas');
        }
      } catch (error: any) {
        console.error('❌ Erro ao fazer login:', error);
        ToastService.error(ErrorTranslator.translateLoginError(error));
      } finally {
        setLoginLoading(false);
      }
    };

    const handleORCIDLogin = async () => {
      try {
        // Get ORCID authorization URL from backend
        const response = await fetch(`${API_BASE_URL}/api/auth/orcid`);
        
        if (response.ok) {
          const data = await response.json();
          // Redirect to ORCID authorization page
          window.location.href = data.authUrl;
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao iniciar autenticação ORCID');
        }
      } catch (error: any) {
        console.error('❌ Erro ao iniciar ORCID OAuth:', error);
        ToastService.error(ErrorTranslator.translate(error));
      }
    };

    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f0f9ff',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          width: '450px'
        }}>
          {/* REMOVIDO: Status da API - confunde usuário */}

          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🔗</div>
            <h1 style={{ color: '#1e40af', fontSize: '2rem', margin: '0 0 10px 0', fontWeight: '700' }}>
              PORTI-HPO
            </h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
              Por ti, pela ciência, em português
            </p>
          </div>

          {/* ORCID Login */}
          <div style={{ marginBottom: '25px' }}>
            <button
              onClick={handleORCIDLogin}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#15803d';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#16a34a';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              🆔 Login com ORCID iD
            </button>
          </div>

          {/* LinkedIn Login */}
          <div style={{ marginBottom: '25px' }}>
            <button
              onClick={() => {
                window.location.href = `${API_BASE_URL}/api/auth/linkedin`;
              }}
              type="button"
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#0077b5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#005885';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0077b5';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              💼 Continuar com LinkedIn
            </button>
          </div>

          {/* Separador */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '25px 0',
            color: '#9ca3af'
          }}>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e5e7eb' }} />
            <span style={{ padding: '0 15px', fontSize: '14px' }}>ou</span>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e5e7eb' }} />
          </div>

          {/* Login com Email */}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                Email:
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  fontSize: '14px'
                }}
                placeholder="seu@email.com"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                Senha:
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  fontSize: '14px'
                }}
                placeholder="Sua senha"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading || !apiConnected}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: (loginLoading || !apiConnected) ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: (loginLoading || !apiConnected) ? 'not-allowed' : 'pointer'
              }}
            >
              {loginLoading ? '⏳ Entrando...' : '🔐 Entrar'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', color: '#64748b', fontSize: '14px' }}>
            Não tem uma conta?{' '}
            <button
              onClick={() => setCurrentPage('register')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '14px'
              }}
            >
              Cadastre-se
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // DASHBOARD
  // ============================================
  const Dashboard = () => (
    <div className="dashboard-content" style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 80px)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'Dashboard' }
        ]} />

        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#1e40af', margin: '0 0 10px 0', fontSize: '2.5rem' }}>
            Bem-vindo, {user?.name}! 👋
          </h1>
          {user?.orcidId && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              marginBottom: '10px'
            }}>
              <span style={{ color: '#16a34a', fontWeight: '600' }}>✅ ORCID:</span>
              <code style={{ 
                backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
                color: theme === 'dark' ? '#f9fafb' : '#1f2937',
                padding: '2px 6px', 
                borderRadius: '4px',
                border: theme === 'dark' ? '1px solid #374151' : 'none'
              }}>
                {user.orcidId}
              </code>
            </div>
          )}
          <p style={{ color: '#64748b', margin: 0 }}>
            {apiConnected ? 
              `Conectado ao sistema HPO-PT • ${stats?.totalTerms || 0} termos disponíveis` :
              'Aguardando conexão com o sistema...'
            }
          </p>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '30px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#374151', margin: '0 0 15px 0' }}>📊 Estatísticas Globais</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '15px'
            }}>
              <div style={{ textAlign: 'center', padding: '15px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
                  {stats.totalTerms.toLocaleString()}
                </div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>Total de Termos</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>
                  {stats.translatedTerms.toLocaleString()}
                </div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>Traduzidos</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ca8a04' }}>
                  {Math.round(stats.translationProgress)}%
                </div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>Progresso</div>
              </div>
            </div>
          </div>
        )}

        {/* 🎯 Recomendações Personalizadas */}
        <div style={{ marginBottom: '30px' }}>
          <RecommendedTerms 
            onTermSelect={(term) => {
              setSelectedTerm(term);
              setCurrentPage('translate');
            }}
            userSpecialty={user?.specialty}
            userLevel={user?.level}
          />
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
          gap: '20px' 
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📝</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Traduzir Termos</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
              Contribua com traduções de termos médicos HPO
            </p>
            <button
              onClick={() => {
                setCurrentPage('translate');
                loadTerms();
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Começar
            </button>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>✅</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Revisar Traduções</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
              Valide traduções feitas por outros colaboradores
            </p>
            <button
              onClick={() => {
                setCurrentPage('review');
                loadPendingTranslations();
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Revisar
            </button>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🏆</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Seus Pontos</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a', margin: '10px 0' }}>
              {user?.points || 0}
            </div>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Nível {user?.level || 1}
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🥇</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Ranking</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
              Veja os melhores tradutores da plataforma
            </p>
            <button
              onClick={() => {
                loadLeaderboard('all');
                setCurrentPage('leaderboard');
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#fbbf24',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Ver Ranking
            </button>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📚</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Meu Histórico</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
              Veja todas as suas traduções e validações
            </p>
            <button
              onClick={() => {
                loadHistory(undefined, 1);
                setCurrentPage('history');
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Ver Histórico
            </button>
          </div>

          {/* Referral Card - Task #6 */}
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center',
            border: '2px solid #ec4899'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>💌</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Convidar Amigos</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
              Ganhe <strong style={{ color: '#10b981' }}>+75 pontos</strong> por cada amigo
            </p>
            <button
              onClick={() => setCurrentPage('referral')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ec4899',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Convidar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================
  // PÁGINA DE TRADUÇÃO
  // ============================================
  const TranslatePage = () => {
    useEffect(() => {
      if (terms.length === 0) {
        loadTerms(1);
        loadCategories();
      }
    }, []);

    const handleSearch = () => {
      loadTerms(
        1, 
        searchTerm || undefined,
        filterCategory || undefined,
        filterStatus || undefined,
        filterDifficulty || undefined
      );
    };

    const clearFilters = () => {
      setSearchTerm('');
      setFilterCategory('');
      setFilterStatus('');
      setFilterDifficulty('');
      loadTerms(1);
    };

    const totalPages = Math.ceil(totalTerms / 20);

    return (
      <div className="translate-content" style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 80px)', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Breadcrumbs */}
          <Breadcrumbs items={[
            { label: 'Dashboard', page: 'dashboard' },
            { label: 'Traduzir' }
          ]} />

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ color: '#1e40af', margin: '0 0 10px 0' }}>
              🔗 PORTI-HPO: Tradução Colaborativa
            </h1>
            <p style={{ color: '#64748b', margin: 0 }}>
              Traduções de terminologia médica HPO para o português
            </p>
            {error && (
              <div style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '4px',
                color: '#991b1b',
                fontSize: '14px'
              }}>
                ❌ {error}
              </div>
            )}
          </div>

          {/* Search and Filters */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#374151', fontSize: '18px', fontWeight: '600' }}>
              🔍 Buscar e Filtrar Termos
            </h3>
            
            {/* Search Bar */}
            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Buscar por HPO ID ou termo em inglês..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Filters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Todas as Categorias</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Todos os Status</option>
                <option value="NOT_TRANSLATED">Não Traduzido</option>
                <option value="PENDING_REVIEW">Pendente Revisão</option>
                <option value="APPROVED">Aprovado</option>
              </select>

              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Todas as Dificuldades</option>
                <option value="1">1 - Muito Fácil</option>
                <option value="2">2 - Fácil</option>
                <option value="3">3 - Médio</option>
                <option value="4">4 - Difícil</option>
                <option value="5">5 - Muito Difícil</option>
              </select>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSearch}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                🔍 {loading ? 'Buscando...' : 'Buscar'}
              </button>
              <button
                onClick={clearFilters}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                🔄 Limpar
              </button>
            </div>

            {/* Results Info */}
            <div style={{ marginTop: '15px', fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>
              {totalTerms > 0 && (
                <span>
                  📊 Exibindo {terms.length} de {totalTerms} termos 
                  {searchTerm && ` • Buscando: "${searchTerm}"`}
                  {filterCategory && ` • Categoria: ${filterCategory}`}
                  {filterStatus && ` • Status: ${filterStatus}`}
                  {filterDifficulty && ` • Dificuldade: ${filterDifficulty}`}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Lista de Termos */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#374151' }}>
                  📋 Termos HPO ({terms.length})
                </h3>
                <button
                  onClick={() => loadTerms(termsPage, searchTerm, filterCategory, filterStatus, filterDifficulty)}
                  disabled={loading}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🔄 {loading ? 'Carregando...' : 'Recarregar'}
                </button>
              </div>
              
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', maxHeight: '500px', overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    🔄 Carregando termos...
                  </div>
                ) : terms.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    {apiConnected ? 
                      '🎉 Todos os termos foram traduzidos!' :
                      '⚠️ Backend offline. Conecte-se para carregar termos.'
                    }
                  </div>
                ) : (
                  terms.map(term => (
                    <div
                      key={term.id}
                      onClick={() => setSelectedTerm(term)}
                      style={{
                        padding: '15px',
                        borderBottom: '1px solid #f3f4f6',
                        cursor: 'pointer',
                        backgroundColor: selectedTerm?.id === term.id ? '#eff6ff' : 'transparent',
                        borderLeft: selectedTerm?.id === term.id ? '3px solid #2563eb' : 'none'
                      }}
                    >
                      <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                        {term.hpoId}
                      </div>
                      <div style={{ color: '#374151', marginTop: '4px', fontSize: '15px' }}>
                        {term.labelEn}
                      </div>
                      {term.definitionEn && (
                        <div style={{ color: '#6b7280', marginTop: '6px', fontSize: '12px' }}>
                          {term.definitionEn.length > 100 ? 
                            `${term.definitionEn.substring(0, 100)}...` : 
                            term.definitionEn
                          }
                        </div>
                      )}
                      {term.category && (
                        <div style={{ 
                          marginTop: '6px',
                          display: 'inline-block',
                          padding: '2px 8px',
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          {term.category}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Pagination Controls */}
              {totalTerms > 20 && (
                <div style={{
                  marginTop: '15px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <button
                    onClick={() => loadTerms(termsPage - 1, searchTerm, filterCategory, filterStatus, filterDifficulty)}
                    disabled={termsPage === 1 || loading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: termsPage === 1 || loading ? '#f3f4f6' : '#3b82f6',
                      color: termsPage === 1 || loading ? '#9ca3af' : 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: termsPage === 1 || loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ← Anterior
                  </button>

                  <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                    Página {termsPage} de {totalPages}
                  </span>

                  <button
                    onClick={() => loadTerms(termsPage + 1, searchTerm, filterCategory, filterStatus, filterDifficulty)}
                    disabled={termsPage >= totalPages || loading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: termsPage >= totalPages || loading ? '#f3f4f6' : '#3b82f6',
                      color: termsPage >= totalPages || loading ? '#9ca3af' : 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: termsPage >= totalPages || loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Próxima →
                  </button>
                </div>
              )}
            </div>

            {/* Formulário de Tradução */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              {selectedTerm ? (
                <>
                  <h3 style={{ margin: '0 0 15px 0', color: '#374151' }}>✏️ Traduzir para Português</h3>
                  
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
                      {selectedTerm.hpoId}
                    </div>
                    <div style={{ color: '#374151', marginBottom: '8px' }}>
                      <strong>Inglês:</strong> {selectedTerm.labelEn}
                    </div>
                    {selectedTerm.definitionEn && (
                      <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
                        <strong>Definição:</strong> {selectedTerm.definitionEn}
                      </div>
                    )}
                    {selectedTerm.synonymsEn && selectedTerm.synonymsEn.length > 0 && (
                      <div style={{ color: '#6b7280', fontSize: '13px' }}>
                        <strong>Sinônimos:</strong> {selectedTerm.synonymsEn.join(', ')}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Tradução em Português:
                    </label>
                    <textarea
                      value={translation}
                      onChange={(e) => setTranslation(e.target.value)}
                      placeholder="Digite a tradução precisa do termo médico..."
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '500' }}>
                      <span>Nível de Confiança: {confidence}/5</span>
                      <button
                        data-tooltip-id="confidence-level-tooltip"
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#3b82f6', 
                          cursor: 'help',
                          fontSize: '16px',
                          padding: '0'
                        }}
                        type="button"
                      >
                        ℹ️
                      </button>
                    </label>
                    <ReactTooltip 
                      id="confidence-level-tooltip" 
                      place="top"
                      style={{ maxWidth: '400px', zIndex: 9999 }}
                    >
                      <div style={{ fontSize: '13px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
                          🎯 Como avaliar seu nível de confiança?
                        </div>
                        <div style={{ marginBottom: '10px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                          <strong>⭐ 1 - Incerto:</strong> Não tenho certeza da tradução. Pode conter erros ou ser imprecisa.
                        </div>
                        <div style={{ marginBottom: '10px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                          <strong>⭐⭐ 2 - Baixa Confiança:</strong> A tradução pode estar correta, mas preciso de validação.
                        </div>
                        <div style={{ marginBottom: '10px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                          <strong>⭐⭐⭐ 3 - Moderado:</strong> Confiante na tradução, mas pode haver nuances a revisar.
                        </div>
                        <div style={{ marginBottom: '10px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                          <strong>⭐⭐⭐⭐ 4 - Alta Confiança:</strong> Muito confiante. Tradução precisa e bem fundamentada.
                        </div>
                        <div style={{ marginBottom: '10px', paddingBottom: '8px' }}>
                          <strong>⭐⭐⭐⭐⭐ 5 - Totalmente Certo:</strong> Certeza absoluta. Validado por fontes confiáveis.
                        </div>
                        <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #e5e7eb', fontSize: '12px', color: '#6b7280' }}>
                          💡 <strong>Dica:</strong> Seu nível de confiança ajuda os revisores a priorizarem as traduções e afeta sua pontuação de qualidade!
                        </div>
                      </div>
                    </ReactTooltip>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={confidence}
                      onChange={(e) => setConfidence(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontSize: '12px', 
                      color: '#6b7280',
                      marginTop: '5px'
                    }}>
                      <span>1 - Incerto</span>
                      <span>3 - Moderado</span>
                      <span>5 - Muito Confiante</span>
                    </div>
                  </div>

                  <button
                    onClick={submitTranslation}
                    disabled={!translation.trim() || loading}
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: (translation.trim() && !loading) ? '#16a34a' : '#9ca3af',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: (translation.trim() && !loading) ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {loading ? '⏳ Salvando...' : '✅ Salvar Tradução no Banco'}
                  </button>

                  <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#15803d',
                    textAlign: 'center'
                  }}>
                    💾 Tradução será salva no PostgreSQL e vinculada ao seu usuário
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '60px 20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎯</div>
                  <h3>Selecione um Termo HPO</h3>
                  <p>Escolha um termo da lista ao lado para começar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // PÁGINA DE REVISÃO
  // ============================================
  const ReviewPage = () => {
    const [validationRating, setValidationRating] = useState(3);
    const [validationComments, setValidationComments] = useState('');
    const [validationDecision, setValidationDecision] = useState<'APPROVED' | 'NEEDS_REVISION' | 'REJECTED'>('APPROVED');

    // Verificar se usuário tem permissão para revisar
    if (!user || !RoleHelpers.canVoteOnTranslation(user.role)) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>🚫 Acesso Negado</h2>
          <p>Você não tem permissão para revisar traduções.</p>
          <p>Entre em contato com um administrador para solicitar acesso.</p>
        </div>
      );
    }

    useEffect(() => {
      if (pendingTranslations.length === 0) {
        loadPendingTranslations();
      }
    }, []);

    const handleValidate = () => {
      submitValidation(validationDecision, validationRating, validationComments);
      setValidationComments('');
      setValidationRating(3);
    };

    return (
      <div className="review-content" style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 80px)', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Breadcrumbs */}
          <Breadcrumbs items={[
            { label: 'Dashboard', page: 'dashboard' },
            { label: 'Revisar Traduções' }
          ]} />

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ color: '#1e40af', margin: '0 0 10px 0' }}>
              ✅ Sistema de Revisão de Traduções
            </h1>
            <p style={{ color: '#64748b', margin: 0 }}>
              Valide traduções feitas por outros colaboradores e ganhe pontos
            </p>
            {error && (
              <div style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '4px',
                color: '#991b1b',
                fontSize: '14px'
              }}>
                ❌ {error}
              </div>
            )}
          </div>

          {/* 🔍 Search and Filters Section */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {/* Search Bar */}
            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="🔍 Buscar por HPO ID, termo ou tradutor..."
                value={reviewSearchTerm}
                onChange={(e) => setReviewSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    loadPendingTranslations(reviewSearchTerm, reviewFilterCategory);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Filters Toggle Button */}
            <button
              onClick={() => setReviewShowFilters(!reviewShowFilters)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>
                🔧 Filtros Avançados
                {reviewFilterCategory && (
                  <span style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    1
                  </span>
                )}
              </span>
              <span>{reviewShowFilters ? '▲' : '▼'}</span>
            </button>

            {/* Filters Panel */}
            {reviewShowFilters && (
              <div style={{
                marginTop: '15px',
                padding: '15px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                    📂 Categoria HPO
                  </label>
                  <select
                    value={reviewFilterCategory}
                    onChange={(e) => setReviewFilterCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => loadPendingTranslations(reviewSearchTerm, reviewFilterCategory)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    🔍 Aplicar Filtros
                  </button>
                  <button
                    onClick={() => {
                      setReviewSearchTerm('');
                      setReviewFilterCategory('');
                      loadPendingTranslations();
                    }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    🗑️ Limpar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Lista de Traduções Pendentes */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#374151' }}>
                  📋 Traduções Pendentes ({pendingTranslations.length})
                </h3>
                <button
                  onClick={loadPendingTranslations}
                  disabled={loading}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🔄 {loading ? 'Carregando...' : 'Recarregar'}
                </button>
              </div>
              
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', maxHeight: '600px', overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    🔄 Carregando traduções...
                  </div>
                ) : pendingTranslations.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    {apiConnected ? 
                      '🎉 Nenhuma tradução pendente no momento!' :
                      '⚠️ Backend offline. Conecte-se para carregar traduções.'
                    }
                  </div>
                ) : (
                  pendingTranslations.map(trans => (
                    <div
                      key={trans.id}
                      onClick={() => setSelectedPendingTranslation(trans)}
                      style={{
                        padding: '15px',
                        borderBottom: '1px solid #f3f4f6',
                        cursor: 'pointer',
                        backgroundColor: selectedPendingTranslation?.id === trans.id ? '#eff6ff' : 'transparent',
                        borderLeft: selectedPendingTranslation?.id === trans.id ? '3px solid #2563eb' : 'none'
                      }}
                    >
                      <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                        {trans.term.hpoId}
                      </div>
                      <div style={{ color: '#374151', marginTop: '4px', fontSize: '15px' }}>
                        <strong>EN:</strong> {trans.term.labelEn}
                      </div>
                      <div style={{ color: '#16a34a', marginTop: '4px', fontSize: '15px' }}>
                        <strong>PT:</strong> {trans.labelPt}
                      </div>
                      <div style={{ 
                        marginTop: '8px',
                        display: 'flex',
                        gap: '8px',
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: '#dbeafe',
                          borderRadius: '4px'
                        }}>
                          Confiança: {trans.confidence}/5
                        </span>
                        <span>Por: {trans.user.name}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Formulário de Validação */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              {selectedPendingTranslation ? (
                <>
                  <h3 style={{ margin: '0 0 15px 0', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ✅ Validar Tradução
                    <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280' }}>
                      ({selectedPendingTranslation.term.hpoId})
                    </span>
                  </h3>
                  
                  {/* Split View: Original vs Tradução */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                    marginBottom: '20px'
                  }}>
                    {/* Coluna Esquerda: Termo Original */}
                    <div style={{
                      backgroundColor: '#f8fafc',
                      padding: '15px',
                      borderRadius: '8px',
                      border: '2px solid #3b82f6'
                    }}>
                      <div style={{ 
                        fontWeight: '700', 
                        color: '#1e40af', 
                        marginBottom: '12px',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        🇬🇧 Termo Original (Inglês)
                      </div>
                      
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#6b7280', 
                          fontWeight: '600',
                          marginBottom: '4px' 
                        }}>
                          Label:
                        </div>
                        <div style={{ 
                          color: '#374151', 
                          fontSize: '15px',
                          fontWeight: '600',
                          lineHeight: '1.5'
                        }}>
                          {selectedPendingTranslation.term.labelEn}
                        </div>
                      </div>

                      {selectedPendingTranslation.term.definitionEn && (
                        <div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#6b7280', 
                            fontWeight: '600',
                            marginBottom: '4px' 
                          }}>
                            Definição:
                          </div>
                          <div style={{ 
                            color: '#6b7280', 
                            fontSize: '13px',
                            lineHeight: '1.6',
                            backgroundColor: 'white',
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0'
                          }}>
                            {selectedPendingTranslation.term.definitionEn}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Coluna Direita: Tradução Proposta */}
                    <div style={{
                      backgroundColor: '#f0fdf4',
                      padding: '15px',
                      borderRadius: '8px',
                      border: '2px solid #16a34a'
                    }}>
                      <div style={{ 
                        fontWeight: '700', 
                        color: '#15803d', 
                        marginBottom: '12px',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        🇵🇹 Tradução Proposta (Português)
                      </div>
                      
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#166534', 
                          fontWeight: '600',
                          marginBottom: '4px' 
                        }}>
                          Label:
                        </div>
                        <div style={{ 
                          color: '#166534', 
                          fontSize: '15px',
                          fontWeight: '600',
                          lineHeight: '1.5'
                        }}>
                          {selectedPendingTranslation.labelPt}
                        </div>
                      </div>

                      {selectedPendingTranslation.definitionPt && (
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#166534', 
                            fontWeight: '600',
                            marginBottom: '4px' 
                          }}>
                            Definição:
                          </div>
                          <div style={{ 
                            color: '#166534', 
                            fontSize: '13px',
                            lineHeight: '1.6',
                            backgroundColor: 'white',
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid #bbf7d0'
                          }}>
                            {selectedPendingTranslation.definitionPt}
                          </div>
                        </div>
                      )}

                      {/* Metadados da Tradução */}
                      <div style={{
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid #bbf7d0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            padding: '2px 8px',
                            backgroundColor: '#16a34a',
                            color: 'white',
                            borderRadius: '4px',
                            fontWeight: '600',
                            fontSize: '11px'
                          }}>
                            ⭐ {selectedPendingTranslation.confidence}/5
                          </span>
                          <span style={{ color: '#166534', fontSize: '11px' }}>
                            Confiança
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#166534' }}>
                          <strong>👤 Traduzido por:</strong> {selectedPendingTranslation.user.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                          📅 {new Date(selectedPendingTranslation.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Decisão:
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => setValidationDecision('APPROVED')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          backgroundColor: validationDecision === 'APPROVED' ? '#16a34a' : '#f3f4f6',
                          color: validationDecision === 'APPROVED' ? 'white' : '#374151',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '14px'
                        }}
                      >
                        ✅ Aprovar Tradução
                      </button>
                      <button
                        onClick={() => setValidationDecision('NEEDS_REVISION')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          backgroundColor: validationDecision === 'NEEDS_REVISION' ? '#f59e0b' : '#f3f4f6',
                          color: validationDecision === 'NEEDS_REVISION' ? 'white' : '#374151',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '14px'
                        }}
                      >
                        ⚠️ Revisar
                      </button>
                      <button
                        onClick={() => setValidationDecision('REJECTED')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          backgroundColor: validationDecision === 'REJECTED' ? '#dc2626' : '#f3f4f6',
                          color: validationDecision === 'REJECTED' ? 'white' : '#374151',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '14px'
                        }}
                      >
                        ❌ Rejeitar
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Avaliação de Qualidade: {validationRating}/5
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={validationRating}
                      onChange={(e) => setValidationRating(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontSize: '12px', 
                      color: '#6b7280',
                      marginTop: '5px'
                    }}>
                      <span>1 - Ruim</span>
                      <span>3 - Boa</span>
                      <span>5 - Excelente</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Comentários (opcional):
                    </label>
                    <textarea
                      value={validationComments}
                      onChange={(e) => setValidationComments(e.target.value)}
                      placeholder="Adicione sugestões ou observações sobre esta tradução..."
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <button
                    onClick={handleValidate}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: loading ? '#9ca3af' : '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? '⏳ Enviando...' : '✅ Enviar Validação'}
                  </button>

                  <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#15803d',
                    textAlign: 'center'
                  }}>
                    🏆 Você ganhará pontos ao validar esta tradução
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '60px 20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>📋</div>
                  <h3>Selecione uma Tradução</h3>
                  <p>Escolha uma tradução da lista ao lado para revisar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // HOME PAGE (Landing Page) - COMPLETA
  // ============================================
  const HomePage = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
      const handleScroll = () => {
        setShowScrollTop(window.scrollY > 300);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        position: 'relative'
      }}>
        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              position: 'fixed',
              bottom: '30px',
              right: '30px',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '24px',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
              zIndex: 1000,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            ⬆️
          </button>
        )}

        {/* Dark Mode Toggle - Landing Page */}
        <button
          onClick={toggleTheme}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: theme === 'dark' ? '#1f2937' : 'rgba(255,255,255,0.9)',
            color: theme === 'dark' ? 'white' : '#1e40af',
            border: '2px solid',
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            cursor: 'pointer',
            fontSize: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {/* Hero Section - COMPACTED */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '60px 20px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🧬</div>
            <h1 style={{
              fontSize: '2.8rem',
              fontWeight: '800',
              marginBottom: '15px',
              lineHeight: '1.2'
            }}>
              HPO-PT Platform
            </h1>
            <p style={{
              fontSize: '1.25rem',
              marginBottom: '30px',
              maxWidth: '700px',
              margin: '0 auto 30px auto',
              lineHeight: '1.5',
              opacity: 0.95
            }}>
              Sistema Colaborativo de Tradução da <strong>Human Phenotype Ontology</strong> para Português
            </p>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setCurrentPage('login')}
                style={{
                  padding: '18px 50px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  backgroundColor: 'white',
                  color: '#667eea',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.2)';
                }}
              >
                🚪 Entrar
              </button>

              <button
                onClick={() => setCurrentPage('register')}
                style={{
                  padding: '18px 50px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '3px solid white',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#667eea';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                ✨ Criar Conta Grátis
              </button>
            </div>
          </div>
        </div>

        {/* O que é HPO */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 20px'
        }}>
        {/* What is HPO + Why Portuguese - COMBINED & COMPACTED */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '50px 20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '800',
              color: '#1e293b',
              marginBottom: '25px',
              textAlign: 'center'
            }}>
              🩺 HPO em Português: Por quê?
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
              gap: '30px',
              marginBottom: '30px'
            }}>
              {/* Left: What is HPO */}
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#667eea', marginBottom: '15px' }}>
                  O que é a HPO?
                </h3>
                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.7', marginBottom: '15px' }}>
                  A <strong>Human Phenotype Ontology</strong> é uma ontologia padronizada com <strong>+16.000 termos</strong> 
                  para descrever fenótipos clínicos em doenças humanas.
                </p>
                <ul style={{ marginLeft: '20px', fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6' }}>
                  <li>✅ Padronização médica global</li>
                  <li>✅ Diagnóstico de doenças raras</li>
                  <li>✅ Pesquisa em genômica clínica</li>
                </ul>
              </div>

              {/* Right: Why Portuguese */}
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#667eea', marginBottom: '15px' }}>
                  Por que Português?
                </h3>
                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.7', marginBottom: '15px' }}>
                  <strong>280 milhões</strong> de falantes precisam de acesso à terminologia médica em sua língua nativa.
                </p>
                <ul style={{ marginLeft: '20px', fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6' }}>
                  <li>🇧🇷🇵🇹 6º idioma mais falado no mundo</li>
                  <li>👨‍⚕️ Facilita diagnóstico para médicos lusófonos</li>
                  <li>🔬 Inclusão em pesquisa internacional</li>
                </ul>
              </div>
            </div>

            {/* Problem Statement */}
            <div style={{
              backgroundColor: '#fef3c7',
              border: '2px solid #fbbf24',
              borderRadius: '12px',
              padding: '15px 20px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#92400e' }}>
                <strong>⚠️ Problema:</strong> HPO só está em inglês. 
                <strong> Precisamos traduzir todos os 16.000+ termos para português!</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Como Funciona - COMPACTED */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '50px 20px'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '800',
              color: '#1e293b',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              ⚙️ Como Funciona?
            </h2>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
              gap: '20px' 
            }}>
              {[
                { emoji: '✍️', title: 'Tradução', description: 'Proponha traduções', color: '#3b82f6' },
                { emoji: '👀', title: 'Revisão', description: 'Avaliação por pares', color: '#8b5cf6' },
                { emoji: '✅', title: 'Validação', description: 'Aprovação de especialistas', color: '#10b981' },
                { emoji: '👑', title: 'Moderação', description: 'Controle de qualidade', color: '#f59e0b' },
                { emoji: '🚀', title: 'Submissão HPO', description: 'Envio oficial com ORCID', color: '#ef4444' },
                { emoji: '🌍', title: 'Publicação', description: 'Disponível globalmente', color: '#06b6d4' }
              ].map((step, index) => (
                <div 
                  key={index}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    borderTop: `4px solid ${step.color}`
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{step.emoji}</div>
                  <h3 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '700', 
                    color: step.color,
                    marginBottom: '8px'
                  }}>
                    {step.title}
                  </h3>
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: '#64748b',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>

        {/* Video Demo Placeholder - NEW */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '50px 20px'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: '#1e293b',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            🎥 Veja Como Funciona
          </h2>
          <div style={{
            backgroundColor: '#1f2937',
            borderRadius: '16px',
            padding: '60px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            position: 'relative',
            aspectRatio: '16/9',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.5 }}>▶️</div>
            <p style={{ 
              color: 'white', 
              fontSize: '1.2rem', 
              opacity: 0.7,
              margin: 0
            }}>
              Vídeo demonstrativo em produção
            </p>
            <p style={{ 
              color: 'white', 
              fontSize: '0.9rem', 
              opacity: 0.5,
              marginTop: '10px'
            }}>
              Em breve: Tutorial completo da plataforma
            </p>
          </div>
        </div>

        {/* Benefícios de Contribuir */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '80px 20px',
          color: 'white'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              marginBottom: '50px',
              textAlign: 'center'
            }}>
              🎁 Benefícios de Contribuir
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '30px'
            }}>
              {[
                {
                  emoji: '📜',
                  title: 'Crédito Oficial via ORCID',
                  description: 'Seu ORCID iD será incluído nas submissões oficiais ao repositório HPO, garantindo reconhecimento acadêmico permanente'
                },
                {
                  emoji: '🏆',
                  title: 'Reconhecimento',
                  description: 'Ranking público de contribuidores e badges de conquistas'
                },
                {
                  emoji: '📚',
                  title: 'Currículo Acadêmico',
                  description: 'Contribuição para projeto internacional reconhecido cientificamente'
                },
                {
                  emoji: '🌟',
                  title: 'Impacto Social',
                  description: 'Ajude a melhorar o diagnóstico de doenças raras na comunidade lusófona'
                },
                {
                  emoji: '🤝',
                  title: 'Networking',
                  description: 'Conecte-se com especialistas e pesquisadores da área'
                },
                {
                  emoji: '🎓',
                  title: 'Aprendizado',
                  description: 'Aprenda sobre terminologia médica e doenças raras'
                }
              ].map((benefit, index) => (
                <div key={index} style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  padding: '30px',
                  borderRadius: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{benefit.emoji}</div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', fontWeight: '700' }}>
                    {benefit.title}
                  </h3>
                  <p style={{ fontSize: '0.95rem', opacity: 0.9, lineHeight: '1.5' }}>
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '80px 20px'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              color: '#1e293b',
              marginBottom: '50px',
              textAlign: 'center'
            }}>
              📊 Nossa Meta
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '30px',
              textAlign: 'center'
            }}>
              {[
                { number: '16.000+', label: 'Termos HPO', emoji: '📖' },
                { number: '100%', label: 'Tradução Completa', emoji: '🎯' },
                { number: '280M+', label: 'Falantes Beneficiados', emoji: '🌍' },
                { number: 'CPLP', label: 'Países da Lusofonia', emoji: '🇧🇷🇵🇹🇦🇴🇲🇿' }
              ].map((stat, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '40px 20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{stat.emoji}</div>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    color: '#667eea',
                    marginBottom: '10px'
                  }}>
                    {stat.number}
                  </div>
                  <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: '600' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div style={{
          backgroundColor: 'white',
          padding: '80px 20px',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              color: '#1e293b',
              marginBottom: '20px'
            }}>
              Pronto para Fazer a Diferença?
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#64748b',
              marginBottom: '40px',
              lineHeight: '1.6'
            }}>
              Junte-se à nossa comunidade de colaboradores e ajude a tornar a HPO 
              acessível para toda a comunidade médica lusófona!
            </p>

            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setCurrentPage('register')}
                style={{
                  padding: '20px 60px',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.4)';
                }}
              >
                ✨ Começar Agora - É Grátis!
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          backgroundColor: '#1e293b',
          color: 'white',
          padding: '60px 20px',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔗</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>PORTI-HPO</h3>
            <p style={{ opacity: 0.7, marginBottom: '20px' }}>
              Portuguese Open Research & Translation Initiative - Por ti, pela ciência, em português
            </p>
            
            {/* Footer Links */}
            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap'
            }}>
              <a
                href="/privacy-policy.html"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#93c5fd',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#dbeafe'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#93c5fd'}
              >
                🔒 Política de Privacidade
              </a>
              <span style={{ opacity: 0.4 }}>•</span>
              <a
                href="mailto:contato@raras-cplp.org"
                style={{
                  color: '#93c5fd',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#dbeafe'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#93c5fd'}
              >
                📧 Contato
              </a>
              <span style={{ opacity: 0.4 }}>•</span>
              <a
                href="mailto:dpo@raras-cplp.org"
                style={{
                  color: '#93c5fd',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#dbeafe'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#93c5fd'}
              >
                🛡️ DPO/LGPD
              </a>
            </div>

            <p style={{ fontSize: '0.9rem', opacity: 0.6 }}>
              Human Phenotype Ontology® é marca registrada. PORTI é um projeto comunitário independente.
            </p>
            <p style={{ fontSize: '0.85rem', opacity: 0.5, marginTop: '10px' }}>
              © 2025 PORTI-HPO by RARAS-CPLP. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // PROFILE PAGE (Task #20)
  // ============================================
  const ProfilePage = () => {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profileExpanded, setProfileExpanded] = useState(false);
    const [loadingLinkedIn, setLoadingLinkedIn] = useState(false);
    const [showEhealsModal, setShowEhealsModal] = useState(false);
    const [profileData, setProfileData] = useState({
      name: user?.name || '',
      email: user?.email || '',
      institution: '',
      specialty: '',
      country: '',
      bio: ''
    });
    const [professionalProfile, setProfessionalProfile] = useState({
      academicDegree: '',
      fieldOfStudy: '',
      professionalRole: '',
      yearsOfExperience: '',
      institution: '',
      medicalSpecialty: '',
      researchArea: '',
      englishProficiency: '',
      linkedinUrl: '',
      ehealsScore: 0,
      ehealsAnswers: [] as number[]
    });

    // Load professional profile on mount
    useEffect(() => {
      const loadCompleteProfile = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/users/profile/complete`, {
            headers: TokenStorage.getAuthHeader()
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.user.professionalProfile) {
              setProfessionalProfile(prev => ({
                ...prev,
                ...data.user.professionalProfile
              }));
            }
          }
        } catch (error) {
          console.error('Error loading professional profile:', error);
        }
      };
      
      loadCompleteProfile();
    }, []);

    // Calculate Profile Completion (Task #6)
    const calculateProfileCompletion = () => {
      const requiredFields = {
        // Basic Profile (30%)
        name: !!profileData.name,
        email: !!profileData.email,
        institution: !!profileData.institution,
        
        // Professional Profile (50%)
        academicDegree: !!professionalProfile.academicDegree,
        fieldOfStudy: !!professionalProfile.fieldOfStudy,
        professionalRole: !!professionalProfile.professionalRole,
        researchArea: !!professionalProfile.researchArea,
        englishProficiency: !!professionalProfile.englishProficiency,
        
        // eHEALS Score (20%)
        ehealsScore: professionalProfile.ehealsScore > 0
      };

      const totalFields = Object.keys(requiredFields).length;
      const completedFields = Object.values(requiredFields).filter(Boolean).length;
      const percentage = Math.round((completedFields / totalFields) * 100);
      
      return {
        percentage,
        completed: completedFields,
        total: totalFields,
        isComplete: percentage === 100,
        missingFields: Object.entries(requiredFields)
          .filter(([_, value]) => !value)
          .map(([key]) => key)
      };
    };

    const profileCompletion = calculateProfileCompletion();
    const PROFILE_COMPLETION_POINTS = 100; // Points awarded for 100% profile

    const handleImportLinkedIn = () => {
      setLoadingLinkedIn(true);
      ToastService.info('🔗 A integração LinkedIn estará disponível em breve! Por enquanto, preencha manualmente.');
      // TODO: Implement LinkedIn OAuth integration
      // LinkedIn OAuth flow:
      // 1. Redirect to: https://www.linkedin.com/oauth/v2/authorization
      // 2. Get authorization code
      // 3. Exchange for access token
      // 4. Fetch profile data from: https://api.linkedin.com/v2/me
      setLoadingLinkedIn(false);
    };

    const handleSaveEheals = async (score: number, answers: number[]) => {
      try {
        setProfessionalProfile(prev => ({
          ...prev,
          ehealsScore: score,
          ehealsAnswers: answers
        }));

        // Save to backend
        const response = await fetch(`${API_BASE_URL}/api/users/profile/professional`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...TokenStorage.getAuthHeader()
          },
          body: JSON.stringify({
            ehealsScore: score,
            ehealsAnswers: answers
          })
        });

        if (response.ok) {
          ToastService.success(`✅ Avaliação eHEALS salva! Score: ${score}/40`);
        } else {
          throw new Error('Erro ao salvar eHEALS');
        }
      } catch (error: any) {
        ToastService.error(ErrorTranslator.translate(error));
      }
    };

    const handleSaveProfessionalProfile = async () => {
      setSaving(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile/professional`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...TokenStorage.getAuthHeader()
          },
          body: JSON.stringify({
            academicDegree: professionalProfile.academicDegree || undefined,
            fieldOfStudy: professionalProfile.fieldOfStudy || undefined,
            professionalRole: professionalProfile.professionalRole || undefined,
            yearsOfExperience: professionalProfile.yearsOfExperience ? parseInt(professionalProfile.yearsOfExperience) : undefined,
            institution: professionalProfile.institution || undefined,
            medicalSpecialty: professionalProfile.medicalSpecialty || undefined,
            researchArea: professionalProfile.researchArea || undefined,
            englishProficiency: professionalProfile.englishProficiency || undefined,
            linkedinUrl: professionalProfile.linkedinUrl || undefined
          })
        });

        if (response.ok) {
          ToastService.success('✅ Perfil profissional atualizado com sucesso!');
          setEditing(false);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao atualizar perfil profissional');
        }
      } catch (error: any) {
        ToastService.error(ErrorTranslator.translate(error));
      } finally {
        setSaving(false);
      }
    };

    const handleSave = async () => {
      // Save both profiles
      await Promise.all([
        handleSaveBasicProfile(),
        profileExpanded && editing ? handleSaveProfessionalProfile() : Promise.resolve()
      ]);
    };

    const handleSaveBasicProfile = async () => {
      setSaving(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...TokenStorage.getAuthHeader()
          },
          body: JSON.stringify(profileData)
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setEditing(false);
          ToastService.success('Perfil atualizado com sucesso!');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao atualizar perfil');
        }
      } catch (error: any) {
        ToastService.error(ErrorTranslator.translate(error));
      } finally {
        setSaving(false);
      }
    };

    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 80px)', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Breadcrumbs items={['Home', 'Perfil']} />
          
          {/* Profile Completion Card (Task #6) */}
          {!profileCompletion.isComplete && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '25px',
              marginTop: '20px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '2px solid #fbbf24'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div style={{ fontSize: '36px' }}>📋</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                    Complete seu Perfil!
                  </h3>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                    Ganhe <strong style={{ color: '#10b981' }}>+{PROFILE_COMPLETION_POINTS} pontos</strong> ao completar 100% do seu perfil
                  </p>
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: profileCompletion.percentage >= 80 ? '#10b981' : profileCompletion.percentage >= 50 ? '#fbbf24' : '#f59e0b'
                }}>
                  {profileCompletion.percentage}%
                </div>
              </div>
              
              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: '12px',
                backgroundColor: '#e5e7eb',
                borderRadius: '6px',
                overflow: 'hidden',
                marginBottom: '15px'
              }}>
                <div style={{
                  width: `${profileCompletion.percentage}%`,
                  height: '100%',
                  background: profileCompletion.percentage >= 80 
                    ? 'linear-gradient(90deg, #10b981, #059669)' 
                    : profileCompletion.percentage >= 50 
                    ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                    : 'linear-gradient(90deg, #f59e0b, #dc2626)',
                  transition: 'width 0.5s ease',
                  borderRadius: '6px'
                }} />
              </div>

              {/* Missing Fields */}
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                <strong>Campos faltantes ({profileCompletion.total - profileCompletion.completed}):</strong>{' '}
                {profileCompletion.missingFields.length > 0 ? (
                  profileCompletion.missingFields.map((field, index) => {
                    const fieldNames: Record<string, string> = {
                      name: 'Nome',
                      email: 'Email',
                      institution: 'Instituição',
                      academicDegree: 'Grau Acadêmico',
                      fieldOfStudy: 'Área de Estudo',
                      professionalRole: 'Função Profissional',
                      researchArea: 'Área de Pesquisa',
                      englishProficiency: 'Proficiência em Inglês',
                      ehealsScore: 'Questionário eHEALS'
                    };
                    return (
                      <span key={field}>
                        {fieldNames[field] || field}
                        {index < profileCompletion.missingFields.length - 1 ? ', ' : ''}
                      </span>
                    );
                  })
                ) : (
                  'Nenhum - Perfil completo! 🎉'
                )}
              </div>
            </div>
          )}

          {/* Completion Success Message */}
          {profileCompletion.isComplete && (
            <div style={{
              backgroundColor: '#dcfce7',
              borderRadius: '12px',
              padding: '20px',
              marginTop: '20px',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div style={{ fontSize: '36px' }}>✅</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#15803d' }}>
                  Perfil 100% Completo!
                </h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#166534' }}>
                  Parabéns! Você ganhou <strong>+{PROFILE_COMPLETION_POINTS} pontos</strong> por completar seu perfil.
                </p>
              </div>
              <div style={{ fontSize: '48px' }}>🏆</div>
            </div>
          )}
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            marginTop: '20px'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              padding: '40px',
              color: 'white',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: '#818cf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  border: '4px solid white',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', fontWeight: '700' }}>
                    {user?.name}
                  </h1>
                  <p style={{ margin: '0 0 15px 0', opacity: 0.95 }}>
                    {user?.email}
                  </p>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', opacity: 0.9 }}>Nível</div>
                      <div style={{ fontSize: '20px', fontWeight: '700' }}>{user?.level || 1}</div>
                    </div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', opacity: 0.9 }}>Pontos</div>
                      <div style={{ fontSize: '20px', fontWeight: '700' }}>{user?.points || 0}</div>
                    </div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', opacity: 0.9 }}>Cargo</div>
                      <div style={{ fontSize: '14px', fontWeight: '600', textTransform: 'capitalize' }}>
                        {user?.role || 'Translator'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div style={{ padding: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', color: '#1f2937' }}>
                  Informações do Perfil
                </h2>
                <button
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  disabled={saving}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: editing ? '#10b981' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    opacity: saving ? 0.6 : 1
                  }}
                >
                  {saving ? '⏳ Salvando...' : editing ? '💾 Salvar Alterações' : '✏️ Editar Perfil'}
                </button>
              </div>

              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    disabled={!editing}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: editing ? 'white' : '#f9fafb'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: '#f9fafb',
                      cursor: 'not-allowed'
                    }}
                  />
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                    O email não pode ser alterado
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                      Instituição
                    </label>
                    <input
                      type="text"
                      value={profileData.institution}
                      onChange={(e) => setProfileData({ ...profileData, institution: e.target.value })}
                      disabled={!editing}
                      placeholder="Ex: Universidade Federal..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: editing ? 'white' : '#f9fafb'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                      Especialidade
                    </label>
                    <input
                      type="text"
                      value={profileData.specialty}
                      onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                      disabled={!editing}
                      placeholder="Ex: Genética Médica"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: editing ? 'white' : '#f9fafb'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    País
                  </label>
                  <input
                    type="text"
                    value={profileData.country}
                    onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                    disabled={!editing}
                    placeholder="Ex: Brasil"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: editing ? 'white' : '#f9fafb'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Biografia
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!editing}
                    placeholder="Conte um pouco sobre você e sua experiência..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: editing ? 'white' : '#f9fafb',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              {editing && (
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>

            {/* Professional Profile Section - OPTIONAL */}
            <div style={{ borderTop: '1px solid #e5e7eb', padding: '40px', backgroundColor: '#f8fafc' }}>
              <div 
                onClick={() => setProfileExpanded(!profileExpanded)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  marginBottom: profileExpanded ? '30px' : '0'
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#1f2937' }}>
                    💼 Perfil Profissional (Opcional)
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                    {profileExpanded ? 'Clique para ocultar' : 'Complete para aumentar sua credibilidade e receber crédito via ORCID nas submissões ao HPO'}
                  </p>
                </div>
                <div style={{ fontSize: '24px', color: '#6b7280' }}>
                  {profileExpanded ? '▼' : '▶'}
                </div>
              </div>

              {profileExpanded && (
                <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
                  {/* LinkedIn Integration Button */}
                  <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '2px dashed #0077b5'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        backgroundColor: '#0077b5',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '20px',
                        fontWeight: 'bold'
                      }}>
                        in
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '16px', color: '#1f2937' }}>
                          Importar do LinkedIn
                        </h4>
                        <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                          Preencha automaticamente seus dados profissionais
                        </p>
                      </div>
                      <button
                        onClick={handleImportLinkedIn}
                        disabled={!editing || loadingLinkedIn}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: editing ? '#0077b5' : '#d1d5db',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: editing && !loadingLinkedIn ? 'pointer' : 'not-allowed',
                          fontWeight: '600',
                          fontSize: '13px',
                          opacity: loadingLinkedIn ? 0.6 : 1
                        }}
                      >
                        {loadingLinkedIn ? '⏳ Conectando...' : '🔗 Conectar LinkedIn'}
                      </button>
                    </div>
                    <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>
                      💡 Dica: Você também pode preencher manualmente os campos abaixo
                    </p>
                  </div>

                  {/* Academic Degree */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                        Grau Acadêmico
                      </label>
                      <select
                        value={professionalProfile.academicDegree}
                        onChange={(e) => setProfessionalProfile({ ...professionalProfile, academicDegree: e.target.value })}
                        disabled={!editing}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          backgroundColor: editing ? 'white' : '#f9fafb',
                          cursor: editing ? 'pointer' : 'not-allowed'
                        }}
                      >
                        <option value="">Selecione...</option>
                        <option value="high_school">Ensino Médio</option>
                        <option value="bachelor">Bacharelado</option>
                        <option value="master">Mestrado</option>
                        <option value="phd">Doutorado (PhD)</option>
                        <option value="postdoc">Pós-Doutorado</option>
                        <option value="other">Outro</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                        Área de Estudo
                      </label>
                      <input
                        type="text"
                        value={professionalProfile.fieldOfStudy}
                        onChange={(e) => setProfessionalProfile({ ...professionalProfile, fieldOfStudy: e.target.value })}
                        disabled={!editing}
                        placeholder="Ex: Medicina, Biologia, Genética..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          backgroundColor: editing ? 'white' : '#f9fafb'
                        }}
                      />
                    </div>
                  </div>

                  {/* Professional Role & Years */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                        Função Profissional
                      </label>
                      <select
                        value={professionalProfile.professionalRole}
                        onChange={(e) => setProfessionalProfile({ ...professionalProfile, professionalRole: e.target.value })}
                        disabled={!editing}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          backgroundColor: editing ? 'white' : '#f9fafb',
                          cursor: editing ? 'pointer' : 'not-allowed'
                        }}
                      >
                        <option value="">Selecione...</option>
                        <option value="researcher">Pesquisador</option>
                        <option value="clinician">Médico/Clínico</option>
                        <option value="student">Estudante</option>
                        <option value="professor">Professor</option>
                        <option value="translator">Tradutor</option>
                        <option value="other">Outro</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                        Anos de Experiência
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={professionalProfile.yearsOfExperience}
                        onChange={(e) => setProfessionalProfile({ ...professionalProfile, yearsOfExperience: e.target.value })}
                        disabled={!editing}
                        placeholder="Ex: 5"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          backgroundColor: editing ? 'white' : '#f9fafb'
                        }}
                      />
                    </div>
                  </div>

                  {/* Medical Specialty & Research Area */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                        Especialidade Médica (se aplicável)
                      </label>
                      <input
                        type="text"
                        value={professionalProfile.medicalSpecialty}
                        onChange={(e) => setProfessionalProfile({ ...professionalProfile, medicalSpecialty: e.target.value })}
                        disabled={!editing}
                        placeholder="Ex: Geneticista, Pediatra..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          backgroundColor: editing ? 'white' : '#f9fafb'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                        Área de Pesquisa
                      </label>
                      <input
                        type="text"
                        value={professionalProfile.researchArea}
                        onChange={(e) => setProfessionalProfile({ ...professionalProfile, researchArea: e.target.value })}
                        disabled={!editing}
                        placeholder="Ex: Doenças Raras, Genômica..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          backgroundColor: editing ? 'white' : '#f9fafb'
                        }}
                      />
                    </div>
                  </div>

                  {/* English Proficiency */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                      Nível de Proficiência em Inglês
                    </label>
                    <select
                      value={professionalProfile.englishProficiency}
                      onChange={(e) => setProfessionalProfile({ ...professionalProfile, englishProficiency: e.target.value })}
                      disabled={!editing}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: editing ? 'white' : '#f9fafb',
                        cursor: editing ? 'pointer' : 'not-allowed'
                      }}
                    >
                      <option value="">Selecione...</option>
                      <option value="basic">Básico</option>
                      <option value="intermediate">Intermediário</option>
                      <option value="advanced">Avançado</option>
                      <option value="fluent">Fluente</option>
                      <option value="native">Nativo</option>
                    </select>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                      💡 Importante para tradução de termos técnicos médicos
                    </p>
                  </div>

                  {/* LinkedIn URL */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                      URL do LinkedIn (opcional)
                    </label>
                    <input
                      type="url"
                      value={professionalProfile.linkedinUrl}
                      onChange={(e) => setProfessionalProfile({ ...professionalProfile, linkedinUrl: e.target.value })}
                      disabled={!editing}
                      placeholder="https://www.linkedin.com/in/seu-perfil"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: editing ? 'white' : '#f9fafb'
                      }}
                    />
                  </div>

                  {/* Info Box */}
                  <div style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '15px',
                    fontSize: '13px',
                    color: '#1e40af'
                  }}>
                    <strong>📌 Por que preencher o perfil profissional?</strong>
                    <ul style={{ marginTop: '10px', marginLeft: '20px', lineHeight: '1.6' }}>
                      <li>Aumenta sua <strong>credibilidade</strong> como tradutor</li>
                      <li>Seu <strong>nível de expertise</strong> será calculado automaticamente (DOMAIN_EXPERT, PROFESSIONAL, LAYPERSON)</li>
                      <li>Suas contribuições terão <strong>maior peso</strong> nas submissões oficiais ao HPO</li>
                      <li>Permite receber <strong>crédito via ORCID</strong> no repositório internacional</li>
                    </ul>
                  </div>

                  {/* eHEALS Assessment Section */}
                  <div style={{
                    backgroundColor: 'white',
                    border: '2px solid #8b5cf6',
                    borderRadius: '12px',
                    padding: '20px',
                    marginTop: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '15px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: '#8b5cf6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        📱
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
                          Avaliação de Literacia Digital em Saúde
                        </h4>
                        <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                          Responda 8 questões sobre sua capacidade de buscar e avaliar informações de saúde online.
                          Esta avaliação ajuda a determinar seu nível de expertise.
                        </p>
                      </div>
                    </div>

                    {professionalProfile.ehealsScore > 0 ? (
                      <>
                        {/* Show Results */}
                        <div style={{
                          backgroundColor: '#f9fafb',
                          borderRadius: '8px',
                          padding: '15px',
                          marginBottom: '15px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '5px' }}>
                                Seu Score eHEALS
                              </div>
                              <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>
                                {professionalProfile.ehealsScore}/40
                              </div>
                            </div>
                            <div style={{
                              padding: '8px 16px',
                              backgroundColor: professionalProfile.ehealsScore >= 33 ? '#22c55e' : professionalProfile.ehealsScore >= 21 ? '#f59e0b' : '#ef4444',
                              color: 'white',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '600'
                            }}>
                              {professionalProfile.ehealsScore >= 33 ? '📈 Alta' : professionalProfile.ehealsScore >= 21 ? '📊 Moderada' : '📉 Baixa'}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowEhealsModal(true)}
                          style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: 'white',
                            color: '#8b5cf6',
                            border: '2px solid #8b5cf6',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px'
                          }}
                        >
                          🔄 Refazer Avaliação
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowEhealsModal(true)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: '#8b5cf6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px'
                        }}
                      >
                        📋 Iniciar Avaliação eHEALS
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* eHEALS Modal */}
            <EhealsModal
              isOpen={showEhealsModal}
              onClose={() => setShowEhealsModal(false)}
              onSave={handleSaveEheals}
              initialAnswers={professionalProfile.ehealsAnswers}
            />

            {/* Stats Section */}
            <div style={{ borderTop: '1px solid #e5e7eb', padding: '40px', backgroundColor: '#f9fafb' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#1f2937' }}>
                Estatísticas Pessoais
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>
                    {historyData?.stats?.total || 0}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                    Traduções Totais
                  </div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
                    {historyData?.stats?.approved || 0}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                    Aprovadas
                  </div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>
                    {historyData?.stats && historyData.stats.total > 0 
                      ? Math.round(((historyData.stats.approved || 0) / historyData.stats.total) * 100) 
                      : 0}%
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                    Taxa de Aprovação
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // LEADERBOARD PAGE
  // ============================================
  const LeaderboardPage = () => {
    return (
      <div className="leaderboard-content" style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'Dashboard', page: 'dashboard' },
          { label: 'Ranking' }
        ]} />

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            padding: '30px',
            color: 'white'
          }}>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '40px' }}>🏆</span>
              Ranking de Tradutores
            </h1>
            <p style={{ margin: '10px 0 0 0', opacity: 0.95, fontSize: '16px' }}>
              Conheça os melhores contribuidores da plataforma
            </p>
          </div>

          {/* Period Selector */}
          <div style={{
            padding: '20px 30px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            gap: '10px',
            backgroundColor: '#f9fafb'
          }}>
            {(['all', 'month', 'week'] as const).map(period => (
              <button
                key={period}
                onClick={() => loadLeaderboard(period)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: leaderboardPeriod === period ? '#fbbf24' : 'white',
                  color: leaderboardPeriod === period ? 'white' : '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                {period === 'all' ? '🌍 Todo Tempo' : period === 'month' ? '📅 Último Mês' : '📆 Última Semana'}
              </button>
            ))}
          </div>

          {/* Current User Card */}
          {leaderboardData?.currentUser && (
            <div style={{
              padding: '20px 30px',
              backgroundColor: '#fef3c7',
              borderBottom: '2px solid #fbbf24'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#92400e', fontSize: '16px', fontWeight: '600' }}>
                📍 Sua Posição
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr auto',
                gap: '15px',
                alignItems: 'center',
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '8px',
                border: '2px solid #fbbf24'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#fbbf24',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'white'
                }}>
                  #{leaderboardData.currentUser.rank}
                </div>

                <div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '5px' }}>
                    {leaderboardData.currentUser.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                    Nível {leaderboardData.currentUser.level} • {leaderboardData.currentUser.points} pontos
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {leaderboardData.currentUser.badges.map(badge => (
                      <span key={badge} style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        borderRadius: '4px',
                        fontWeight: '600'
                      }}>
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
                    {leaderboardData.currentUser.stats.totalTranslations} traduções
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {leaderboardData.currentUser.stats.totalValidations} validações
                  </div>
                  <div style={{
                    marginTop: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#16a34a'
                  }}>
                    {leaderboardData.currentUser.stats.approvalRate}% aprovadas
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard List */}
          <div style={{ padding: '30px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
                <p>Carregando ranking...</p>
              </div>
            ) : leaderboardData?.leaderboard && leaderboardData.leaderboard.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {leaderboardData.leaderboard.map((entry) => {
                  const isCurrentUser = entry.userId === user?.id;
                  const isMedal = entry.rank <= 3;

                  return (
                    <div
                      key={entry.userId}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '60px 1fr auto',
                        gap: '15px',
                        alignItems: 'center',
                        padding: '15px',
                        backgroundColor: isCurrentUser ? '#fef3c7' : '#f9fafb',
                        borderRadius: '8px',
                        border: `2px solid ${isCurrentUser ? '#fbbf24' : '#e5e7eb'}`,
                        transition: 'transform 0.2s',
                        cursor: 'default'
                      }}
                    >
                      {/* Rank */}
                      <div style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: isMedal 
                          ? (entry.rank === 1 ? '#fbbf24' : entry.rank === 2 ? '#cbd5e1' : '#c2410c')
                          : '#e5e7eb',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: isMedal ? '28px' : '20px',
                        fontWeight: '700',
                        color: isMedal ? 'white' : '#6b7280'
                      }}>
                        {isMedal ? (entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉') : `#${entry.rank}`}
                      </div>

                      {/* User Info */}
                      <div>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#1f2937',
                          marginBottom: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          {entry.name}
                          {isCurrentUser && <span style={{ fontSize: '14px', color: '#92400e' }}>(Você)</span>}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                          Nível {entry.level} • {entry.points} pontos • {entry.role}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {entry.badges.map(badge => (
                            <span key={badge} style={{
                              fontSize: '11px',
                              padding: '3px 8px',
                              backgroundColor: isMedal ? '#fef3c7' : '#e0e7ff',
                              color: isMedal ? '#92400e' : '#3730a3',
                              borderRadius: '4px',
                              fontWeight: '600'
                            }}>
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
                          📝 {entry.stats.totalTranslations} traduções
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
                          ✅ {entry.stats.totalValidations} validações
                        </div>
                        <div style={{
                          marginTop: '8px',
                          fontSize: '14px',
                          fontWeight: '700',
                          color: '#16a34a'
                        }}>
                          {entry.stats.approvalRate}% aprovadas
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏆</div>
                <h3>Nenhum dado disponível</h3>
                <p>Seja o primeiro a contribuir!</p>
              </div>
            )}

            {leaderboardData && (
              <div style={{
                marginTop: '30px',
                padding: '20px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                📊 Total de {leaderboardData.totalUsers} usuários registrados na plataforma
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // HISTORY PAGE
  // ============================================
  const HistoryPage = () => {
    // DESABILITADO - Carregamento automático removido para evitar loop
    // Usuário deve clicar em "Carregar Histórico"
    // useEffect(() => {
    //   loadHistory(historyFilter === 'ALL' ? undefined : historyFilter, 1);
    // }, []);

    const handleLoadHistory = () => {
      console.log('[HISTORY] Botao de carregar clicado');
      if (!historyLoadedRef.current) {
        historyLoadedRef.current = true;
      }
      loadHistory(historyFilter === 'ALL' ? undefined : historyFilter, 1);
    };

    const getStatusBadge = (status: string) => {
      const styles: Record<string, { bg: string; color: string; text: string; emoji: string }> = {
        'APPROVED': { bg: '#dcfce7', color: '#15803d', text: 'Aprovada', emoji: '✅' },
        'PENDING_REVIEW': { bg: '#fef3c7', color: '#92400e', text: 'Pendente', emoji: '⏳' },
        'REJECTED': { bg: '#fee2e2', color: '#991b1b', text: 'Rejeitada', emoji: '❌' },
        'NEEDS_REVISION': { bg: '#fef9c3', color: '#854d0e', text: 'Precisa Revisão', emoji: '🔄' }
      };
      const style = styles[status] || styles['PENDING_REVIEW'];
      return (
        <span style={{
          padding: '4px 12px',
          backgroundColor: style.bg,
          color: style.color,
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {style.emoji} {style.text}
        </span>
      );
    };

    return (
      <div className="history-content" style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            padding: '30px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '40px' }}>📚</span>
                  Meu Histórico de Traduções
                </h1>
                <p style={{ margin: '10px 0 0 0', opacity: 0.95, fontSize: '16px' }}>
                  Acompanhe todas as suas contribuições
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {!historyLoadedRef.current && (
                  <button
                    onClick={handleLoadHistory}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <span>📥</span>
                    Carregar Histórico
                  </button>
                )}
                <button
                  onClick={() => setShowExportModal(true)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'white',
                    color: '#1e40af',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  📥 Exportar Traduções
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {historyData?.stats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '15px',
              padding: '30px',
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6' }}>
                  {historyData.stats.total}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                  Total
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#16a34a' }}>
                  {historyData.stats.approved}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                  Aprovadas
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>
                  {historyData.stats.pending}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                  Pendentes
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#dc2626' }}>
                  {historyData.stats.rejected}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                  Rejeitadas
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#8b5cf6' }}>
                  {historyData.stats.needsRevision}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                  Revisão
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#16a34a' }}>
                  {historyData.stats.approvalRate}%
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                  Taxa Aprovação
                </div>
              </div>
            </div>
          )}

          {/* Tabs (Task #4) */}
          <div style={{
            padding: '0 30px',
            borderBottom: '2px solid #e5e7eb',
            display: 'flex',
            gap: '0',
            backgroundColor: 'white'
          }}>
            {([
              { key: 'ALL' as const, label: '🌐 Todas', count: historyData?.stats?.total || 0 },
              { key: 'PENDING_REVIEW' as const, label: '⏳ Pendentes', count: historyData?.stats?.pending || 0 },
              { key: 'APPROVED' as const, label: '✅ Aprovadas', count: historyData?.stats?.approved || 0 },
              { key: 'REJECTED' as const, label: '❌ Rejeitadas', count: historyData?.stats?.rejected || 0 }
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  setHistoryTab(tab.key);
                  setHistoryFilter(tab.key);
                  loadHistory(tab.key === 'ALL' ? undefined : tab.key, 1);
                }}
                style={{
                  padding: '15px 24px',
                  backgroundColor: 'transparent',
                  color: historyTab === tab.key ? '#3b82f6' : '#6b7280',
                  border: 'none',
                  borderBottom: historyTab === tab.key ? '3px solid #3b82f6' : '3px solid transparent',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  if (historyTab !== tab.key) {
                    e.currentTarget.style.color = '#3b82f6';
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                  }
                }}
                onMouseOut={(e) => {
                  if (historyTab !== tab.key) {
                    e.currentTarget.style.color = '#6b7280';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    backgroundColor: historyTab === tab.key ? '#3b82f6' : '#e5e7eb',
                    color: historyTab === tab.key ? 'white' : '#6b7280',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Old Filters - Remove or hide */}
          <div style={{ display: 'none' }}>
            {(['ALL', 'PENDING_REVIEW', 'APPROVED', 'NEEDS_REVISION', 'REJECTED'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => {
                  setHistoryFilter(filter);
                  loadHistory(filter === 'ALL' ? undefined : filter, 1);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: historyFilter === filter ? '#3b82f6' : 'white',
                  color: historyFilter === filter ? 'white' : '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                {filter === 'ALL' ? '🌐 Todas' : 
                 filter === 'PENDING_REVIEW' ? '⏳ Pendentes' :
                 filter === 'APPROVED' ? '✅ Aprovadas' :
                 filter === 'NEEDS_REVISION' ? '🔄 Revisão' : '❌ Rejeitadas'}
              </button>
            ))}
          </div>

          {/* Translations List */}
          <div style={{ padding: '30px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
                <p>Carregando histórico...</p>
              </div>
            ) : historyData?.translations && historyData.translations.length > 0 ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {historyData.translations.map((translation) => (
                    <div
                      key={translation.id}
                      style={{
                        backgroundColor: '#f9fafb',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>
                            {translation.term.hpoId} • {translation.term.category || 'Sem categoria'}
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                            EN: {translation.term.labelEn}
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#3b82f6' }}>
                            PT: {translation.labelPt}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          {getStatusBadge(translation.status)}
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {new Date(translation.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            Confiança: {translation.confidence}/5 ⭐
                          </div>
                        </div>
                      </div>

                      {translation.definitionPt && (
                        <div style={{
                          padding: '12px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: '#4b5563',
                          marginBottom: '10px'
                        }}>
                          <strong>Definição:</strong> {translation.definitionPt}
                        </div>
                      )}

                      {/* Validations */}
                      {translation.validations && translation.validations.length > 0 && (
                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e5e7eb' }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '10px' }}>
                            📝 Validações ({translation.validations.length})
                          </div>
                          {translation.validations.map((validation) => (
                            <div
                              key={validation.id}
                              style={{
                                backgroundColor: 'white',
                                padding: '12px',
                                borderRadius: '6px',
                                marginBottom: '8px',
                                fontSize: '13px'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span style={{ fontWeight: '600', color: '#1f2937' }}>
                                  {validation.validator.name}
                                </span>
                                <span style={{ color: '#6b7280' }}>
                                  {new Date(validation.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <div style={{ marginBottom: '5px' }}>
                                {getStatusBadge(validation.decision)}
                                <span style={{ marginLeft: '10px', color: '#6b7280' }}>
                                  Nota: {validation.rating}/5 ⭐
                                </span>
                              </div>
                              {validation.comments && (
                                <div style={{ color: '#4b5563', fontStyle: 'italic' }}>
                                  "{validation.comments}"
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {historyData.pagination && historyData.pagination.totalPages > 1 && (
                  <div style={{
                    marginTop: '30px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <button
                      onClick={() => loadHistory(historyFilter === 'ALL' ? undefined : historyFilter, historyPage - 1)}
                      disabled={historyPage === 1}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: historyPage === 1 ? '#e5e7eb' : '#3b82f6',
                        color: historyPage === 1 ? '#9ca3af' : 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: historyPage === 1 ? 'not-allowed' : 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      ← Anterior
                    </button>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>
                      Página {historyPage} de {historyData.pagination.totalPages}
                    </span>
                    <button
                      onClick={() => loadHistory(historyFilter === 'ALL' ? undefined : historyFilter, historyPage + 1)}
                      disabled={historyPage === historyData.pagination.totalPages}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: historyPage === historyData.pagination.totalPages ? '#e5e7eb' : '#3b82f6',
                        color: historyPage === historyData.pagination.totalPages ? '#9ca3af' : 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: historyPage === historyData.pagination.totalPages ? 'not-allowed' : 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Próxima →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
                <h3>Nenhuma tradução encontrada</h3>
                <p>Comece a traduzir termos para ver seu histórico aqui!</p>
                <button
                  onClick={() => setCurrentPage('translate')}
                  style={{
                    marginTop: '20px',
                    padding: '12px 24px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Começar a Traduzir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // GAMIFICATION PAGE (Sistema de Pontuação) - Task #4
  // ============================================
  const GamificationPage = () => {
    interface PointRule {
      action: string;
      points: number;
      icon: string;
      description: string;
      frequency?: string;
    }

    const pointRules: PointRule[] = [
      {
        action: 'Traduzir Termo',
        points: 10,
        icon: '📝',
        description: 'Submeter uma nova tradução para review',
        frequency: 'Por tradução'
      },
      {
        action: 'Tradução Aprovada',
        points: 25,
        icon: '✅',
        description: 'Sua tradução foi aprovada por revisores',
        frequency: 'Por aprovação'
      },
      {
        action: 'Revisar Tradução',
        points: 15,
        icon: '🔍',
        description: 'Revisar e votar em traduções pendentes (REVIEWER+)',
        frequency: 'Por revisão'
      },
      {
        action: 'Tradução de Alta Qualidade',
        points: 50,
        icon: '⭐',
        description: 'Tradução aprovada com nota média ≥ 4.5',
        frequency: 'Bônus'
      },
      {
        action: 'Preencher Perfil Completo',
        points: 100,
        icon: '📋',
        description: 'Completar 100% do perfil (dados pessoais + profissionais + eHEALS)',
        frequency: 'Uma vez'
      },
      {
        action: 'Conectar ORCID',
        points: 50,
        icon: '🔗',
        description: 'Vincular conta ORCID para autenticidade científica',
        frequency: 'Uma vez'
      },
      {
        action: 'Login Diário',
        points: 5,
        icon: '📅',
        description: 'Fazer login consecutivo por dia',
        frequency: 'Diário'
      },
      {
        action: 'Streak 7 dias',
        points: 50,
        icon: '🔥',
        description: 'Contribuir por 7 dias consecutivos',
        frequency: 'Bônus'
      },
      {
        action: 'Streak 30 dias',
        points: 200,
        icon: '🏆',
        description: 'Contribuir por 30 dias consecutivos',
        frequency: 'Bônus'
      },
      {
        action: 'Convidar Amigo',
        points: 75,
        icon: '💌',
        description: 'Amigo aceita convite e faz primeira contribuição',
        frequency: 'Por convite aceito'
      },
      {
        action: 'Comentar Tradução',
        points: 5,
        icon: '💬',
        description: 'Adicionar comentário construtivo em tradução',
        frequency: 'Por comentário'
      },
      {
        action: 'Top 10 no Ranking Mensal',
        points: 300,
        icon: '🥇',
        description: 'Ficar entre os 10 melhores do mês',
        frequency: 'Mensal'
      }
    ];

    const levels = [
      { level: 1, minPoints: 0, maxPoints: 99, title: 'Iniciante', icon: '🌱', color: '#94a3b8' },
      { level: 2, minPoints: 100, maxPoints: 249, title: 'Aprendiz', icon: '📚', color: '#60a5fa' },
      { level: 3, minPoints: 250, maxPoints: 499, title: 'Colaborador', icon: '🤝', color: '#34d399' },
      { level: 4, minPoints: 500, maxPoints: 999, title: 'Especialista', icon: '⭐', color: '#fbbf24' },
      { level: 5, minPoints: 1000, maxPoints: 2499, title: 'Mestre', icon: '🎓', color: '#f59e0b' },
      { level: 6, minPoints: 2500, maxPoints: 4999, title: 'Veterano', icon: '🏅', color: '#8b5cf6' },
      { level: 7, minPoints: 5000, maxPoints: 9999, title: 'Lenda', icon: '👑', color: '#ec4899' },
      { level: 8, minPoints: 10000, maxPoints: Infinity, title: 'Mestre HPO', icon: '🔮', color: '#dc2626' }
    ];

    const getCurrentLevel = (points: number) => {
      return levels.find(l => points >= l.minPoints && points <= l.maxPoints) || levels[0];
    };

    const getNextLevel = (points: number) => {
      const currentLevel = getCurrentLevel(points);
      const currentIndex = levels.findIndex(l => l.level === currentLevel.level);
      return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
    };

    const currentLevel = getCurrentLevel(user?.points || 0);
    const nextLevel = getNextLevel(user?.points || 0);
    const progressToNext = nextLevel 
      ? ((user?.points || 0) - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints) * 100
      : 100;

    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 80px)', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Breadcrumbs items={[
            { label: 'Dashboard', page: 'dashboard' },
            { label: 'Sistema de Pontuação' }
          ]} />

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            borderRadius: '16px',
            padding: '40px',
            color: 'white',
            marginTop: '20px',
            boxShadow: '0 10px 25px rgba(251, 191, 36, 0.3)'
          }}>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '15px' }}>
              🏆 Sistema de Pontuação
            </h1>
            <p style={{ margin: '10px 0 0 0', fontSize: '18px', opacity: 0.95 }}>
              Ganhe pontos, suba de nível e contribua para a ciência em português!
            </p>
          </div>

          {/* Current Status Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '30px',
            marginTop: '30px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
              📊 Seu Progresso Atual
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ 
                padding: '20px', 
                backgroundColor: currentLevel.color + '15', 
                borderRadius: '12px',
                border: `2px solid ${currentLevel.color}`
              }}>
                <div style={{ fontSize: '48px', textAlign: 'center' }}>{currentLevel.icon}</div>
                <div style={{ fontSize: '24px', fontWeight: '700', textAlign: 'center', color: currentLevel.color, marginTop: '10px' }}>
                  Nível {currentLevel.level}
                </div>
                <div style={{ fontSize: '16px', textAlign: 'center', color: '#6b7280', marginTop: '5px' }}>
                  {currentLevel.title}
                </div>
              </div>

              <div style={{ padding: '20px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Total de Pontos</div>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#1e40af' }}>
                  {user?.points || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                  pontos acumulados
                </div>
              </div>

              {nextLevel && (
                <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '12px', border: '2px solid #f59e0b' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Próximo Nível</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#92400e', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {nextLevel.icon} {nextLevel.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                    Faltam {nextLevel.minPoints - (user?.points || 0)} pontos
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {nextLevel && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    Progresso para {nextLevel.title}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: currentLevel.color }}>
                    {Math.round(progressToNext)}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '20px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progressToNext}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${currentLevel.color}, ${nextLevel.color})`,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* Point Rules Table */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '30px',
            marginTop: '30px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
              💰 Como Ganhar Pontos
            </h2>
            <p style={{ margin: '0 0 30px 0', color: '#6b7280' }}>
              Todas as ações que geram pontos na plataforma
            </p>

            <div style={{ display: 'grid', gap: '15px' }}>
              {pointRules.map((rule, index) => (
                <div
                  key={index}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 100px 150px',
                    alignItems: 'center',
                    padding: '20px',
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
                    borderRadius: '12px',
                    border: `2px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                    gap: '15px'
                  }}
                >
                  <div style={{ fontSize: '36px', textAlign: 'center' }}>{rule.icon}</div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: theme === 'dark' ? '#f9fafb' : '#1f2937' }}>
                      {rule.action}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                      {rule.description}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#10b981',
                    textAlign: 'center'
                  }}>
                    +{rule.points}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'white',
                    backgroundColor: '#6b7280',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    textAlign: 'center'
                  }}>
                    {rule.frequency}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Levels Table */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '30px',
            marginTop: '30px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
              🎖️ Níveis e Conquistas
            </h2>
            <p style={{ margin: '0 0 30px 0', color: '#6b7280' }}>
              Suba de nível conforme acumula pontos
            </p>

            <div style={{ display: 'grid', gap: '15px' }}>
              {levels.map((level) => {
                const isCurrentLevel = user?.level === level.level;
                const isUnlocked = (user?.points || 0) >= level.minPoints;
                
                return (
                  <div
                    key={level.level}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr 200px',
                      alignItems: 'center',
                      padding: '20px',
                      backgroundColor: isCurrentLevel 
                        ? level.color + '15' 
                        : theme === 'dark' ? '#1f2937' : '#f9fafb',
                      borderRadius: '12px',
                      border: `2px solid ${isCurrentLevel ? level.color : (theme === 'dark' ? '#374151' : '#e5e7eb')}`,
                      gap: '20px',
                      opacity: isUnlocked ? 1 : 0.5
                    }}
                  >
                    <div style={{ fontSize: '48px', textAlign: 'center' }}>
                      {isUnlocked ? level.icon : '🔒'}
                    </div>
                    <div>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: '700', 
                        color: isCurrentLevel ? level.color : (theme === 'dark' ? '#f9fafb' : '#1f2937'),
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        Nível {level.level}: {level.title}
                        {isCurrentLevel && (
                          <span style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: level.color,
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px'
                          }}>
                            SEU NÍVEL
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                        {level.maxPoints === Infinity 
                          ? `${level.minPoints}+ pontos`
                          : `${level.minPoints} - ${level.maxPoints} pontos`
                        }
                      </div>
                    </div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: isUnlocked ? '#10b981' : '#6b7280',
                      textAlign: 'right'
                    }}>
                      {isUnlocked ? '✅ Desbloqueado' : '🔒 Bloqueado'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAQ Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '30px',
            marginTop: '30px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
              ❓ Perguntas Frequentes
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: theme === 'dark' ? '#f9fafb' : '#1f2937', marginBottom: '8px' }}>
                  📌 Os pontos expiram?
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Não! Seus pontos são permanentes e acumulam indefinidamente.
                </div>
              </div>

              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: theme === 'dark' ? '#f9fafb' : '#1f2937', marginBottom: '8px' }}>
                  📌 Posso perder pontos?
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Sim, se uma tradução sua for rejeitada após revisão, você pode perder os pontos ganhos inicialmente. Foque em qualidade!
                </div>
              </div>

              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: theme === 'dark' ? '#f9fafb' : '#1f2937', marginBottom: '8px' }}>
                  📌 Como funciona o sistema de convites?
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Convide amigos por email. Você ganha {pointRules.find(r => r.action === 'Convidar Amigo')?.points} pontos quando eles se registram E fazem a primeira contribuição.
                </div>
              </div>

              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: theme === 'dark' ? '#f9fafb' : '#1f2937', marginBottom: '8px' }}>
                  📌 O que acontece quando alcanço o nível máximo?
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Você se torna um Mestre HPO! Continue contribuindo - seus pontos e reconhecimento permanecem no ranking.
                </div>
              </div>

              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: theme === 'dark' ? '#f9fafb' : '#1f2937', marginBottom: '8px' }}>
                  📌 Há recompensas além de pontos?
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Sim! Contribuidores de destaque podem receber badges especiais, menções em publicações científicas, e certificados de contribuição.
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '40px',
            marginTop: '30px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
              Pronto para ganhar pontos?
            </h3>
            <p style={{ margin: '0 0 25px 0', color: '#6b7280', fontSize: '16px' }}>
              Comece agora a traduzir termos e suba no ranking!
            </p>
            <button
              onClick={() => setCurrentPage('translate')}
              style={{
                padding: '16px 40px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              🚀 Começar a Traduzir
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // REFERRAL PAGE (Sistema de Convites) - Task #6
  // ============================================
  const ReferralPage = () => {
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [invites, setInvites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const REFERRAL_POINTS = 75; // Points per successful referral

    useEffect(() => {
      loadInvites();
    }, []);

    const loadInvites = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/referrals/my-invites`, {
          headers: TokenStorage.getAuthHeader()
        });
        
        if (response.ok) {
          const data = await response.json();
          setInvites(data.invites || []);
        }
      } catch (error) {
        console.error('Error loading invites:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleSendInvite = async () => {
      if (!email || !email.includes('@')) {
        ToastService.warning('Por favor, insira um email válido');
        return;
      }

      setSending(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/referrals/invite`, {
          method: 'POST',
          headers: {
            ...TokenStorage.getAuthHeader(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });

        if (response.ok) {
          ToastService.success(`✉️ Convite enviado para ${email}!`);
          setEmail('');
          loadInvites(); // Reload list
        } else {
          const error = await response.json();
          throw new Error(error.message || 'Erro ao enviar convite');
        }
      } catch (error: any) {
        ToastService.error(ErrorTranslator.translate(error));
      } finally {
        setSending(false);
      }
    };

    const stats = {
      total: invites.length,
      pending: invites.filter(i => i.status === 'PENDING').length,
      accepted: invites.filter(i => i.status === 'ACCEPTED').length,
      registered: invites.filter(i => i.status === 'REGISTERED').length,
      pointsEarned: invites.filter(i => i.status === 'ACCEPTED').length * REFERRAL_POINTS
    };

    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 80px)', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Breadcrumbs items={[
            { label: 'Dashboard', page: 'dashboard' },
            { label: 'Convidar Amigos' }
          ]} />

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            borderRadius: '16px',
            padding: '40px',
            color: 'white',
            marginTop: '20px',
            boxShadow: '0 10px 25px rgba(236, 72, 153, 0.3)'
          }}>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '15px' }}>
              💌 Convide Amigos
            </h1>
            <p style={{ margin: '10px 0 0 0', fontSize: '18px', opacity: 0.95 }}>
              Ganhe <strong>+{REFERRAL_POINTS} pontos</strong> por cada amigo que se registrar e fazer sua primeira contribuição!
            </p>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px',
            marginTop: '30px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>📧</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#6366f1' }}>{stats.total}</div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>Convites Enviados</div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>⏳</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#fbbf24' }}>{stats.pending}</div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>Pendentes</div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>✅</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>{stats.accepted}</div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>Aceitos</div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              textAlign: 'center',
              border: '2px solid #10b981'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🏆</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>{stats.pointsEarned}</div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>Pontos Ganhos</div>
            </div>
          </div>

          {/* Invite Form */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '30px',
            marginTop: '30px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
              ✉️ Enviar Convite
            </h2>
            <p style={{ margin: '0 0 25px 0', color: '#6b7280', fontSize: '14px' }}>
              Digite o email de um amigo que você gostaria de convidar para a plataforma
            </p>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'end', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Email do Amigo
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendInvite()}
                  placeholder="exemplo@email.com"
                  disabled={sending}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <button
                onClick={handleSendInvite}
                disabled={sending || !email}
                style={{
                  padding: '12px 32px',
                  backgroundColor: sending || !email ? '#9ca3af' : '#ec4899',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: sending || !email ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!sending && email) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.backgroundColor = '#db2777';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  if (!sending && email) e.currentTarget.style.backgroundColor = '#ec4899';
                }}
              >
                {sending ? '📤 Enviando...' : '📧 Enviar Convite'}
              </button>
            </div>

            {/* Info Box */}
            <div style={{
              marginTop: '25px',
              padding: '20px',
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #bfdbfe'
            }}>
              <div style={{ fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                <strong>💡 Como funciona:</strong>
                <ul style={{ margin: '10px 0 0 20px', paddingLeft: '0' }}>
                  <li>Seu amigo receberá um email com link de convite único</li>
                  <li>Ao se registrar usando seu link, ele ganha um bônus inicial</li>
                  <li>Quando ele fizer sua primeira contribuição (tradução ou revisão), você ganha <strong>+{REFERRAL_POINTS} pontos</strong></li>
                  <li>Não há limite de convites! Convide quantos amigos quiser 🎉</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Invites History */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '30px',
            marginTop: '30px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
              📋 Histórico de Convites
            </h2>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>⏳</div>
                <p>Carregando convites...</p>
              </div>
            ) : invites.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                <div style={{ fontSize: '64px', marginBottom: '15px' }}>📭</div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#1f2937' }}>
                  Nenhum convite enviado ainda
                </h3>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Comece convidando seus amigos para ganhar pontos!
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: theme === 'dark' ? '#f9fafb' : '#374151' }}>
                        Email
                      </th>
                      <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: theme === 'dark' ? '#f9fafb' : '#374151' }}>
                        Status
                      </th>
                      <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: theme === 'dark' ? '#f9fafb' : '#374151' }}>
                        Data Envio
                      </th>
                      <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: theme === 'dark' ? '#f9fafb' : '#374151' }}>
                        Pontos
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((invite, index) => {
                      const statusConfig: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
                        PENDING: { label: 'Pendente', color: '#92400e', bg: '#fef3c7', emoji: '⏳' },
                        REGISTERED: { label: 'Registrado', color: '#1e40af', bg: '#dbeafe', emoji: '📝' },
                        ACCEPTED: { label: 'Aceito', color: '#15803d', bg: '#dcfce7', emoji: '✅' }
                      };
                      const status = statusConfig[invite.status] || statusConfig['PENDING'];

                      return (
                        <tr key={invite.id || index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '15px', color: theme === 'dark' ? '#f9fafb' : '#1f2937' }}>
                            {invite.email}
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            <span style={{
                              padding: '6px 12px',
                              backgroundColor: status.bg,
                              color: status.color,
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'inline-block'
                            }}>
                              {status.emoji} {status.label}
                            </span>
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center', color: '#6b7280' }}>
                            {new Date(invite.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>
                            {invite.status === 'ACCEPTED' ? (
                              <span style={{ color: '#10b981' }}>+{REFERRAL_POINTS}</span>
                            ) : (
                              <span style={{ color: '#9ca3af' }}>-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Share Options (Future) */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '30px',
            marginTop: '30px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
              Compartilhe nas Redes Sociais 🌐
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#6b7280', fontSize: '14px' }}>
              Em breve: compartilhe diretamente no Twitter, LinkedIn e WhatsApp!
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', opacity: 0.5 }}>
              <button disabled style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'not-allowed' }}>
                🐦 Twitter
              </button>
              <button disabled style={{ padding: '12px 24px', backgroundColor: '#0a66c2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'not-allowed' }}>
                💼 LinkedIn
              </button>
              <button disabled style={{ padding: '12px 24px', backgroundColor: '#25d366', color: 'white', border: 'none', borderRadius: '8px', cursor: 'not-allowed' }}>
                💬 WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // ADMIN USER MANAGEMENT PAGE
  // ============================================
  const AdminUserManagementPage = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [newStatus, setNewStatus] = useState(true);
    const [statusReason, setStatusReason] = useState('');
    const [userStats, setUserStats] = useState<any>(null);
    const [userHistory, setUserHistory] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkAction, setBulkAction] = useState('');

    const USERS_PER_PAGE = 50;

    useEffect(() => {
      loadUsers();
    }, [searchTerm, filterRole, filterStatus, currentPage]);

    const loadUsers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: USERS_PER_PAGE.toString()
        });

        if (searchTerm) params.append('search', searchTerm);
        if (filterRole !== 'all') params.append('role', filterRole);
        if (filterStatus !== 'all') params.append('status', filterStatus);

        const response = await fetch(`${API_BASE_URL}/api/admin/users?${params.toString()}`, {
          headers: TokenStorage.getAuthHeader()
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
          setTotalPages(data.pages || 1);
          setTotalUsers(data.total || 0);
        } else {
          throw new Error('Erro ao carregar usuários');
        }
      } catch (error: any) {
        console.error('Erro ao carregar usuários:', error);
        ToastService.error('Erro ao carregar usuários');
      } finally {
        setLoading(false);
      }
    };

    const loadUserStats = async (userId: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/stats`, {
          headers: TokenStorage.getAuthHeader()
        });

        if (response.ok) {
          const data = await response.json();
          setUserStats(data);
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    };

    const loadUserHistory = async (userId: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/history`, {
          headers: TokenStorage.getAuthHeader()
        });

        if (response.ok) {
          const data = await response.json();
          setUserHistory(data.activities || []);
        }
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      }
    };

    const handleViewUser = async (user: any) => {
      setSelectedUser(user);
      setShowUserModal(true);
      await loadUserStats(user.id);
      await loadUserHistory(user.id);
    };

    const handleChangeRole = async () => {
      if (!selectedUser || !newRole) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${selectedUser.id}/role`, {
          method: 'PUT',
          headers: {
            ...TokenStorage.getAuthHeader(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role: newRole })
        });

        if (response.ok) {
          ToastService.success(`Cargo alterado para ${newRole}`);
          setShowRoleModal(false);
          loadUsers();
          if (showUserModal) {
            const updatedUser = { ...selectedUser, role: newRole };
            setSelectedUser(updatedUser);
          }
        } else {
          const error = await response.json();
          throw new Error(error.message || 'Erro ao alterar cargo');
        }
      } catch (error: any) {
        ToastService.error(ErrorTranslator.translate(error));
      }
    };

    const handleChangeStatus = async () => {
      if (!selectedUser) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${selectedUser.id}/status`, {
          method: 'PUT',
          headers: {
            ...TokenStorage.getAuthHeader(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            isActive: newStatus,
            reason: statusReason || undefined
          })
        });

        if (response.ok) {
          ToastService.success(`Usuário ${newStatus ? 'ativado' : 'desativado'}`);
          setShowStatusModal(false);
          setStatusReason('');
          loadUsers();
          if (showUserModal) {
            const updatedUser = { ...selectedUser, isActive: newStatus };
            setSelectedUser(updatedUser);
          }
        } else {
          const error = await response.json();
          throw new Error(error.message || 'Erro ao alterar status');
        }
      } catch (error: any) {
        ToastService.error(ErrorTranslator.translate(error));
      }
    };

    const handleBulkAction = async () => {
      if (selectedUsers.size === 0 || !bulkAction) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/bulk-action`, {
          method: 'POST',
          headers: {
            ...TokenStorage.getAuthHeader(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userIds: Array.from(selectedUsers),
            action: bulkAction
          })
        });

        if (response.ok) {
          const data = await response.json();
          ToastService.success(`${data.affected} usuários atualizados`);
          setShowBulkModal(false);
          setSelectedUsers(new Set());
          loadUsers();
        } else {
          const error = await response.json();
          throw new Error(error.message || 'Erro na ação em massa');
        }
      } catch (error: any) {
        ToastService.error(ErrorTranslator.translate(error));
      }
    };

    const handleExportUsers = async () => {
      try {
        const params = new URLSearchParams({
          format: 'csv',
          role: filterRole,
          status: filterStatus
        });

        const response = await fetch(`${API_BASE_URL}/api/admin/users/export?${params.toString()}`, {
          headers: TokenStorage.getAuthHeader()
        });

        if (!response.ok) {
          throw new Error('Erro ao exportar usuários');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `usuarios-hpo-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        ToastService.success('Usuários exportados com sucesso');
      } catch (error: any) {
        ToastService.error('Erro ao exportar usuários');
      }
    };

    const toggleUserSelection = (userId: string) => {
      const newSelection = new Set(selectedUsers);
      if (newSelection.has(userId)) {
        newSelection.delete(userId);
      } else {
        newSelection.add(userId);
      }
      setSelectedUsers(newSelection);
    };

    const toggleSelectAll = () => {
      if (selectedUsers.size === users.length) {
        setSelectedUsers(new Set());
      } else {
        setSelectedUsers(new Set(users.map(u => u.id)));
      }
    };

    const getRoleBadge = (role: string) => {
      const styles: Record<string, any> = {
        ADMIN: { bg: '#dc2626', icon: '👑' },
        MODERATOR: { bg: '#ea580c', icon: '🛡️' },
        REVIEWER: { bg: '#0891b2', icon: '✅' },
        TRANSLATOR: { bg: '#16a34a', icon: '📝' }
      };
      const style = styles[role] || { bg: '#6b7280', icon: '👤' };
      return (
        <span style={{
          backgroundColor: style.bg,
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {style.icon} {role}
        </span>
      );
    };

    const getStatusBadge = (isActive: boolean) => {
      return (
        <span style={{
          backgroundColor: isActive ? '#16a34a' : '#dc2626',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {isActive ? '✅ Ativo' : '🚫 Inativo'}
        </span>
      );
    };

    return (
      <div style={{ padding: '30px', maxWidth: '1800px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '15px' }}>
                👥 Gestão de Usuários
              </h1>
              <p style={{ margin: '10px 0 0 0', color: '#64748b' }}>
                {totalUsers} usuários cadastrados na plataforma
              </p>
            </div>
            <button
              onClick={handleExportUsers}
              style={{
                padding: '12px 24px',
                backgroundColor: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📥 Exportar CSV
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Nome, email..."
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Cargo
              </label>
              <select
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="all">Todos os cargos</option>
                <option value="TRANSLATOR">Tradutor</option>
                <option value="REVIEWER">Revisor</option>
                <option value="MODERATOR">Moderador</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="all">Todos os status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>

            {selectedUsers.size > 0 && (
              <button
                onClick={() => setShowBulkModal(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}
              >
                ⚡ Ação em Massa ({selectedUsers.size})
              </button>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
              <p style={{ color: '#64748b' }}>Carregando usuários...</p>
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
              <p style={{ color: '#64748b' }}>Nenhum usuário encontrado</p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '15px', textAlign: 'left', width: '50px' }}>
                        <input
                          type="checkbox"
                          checked={selectedUsers.size === users.length && users.length > 0}
                          onChange={toggleSelectAll}
                          style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                        />
                      </th>
                      <th style={{ padding: '15px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Nome</th>
                      <th style={{ padding: '15px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Email</th>
                      <th style={{ padding: '15px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Cargo</th>
                      <th style={{ padding: '15px', textAlign: 'center', fontWeight: '700', color: '#374151' }}>Pontos</th>
                      <th style={{ padding: '15px', textAlign: 'center', fontWeight: '700', color: '#374151' }}>Nível</th>
                      <th style={{ padding: '15px', textAlign: 'center', fontWeight: '700', color: '#374151' }}>Status</th>
                      <th style={{ padding: '15px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Cadastro</th>
                      <th style={{ padding: '15px', textAlign: 'center', fontWeight: '700', color: '#374151' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '15px' }}>
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                          />
                        </td>
                        <td style={{ padding: '15px', fontWeight: '600', color: '#1f2937' }}>
                          {user.name}
                          {user.orcidId && <span style={{ marginLeft: '8px', fontSize: '12px', color: '#16a34a' }}>🔗 ORCID</span>}
                        </td>
                        <td style={{ padding: '15px', color: '#64748b', fontSize: '14px' }}>{user.email}</td>
                        <td style={{ padding: '15px' }}>{getRoleBadge(user.role)}</td>
                        <td style={{ padding: '15px', textAlign: 'center', fontWeight: '700', color: '#f59e0b' }}>
                          {user.points || 0}
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center', fontWeight: '700', color: '#8b5cf6' }}>
                          {user.level || 1}
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                          {getStatusBadge(user.isActive !== false)}
                        </td>
                        <td style={{ padding: '15px', color: '#64748b', fontSize: '14px' }}>
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleViewUser(user)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '600'
                            }}
                          >
                            👁️ Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '30px',
                paddingTop: '20px',
                borderTop: '2px solid #e5e7eb'
              }}>
                <div style={{ color: '#64748b', fontSize: '14px' }}>
                  Mostrando {(currentPage - 1) * USERS_PER_PAGE + 1} a {Math.min(currentPage * USERS_PER_PAGE, totalUsers)} de {totalUsers} usuários
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: currentPage === 1 ? '#e5e7eb' : '#3b82f6',
                      color: currentPage === 1 ? '#9ca3af' : 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    ← Anterior
                  </button>
                  <span style={{ padding: '8px 16px', color: '#374151', fontWeight: '600' }}>
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: currentPage === totalPages ? '#e5e7eb' : '#3b82f6',
                      color: currentPage === totalPages ? '#9ca3af' : 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    Próxima →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
            onClick={() => setShowUserModal(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '30px',
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '25px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
                    {selectedUser.name}
                  </h2>
                  <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => setShowUserModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#9ca3af'
                  }}
                >
                  ✖️
                </button>
              </div>

              {/* User Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Cargo</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {getRoleBadge(selectedUser.role)}
                    <button
                      onClick={() => {
                        setNewRole(selectedUser.role);
                        setShowRoleModal(true);
                      }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✏️ Alterar
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Status</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {getStatusBadge(selectedUser.isActive !== false)}
                    <button
                      onClick={() => {
                        setNewStatus(!(selectedUser.isActive !== false));
                        setShowStatusModal(true);
                      }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✏️ Alterar
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Pontos</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                    {selectedUser.points || 0}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Nível</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>
                    {selectedUser.level || 1}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>ORCID</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: selectedUser.orcidId ? '#16a34a' : '#9ca3af' }}>
                    {selectedUser.orcidId ? `🔗 ${selectedUser.orcidId}` : 'Não conectado'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Cadastro</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    {new Date(selectedUser.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* Stats */}
              {userStats && (
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '15px' }}>
                    📊 Estatísticas
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Traduções</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                        {userStats.stats?.contributions?.translations || 0}
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Aprovadas</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>
                        {userStats.stats?.contributions?.approved || 0}
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Revisões</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#0891b2' }}>
                        {userStats.stats?.contributions?.reviews || 0}
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Taxa Aprovação</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>
                        {userStats.stats?.contributions?.approvalRate || 0}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              {userHistory.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '15px' }}>
                    📅 Atividade Recente
                  </h3>
                  <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                    {userHistory.slice(0, 10).map((activity: any) => (
                      <div
                        key={activity.id}
                        style={{
                          padding: '15px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          marginBottom: '10px',
                          borderLeft: '4px solid #3b82f6'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div>
                            <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '5px' }}>
                              {activity.type === 'TRANSLATION_SUBMITTED' && '📝 Nova tradução'}
                              {activity.type === 'TRANSLATION_APPROVED' && '✅ Tradução aprovada'}
                              {activity.type === 'REVIEW_SUBMITTED' && '🔍 Nova revisão'}
                              {activity.type === 'LEVEL_UP' && '⬆️ Subiu de nível'}
                              {activity.type === 'BADGE_EARNED' && '🏆 Conquista desbloqueada'}
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                              {activity.metadata?.termName && `Termo: ${activity.metadata.termName}`}
                              {activity.metadata?.level && `Nível ${activity.metadata.level}`}
                            </div>
                          </div>
                          <div style={{ fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                            {new Date(activity.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Role Change Modal */}
        {showRoleModal && selectedUser && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1001
            }}
            onClick={() => setShowRoleModal(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '30px',
                maxWidth: '500px',
                width: '100%'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                Alterar Cargo
              </h3>
              <p style={{ marginBottom: '20px', color: '#64748b' }}>
                Alterando cargo de <strong>{selectedUser.name}</strong>
              </p>

              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Novo Cargo
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '20px'
                }}
              >
                <option value="TRANSLATOR">Tradutor</option>
                <option value="REVIEWER">Revisor</option>
                <option value="MODERATOR">Moderador</option>
                <option value="ADMIN">Admin</option>
              </select>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowRoleModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChangeRole}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Change Modal */}
        {showStatusModal && selectedUser && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1001
            }}
            onClick={() => setShowStatusModal(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '30px',
                maxWidth: '500px',
                width: '100%'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                {newStatus ? 'Ativar' : 'Desativar'} Usuário
              </h3>
              <p style={{ marginBottom: '20px', color: '#64748b' }}>
                {newStatus ? 'Ativar' : 'Desativar'} conta de <strong>{selectedUser.name}</strong>
              </p>

              {!newStatus && (
                <>
                  <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Motivo (opcional)
                  </label>
                  <textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder="Ex: Inatividade, solicitação do usuário..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      marginBottom: '20px',
                      resize: 'vertical',
                      minHeight: '80px'
                    }}
                  />
                </>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setStatusReason('');
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChangeStatus}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: newStatus ? '#16a34a' : '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Action Modal */}
        {showBulkModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1001
            }}
            onClick={() => setShowBulkModal(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '30px',
                maxWidth: '500px',
                width: '100%'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                Ação em Massa
              </h3>
              <p style={{ marginBottom: '20px', color: '#64748b' }}>
                Aplicar ação a {selectedUsers.size} usuário(s) selecionado(s)
              </p>

              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Ação
              </label>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '20px'
                }}
              >
                <option value="">Selecione uma ação</option>
                <option value="activate">✅ Ativar contas</option>
                <option value="deactivate">🚫 Desativar contas</option>
              </select>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkAction('');
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: bulkAction ? '#8b5cf6' : '#e5e7eb',
                    color: bulkAction ? 'white' : '#9ca3af',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: bulkAction ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // HEADER (REORGANIZADO - Dropdown "Mais")
  // ============================================
  const Header = () => {
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    
    return (
      <header 
        role="banner"
        style={{
          backgroundColor: '#1e40af',
          color: 'white',
          padding: '15px 20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          position: 'relative'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ fontSize: '1.5rem' }} role="img" aria-label="Ícone Rede">🔗</div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '18px' }}>
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                  PORTI-HPO <span role="img" aria-label={apiConnected ? 'Conectado' : 'Desconectado'}>{apiConnected ? '🟢' : '🔴'}</span>
                </h1>
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                Por ti, pela ciência, em português
              </div>
            </div>
          </div>

          <nav role="navigation" aria-label="Menu principal" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Main Navigation - Core Actions */}
            <button
              data-page="dashboard"
              onClick={() => setCurrentPage('dashboard')}
              aria-label="Ir para Dashboard"
              aria-current={currentPage === 'dashboard' ? 'page' : undefined}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === 'dashboard' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
            >
              <span role="img" aria-hidden="true">🏠</span> Dashboard
            </button>
            
            <button
              data-page="translate"
              onClick={() => setCurrentPage('translate')}
              aria-label="Ir para página de Traduzir termos"
              aria-current={currentPage === 'translate' ? 'page' : undefined}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === 'translate' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
            >
              <span role="img" aria-hidden="true">📝</span> Traduzir
            </button>

            <button
              data-page="review"
              onClick={() => setCurrentPage('review')}
              aria-label="Ir para página de Revisar traduções"
              aria-current={currentPage === 'review' ? 'page' : undefined}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === 'review' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
            >
              <span role="img" aria-hidden="true">✅</span> Revisar
            </button>

            <button
              data-page="leaderboard"
              onClick={() => {
                loadLeaderboard('all');
                setCurrentPage('leaderboard');
              }}
              aria-label="Ir para Ranking de colaboradores"
              aria-current={currentPage === 'leaderboard' ? 'page' : undefined}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === 'leaderboard' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
            >
              <span role="img" aria-hidden="true">🏆</span> Ranking
            </button>

            {/* Dropdown "Mais" - Secondary Navigation */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                aria-label="Menu adicional"
                aria-expanded={showMoreMenu}
                style={{
                  padding: '8px 16px',
                  backgroundColor: showMoreMenu ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background-color 0.2s'
                }}
              >
                <span role="img" aria-hidden="true">⋯</span> Mais
              </button>

              {/* Dropdown Menu */}
              {showMoreMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    marginTop: '8px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    minWidth: '200px',
                    overflow: 'hidden',
                    zIndex: 1000,
                    border: '1px solid #e5e7eb'
                  }}
                  onMouseLeave={() => setShowMoreMenu(false)}
                >
                  <button
                    onClick={() => {
                      loadHistory(undefined, 1);
                      setCurrentPage('history');
                      setShowMoreMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: currentPage === 'history' ? '#eff6ff' : 'white',
                      color: currentPage === 'history' ? '#1e40af' : '#1f2937',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 'history') {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 'history') {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <span role="img" aria-hidden="true">📚</span> Histórico
                  </button>

                  <button
                    onClick={() => {
                      setCurrentPage('guidelines');
                      setShowMoreMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: currentPage === 'guidelines' ? '#eff6ff' : 'white',
                      color: currentPage === 'guidelines' ? '#1e40af' : '#1f2937',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 'guidelines') {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 'guidelines') {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <span role="img" aria-hidden="true">📖</span> Diretrizes
                  </button>

                  <button
                    onClick={() => {
                      setCurrentPage('points');
                      setShowMoreMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: currentPage === 'points' ? '#eff6ff' : 'white',
                      color: currentPage === 'points' ? '#1e40af' : '#1f2937',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 'points') {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 'points') {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <span role="img" aria-hidden="true">🎯</span> Pontos
                  </button>

                  <button
                    onClick={() => {
                      setCurrentPage('referral');
                      setShowMoreMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: currentPage === 'referral' ? '#eff6ff' : 'white',
                      color: currentPage === 'referral' ? '#1e40af' : '#1f2937',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 'referral') {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 'referral') {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <span role="img" aria-hidden="true">💌</span> Convidar Amigos
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '30px', backgroundColor: 'rgba(255,255,255,0.3)', margin: '0 4px' }} />

            {/* Profile & Admin */}
            <button
              onClick={() => setCurrentPage('profile')}
              aria-label="Ir para Perfil do usuário"
              aria-current={currentPage === 'profile' ? 'page' : undefined}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === 'profile' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
            >
              <span role="img" aria-hidden="true">👤</span> Perfil
            </button>

            {/* Admin Dashboard - Only for MODERATOR and above */}
            {user && RoleHelpers.canAccessAdminDashboard(user.role) && (
              <button
                onClick={() => setCurrentPage('admin')}
                aria-label="Ir para Dashboard Administrativo"
                aria-current={currentPage === 'admin' ? 'page' : undefined}
                style={{
                  padding: '8px 16px',
                  backgroundColor: currentPage === 'admin' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'background-color 0.2s'
                }}
              >
                <span role="img" aria-hidden="true">👑</span> Admin
              </button>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => {
                if (!showNotifications) {
                  loadNotifications(1);
                }
                setShowNotifications(!showNotifications);
              }}
              aria-label={`Notificações ${unreadCount > 0 ? `- ${unreadCount} não lidas` : ''}`}
              aria-expanded={showNotifications}
              style={{
                position: 'relative',
                padding: '8px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '18px',
                transition: 'background-color 0.2s'
              }}
              title="Notificações"
            >
              <span role="img" aria-hidden="true">🔔</span>
              {unreadCount > 0 && (
                <span 
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '2px 6px',
                    fontSize: '10px',
                    fontWeight: '600',
                    minWidth: '18px',
                    textAlign: 'center'
                  }}
                  aria-label={`${unreadCount > 99 ? 'Mais de 99' : unreadCount} notificações não lidas`}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Info */}
            <div style={{ textAlign: 'right', marginLeft: '8px' }} role="status" aria-label="Informações do usuário">
              <div style={{ fontSize: '14px', fontWeight: '500' }}>
                {user?.name}
                {user?.orcidId && <span style={{ color: '#4ade80' }} aria-label="ORCID verificado"> ✓</span>}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                {user?.points} pts • Nível {user?.level}
              </div>
            </div>

            {/* Accessibility Menu Button */}
            <button
              onClick={() => setShowAccessibilityMenu(!showAccessibilityMenu)}
              aria-label="Abrir menu de acessibilidade"
              aria-expanded={showAccessibilityMenu}
              style={{
                padding: '8px 16px',
                backgroundColor: showAccessibilityMenu ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.3s ease'
              }}
              title="Acessibilidade (Tamanho Texto, Tema, Ajuda)"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => {
                if (!showAccessibilityMenu) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                }
              }}
            >
              <span role="img" aria-hidden="true">♿</span>
            </button>
            
            {/* Logout */}
            <button
              onClick={() => {
                TokenStorage.remove();
                setUser(null);
                setCurrentPage('login');
                setSelectedTerm(null);
                setTranslation('');
                setTerms([]);
              }}
              aria-label="Sair da aplicação"
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
            >
              <span role="img" aria-hidden="true">🚪</span> Sair
            </button>
          </nav>
        </div>
      </header>
    );
  };

  // ============================================
  // NOTIFICATION CENTER COMPONENT
  // ============================================
  const NotificationCenter = () => {
    if (!showNotifications) return null;

    return (
      <div
        style={{
          position: 'fixed',
          top: '65px',
          right: '20px',
          width: '400px',
          maxHeight: '600px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '15px 20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f9fafb'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
            Notificações
          </h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Marcar todas como lidas
              </button>
            )}
            <button
              onClick={() => setShowNotifications(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '0',
                lineHeight: '1'
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: '500px'
        }}>
          {notifications.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔔</div>
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  padding: '15px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  backgroundColor: notif.read ? 'white' : '#eff6ff',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => {
                  if (!notif.read) {
                    markAsRead(notif.id);
                  }
                  if (notif.link) {
                    // Handle deep links
                    if (notif.link.includes('/admin')) {
                      setCurrentPage('admin');
                    } else if (notif.link.includes('/history')) {
                      setCurrentPage('history');
                    }
                    setShowNotifications(false);
                  }
                }}
              >
                {!notif.read && (
                  <div style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '50%'
                  }} />
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <div style={{ flex: 1, paddingLeft: '15px' }}>
                    <div style={{
                      fontWeight: notif.read ? '400' : '600',
                      marginBottom: '4px',
                      fontSize: '14px'
                    }}>
                      {notif.title}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      marginBottom: '6px'
                    }}>
                      {notif.message}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#9ca3af'
                    }}>
                      {new Date(notif.createdAt).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '0'
                    }}
                    title="Excluir notificação"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // ============================================
  // ADMIN DASHBOARD COMPONENT
  // ============================================
  const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [pendingTranslations, setPendingTranslations] = useState<any[]>([]);
    const [selectedTranslation, setSelectedTranslation] = useState<any>(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectReasonCode, setRejectReasonCode] = useState('INCORRECT_TRANSLATION');
    const [exportStartDate, setExportStartDate] = useState('');
    const [exportEndDate, setExportEndDate] = useState('');
    const [exportingBabelon, setExportingBabelon] = useState(false);

    useEffect(() => {
      loadAdminDashboard();
      loadPendingForModeration();
    }, []);

    const loadAdminDashboard = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
          headers: TokenStorage.getAuthHeader()
        });
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Erro ao carregar dashboard admin:', error);
      }
    };

    const loadPendingForModeration = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/translations/pending?limit=50`, {
          headers: TokenStorage.getAuthHeader()
        });
        if (response.ok) {
          const data = await response.json();
          setPendingTranslations(data.translations || []);
        }
      } catch (error) {
        console.error('Erro ao carregar traduções pendentes:', error);
      }
    };

    const handleApprove = async () => {
      if (!selectedTranslation) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/translations/${selectedTranslation.id}/approve`, {
          method: 'POST',
          headers: {
            ...TokenStorage.getAuthHeader(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ syncToHpo: true })
        });

        if (response.ok) {
          ToastService.success('Tradução aprovada com sucesso!');
          setShowApproveModal(false);
          setSelectedTranslation(null);
          loadPendingForModeration();
          loadAdminDashboard();
        } else {
          const error = await response.json();
          throw new Error(error.message || 'Erro ao aprovar tradução');
        }
      } catch (error: any) {
        ToastService.error(ErrorTranslator.translate(error));
        console.error('Erro ao aprovar:', error);
        ToastService.error('Erro ao aprovar tradução');
      }
    };

    const handleReject = async () => {
      if (!selectedTranslation || !rejectReason) {
        ToastService.warning('Por favor, forneça um motivo detalhado para a rejeição');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/translations/${selectedTranslation.id}/reject`, {
          method: 'POST',
          headers: {
            ...TokenStorage.getAuthHeader(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reasonCode: rejectReasonCode,
            detailedReason: rejectReason,
            canResubmit: true
          })
        });

        if (response.ok) {
          ToastService.success('Tradução rejeitada');
          setShowRejectModal(false);
          setSelectedTranslation(null);
          setRejectReason('');
          loadPendingForModeration();
          loadAdminDashboard();
        } else {
          const error = await response.json();
          throw new Error(error.message || 'Erro ao rejeitar tradução');
        }
      } catch (error: any) {
        ToastService.error(ErrorTranslator.translate(error));
        console.error('Erro ao rejeitar:', error);
        ToastService.error('Erro ao rejeitar tradução');
      }
    };

    const handleExportBabelon = async () => {
      setExportingBabelon(true);
      try {
        const params = new URLSearchParams();
        if (exportStartDate) params.append('startDate', exportStartDate);
        if (exportEndDate) params.append('endDate', exportEndDate);
        
        const url = `${API_BASE_URL}/api/export/release/babelon-with-orcid${params.toString() ? '?' + params.toString() : ''}`;
        
        const response = await fetch(url, {
          headers: TokenStorage.getAuthHeader()
        });

        if (!response.ok) {
          throw new Error('Erro ao exportar Babelon TSV');
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `babelon-hpo-pt-${dateStr}.tsv`;
        a.download = filename;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);

        ToastService.success(`✅ Babelon TSV exportado: ${filename}`);
      } catch (error: any) {
        ToastService.error(ErrorTranslator.translate(error));
        console.error('Erro ao exportar Babelon:', error);
      } finally {
        setExportingBabelon(false);
      }
    };

    return (
      <div style={{ padding: '30px', maxWidth: '1600px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '15px' }}>
                👑 Dashboard Administrativo
              </h1>
              <p style={{ margin: '10px 0 0 0', color: '#64748b' }}>
                Moderação, aprovação e gestão da plataforma HPO-PT
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('admin-users')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
            >
              👥 Gestão de Usuários
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {dashboardData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#f59e0b' }}>
                {dashboardData.summary.pendingTranslations}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                Aguardando Aprovação
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#ef4444' }}>
                {dashboardData.summary.conflictsPending}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                Conflitos Pendentes
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#8b5cf6' }}>
                {dashboardData.summary.lowQualityItems}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                Qualidade Baixa
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#10b981' }}>
                {dashboardData.summary.approvedForSync}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                Prontos para Sync
              </div>
            </div>
          </div>
        )}

        {/* Analytics Dashboard Section - ADMIN/SUPER_ADMIN ONLY */}
        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
          <div style={{ 
            marginBottom: '30px',
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              marginBottom: '20px',
              paddingBottom: '15px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>👑</span>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>
                  Analytics Avançado
                </h2>
                <span style={{
                  padding: '4px 12px',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  ADMIN ONLY
                </span>
              </div>
              <p style={{ margin: '5px 0 0 34px', color: '#64748b', fontSize: '14px' }}>
                Dados avançados de uso e comportamento da plataforma
              </p>
            </div>
            <AnalyticsDashboard />
          </div>
        )}

        {/* Babelon Export Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            📥 Exportar para HPO (Babelon TSV)
          </h2>
          <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px' }}>
            Gere arquivo TSV no formato Babelon com traduções aprovadas e ORCID iDs dos tradutores
          </p>

          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            alignItems: 'end',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '8px'
              }}>
                Data Início (opcional)
              </label>
              <input
                type="date"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '8px'
              }}>
                Data Fim (opcional)
              </label>
              <input
                type="date"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <button
              onClick={handleExportBabelon}
              disabled={exportingBabelon}
              style={{
                padding: '12px 30px',
                backgroundColor: exportingBabelon ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: exportingBabelon ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: exportingBabelon ? 'none' : '0 2px 4px rgba(37, 99, 235, 0.4)'
              }}
              onMouseEnter={(e) => {
                if (!exportingBabelon) {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!exportingBabelon) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {exportingBabelon ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                  Exportando...
                </>
              ) : (
                <>
                  📥 Exportar Babelon TSV
                </>
              )}
            </button>
          </div>

          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: '#eff6ff', 
            borderRadius: '8px',
            border: '1px solid #bfdbfe'
          }}>
            <div style={{ fontSize: '14px', color: '#1e40af', fontWeight: '600', marginBottom: '8px' }}>
              📋 Formato do Arquivo:
            </div>
            <div style={{ fontSize: '13px', color: '#3b82f6', lineHeight: '1.6' }}>
              • 14 colunas: term_id, language, label, definition, synonyms, contributor, creator_id, 
              contributor_name, contributor_id, reviewer, reviewer_name, translator_expertise, source, comment
              <br />
              • Apenas traduções com status: <strong>approved_for_sync</strong>
              <br />
              • ORCID iDs incluídos nos campos: creator_id, contributor_id
              <br />
              • Filtros de data aplicados à <strong>syncedToHpoAt</strong> (quando tradução foi sincronizada)
            </div>
          </div>
        </div>

        {/* Moderation Queue */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
            📋 Fila de Moderação ({pendingTranslations.length})
          </h2>

          {pendingTranslations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎉</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>
                Nenhuma tradução pendente de aprovação!
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {pendingTranslations.map(trans => (
                <div
                  key={trans.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '20px',
                    backgroundColor: '#f9fafb'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
                        {trans.term.hpoId} - {trans.term.labelEn}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>
                        📝 "{trans.labelPt}"
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                        Tradutor: {trans.user.name} (Nível {trans.user.level}, {trans.user.points} pts)
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{
                          padding: '4px 12px',
                          backgroundColor: trans.confidence >= 4 ? '#dcfce7' : trans.confidence >= 3 ? '#fef3c7' : '#fee2e2',
                          color: trans.confidence >= 4 ? '#15803d' : trans.confidence >= 3 ? '#92400e' : '#991b1b',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          Confiança: {trans.confidence}/5
                        </span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          {trans.validations.length} validações
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                      <button
                        onClick={() => {
                          setSelectedTranslation(trans);
                          setShowApproveModal(true);
                        }}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px'
                        }}
                      >
                        ✅ Aprovar Tradução
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTranslation(trans);
                          setShowRejectModal(true);
                        }}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px'
                        }}
                      >
                        ❌ Rejeitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approve Modal */}
        {showApproveModal && selectedTranslation && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700' }}>
                ✅ Aprovar Tradução
              </h3>
              <div style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                <div><strong>Termo:</strong> {selectedTranslation.term.hpoId}</div>
                <div><strong>Original:</strong> {selectedTranslation.term.labelEn}</div>
                <div><strong>Tradução:</strong> {selectedTranslation.labelPt}</div>
                <div><strong>Tradutor:</strong> {selectedTranslation.user.name}</div>
                <div><strong>Confiança:</strong> {selectedTranslation.confidence}/5</div>
              </div>
              <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                Esta tradução será marcada como OFICIAL e o tradutor receberá +100 pontos.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedTranslation(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApprove}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Confirmar Aprovação
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedTranslation && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
                ❌ Rejeitar Tradução
              </h3>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Motivo da Rejeição:
                </label>
                <select
                  value={rejectReasonCode}
                  onChange={(e) => setRejectReasonCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    marginBottom: '15px'
                  }}
                >
                  <option value="INCORRECT_TRANSLATION">Tradução Incorreta</option>
                  <option value="POOR_GRAMMAR">Gramática Ruim</option>
                  <option value="NOT_MEDICAL_TERM">Não é Termo Médico</option>
                  <option value="DUPLICATE">Duplicado</option>
                  <option value="INCONSISTENT">Inconsistente</option>
                  <option value="OTHER">Outro</option>
                </select>

                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Explicação Detalhada:
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explique o motivo da rejeição (mínimo 10 caracteres)"
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '10px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedTranslation(null);
                    setRejectReason('');
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReject}
                  disabled={rejectReason.length < 10}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: rejectReason.length < 10 ? '#9ca3af' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: rejectReason.length < 10 ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Confirmar Rejeição
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Export Modal Component
  const ExportModal = () => {
    if (!showExportModal) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '24px', fontWeight: '700' }}>
            📥 Exportar Traduções
          </h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Formato do Arquivo:
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="csv">📊 CSV - Excel / Google Sheets</option>
              <option value="json">📦 JSON - API / Integração</option>
              <option value="xliff">🌐 XLIFF - Padrão Internacional</option>
              <option value="babelon">🔬 Babelon TSV - Formato Oficial HPO</option>
              <option value="fivestars">⭐ Five Stars TSV - Sistema de Confiança</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <input
                type="checkbox"
                checked={exportOnlyApproved}
                onChange={(e) => setExportOnlyApproved(e.target.checked)}
                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
              />
              <span style={{ color: '#374151', fontSize: '14px' }}>
                Apenas traduções <strong>aprovadas</strong>
              </span>
            </label>
          </div>

          {/* Format descriptions */}
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.6' }}>
              {exportFormat === 'csv' && '📊 Formato compatível com Excel, Google Sheets e análise de dados. Inclui todas as informações e validações.'}
              {exportFormat === 'json' && '📦 Formato estruturado ideal para integração com APIs, ferramentas de programação e análise automatizada.'}
              {exportFormat === 'xliff' && '🌐 Padrão internacional para tradução (XLIFF 1.2). Compatível com ferramentas CAT profissionais como MemoQ, SDL Trados.'}
              {exportFormat === 'babelon' && '🔬 Formato oficial do repositório HPO. Use este arquivo para contribuir traduções ao projeto oficial do Human Phenotype Ontology!'}
              {exportFormat === 'fivestars' && '⭐ Sistema de classificação de confiança e qualidade. Inclui scores calculados baseados em validações, ratings e confiança do tradutor.'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowExportModal(false)}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleExport}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              {loading ? '⏳ Exportando...' : '📥 Exportar'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==================== CONFIRMATION MODAL (Task #11) ====================
  interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }

  const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    onConfirm,
    onCancel,
    variant = 'warning'
  }) => {
    if (!isOpen) return null;

    const variantColors = {
      danger: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', button: '#dc2626' },
      warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', button: '#f59e0b' },
      info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e3a8a', button: '#3b82f6' }
    };

    const colors = variantColors[variant];

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(4px)'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{
            backgroundColor: colors.bg,
            border: `2px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: colors.text,
              marginBottom: '10px'
            }}>
              {variant === 'danger' && '⚠️ '}{variant === 'warning' && '❗ '}{variant === 'info' && 'ℹ️ '}
              {title}
            </h3>
            <p style={{
              fontSize: '14px',
              color: colors.text,
              lineHeight: '1.6'
            }}>
              {message}
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              style={{
                padding: '10px 20px',
                backgroundColor: colors.button,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==================== TOOLTIP COMPONENT (Task #3) ====================
  interface TooltipProps {
    text: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
  }

  const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
    const [visible, setVisible] = useState(false);

    const positionStyles = {
      top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' },
      bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' },
      left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px' },
      right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' }
    };

    return (
      <span
        style={{ position: 'relative', display: 'inline-block', cursor: 'help' }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
        {visible && (
          <span style={{
            position: 'absolute',
            ...positionStyles[position],
            backgroundColor: '#1f2937',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            zIndex: 9999,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            maxWidth: '250px',
            whiteSpace: 'normal',
            lineHeight: '1.4'
          }}>
            {text}
            <span style={{
              content: '""',
              position: 'absolute',
              ...(position === 'top' && { top: '100%', left: '50%', transform: 'translateX(-50%)', borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #1f2937' }),
              ...(position === 'bottom' && { bottom: '100%', left: '50%', transform: 'translateX(-50%)', borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '6px solid #1f2937' }),
              ...(position === 'left' && { left: '100%', top: '50%', transform: 'translateY(-50%)', borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '6px solid #1f2937' }),
              ...(position === 'right' && { right: '100%', top: '50%', transform: 'translateY(-50%)', borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: '6px solid #1f2937' })
            }} />
          </span>
        )}
      </span>
    );
  };

  // ==================== SKELETON COMPONENT (Task #5) ====================
  const Skeleton: React.FC<{ width?: string; height?: string; borderRadius?: string }> = ({ 
    width = '100%', 
    height = '20px', 
    borderRadius = '4px' 
  }) => (
    <div 
      className="skeleton-pulse"
      style={{
        width,
        height,
        backgroundColor: '#e5e7eb',
        borderRadius
      }} 
    />
  );

  // ==================== EMPTY STATE COMPONENT (Task #13) ====================
  interface EmptyStateProps {
    icon: string;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  }

  const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, actionLabel, onAction }) => (
    <div style={{
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6b7280'
    }}>
      <div style={{ fontSize: '80px', marginBottom: '20px' }}>{icon}</div>
      <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '14px', marginBottom: '30px', maxWidth: '400px', margin: '0 auto 30px' }}>
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );

  // ==================== STAR RATING COMPONENT (Task #15) ====================
  const StarRating: React.FC<{ rating: number; maxRating?: number }> = ({ rating, maxRating = 5 }) => {
    const stars: React.ReactElement[] = [];
    for (let i = 1; i <= maxRating; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? '#fbbf24' : '#d1d5db', fontSize: '16px' }}>
          ⭐
        </span>
      );
    }
    return <span style={{ display: 'inline-flex', gap: '2px' }}>{stars}</span>;
  };

  // ==================== BREADCRUMBS COMPONENT (Task #10) ====================
  interface BreadcrumbItem {
    label: string;
    page?: 'home' | 'dashboard' | 'translate' | 'review' | 'leaderboard' | 'history' | 'admin' | 'profile' | 'guidelines';
    onClick?: () => void;
  }

  const Breadcrumbs: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => (
    <div style={{ 
      padding: '12px 0', 
      marginBottom: '8px',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      <span style={{ fontSize: '16px', marginRight: '4px' }}>🏠</span>
      {items.map((item, index) => (
        <span key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {index > 0 && <span style={{ color: '#d1d5db', margin: '0 4px' }}>›</span>}
          {item.page || item.onClick ? (
            <button
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else if (item.page) {
                  setCurrentPage(item.page);
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: index === items.length - 1 ? '#3b82f6' : '#6b7280',
                fontWeight: index === items.length - 1 ? '600' : 'normal',
                cursor: index === items.length - 1 ? 'default' : 'pointer',
                textDecoration: 'none',
                padding: '4px 6px',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (index !== items.length - 1) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = '#3b82f6';
                }
              }}
              onMouseLeave={(e) => {
                if (index !== items.length - 1) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }
              }}
              disabled={index === items.length - 1}
            >
              {item.label}
            </button>
          ) : (
            <span style={{ 
              color: index === items.length - 1 ? '#3b82f6' : '#6b7280', 
              fontWeight: index === items.length - 1 ? '600' : 'normal',
              padding: '4px 6px'
            }}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </div>
  );

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh' }}>
      {/* ♿ WCAG 2.1 Accessibility Elements */}
      
      {/* Skip Links */}
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>
      
      {/* ARIA Live Region for screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announceMessage}
      </div>
      
      {/* Accessibility Menu - Only shows when opened (Task #1) */}
      {user && showAccessibilityMenu && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 1000,
            backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            minWidth: '280px',
            border: `2px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
          }}
          role="dialog"
          aria-label="Menu de Acessibilidade"
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '700',
              color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ♿ Acessibilidade
            </div>
            <button
              onClick={() => setShowAccessibilityMenu(false)}
              aria-label="Fechar menu de acessibilidade"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                padding: '0',
                lineHeight: '1'
              }}
            >
              ×
            </button>
          </div>

          {/* Font Size Section */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
              marginBottom: '8px'
            }}>
              📝 Tamanho do Texto
            </div>
          <button
            onClick={() => changeFontSize('normal')}
            aria-pressed={fontSize === 'normal'}
            aria-label="Tamanho de fonte normal"
            style={{
              padding: '8px 12px',
              backgroundColor: fontSize === 'normal' ? '#3b82f6' : (theme === 'dark' ? '#374151' : '#f3f4f6'),
              color: fontSize === 'normal' ? 'white' : (theme === 'dark' ? '#f3f4f6' : '#1f2937'),
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s',
              minWidth: '44px',
              minHeight: '44px'
            }}
            title="Tamanho normal (16px)"
          >
            A
          </button>
          <button
            onClick={() => changeFontSize('large')}
            aria-pressed={fontSize === 'large'}
            aria-label="Tamanho de fonte grande"
            style={{
              padding: '8px 12px',
              backgroundColor: fontSize === 'large' ? '#3b82f6' : (theme === 'dark' ? '#374151' : '#f3f4f6'),
              color: fontSize === 'large' ? 'white' : (theme === 'dark' ? '#f3f4f6' : '#1f2937'),
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s',
              minWidth: '44px',
              minHeight: '44px'
            }}
            title="Tamanho grande (18px)"
          >
            A
          </button>
          <button
            onClick={() => changeFontSize('xlarge')}
            aria-pressed={fontSize === 'xlarge'}
            aria-label="Tamanho de fonte extra grande"
            style={{
              padding: '8px 12px',
              backgroundColor: fontSize === 'xlarge' ? '#3b82f6' : (theme === 'dark' ? '#374151' : '#f3f4f6'),
              color: fontSize === 'xlarge' ? 'white' : (theme === 'dark' ? '#f3f4f6' : '#1f2937'),
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: '600',
              transition: 'all 0.2s',
              minWidth: '44px',
              minHeight: '44px'
            }}
            title="Tamanho extra grande (20px)"
          >
            A
          </button>
          </div>

          {/* Dark Mode Section */}
          <div style={{ 
            marginBottom: '16px',
            paddingTop: '12px',
            borderTop: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
              marginBottom: '8px'
            }}>
              {theme === 'light' ? '🌙' : '☀️'} Tema
            </div>
            <button
              onClick={toggleTheme}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#4b5563' : '#e5e7eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'}
            >
              {theme === 'light' ? '🌙 Ativar Modo Escuro' : '☀️ Ativar Modo Claro'}
            </button>
          </div>

          {/* Help Section */}
          <div style={{
            paddingTop: '12px',
            borderTop: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
              marginBottom: '8px'
            }}>
              ❓ Ajuda
            </div>
            <button
              onClick={() => {
                setShowTour(true);
                setShowAccessibilityMenu(false);
              }}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#4b5563' : '#e5e7eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'}
            >
              🎓 Iniciar Tour Interativo
            </button>
          </div>
        </div>
      )}
      
      {/* Floating Tour Button */}
      {user && !showTour && (
        <button
          onClick={() => setShowTour(true)}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 10000,
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            animation: 'bounce 2s infinite'
          }}
          title="Reabrir Tour Interativo"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
          }}
        >
          ❓
        </button>
      )}

      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}</style>

      {/* Rate Limiting Banner (Task #18) */}
      {isRateLimited && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fef3c7',
          borderBottom: '2px solid #f59e0b',
          padding: '12px 20px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <span style={{ fontSize: '24px' }}>⏰</span>
          <span style={{ fontWeight: '600', color: '#92400e' }}>
            Muitas requisições! Aguarde {rateLimitRetryAfter} segundo{rateLimitRetryAfter !== 1 ? 's' : ''} antes de tentar novamente.
          </span>
        </div>
      )}
      
      {user && <Header />}
      <ExportModal />
      <NotificationCenter />
      
      {/* Interactive Tour */}
      {showTour && (
        <InteractiveTour
          currentPage={currentPage}
          onComplete={async () => {
            setShowTour(false);
            setTourCompleted(true);
            localStorage.setItem('tourCompleted', 'true');
            
            // Marcar como completado no backend
            try {
              await fetch(`${API_BASE_URL}/api/users/complete-onboarding`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${TokenStorage.get()}`
                }
              });
              if (user) {
                setUser({ ...user, hasCompletedOnboarding: true });
              }
              ToastService.success('🎉 Tour concluído! Bem-vindo à plataforma!');
            } catch (error) {
              console.error('Erro ao completar onboarding:', error);
            }
          }}
          onSkip={() => {
            setShowTour(false);
            ToastService.info('Você pode reabrir o tour clicando no botão ❓ no canto inferior direito');
          }}
          onPageChange={(page) => {
            setCurrentPage(page as any);
          }}
        />
      )}
      
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        cancelLabel={confirmModal.cancelLabel}
        onConfirm={() => {
          confirmModal.onConfirm();
          setConfirmModal({ ...confirmModal, isOpen: false });
        }}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        variant={confirmModal.variant}
      />
      
      {/* Main Content with ARIA landmark */}
      <main id="main-content" role="main" aria-label="Conteúdo principal">
        {console.log('🎨 RENDERIZANDO - currentPage:', currentPage, 'user:', user ? 'EXISTE' : 'NULL', 'isLoadingAuth:', isLoadingAuth)}
        
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'login' && <LoginPage />}
        {currentPage === 'register' && <RegisterPage />}
        
        {/* Dashboard - Mostra loading se está carregando auth */}
        {currentPage === 'dashboard' && user && <Dashboard />}
        {currentPage === 'dashboard' && !user && isLoadingAuth && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px', animation: 'spin 2s linear infinite' }}>🔄</div>
            <h2>Carregando seu dashboard...</h2>
            <p>Aguarde enquanto recuperamos seus dados.</p>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>Máximo 10 segundos...</p>
          </div>
        )}
        
        {/* Translate - Mostra loading se está carregando auth */}
        {currentPage === 'translate' && user && <TranslatePage />}
        {currentPage === 'translate' && !user && isLoadingAuth && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px', animation: 'spin 2s linear infinite' }}>🔄</div>
            <h2>Carregando página de tradução...</h2>
            <p>Aguarde enquanto recuperamos seus dados.</p>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>Máximo 10 segundos...</p>
          </div>
        )}
        
        {currentPage === 'review' && user && RoleHelpers.canReview(user.role) && <ReviewPage />}
        {currentPage === 'review' && user && !RoleHelpers.canReview(user.role) && (
          <UnauthorizedAccess 
            requiredRole="REVIEWER" 
            userRole={user.role}
            message="Você precisa ser um Revisor ou ter cargo superior para acessar esta página."
          />
        )}
        {currentPage === 'leaderboard' && user && <LeaderboardPage />}
        {currentPage === 'history' && user && <HistoryPage />}
        {currentPage === 'profile' && user && <ProfilePage />}
        {currentPage === 'admin' && user && RoleHelpers.canAccessAdminDashboard(user.role) && <AdminDashboard />}
        {currentPage === 'admin' && user && !RoleHelpers.canAccessAdminDashboard(user.role) && (
          <UnauthorizedAccess 
            requiredRole="MODERATOR" 
            userRole={user.role}
            message="Você precisa ser um Moderador ou ter cargo superior para acessar o Dashboard Administrativo."
          />
        )}
        {currentPage === 'admin-users' && user && RoleHelpers.canAccessAdminDashboard(user.role) && <AdminUserManagementPage />}
        {currentPage === 'admin-users' && user && !RoleHelpers.canAccessAdminDashboard(user.role) && (
          <UnauthorizedAccess 
            requiredRole="MODERATOR" 
            userRole={user.role}
            message="Você precisa ser um Moderador ou ter cargo superior para acessar a Gestão de Usuários."
          />
        )}
        {currentPage === 'guidelines' && user && <GuidelinesPage onBack={() => setCurrentPage('dashboard')} />}
        {currentPage === 'points' && user && <GamificationPage />}
        {currentPage === 'referral' && user && <ReferralPage />}
      </main>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default ProductionHPOApp;