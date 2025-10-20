/**
 * Empty State Components
 * Friendly messages when no data is available
 */

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: React.CSSProperties;
}

export const EmptyState = ({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
  style = {}
}: EmptyStateProps) => (
  <div style={{
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#F9FAFB',
    borderRadius: '12px',
    border: '2px dashed #E5E7EB',
    ...style
  }}>
    <div style={{ fontSize: '64px', marginBottom: '16px' }}>
      {icon}
    </div>
    <h3 style={{
      fontSize: '20px',
      fontWeight: '600',
      color: '#1F2937',
      marginBottom: '8px'
    }}>
      {title}
    </h3>
    <p style={{
      fontSize: '16px',
      color: '#6B7280',
      marginBottom: actionLabel ? '24px' : '0',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      {description}
    </p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        style={{
          marginTop: '24px',
          padding: '12px 24px',
          backgroundColor: '#3B82F6',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#2563EB';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#3B82F6';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {actionLabel}
      </button>
    )}
  </div>
);

// Specific empty states

export const NoTranslationsEmpty = ({ onCreateNew }: { onCreateNew?: () => void }) => (
  <EmptyState
    icon="✍️"
    title="Nenhuma Tradução Ainda"
    description="Comece criando sua primeira tradução de um termo HPO. Ganhe pontos e suba no ranking!"
    actionLabel="Criar Primeira Tradução"
    onAction={onCreateNew}
  />
);

export const NoConflictsEmpty = () => (
  <EmptyState
    icon="✅"
    title="Nenhum Conflito Pendente"
    description="Ótimo! Não há conflitos de tradução para revisar no momento. Todos os termos estão alinhados."
  />
);

export const NoNotificationsEmpty = () => (
  <EmptyState
    icon="🎉"
    title="Você Está em Dia!"
    description="Não há notificações não lidas. Volte mais tarde para atualizações sobre suas traduções."
    style={{ padding: '40px 20px' }}
  />
);

export const NoSearchResultsEmpty = ({ searchTerm }: { searchTerm: string }) => (
  <EmptyState
    icon="🔍"
    title="Nenhum Resultado Encontrado"
    description={`Não encontramos resultados para "${searchTerm}". Tente buscar com outros termos ou verifique a ortografia.`}
  />
);

export const NoHistoryEmpty = ({ onStartTranslating }: { onStartTranslating?: () => void }) => (
  <EmptyState
    icon="📖"
    title="Seu Histórico Está Vazio"
    description="Você ainda não criou nenhuma tradução. Comece agora e acompanhe seu progresso aqui!"
    actionLabel="Começar a Traduzir"
    onAction={onStartTranslating}
  />
);

export const NoSyncHistoryEmpty = () => (
  <EmptyState
    icon="🔄"
    title="Nenhuma Sincronização Realizada"
    description="Quando você sincronizar traduções com o HPO oficial, o histórico aparecerá aqui."
    style={{ padding: '40px 20px' }}
  />
);

export const NoLeaderboardEmpty = () => (
  <EmptyState
    icon="🏆"
    title="Ranking Vazio"
    description="Seja o primeiro a traduzir e aparecer no ranking de contribuidores!"
  />
);

export const ErrorState = ({ 
  title = "Algo Deu Errado", 
  description,
  onRetry 
}: { 
  title?: string; 
  description: string;
  onRetry?: () => void;
}) => (
  <EmptyState
    icon="⚠️"
    title={title}
    description={description}
    actionLabel={onRetry ? "Tentar Novamente" : undefined}
    onAction={onRetry}
    style={{ 
      borderColor: '#FCA5A5',
      backgroundColor: '#FEF2F2'
    }}
  />
);

export const LoadingState = ({ message = "Carregando..." }: { message?: string }) => (
  <div style={{
    textAlign: 'center',
    padding: '60px 20px'
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      margin: '0 auto 16px',
      border: '4px solid #E5E7EB',
      borderTopColor: '#3B82F6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <p style={{
      fontSize: '16px',
      color: '#6B7280'
    }}>
      {message}
    </p>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);
