/**
 * RoleHelpers.test.ts
 * 
 * Testes unitários para o sistema de permissões baseado em roles.
 * Cobre todas as funções de verificação de permissões.
 */

import { describe, it, expect } from 'vitest';
import {
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
} from '../utils/RoleHelpers';

describe('RoleHelpers - Hierarquia', () => {
  it('deve ter hierarquia correta de roles', () => {
    expect(ROLE_HIERARCHY.TRANSLATOR).toBe(1);
    expect(ROLE_HIERARCHY.REVIEWER).toBe(2);
    expect(ROLE_HIERARCHY.VALIDATOR).toBe(3);
    expect(ROLE_HIERARCHY.MODERATOR).toBe(4);
    expect(ROLE_HIERARCHY.COMMITTEE_MEMBER).toBe(5);
    expect(ROLE_HIERARCHY.ADMIN).toBe(6);
    expect(ROLE_HIERARCHY.SUPER_ADMIN).toBe(7);
  });

  it('deve ordenar roles corretamente', () => {
    expect(ROLE_HIERARCHY.SUPER_ADMIN).toBeGreaterThan(ROLE_HIERARCHY.ADMIN);
    expect(ROLE_HIERARCHY.ADMIN).toBeGreaterThan(ROLE_HIERARCHY.MODERATOR);
    expect(ROLE_HIERARCHY.MODERATOR).toBeGreaterThan(ROLE_HIERARCHY.TRANSLATOR);
  });
});

