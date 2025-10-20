/**
 * Tradução de Mensagens de Erro
 * Traduz erros técnicos comuns para mensagens amigáveis em português
 */

export class ErrorTranslator {
  /**
   * Traduz mensagens de erro técnicas para português amigável
   */
  static translate(error: any): string {
    if (!error) return 'Erro desconhecido';

    const errorMessage = error.message || error.error || String(error);
    const lowerMessage = errorMessage.toLowerCase();

    // Erros de rede
    if (lowerMessage.includes('failed to fetch')) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
    }

    if (lowerMessage.includes('network error') || lowerMessage.includes('networkerror')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }

    if (lowerMessage.includes('timeout')) {
      return 'A solicitação demorou muito. Tente novamente.';
    }

    // Erros de autenticação
    if (lowerMessage.includes('unauthorized') || lowerMessage.includes('401')) {
      return 'Credenciais inválidas. Verifique seu email e senha.';
    }

    if (lowerMessage.includes('invalid credentials')) {
      return 'Email ou senha incorretos.';
    }

    if (lowerMessage.includes('invalid password')) {
      return 'Senha incorreta.';
    }

    if (lowerMessage.includes('user not found')) {
      return 'Usuário não encontrado. Verifique o email digitado.';
    }

    if (lowerMessage.includes('email already exists') || lowerMessage.includes('duplicate email')) {
      return 'Este email já está cadastrado. Tente fazer login ou recuperar sua senha.';
    }

    if (lowerMessage.includes('token expired') || lowerMessage.includes('expired token')) {
      return 'Sua sessão expirou. Por favor, faça login novamente.';
    }

    if (lowerMessage.includes('invalid token')) {
      return 'Sessão inválida. Por favor, faça login novamente.';
    }

    // Erros de validação
    if (lowerMessage.includes('validation error') || lowerMessage.includes('invalid input')) {
      return 'Dados inválidos. Verifique os campos e tente novamente.';
    }

    if (lowerMessage.includes('required field') || lowerMessage.includes('missing field')) {
      return 'Por favor, preencha todos os campos obrigatórios.';
    }

    if (lowerMessage.includes('email format') || lowerMessage.includes('invalid email')) {
      return 'Email inválido. Digite um email válido.';
    }

    if (lowerMessage.includes('password too weak') || lowerMessage.includes('weak password')) {
      return 'Senha muito fraca. Use letras, números e caracteres especiais.';
    }

    if (lowerMessage.includes('password too short')) {
      return 'Senha muito curta. Use no mínimo 8 caracteres.';
    }

    // Erros de permissão
    if (lowerMessage.includes('forbidden') || lowerMessage.includes('403')) {
      return 'Você não tem permissão para realizar esta ação.';
    }

    if (lowerMessage.includes('access denied')) {
      return 'Acesso negado.';
    }

    // Erros de recurso
    if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
      return 'Recurso não encontrado.';
    }

    if (lowerMessage.includes('already exists')) {
      return 'Este item já existe.';
    }

    // Erros de servidor
    if (lowerMessage.includes('internal server error') || lowerMessage.includes('500')) {
      return 'Erro no servidor. Tente novamente em alguns instantes.';
    }

    if (lowerMessage.includes('service unavailable') || lowerMessage.includes('503')) {
      return 'Serviço temporariamente indisponível. Tente novamente em breve.';
    }

    if (lowerMessage.includes('bad gateway') || lowerMessage.includes('502')) {
      return 'Erro de comunicação com o servidor. Tente novamente.';
    }

    // Erros de limite
    if (lowerMessage.includes('too many requests') || lowerMessage.includes('rate limit')) {
      return 'Muitas tentativas. Aguarde alguns momentos e tente novamente.';
    }

    // Erros específicos da aplicação
    if (lowerMessage.includes('translation already exists') || lowerMessage.includes('duplicate translation')) {
      return 'Você já possui uma tradução para este termo.';
    }

    if (lowerMessage.includes('cannot vote on own') || lowerMessage.includes('own translation')) {
      return 'Você não pode votar na sua própria tradução.';
    }

    if (lowerMessage.includes('already voted') || lowerMessage.includes('duplicate vote')) {
      return 'Você já votou nesta tradução.';
    }
    
    if (lowerMessage.includes('insufficient privileges') || lowerMessage.includes('not admin')) {
      return 'Você não tem privilégios de administrador para esta ação.';
    }
    
    if (lowerMessage.includes('comment too short')) {
      return 'Comentário muito curto. Escreva no mínimo 3 caracteres.';
    }
    
    if (lowerMessage.includes('translation too short') || lowerMessage.includes('text too short')) {
      return 'Tradução muito curta. Forneça uma tradução adequada.';
    }

    if (lowerMessage.includes('orcid')) {
      return 'Erro ao conectar com ORCID. Tente novamente ou use login convencional.';
    }

    // Se a mensagem já estiver em português (sem palavras em inglês técnicas), retorna
    if (!this.hasEnglishTechnicalTerms(lowerMessage)) {
      return errorMessage;
    }

    // Mensagem genérica para erros não mapeados
    return `Erro: ${errorMessage}`;
  }

  /**
   * Verifica se a mensagem contém termos técnicos em inglês
   */
  private static hasEnglishTechnicalTerms(message: string): boolean {
    const technicalTerms = [
      'error', 'failed', 'invalid', 'unauthorized', 'forbidden',
      'not found', 'server', 'network', 'timeout', 'fetch',
      'validation', 'required', 'missing', 'duplicate', 'exists'
    ];

    return technicalTerms.some(term => message.includes(term));
  }

  /**
   * Traduz erro de login especificamente
   */
  static translateLoginError(error: any): string {
    const translated = this.translate(error);
    
    // Se for erro genérico de login, personaliza
    if (translated === 'Erro desconhecido' || translated.includes('Erro:')) {
      return 'Não foi possível fazer login. Verifique seu email e senha.';
    }

    return translated;
  }

  /**
   * Traduz erro de registro especificamente
   */
  static translateRegisterError(error: any): string {
    const translated = this.translate(error);
    
    // Se for erro genérico de registro, personaliza
    if (translated === 'Erro desconhecido' || translated.includes('Erro:')) {
      return 'Não foi possível completar o cadastro. Verifique os dados e tente novamente.';
    }

    return translated;
  }
}

export default ErrorTranslator;
