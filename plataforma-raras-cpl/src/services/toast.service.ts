// @ts-nocheck
import { toast, ToastOptions, ToastContent } from 'react-toastify';

/**
 * Toast Service
 * Wrapper para react-toastify com configurações personalizadas
 */

const defaultOptions: ToastOptions = {
  position: 'top-right' as ToastPosition,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const ToastService = {
  /**
   * Toast de sucesso
   */
  success(message: string, options?: ToastOptions) {
    toast.success(message, {
      ...defaultOptions,
      ...options,
      icon: '✅' as any,
    });
  },

  /**
   * Toast de erro
   */
  error(message: string, options?: ToastOptions) {
    toast.error(message, {
      ...defaultOptions,
      ...options,
      autoClose: 5000, // Erros ficam mais tempo
      icon: '❌' as any,
    });
  },

  /**
   * Toast de aviso/warning
   */
  warning(message: string, options?: ToastOptions) {
    toast.warning(message, {
      ...defaultOptions,
      ...options,
      icon: '⚠️' as any,
    });
  },

  /**
   * Toast de informação
   */
  info(message: string, options?: ToastOptions) {
    toast.info(message, {
      ...defaultOptions,
      ...options,
      icon: 'ℹ️' as any,
    });
  },

  /**
   * Toast personalizado
   */
  custom(message: string, options?: ToastOptions) {
    toast(message, {
      ...defaultOptions,
      ...options,
    });
  },

  /**
   * Toast de loading (promise)
   */
  loading(message: string = 'Carregando...') {
    return toast.loading(message, {
      position: 'top-right' as ToastPosition,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: false,
    });
  },

  /**
   * Atualizar toast de loading para sucesso/erro
   */
  update(toastId: string | number, type: 'success' | 'error' | 'warning' | 'info', message: string) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };

    toast.update(toastId, {
      render: message,
      type,
      icon: icons[type] as any,
      isLoading: false,
      autoClose: 3000,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  /**
   * Toast com promise (automático success/error)
   */
  async promise<T>(
    promise: Promise<T>,
    messages: {
      pending: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ): Promise<T> {
    return toast.promise(
      promise,
      {
        pending: {
          render: messages.pending,
          icon: '⏳',
        },
        success: {
          render: typeof messages.success === 'function' 
            ? ({ data }) => messages.success(data) 
            : messages.success,
          icon: '✅',
        },
        error: {
          render: typeof messages.error === 'function' 
            ? ({ data }) => messages.error(data) 
            : messages.error,
          icon: '❌',
        },
      },
      {
        ...defaultOptions,
        ...options,
      }
    );
  },

  /**
   * Fechar todos os toasts
   */
  dismissAll() {
    toast.dismiss();
  },

  /**
   * Fechar toast específico
   */
  dismiss(toastId?: string | number) {
    toast.dismiss(toastId);
  },

  /**
   * Verificar se já existe toast ativo
   */
  isActive(toastId: string | number): boolean {
    return toast.isActive(toastId);
  },
};

// Exemplos de uso:
// ToastService.success('Tradução salva com sucesso!');
// ToastService.error('Erro ao salvar tradução');
// ToastService.warning('Você tem 5 traduções pendentes');
// ToastService.info('Nova versão disponível');

// Com loading:
// const loadingId = ToastService.loading('Salvando...');
// // ... chamada API ...
// ToastService.update(loadingId, 'success', 'Salvo!');

// Com promise:
// ToastService.promise(
//   apiCall(),
//   {
//     pending: 'Salvando tradução...',
//     success: 'Tradução salva!',
//     error: 'Erro ao salvar'
//   }
// );

export default ToastService;
