import React, { useState, useEffect, useRef } from 'react';

interface TourStep {
  id: string;
  target: string; // Seletor CSS do elemento a destacar
  title: string;
  description: string;
  icon: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string; // Ação simulada (ex: "Clique aqui")
  page: 'dashboard' | 'translate' | 'review' | 'history' | 'leaderboard';
}

interface InteractiveTourProps {
  currentPage: string;
  onComplete: () => void;
  onSkip: () => void;
  onPageChange: (page: string) => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    target: 'body',
    title: '🎉 Bem-vindo ao HPO-PT!',
    description: 'Vamos fazer um tour interativo pela plataforma. Você aprenderá como traduzir, revisar e colaborar com a comunidade científica!',
    icon: '🚀',
    position: 'bottom',
    page: 'dashboard'
  },
  {
    id: 'dashboard-stats',
    target: '.dashboard-content',
    title: '📊 Suas Estatísticas',
    description: 'Aqui você acompanha seu progresso: traduções, revisões, pontos e nível. Quanto mais você contribui, mais sobe no ranking!',
    icon: '📈',
    position: 'bottom',
    page: 'dashboard'
  },
  {
    id: 'navigate-translate',
    target: '[data-page="translate"]',
    title: '🌍 Vamos Traduzir!',
    description: 'Clique no botão "Traduzir" para começar sua primeira contribuição. Você verá termos médicos da HPO que precisam de tradução.',
    icon: '👉',
    position: 'bottom',
    action: 'Clique aqui para continuar',
    page: 'dashboard'
  },
  {
    id: 'translate-page',
    target: '.translate-content',
    title: '📝 Página de Tradução',
    description: 'Aqui você vê uma lista de termos HPO para traduzir. Escolha termos que você domina e contribua com traduções precisas!',
    icon: '🎯',
    position: 'top',
    page: 'translate'
  },
  {
    id: 'confidence-info',
    target: '.translate-content',
    title: '⭐ Qualidade é Importante',
    description: 'Lembre-se: indique seu nível de confiança honestamente (1-5). Isso ajuda revisores a priorizarem e aumenta a credibilidade do projeto.',
    icon: '💡',
    position: 'top',
    page: 'translate'
  },
  {
    id: 'navigate-review',
    target: '[data-page="review"]',
    title: '🔍 Hora de Revisar!',
    description: 'Agora vamos revisar traduções de outros colaboradores. Clique em "Revisar" para ver traduções pendentes.',
    icon: '👀',
    position: 'bottom',
    action: 'Ir para revisões',
    page: 'dashboard'
  },
  {
    id: 'review-page',
    target: '.review-content',
    title: '📋 Traduções Pendentes',
    description: 'Aqui você vê traduções aguardando aprovação. Avalie a qualidade, precisão e adequação da tradução ao contexto médico.',
    icon: '🔬',
    position: 'top',
    page: 'review'
  },
  {
    id: 'review-quality',
    target: '.review-content',
    title: '✅ Seja Justo e Construtivo',
    description: 'Aprove traduções corretas, rejeite incorretas ou solicite revisão. Deixe comentários construtivos para ajudar outros tradutores!',
    icon: '⚖️',
    position: 'top',
    page: 'review'
  },
  {
    id: 'navigate-history',
    target: '[data-page="history"]',
    title: '📚 Seu Histórico',
    description: 'Acompanhe todas as suas contribuições! Veja status, pontos ganhos e feedback da comunidade.',
    icon: '📖',
    position: 'bottom',
    action: 'Ver histórico',
    page: 'dashboard'
  },
  {
    id: 'history-page',
    target: '.history-content',
    title: '🔎 Acompanhe seu Progresso',
    description: 'Filtre suas traduções por status: Aprovadas, Pendentes, Rejeitadas ou que precisam revisão. Aprenda com o feedback!',
    icon: '🗂️',
    position: 'top',
    page: 'history'
  },
  {
    id: 'navigate-leaderboard',
    target: '[data-page="leaderboard"]',
    title: '🏆 Ranking da Comunidade',
    description: 'Veja os top colaboradores e sua posição no ranking! Ganhe pontos traduzindo e revisando.',
    icon: '👑',
    position: 'bottom',
    action: 'Ver ranking',
    page: 'dashboard'
  },
  {
    id: 'leaderboard-page',
    target: '.leaderboard-content',
    title: '🎖️ Competição Saudável',
    description: 'Quanto mais você contribui com qualidade, mais sobe no ranking. Colabore e seja reconhecido pela comunidade científica!',
    icon: '🌟',
    position: 'top',
    page: 'leaderboard'
  },
  {
    id: 'complete',
    target: 'body',
    title: '🎊 Parabéns!',
    description: 'Você completou o tour! Agora está pronto para contribuir. Lembre-se: qualidade > quantidade. Boa sorte e boas traduções! 🚀',
    icon: '🎉',
    position: 'bottom',
    page: 'dashboard'
  }
];

