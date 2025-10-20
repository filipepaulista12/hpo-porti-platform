import { useState } from 'react';

/**
 * Confirmation Dialog Component
 * Shows a modal confirmation before critical actions
 */

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmStyle?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmStyle = 'primary',
  onConfirm,
  onCancel
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  const getConfirmColor = () => {
    switch (confirmStyle) {
      case 'danger': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return '#3B82F6';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />
      
      {/* Dialog */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '400px',
        width: '90%',
        zIndex: 10000,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        animation: 'slideUp 0.3s ease-out'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#1F2937',
          marginBottom: '12px'
        }}>
          {title}
        </h3>
        
        <p style={{
          fontSize: '16px',
          color: '#6B7280',
          marginBottom: '24px',
          lineHeight: '1.5'
        }}>
          {message}
        </p>
        
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#F3F4F6',
              color: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
          >
            {cancelLabel}
          </button>
          
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              backgroundColor: getConfirmColor(),
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
};

/**
 * Hook for managing confirmation dialogs
 */
export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmStyle?: 'danger' | 'warning' | 'primary';
  }>({
    title: '',
    message: ''
  });
  const [resolveCallback, setResolveCallback] = useState<((value: boolean) => void) | null>(null);

  const confirm = (options: typeof config): Promise<boolean> => {
    setConfig(options);
    setIsOpen(true);
    
    return new Promise((resolve) => {
      setResolveCallback(() => resolve);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolveCallback) resolveCallback(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolveCallback) resolveCallback(false);
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      isOpen={isOpen}
      {...config}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, ConfirmDialog: ConfirmDialogComponent };
};

/**
 * Tooltip Component
 * Shows helpful information on hover
 */

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip = ({ text, children, position = 'top' }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      backgroundColor: '#1F2937',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '14px',
      whiteSpace: 'nowrap',
      zIndex: 1000,
      pointerEvents: 'none',
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.2s',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    };

    switch (position) {
      case 'top':
        return { ...baseStyles, bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' };
      case 'bottom':
        return { ...baseStyles, top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' };
      case 'left':
        return { ...baseStyles, right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px' };
      case 'right':
        return { ...baseStyles, left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' };
      default:
        return baseStyles;
    }
  };

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <div style={getPositionStyles()}>
        {text}
        {/* Arrow */}
        <div style={{
          position: 'absolute',
          width: 0,
          height: 0,
          borderStyle: 'solid',
          ...(position === 'top' && {
            bottom: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '4px 4px 0 4px',
            borderColor: '#1F2937 transparent transparent transparent'
          }),
          ...(position === 'bottom' && {
            top: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '0 4px 4px 4px',
            borderColor: 'transparent transparent #1F2937 transparent'
          }),
          ...(position === 'left' && {
            right: '-4px',
            top: '50%',
            transform: 'translateY(-50%)',
            borderWidth: '4px 0 4px 4px',
            borderColor: 'transparent transparent transparent #1F2937'
          }),
          ...(position === 'right' && {
            left: '-4px',
            top: '50%',
            transform: 'translateY(-50%)',
            borderWidth: '4px 4px 4px 0',
            borderColor: 'transparent #1F2937 transparent transparent'
          })
        }} />
      </div>
    </div>
  );
};

/**
 * Info Icon with Tooltip
 */
export const InfoTooltip = ({ text, position }: { text: string; position?: TooltipProps['position'] }) => (
  <Tooltip text={text} position={position}>
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      backgroundColor: '#3B82F6',
      color: '#fff',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'help',
      marginLeft: '6px'
    }}>
      i
    </span>
  </Tooltip>
);
