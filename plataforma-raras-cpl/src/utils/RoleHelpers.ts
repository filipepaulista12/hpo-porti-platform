/**
 * RoleHelpers.ts
 * 
 * Utilitário para verificação de permissões baseadas em roles no frontend.
 * Espelha as permissões definidas no backend (src/middleware/permissions.ts)
 * 
 * IMPORTANTE: Manter sincronizado com o backend!
 * Se adicionar nova permissão no backend, adicione também aqui.
 */

// ============================================
// HIERARQUIA DE ROLES
// ============================================

export const ROLE_HIERARCHY: Record<string, number> = {
  TRANSLATOR: 1,
  REVIEWER: 2,
  VALIDATOR: 3,
  MODERATOR: 4,
  COMMITTEE_MEMBER: 5,
  ADMIN: 6,
  SUPER_ADMIN: 7
};

// ============================================
// VERIFICAÇÕES BÁSICAS DE ROLE
// ============================================

/**
 * Verifica se o usuário é um Tradutor
 */
export const isTranslator = (userRole: string): boolean => {
  return userRole === 'TRANSLATOR';
};

/**
 * Verifica se o usuário é um Revisor
 */
export const isReviewer = (userRole: string): boolean => {
  return userRole === 'REVIEWER';
};

/**
 * Verifica se o usuário é um Validador
 */
export const isValidator = (userRole: string): boolean => {
  return userRole === 'VALIDATOR';
};

/**
 * Verifica se o usuário é um Moderador ou superior
 */
export const isModerator = (userRole: string): boolean => {
  const roleLevel = ROLE_HIERARCHY[userRole] || 0;
  return roleLevel >= ROLE_HIERARCHY.MODERATOR;
};

/**
 * Verifica se o usuário é Membro do Comitê ou superior
 */
export const isCommitteeMember = (userRole: string): boolean => {
  const roleLevel = ROLE_HIERARCHY[userRole] || 0;
  return roleLevel >= ROLE_HIERARCHY.COMMITTEE_MEMBER;
};

/**
 * Verifica se o usuário é Administrador ou Super Admin
 */
export const isAdmin = (userRole: string): boolean => {
  return userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
};

/**
 * Verifica se o usuário é Super Admin
 */
export const isSuperAdmin = (userRole: string): boolean => {
  return userRole === 'SUPER_ADMIN';
};

// ============================================
// PERMISSÕES ESPECÍFICAS
// ============================================

/**
 * Pode aprovar traduções?
 * Apenas ADMIN e SUPER_ADMIN
 */
export const canApproveTranslation = (userRole: string): boolean => {
  return isAdmin(userRole);
};

/**
 * Pode rejeitar traduções?
 * MODERATOR, ADMIN e SUPER_ADMIN
 */
export const canRejectTranslation = (userRole: string): boolean => {
  return isModerator(userRole);
};

/**
 * Pode revisar traduções?
 * REVIEWER ou superior (todos podem revisar)
 */
export const canReview = (userRole: string): boolean => {
  const roleLevel = ROLE_HIERARCHY[userRole] || 0;
  return roleLevel >= ROLE_HIERARCHY.REVIEWER;
};

/**
 * Pode acessar o Dashboard Administrativo?
 * MODERATOR ou superior
 */
export const canAccessAdminDashboard = (userRole: string): boolean => {
  return isModerator(userRole);
};

/**
 * Pode votar em conflitos de tradução?
 * COMMITTEE_MEMBER, ADMIN e SUPER_ADMIN
 */
export const canVoteOnConflict = (userRole: string): boolean => {
  return isCommitteeMember(userRole);
};

/**
 * Pode gerenciar usuários (banir, desbanir, editar)?
 * Apenas ADMIN e SUPER_ADMIN
 */
export const canManageUsers = (userRole: string): boolean => {
  return isAdmin(userRole);
};

/**
 * Pode banir/desbanir usuários?
 * Apenas ADMIN e SUPER_ADMIN
 */
export const canBanUsers = (userRole: string): boolean => {
  return isAdmin(userRole);
};

/**
 * Pode criar e gerenciar conflitos?
 * MODERATOR ou superior
 */
export const canManageConflicts = (userRole: string): boolean => {
  return isModerator(userRole);
};

/**
 * Pode deletar comentários de outros usuários?
 * MODERATOR ou superior
 */
export const canDeleteAnyComment = (userRole: string): boolean => {
  return isModerator(userRole);
};

/**
 * Pode fazer aprovação em lote (bulk approve)?
 * Apenas ADMIN e SUPER_ADMIN
 */
export const canBulkApprove = (userRole: string): boolean => {
  return isAdmin(userRole);
};

/**
 * Pode sincronizar com HPO oficial?
 * Apenas ADMIN e SUPER_ADMIN
 */
export const canSyncToHPO = (userRole: string): boolean => {
  return isAdmin(userRole);
};

/**
 * Pode ver estatísticas completas do sistema?
 * MODERATOR ou superior
 */
export const canViewFullStats = (userRole: string): boolean => {
  return isModerator(userRole);
};

/**
 * Pode exportar traduções?
 * Qualquer usuário autenticado
 */