describe('RoleHelpers - Verificações Básicas de Role', () => {
  describe('isTranslator', () => {
    it('deve retornar true para TRANSLATOR', () => {
      expect(isTranslator('TRANSLATOR')).toBe(true);
    });

    it('deve retornar false para outros roles', () => {
      expect(isTranslator('ADMIN')).toBe(false);
      expect(isTranslator('MODERATOR')).toBe(false);
    });
  });

  describe('isReviewer', () => {
    it('deve retornar true para REVIEWER', () => {
      expect(isReviewer('REVIEWER')).toBe(true);
    });

    it('deve retornar false para outros roles', () => {
      expect(isReviewer('TRANSLATOR')).toBe(false);
      expect(isReviewer('ADMIN')).toBe(false);
    });
  });

  describe('isModerator', () => {
    it('deve retornar true para MODERATOR e superiores', () => {
      expect(isModerator('MODERATOR')).toBe(true);
      expect(isModerator('COMMITTEE_MEMBER')).toBe(true);
      expect(isModerator('ADMIN')).toBe(true);
      expect(isModerator('SUPER_ADMIN')).toBe(true);
    });

    it('deve retornar false para roles inferiores', () => {
      expect(isModerator('TRANSLATOR')).toBe(false);
      expect(isModerator('REVIEWER')).toBe(false);
      expect(isModerator('VALIDATOR')).toBe(false);
    });
  });

  describe('isCommitteeMember', () => {
    it('deve retornar true para COMMITTEE_MEMBER e superiores', () => {
      expect(isCommitteeMember('COMMITTEE_MEMBER')).toBe(true);
      expect(isCommitteeMember('ADMIN')).toBe(true);
      expect(isCommitteeMember('SUPER_ADMIN')).toBe(true);
    });

    it('deve retornar false para roles inferiores', () => {
      expect(isCommitteeMember('TRANSLATOR')).toBe(false);
      expect(isCommitteeMember('MODERATOR')).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('deve retornar true para ADMIN e SUPER_ADMIN', () => {
      expect(isAdmin('ADMIN')).toBe(true);
      expect(isAdmin('SUPER_ADMIN')).toBe(true);
    });

    it('deve retornar false para outros roles', () => {
      expect(isAdmin('TRANSLATOR')).toBe(false);
      expect(isAdmin('MODERATOR')).toBe(false);
      expect(isAdmin('COMMITTEE_MEMBER')).toBe(false);
    });
  });

  describe('isSuperAdmin', () => {
    it('deve retornar true apenas para SUPER_ADMIN', () => {
      expect(isSuperAdmin('SUPER_ADMIN')).toBe(true);
    });

    it('deve retornar false para todos os outros roles', () => {
      expect(isSuperAdmin('ADMIN')).toBe(false);
      expect(isSuperAdmin('MODERATOR')).toBe(false);
      expect(isSuperAdmin('TRANSLATOR')).toBe(false);
    });
  });
});

describe('RoleHelpers - Permissões de Moderação', () => {
  describe('canApproveTranslation', () => {
    it('deve permitir apenas ADMIN e SUPER_ADMIN', () => {
      expect(canApproveTranslation('ADMIN')).toBe(true);
      expect(canApproveTranslation('SUPER_ADMIN')).toBe(true);
    });

    it('deve negar para outros roles', () => {
      expect(canApproveTranslation('TRANSLATOR')).toBe(false);
      expect(canApproveTranslation('REVIEWER')).toBe(false);
      expect(canApproveTranslation('VALIDATOR')).toBe(false);
      expect(canApproveTranslation('MODERATOR')).toBe(false);
      expect(canApproveTranslation('COMMITTEE_MEMBER')).toBe(false);
    });
  });

  describe('canRejectTranslation', () => {
    it('deve permitir MODERATOR e superiores', () => {
      expect(canRejectTranslation('MODERATOR')).toBe(true);
      expect(canRejectTranslation('COMMITTEE_MEMBER')).toBe(true);
      expect(canRejectTranslation('ADMIN')).toBe(true);
      expect(canRejectTranslation('SUPER_ADMIN')).toBe(true);
    });

    it('deve negar para roles inferiores', () => {
      expect(canRejectTranslation('TRANSLATOR')).toBe(false);
      expect(canRejectTranslation('REVIEWER')).toBe(false);
      expect(canRejectTranslation('VALIDATOR')).toBe(false);
    });
  });

  describe('canAccessAdminDashboard', () => {
    it('deve permitir MODERATOR e superiores', () => {
      expect(canAccessAdminDashboard('MODERATOR')).toBe(true);
      expect(canAccessAdminDashboard('COMMITTEE_MEMBER')).toBe(true);
      expect(canAccessAdminDashboard('ADMIN')).toBe(true);
      expect(canAccessAdminDashboard('SUPER_ADMIN')).toBe(true);
    });

    it('deve negar para roles básicos', () => {
      expect(canAccessAdminDashboard('TRANSLATOR')).toBe(false);
      expect(canAccessAdminDashboard('REVIEWER')).toBe(false);
      expect(canAccessAdminDashboard('VALIDATOR')).toBe(false);
    });
  });
});

describe('RoleHelpers - Permissões de Conflitos', () => {
  describe('canVoteOnConflict', () => {
    it('deve permitir COMMITTEE_MEMBER e superiores', () => {
      expect(canVoteOnConflict('COMMITTEE_MEMBER')).toBe(true);
      expect(canVoteOnConflict('ADMIN')).toBe(true);
      expect(canVoteOnConflict('SUPER_ADMIN')).toBe(true);
    });

    it('deve negar para roles inferiores', () => {
      expect(canVoteOnConflict('TRANSLATOR')).toBe(false);
      expect(canVoteOnConflict('MODERATOR')).toBe(false);
    });
  });

  describe('canManageConflicts', () => {
    it('deve permitir MODERATOR e superiores', () => {
      expect(canManageConflicts('MODERATOR')).toBe(true);
      expect(canManageConflicts('ADMIN')).toBe(true);
      expect(canManageConflicts('SUPER_ADMIN')).toBe(true);
    });

    it('deve negar para roles básicos', () => {
      expect(canManageConflicts('TRANSLATOR')).toBe(false);
      expect(canManageConflicts('REVIEWER')).toBe(false);
    });
  });
});

describe('RoleHelpers - Permissões Administrativas', () => {
  describe('canManageUsers', () => {
    it('deve permitir apenas ADMIN e SUPER_ADMIN', () => {
      expect(canManageUsers('ADMIN')).toBe(true);
      expect(canManageUsers('SUPER_ADMIN')).toBe(true);
    });

    it('deve negar para outros roles', () => {
      expect(canManageUsers('TRANSLATOR')).toBe(false);
      expect(canManageUsers('MODERATOR')).toBe(false);
      expect(canManageUsers('COMMITTEE_MEMBER')).toBe(false);
    });
  });

  describe('canBanUsers', () => {
    it('deve permitir apenas ADMIN e SUPER_ADMIN', () => {
      expect(canBanUsers('ADMIN')).toBe(true);
      expect(canBanUsers('SUPER_ADMIN')).toBe(true);
    });

    it('deve negar para outros roles', () => {
      expect(canBanUsers('MODERATOR')).toBe(false);
      expect(canBanUsers('TRANSLATOR')).toBe(false);
    });
  });

  describe('canBulkApprove', () => {
    it('deve permitir apenas ADMIN e SUPER_ADMIN', () => {
      expect(canBulkApprove('ADMIN')).toBe(true);
      expect(canBulkApprove('SUPER_ADMIN')).toBe(true);
    });

    it('deve negar para outros roles', () => {
      expect(canBulkApprove('MODERATOR')).toBe(false);
      expect(canBulkApprove('TRANSLATOR')).toBe(false);
    });
  });

  describe('canSyncToHPO', () => {
    it('deve permitir apenas ADMIN e SUPER_ADMIN', () => {
      expect(canSyncToHPO('ADMIN')).toBe(true);
      expect(canSyncToHPO('SUPER_ADMIN')).toBe(true);
    });

    it('deve negar para outros roles', () => {
      expect(canSyncToHPO('MODERATOR')).toBe(false);
      expect(canSyncToHPO('TRANSLATOR')).toBe(false);
    });
  });

  describe('canDeleteAnyComment', () => {
    it('deve permitir MODERATOR e superiores', () => {
      expect(canDeleteAnyComment('MODERATOR')).toBe(true);
      expect(canDeleteAnyComment('ADMIN')).toBe(true);
      expect(canDeleteAnyComment('SUPER_ADMIN')).toBe(true);
    });

    it('deve negar para roles básicos', () => {
      expect(canDeleteAnyComment('TRANSLATOR')).toBe(false);
      expect(canDeleteAnyComment('REVIEWER')).toBe(false);
    });
  });

  describe('canViewFullStats', () => {
    it('deve permitir MODERATOR e superiores', () => {
      expect(canViewFullStats('MODERATOR')).toBe(true);
      expect(canViewFullStats('ADMIN')).toBe(true);
      expect(canViewFullStats('SUPER_ADMIN')).toBe(true);
    });

    it('deve negar para roles básicos', () => {
      expect(canViewFullStats('TRANSLATOR')).toBe(false);
      expect(canViewFullStats('REVIEWER')).toBe(false);
    });
  });
});

describe('RoleHelpers - Permissões Básicas (Todos)', () => {
  describe('canExportTranslations', () => {
    it('deve permitir para qualquer role válido', () => {
      expect(canExportTranslations('TRANSLATOR')).toBe(true);
      expect(canExportTranslations('REVIEWER')).toBe(true);
      expect(canExportTranslations('ADMIN')).toBe(true);
    });

    it('deve negar para role vazio', () => {
      expect(canExportTranslations('')).toBe(false);
    });
  });

  describe('canEditOwnProfile', () => {
    it('deve permitir para qualquer role válido', () => {
      expect(canEditOwnProfile('TRANSLATOR')).toBe(true);
      expect(canEditOwnProfile('ADMIN')).toBe(true);
    });
  });

  describe('canSubmitTranslation', () => {
    it('deve permitir para qualquer role válido', () => {
      expect(canSubmitTranslation('TRANSLATOR')).toBe(true);
      expect(canSubmitTranslation('REVIEWER')).toBe(true);
      expect(canSubmitTranslation('ADMIN')).toBe(true);
    });
  });

  describe('canVoteOnTranslation', () => {
    it('deve permitir para qualquer role válido', () => {
      expect(canVoteOnTranslation('TRANSLATOR')).toBe(true);
      expect(canVoteOnTranslation('MODERATOR')).toBe(true);
    });
  });

  describe('canComment', () => {
    it('deve permitir para qualquer role válido', () => {
      expect(canComment('TRANSLATOR')).toBe(true);
      expect(canComment('ADMIN')).toBe(true);
    });
  });
});

describe('RoleHelpers - Helpers Auxiliares', () => {
  describe('getRoleDisplayName', () => {
    it('deve retornar nomes em português', () => {
      expect(getRoleDisplayName('TRANSLATOR')).toBe('Tradutor');
      expect(getRoleDisplayName('REVIEWER')).toBe('Revisor');
      expect(getRoleDisplayName('VALIDATOR')).toBe('Validador');
      expect(getRoleDisplayName('MODERATOR')).toBe('Moderador');
      expect(getRoleDisplayName('COMMITTEE_MEMBER')).toBe('Membro do Comitê');
      expect(getRoleDisplayName('ADMIN')).toBe('Administrador');
      expect(getRoleDisplayName('SUPER_ADMIN')).toBe('Super Administrador');
    });

    it('deve retornar o próprio role se não encontrar', () => {
      expect(getRoleDisplayName('UNKNOWN_ROLE')).toBe('UNKNOWN_ROLE');
    });
  });

  describe('getRoleDescription', () => {
    it('deve retornar descrições válidas', () => {
      expect(getRoleDescription('TRANSLATOR')).toContain('traduzir');
      expect(getRoleDescription('ADMIN')).toContain('plataforma');
      expect(getRoleDescription('MODERATOR')).toContain('moderar');
    });
  });

  describe('getRoleEmoji', () => {
    it('deve retornar emojis para cada role', () => {
      expect(getRoleEmoji('TRANSLATOR')).toBe('✍️');
      expect(getRoleEmoji('REVIEWER')).toBe('⭐');
      expect(getRoleEmoji('MODERATOR')).toBe('🛡️');
      expect(getRoleEmoji('ADMIN')).toBe('👑');
      expect(getRoleEmoji('SUPER_ADMIN')).toBe('💎');
    });
  });

  describe('hasRoleOrHigher', () => {
    it('deve comparar roles corretamente - igual', () => {
      expect(hasRoleOrHigher('ADMIN', 'ADMIN')).toBe(true);
      expect(hasRoleOrHigher('MODERATOR', 'MODERATOR')).toBe(true);
    });

    it('deve comparar roles corretamente - superior', () => {
      expect(hasRoleOrHigher('ADMIN', 'MODERATOR')).toBe(true);
      expect(hasRoleOrHigher('SUPER_ADMIN', 'ADMIN')).toBe(true);
      expect(hasRoleOrHigher('MODERATOR', 'TRANSLATOR')).toBe(true);
    });

    it('deve comparar roles corretamente - inferior', () => {
      expect(hasRoleOrHigher('TRANSLATOR', 'ADMIN')).toBe(false);
      expect(hasRoleOrHigher('MODERATOR', 'ADMIN')).toBe(false);
    });
  });

  describe('getRolePermissions', () => {
    it('deve retornar lista de permissões para TRANSLATOR', () => {
      const permissions = getRolePermissions('TRANSLATOR');
      expect(permissions).toContain('Submeter traduções');
      expect(permissions).toContain('Votar em traduções');
      expect(permissions).not.toContain('Aprovar traduções');
    });

    it('deve retornar lista de permissões para MODERATOR', () => {
      const permissions = getRolePermissions('MODERATOR');
      expect(permissions).toContain('Rejeitar traduções');
      expect(permissions).toContain('Acessar painel administrativo');
      expect(permissions).not.toContain('Aprovar traduções');
    });

    it('deve retornar lista completa para ADMIN', () => {
      const permissions = getRolePermissions('ADMIN');
      expect(permissions).toContain('Aprovar traduções');
      expect(permissions).toContain('Rejeitar traduções');
      expect(permissions).toContain('Gerenciar usuários');
      expect(permissions).toContain('Sincronizar com HPO');
    });

    it('deve incluir todas as permissões para SUPER_ADMIN', () => {
      const permissions = getRolePermissions('SUPER_ADMIN');
      expect(permissions.length).toBeGreaterThan(10);
    });
  });
});

describe('RoleHelpers - Casos de Borda', () => {
  it('deve lidar com role undefined', () => {
    expect(canApproveTranslation(undefined as any)).toBe(false);
    expect(canRejectTranslation(undefined as any)).toBe(false);
  });

  it('deve lidar com role null', () => {
    expect(canApproveTranslation(null as any)).toBe(false);
    expect(canRejectTranslation(null as any)).toBe(false);
  });

  it('deve lidar com role vazio', () => {
    expect(canApproveTranslation('')).toBe(false);
    expect(canAccessAdminDashboard('')).toBe(false);
  });

  it('deve lidar com role inválido', () => {
    expect(canApproveTranslation('INVALID_ROLE')).toBe(false);
    expect(isModerator('INVALID_ROLE')).toBe(false);
  });

  it('deve lidar com case sensitivity', () => {
    // Roles devem ser case-sensitive
    expect(canApproveTranslation('admin')).toBe(false);
    expect(canApproveTranslation('Admin')).toBe(false);
    expect(canApproveTranslation('ADMIN')).toBe(true);
  });
});

describe('RoleHelpers - Cenários Reais de Uso', () => {
  it('TRANSLATOR não deve ter acesso a funcionalidades admin', () => {
    const role = 'TRANSLATOR';
    
    expect(canApproveTranslation(role)).toBe(false);
    expect(canRejectTranslation(role)).toBe(false);
    expect(canAccessAdminDashboard(role)).toBe(false);
    expect(canManageUsers(role)).toBe(false);
    expect(canVoteOnConflict(role)).toBe(false);
    
    // Mas deve ter acesso básico
    expect(canSubmitTranslation(role)).toBe(true);
    expect(canVoteOnTranslation(role)).toBe(true);
    expect(canComment(role)).toBe(true);
  });

  it('MODERATOR deve poder rejeitar mas não aprovar', () => {
    const role = 'MODERATOR';
    
    expect(canRejectTranslation(role)).toBe(true);
    expect(canApproveTranslation(role)).toBe(false);
    expect(canAccessAdminDashboard(role)).toBe(true);
    expect(canManageUsers(role)).toBe(false);
  });

  it('ADMIN deve ter permissões completas de moderação', () => {
    const role = 'ADMIN';
    
    expect(canApproveTranslation(role)).toBe(true);
    expect(canRejectTranslation(role)).toBe(true);
    expect(canAccessAdminDashboard(role)).toBe(true);
    expect(canManageUsers(role)).toBe(true);
    expect(canBanUsers(role)).toBe(true);
    expect(canSyncToHPO(role)).toBe(true);
  });

  it('COMMITTEE_MEMBER deve poder votar em conflitos', () => {
    const role = 'COMMITTEE_MEMBER';
    
    expect(canVoteOnConflict(role)).toBe(true);
    expect(canAccessAdminDashboard(role)).toBe(true);
    
    // Mas não deve aprovar traduções normais
    expect(canApproveTranslation(role)).toBe(false);
  });

  it('SUPER_ADMIN deve ter todas as permissões', () => {
    const role = 'SUPER_ADMIN';
    
    expect(canApproveTranslation(role)).toBe(true);
    expect(canRejectTranslation(role)).toBe(true);
    expect(canAccessAdminDashboard(role)).toBe(true);
    expect(canManageUsers(role)).toBe(true);
    expect(canVoteOnConflict(role)).toBe(true);
    expect(canSyncToHPO(role)).toBe(true);
    expect(canBulkApprove(role)).toBe(true);
    expect(canDeleteAnyComment(role)).toBe(true);
  });
});
