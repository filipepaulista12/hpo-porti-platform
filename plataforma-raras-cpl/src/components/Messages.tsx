/**
 * Better Error Messages Component
 * User-friendly error messages with actionable suggestions
 */

interface ErrorMessageProps {
  type: 'network' | 'validation' | 'permission' | 'notFound' | 'server' | 'generic';
  message?: string;
  details?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorMessage = ({
  type,
  message,
  details,
  onRetry,
  onDismiss
}: ErrorMessageProps) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: '📡',
          title: message || 'Problema de Conexão',
          description: details || 'Não conseguimos conectar ao servidor. Verifique sua conexão com a internet e tente novamente.',
          suggestion: 'Verifique se está conectado à internet',
          color: '#F59E0B'
        };
      
      case 'validation':
        return {
          icon: '⚠️',
          title: message || 'Dados Inválidos',
          description: details || 'Alguns campos não foram preenchidos corretamente. Verifique as informações e tente novamente.',
          suggestion: 'Revise os campos destacados em vermelho',
          color: '#EF4444'
        };
      
      case 'permission':
        return {
          icon: '🔒',
          title: message || 'Sem Permissão',
          description: details || 'Você não tem permissão para realizar esta ação. Entre em contato com um administrador se precisar de acesso.',
          suggestion: 'Solicite permissão ao administrador',
          color: '#EF4444'
        };
      
      case 'notFound':
        return {
          icon: '🔍',
          title: message || 'Não Encontrado',
          description: details || 'O recurso que você procura não foi encontrado. Pode ter sido removido ou o link está incorreto.',
          suggestion: 'Volte e tente outra página',
          color: '#6B7280'
        };
      
      case 'server':
        return {
          icon: '🔧',
          title: message || 'Erro no Servidor',
          description: details || 'Ocorreu um problema no servidor. Nossa equipe já foi notificada e está trabalhando para resolver.',
          suggestion: 'Tente novamente em alguns minutos',
          color: '#EF4444'
        };
      
      default:
        return {
          icon: '❌',
          title: message || 'Algo Deu Errado',
          description: details || 'Ocorreu um erro inesperado. Por favor, tente novamente.',
          suggestion: 'Recarregue a página e tente novamente',
          color: '#6B7280'
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div style={{
      backgroundColor: '#FEF2F2',
      border: `2px solid ${config.color}`,
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      position: 'relative'
    }}>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#6B7280',
            padding: '4px 8px'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#1F2937'}
          onMouseOut={(e) => e.currentTarget.style.color = '#6B7280'}
        >
          ×
        </button>
      )}

      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ fontSize: '32px', flexShrink: 0 }}>
          {config.icon}
        </div>
        
        <div style={{ flex: 1 }}>
          <h4 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1F2937',
            marginBottom: '8px'
          }}>
            {config.title}
          </h4>
          
          <p style={{
            fontSize: '15px',
            color: '#374151',
            marginBottom: '12px',
            lineHeight: '1.5'
          }}>
            {config.description}
          </p>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#6B7280',
            marginBottom: onRetry ? '16px' : '0'
          }}>
            <span>💡</span>
            <span>{config.suggestion}</span>
          </div>
          
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                padding: '10px 20px',
                backgroundColor: config.color,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              🔄 Tentar Novamente
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Inline Error (for form fields)
 */
export const InlineError = ({ message }: { message: string }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '6px',
    fontSize: '14px',
    color: '#EF4444'
  }}>
    <span>⚠️</span>
    <span>{message}</span>
  </div>
);

/**
 * Success Message
 */
export const SuccessMessage = ({ 
  title, 
  description,
  onDismiss 
}: { 
  title: string; 
  description?: string;
  onDismiss?: () => void;
}) => (
  <div style={{
    backgroundColor: '#F0FDF4',
    border: '2px solid #10B981',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    position: 'relative'
  }}>
    {onDismiss && (
      <button
        onClick={onDismiss}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'none',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          color: '#6B7280',
          padding: '4px 8px'
        }}
        onMouseOver={(e) => e.currentTarget.style.color = '#1F2937'}
        onMouseOut={(e) => e.currentTarget.style.color = '#6B7280'}
      >
        ×
      </button>
    )}

    <div style={{ display: 'flex', gap: '16px' }}>
      <div style={{ fontSize: '32px', flexShrink: 0 }}>
        ✅
      </div>
      
      <div>
        <h4 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1F2937',
          marginBottom: description ? '8px' : '0'
        }}>
          {title}
        </h4>
        
        {description && (
          <p style={{
            fontSize: '15px',
            color: '#374151',
            lineHeight: '1.5'
          }}>
            {description}
          </p>
        )}
      </div>
    </div>
  </div>
);

/**
 * Warning Message
 */
export const WarningMessage = ({ 
  title, 
  description 
}: { 
  title: string; 
  description?: string;
}) => (
  <div style={{
    backgroundColor: '#FFFBEB',
    border: '2px solid #F59E0B',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px'
  }}>
    <div style={{ display: 'flex', gap: '16px' }}>
      <div style={{ fontSize: '32px', flexShrink: 0 }}>
        ⚠️
      </div>
      
      <div>
        <h4 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1F2937',
          marginBottom: description ? '8px' : '0'
        }}>
          {title}
        </h4>
        
        {description && (
          <p style={{
            fontSize: '15px',
            color: '#374151',
            lineHeight: '1.5'
          }}>
            {description}
          </p>
        )}
      </div>
    </div>
  </div>
);

/**
 * Info Message
 */
export const InfoMessage = ({ 
  title, 
  description 
}: { 
  title: string; 
  description?: string;
}) => (
  <div style={{
    backgroundColor: '#EFF6FF',
    border: '2px solid #3B82F6',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px'
  }}>
    <div style={{ display: 'flex', gap: '16px' }}>
      <div style={{ fontSize: '32px', flexShrink: 0 }}>
        ℹ️
      </div>
      
      <div>
        <h4 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1F2937',
          marginBottom: description ? '8px' : '0'
        }}>
          {title}
        </h4>
        
        {description && (
          <p style={{
            fontSize: '15px',
            color: '#374151',
            lineHeight: '1.5'
          }}>
            {description}
          </p>
        )}
      </div>
    </div>
  </div>
);