export const canExportTranslations = (userRole: string): boolean => {
  return !!userRole; // Qualquer role válido
};

/**
 * Pode editar o próprio perfil?
 * Qualquer usuário autenticado
 */
export const canEditOwnProfile = (userRole: string): boolean => {
  return !!userRole;
};

/**
 * Pode submeter traduções?
 * Qualquer usuário autenticado
 */
export const canSubmitTranslation = (userRole: string): boolean => {
  return !!userRole;
};

/**
 * Pode votar em traduções?
 * Qualquer usuário autenticado
 */
export const canVoteOnTranslation = (userRole: string): boolean => {
  return !!userRole;
};

/**
 * Pode comentar?
 * Qualquer usuário autenticado
 */
export const canComment = (userRole: string): boolean => {
  return !!userRole;
};

// ============================================
// HELPERS AUXILIARES
// ============================================

/**
 * Retorna o nome em português do role
 */
export const getRoleDisplayName = (role: string): string => {
  const roleNames: Record<string, string> = {
    TRANSLATOR: 'Tradutor',
    REVIEWER: 'Revisor',
    VALIDATOR: 'Validador',
    MODERATOR: 'Moderador',
    COMMITTEE_MEMBER: 'Membro do Comitê',
    ADMIN: 'Administrador',
    SUPER_ADMIN: 'Super Administrador'
  };

  return roleNames[role] || role;
};

/**
 * Retorna descrição curta do role
 */
export const getRoleDescription = (role: string): string => {
  const descriptions: Record<string, string> = {
    TRANSLATOR: 'Pode traduzir termos e votar em traduções',
    REVIEWER: 'Tradutor experiente com alta taxa de aprovação',
    VALIDATOR: 'Especialista convidado para validações',
    MODERATOR: 'Pode aprovar, rejeitar e moderar traduções',
    COMMITTEE_MEMBER: 'Vota em conflitos de tradução',
    ADMIN: 'Gerencia plataforma e usuários',
    SUPER_ADMIN: 'Acesso total ao sistema'
  };

  return descriptions[role] || 'Role desconhecido';
};

/**
 * Retorna emoji representando o role
 */
export const getRoleEmoji = (role: string): string => {
  const emojis: Record<string, string> = {
    TRANSLATOR: '✍️',
    REVIEWER: '⭐',
    VALIDATOR: '🎓',
    MODERATOR: '🛡️',
    COMMITTEE_MEMBER: '⚖️',
    ADMIN: '👑',
    SUPER_ADMIN: '💎'
  };

  return emojis[role] || '👤';
};

/**
 * Compara dois roles e retorna se o primeiro é maior/igual ao segundo
 */
export const hasRoleOrHigher = (userRole: string, requiredRole: string): boolean => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
};

/**
 * Retorna lista de permissões do role em formato legível
 */
export const getRolePermissions = (userRole: string): string[] => {
  const permissions: string[] = [];

  // Permissões básicas (todos têm)
  if (canSubmitTranslation(userRole)) {
    permissions.push('Submeter traduções');
  }
  if (canVoteOnTranslation(userRole)) {
    permissions.push('Votar em traduções');
  }
  if (canComment(userRole)) {
    permissions.push('Comentar em traduções');
  }
  if (canExportTranslations(userRole)) {
    permissions.push('Exportar traduções');
  }

  // Permissões especiais
  if (canRejectTranslation(userRole)) {
    permissions.push('Rejeitar traduções');
  }
  if (canApproveTranslation(userRole)) {
    permissions.push('Aprovar traduções');
  }
  if (canVoteOnConflict(userRole)) {
    permissions.push('Votar em conflitos');
  }
  if (canManageConflicts(userRole)) {
    permissions.push('Gerenciar conflitos');
  }
  if (canDeleteAnyComment(userRole)) {
    permissions.push('Deletar qualquer comentário');
  }
  if (canManageUsers(userRole)) {
    permissions.push('Gerenciar usuários');
  }
  if (canBulkApprove(userRole)) {
    permissions.push('Aprovação em lote');
  }
  if (canSyncToHPO(userRole)) {
    permissions.push('Sincronizar com HPO');
  }
  if (canAccessAdminDashboard(userRole)) {
    permissions.push('Acessar painel administrativo');
  }

  return permissions;
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  // Hierarquia
  ROLE_HIERARCHY,
  
  // Verificações básicas
  isTranslator,
  isReviewer,
  isValidator,
  isModerator,
  isCommitteeMember,
  isAdmin,
  isSuperAdmin,
  
  // Permissões específicas
  canReview,
  canApproveTranslation,
  canRejectTranslation,
  canAccessAdminDashboard,
  canVoteOnConflict,
  canManageUsers,
  canBanUsers,
  canManageConflicts,
  canDeleteAnyComment,
  canBulkApprove,
  canSyncToHPO,
  canViewFullStats,
  canExportTranslations,
  canEditOwnProfile,
  canSubmitTranslation,
  canVoteOnTranslation,
  canComment,
  
  // Helpers
  getRoleDisplayName,
  getRoleDescription,
  getRoleEmoji,
  hasRoleOrHigher,
  getRolePermissions
};