const InteractiveTour: React.FC<InteractiveTourProps> = ({
  currentPage,
  onComplete,
  onSkip,
  onPageChange
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [spotlightPosition, setSpotlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [tooltipPosition, setTooltipPosition] = useState({ top: 80, left: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasBeenDragged, setHasBeenDragged] = useState(false); // ✅ NOVO: Rastreia se já foi arrastado
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = TOUR_STEPS[currentStepIndex];
  const progress = ((currentStepIndex + 1) / TOUR_STEPS.length) * 100;

  useEffect(() => {
    updatePositions();
    window.addEventListener('resize', updatePositions);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [currentStepIndex, currentPage, isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && tooltipRef.current) {
      const newLeft = e.clientX - dragOffset.x;
      const newTop = e.clientY - dragOffset.y;
      
      // Limites para não sair da tela
      const maxLeft = window.innerWidth - tooltipRef.current.offsetWidth;
      const maxTop = window.innerHeight - tooltipRef.current.offsetHeight;
      
      setTooltipPosition({
        left: Math.max(0, Math.min(newLeft, maxLeft)),
        top: Math.max(0, Math.min(newTop, maxTop))
      });
      setHasBeenDragged(true); // ✅ Marca que foi arrastado
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updatePositions = () => {
    if (!currentStep) return;

    let targetElement: HTMLElement | null = null;

    if (currentStep.target === 'body') {
      // Centralizar na tela
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setSpotlightPosition({ top: centerY - 100, left: centerX - 100, width: 200, height: 200 });
      setTooltipPosition({ top: centerY - 200, left: centerX - 210 });
      return;
    }

    targetElement = document.querySelector(currentStep.target) as HTMLElement;

    if (!targetElement) {
      // Se elemento não encontrado, centralizar tooltip na tela
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setSpotlightPosition({ top: centerY - 100, left: centerX - 100, width: 200, height: 200 });
      setTooltipPosition({ top: centerY - 200, left: centerX - 210 });
      return;
    }

    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const padding = 15;
      
      setSpotlightPosition({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + (padding * 2),
        height: rect.height + (padding * 2)
      });

      // TOOLTIP: Manter posição se já foi arrastado manualmente
      if (!hasBeenDragged) {
        const tooltipWidth = 420;
        const centerX = window.innerWidth / 2;
        const tooltipLeft = centerX - (tooltipWidth / 2);
        const tooltipTop = 80;
        setTooltipPosition({ top: tooltipTop, left: tooltipLeft });
      }
      // Se já foi arrastado, mantém a posição atual
    }
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextStep = TOUR_STEPS[currentStepIndex + 1];
      
      // Se próximo passo é em outra página, navegar
      if (nextStep.page !== currentPage) {
        onPageChange(nextStep.page);
      }
      
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevStep = TOUR_STEPS[currentStepIndex - 1];
      
      // Se passo anterior é em outra página, navegar
      if (prevStep.page !== currentPage) {
        onPageChange(prevStep.page);
      }
      
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  if (!currentStep || currentStep.page !== currentPage) {
    return null;
  }

  return (
    <>
      {/* Overlay mais transparente */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9998,
        transition: 'background-color 0.3s ease'
      }} />

      {/* Spotlight no elemento */}
      {currentStep.target !== 'body' && (
        <div style={{
          position: 'fixed',
          top: spotlightPosition.top,
          left: spotlightPosition.left,
          width: spotlightPosition.width,
          height: spotlightPosition.height,
          border: '4px solid #3b82f6',
          borderRadius: '12px',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59, 130, 246, 0.8), inset 0 0 20px rgba(59, 130, 246, 0.3)',
          zIndex: 9999,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'none',
          animation: 'pulse-border 2s infinite'
        }} />
      )}

      {/* Tooltip de instrução - ARRASTÁVEL */}
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: '450px',
          maxWidth: 'calc(100vw - 40px)',
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '35px',
          boxShadow: isDragging 
            ? '0 35px 90px rgba(0, 0, 0, 0.5), 0 15px 40px rgba(59, 130, 246, 0.4)'
            : '0 25px 70px rgba(0, 0, 0, 0.3), 0 10px 30px rgba(59, 130, 246, 0.2)',
          zIndex: 10000,
          animation: 'fadeInScale 0.3s ease',
          border: '3px solid #3b82f6',
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          transition: isDragging ? 'none' : 'box-shadow 0.2s ease'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Indicador de arrastar */}
        <div style={{
          textAlign: 'center',
          marginBottom: '10px',
          fontSize: '0.75rem',
          color: '#9ca3af',
          fontWeight: '600',
          letterSpacing: '0.05em'
        }}>
          ⇅ ARRASTE PARA MOVER ⇅
        </div>

        {/* Ícone e Título */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>{currentStep.icon}</div>
          <h3 style={{
            margin: 0,
            fontSize: '1.6rem',
            color: '#1e40af',
            fontWeight: '800',
            lineHeight: '1.3'
          }}>
            {currentStep.title}
          </h3>
        </div>

        {/* Descrição */}
        <p style={{
          fontSize: '1.05rem',
          color: '#374151',
          lineHeight: '1.7',
          marginBottom: '25px',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          {currentStep.description}
        </p>

        {/* Ação especial */}
        {currentStep.action && (
          <div style={{
            backgroundColor: '#fef3c7',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '25px',
            textAlign: 'center',
            border: '2px solid #fbbf24'
          }}>
            <span style={{
              fontSize: '0.95rem',
              color: '#92400e',
              fontWeight: '700'
            }}>
              💡 {currentStep.action}
            </span>
          </div>
        )}

        {/* Barra de Progresso */}
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          marginBottom: '15px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#3b82f6',
            transition: 'width 0.3s ease',
            borderRadius: '4px'
          }} />
        </div>

        {/* Contador */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.9rem',
          color: '#6b7280',
          marginBottom: '25px',
          fontWeight: '700'
        }}>
          Etapa {currentStepIndex + 1} de {TOUR_STEPS.length}
        </div>

        {/* Botões de Navegação */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onSkip}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f3f4f6',
              border: '2px solid #d1d5db',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '700',
              color: '#374151',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ⏭️ Pular Tour
          </button>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                ← Anterior
              </button>
            )}

            <button
              onClick={handleNext}
              style={{
                padding: '12px 28px',
                backgroundColor: currentStepIndex === TOUR_STEPS.length - 1 ? '#10b981' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '700',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = currentStepIndex === TOUR_STEPS.length - 1 ? '#059669' : '#2563eb';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = currentStepIndex === TOUR_STEPS.length - 1 ? '#10b981' : '#3b82f6';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {currentStepIndex === TOUR_STEPS.length - 1 ? '✓ Concluir Tour' : 'Próximo →'}
            </button>
          </div>
        </div>
      </div>

      {/* Animações CSS */}
      <style>{`
        @keyframes pulse-border {
          0%, 100% {
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59, 130, 246, 0.8), inset 0 0 20px rgba(59, 130, 246, 0.3);
            border-color: #3b82f6;
          }
          50% {
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 60px rgba(59, 130, 246, 1), inset 0 0 30px rgba(59, 130, 246, 0.5);
            border-color: #60a5fa;
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default InteractiveTour;
