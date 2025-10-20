/**
 * Onboarding Tour Steps Configuration
 * Defines the interactive tutorial shown to new users
 */

export interface OnboardingStep {
  target: string; // CSS selector or 'center' for modal
  title: string;
  content: string;
  placement: 'top' | 'right' | 'bottom' | 'left' | 'center';
  showSkip?: boolean;
  ctaText: string;
  icon?: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  // Step 1: Welcome
  {
    target: 'center',
    title: '🎉 Bem-vindo ao HPO Translator!',
    content: 'Você está prestes a contribuir para a democratização do diagnóstico de doenças raras no Brasil. Mais de 17.000 termos médicos aguardam tradução. Vamos fazer um tour rápido?',
    placement: 'center',
    showSkip: true,
    ctaText: '🚀 Começar Tour',
    icon: '🎉'
  },
  
  // Step 2: Purpose
  {
    target: 'center',
    title: '🧬 O Que é HPO?',
    content: 'Human Phenotype Ontology é um vocabulário padronizado com 17.020 termos que descrevem fenótipos clínicos anormais. É usado mundialmente para diagnóstico de doenças raras. Nossa missão: traduzir TODOS para português brasileiro!',
    placement: 'center',
    ctaText: 'Entendi',
    icon: '🧬'
  },
  
  // Step 3: How It Works
  {
    target: 'center',
    title: '🤝 Como Funciona?',
    content: 'Este é um projeto COLABORATIVO. Você traduz → Outros validam → Comitê científico aprova → Sincronizamos com HPO oficial. Traduções de qualidade ganham pontos extras!',
    placement: 'center',
    ctaText: 'Legal!',
    icon: '🤝'
  },
  
  // Step 4: Translate Button
  {
    target: '[data-tour="translate-btn"]',
    title: '📝 Começe Traduzindo',
    content: 'Clique aqui para ver termos disponíveis. Use filtros para encontrar termos da sua especialidade. Cada tradução vale +50 pontos!',
    placement: 'bottom',
    ctaText: 'Próximo',
    icon: '📝'
  },
  
  // Step 5: Points Display
  {
    target: '[data-tour="points-display"]',
    title: '🎮 Sistema de Gamificação',
    content: 'Ganhe pontos por contribuir! Tradução: +50pts | Validação: +30pts | Aprovação: +100pts bônus | Vencer conflito: +150pts extra. Suba de nível e desbloqueie badges!',
    placement: 'left',
    ctaText: 'Ótimo!',
    icon: '🎮'
  },
  
  // Step 6: Notifications
  {
    target: '[data-tour="notifications-bell"]',
    title: '🔔 Notificações em Tempo Real',
    content: 'Receba alertas INSTANTÂNEOS via WebSocket quando suas traduções forem aprovadas, validadas ou comentadas. Tudo sem precisar atualizar a página!',
    placement: 'bottom',
    ctaText: 'Demais!',
    icon: '🔔'
  },
  
  // Step 7: Profile
  {
    target: '[data-tour="profile-menu"]',
    title: '👤 Complete Seu Perfil',
    content: 'IMPORTANTE: Adicione sua instituição, especialidade e ORCID iD para receber crédito correto pelas traduções. Suas contribuições serão citadas no repositório oficial do HPO!',
    placement: 'left',
    ctaText: 'Vou Completar',
    icon: '👤'
  },
  
  // Step 8: Help
  {
    target: '[data-tour="help-btn"]',
    title: '❓ Precisa de Ajuda?',
    content: 'Clique no botão ❓ em qualquer página para ver instruções específicas. Também temos um guia completo do usuário com exemplos e dicas!',
    placement: 'bottom',
    ctaText: 'Beleza',
    icon: '❓'
  },
  
  // Step 9: Ready
  {
    target: 'center',
    title: '🚀 Tudo Pronto!',
    content: 'Você está pronto para começar sua jornada! Lembre-se: qualidade é mais importante que quantidade. Comece por termos de dificuldade 1-2 da sua área. Boa tradução! 💙🇧🇷',
    placement: 'center',
    showSkip: false,
    ctaText: '🎯 Começar a Traduzir!',
    icon: '🚀'
  }
];

// Helper to get step by index
export const getStep = (index: number): OnboardingStep | null => {
  return ONBOARDING_STEPS[index] || null;
};

// Total number of steps
export const TOTAL_STEPS = ONBOARDING_STEPS.length;
