/**
 * Script para criar usuários de teste com diferentes roles
 * Para testar o sistema de permissões no frontend
 * 
 * Execute: npx ts-node scripts/create-test-users.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestUsers() {
  console.log('\n════════════════════════════════════════════════════════');
  console.log('🔧 Criando Usuários de Teste para Sistema de Permissões');
  console.log('════════════════════════════════════════════════════════\n');

  const password = await bcrypt.hash('Test123!', 10);

  const testUsers = [
    {
      email: 'translator@test.com',
      name: 'João Tradutor',
      role: 'TRANSLATOR',
      institution: 'Universidade de Testes',
      specialty: 'Genética',
      country: 'Brasil',
      description: 'Usuário TRANSLATOR - pode traduzir, votar, comentar'
    },
    {
      email: 'reviewer@test.com',
      name: 'Maria Revisora',
      role: 'REVIEWER',
      institution: 'Instituto de Pesquisa',
      specialty: 'Genética Médica',
      country: 'Brasil',
      description: 'Usuário REVIEWER - tradutor experiente'
    },
    {
      email: 'moderator@test.com',
      name: 'Carlos Moderador',
      role: 'MODERATOR',
      institution: 'HPO Brasil',
      specialty: 'Administração',
      country: 'Brasil',
      description: 'Usuário MODERATOR - pode rejeitar traduções'
    },
    {
      email: 'committee@test.com',
      name: 'Ana Comitê',
      role: 'COMMITTEE_MEMBER',
      institution: 'Comitê HPO-PT',
      specialty: 'Genética Clínica',
      country: 'Portugal',
      description: 'Usuário COMMITTEE_MEMBER - pode votar em conflitos'
    },
    {
      email: 'admin@test.com',
      name: 'Admin Sistema',
      role: 'ADMIN',
      institution: 'HPO Platform',
      specialty: 'Gestão',
      country: 'Global',
      description: 'Usuário ADMIN - pode aprovar, rejeitar, banir'
    }
  ];

  console.log('📝 Criando/Atualizando usuários de teste...\n');

  for (const userData of testUsers) {
    try {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          name: userData.name,
          role: userData.role as any,
          institution: userData.institution,
          specialty: userData.specialty,
          country: userData.country,
          isActive: true,
          emailVerified: true
        },
        create: {
          email: userData.email,
          name: userData.name,
          password: password,
          role: userData.role as any,
          institution: userData.institution,
          specialty: userData.specialty,
          country: userData.country,
          isActive: true,
          emailVerified: true,
          points: 0,
          level: 1
        }
      });

      console.log(`✅ ${user.role.padEnd(18)} | ${user.email.padEnd(25)} | ${user.name}`);
      console.log(`   ${userData.description}`);
      console.log('');
    } catch (error) {
      console.error(`❌ Erro ao criar ${userData.email}:`, error);
    }
  }

  console.log('\n════════════════════════════════════════════════════════');
  console.log('✅ Usuários de Teste Criados com Sucesso!');
  console.log('════════════════════════════════════════════════════════\n');

  console.log('📋 CREDENCIAIS PARA TESTE:\n');
  console.log('┌────────────────────────────────────────────────────────┐');
  console.log('│ Usuário TRANSLATOR (não vê botões admin)              │');
  console.log('│ Email: translator@test.com                            │');
  console.log('│ Senha: Test123!                                       │');
  console.log('└────────────────────────────────────────────────────────┘\n');

  console.log('┌────────────────────────────────────────────────────────┐');
  console.log('│ Usuário MODERATOR (vê "Rejeitar" mas não "Aprovar")   │');
  console.log('│ Email: moderator@test.com                             │');
  console.log('│ Senha: Test123!                                       │');
  console.log('└────────────────────────────────────────────────────────┘\n');

  console.log('┌────────────────────────────────────────────────────────┐');
  console.log('│ Usuário ADMIN (vê TUDO)                               │');
  console.log('│ Email: admin@test.com                                 │');
  console.log('│ Senha: Test123!                                       │');
  console.log('└────────────────────────────────────────────────────────┘\n');

  console.log('🧪 TESTES MANUAIS:\n');
  console.log('1. Abra http://localhost:5173');
  console.log('2. Login com translator@test.com');
  console.log('   → Não deve ver botão "👑 Admin" no menu');
  console.log('   → Não deve ver botões "Aprovar" ou "Rejeitar"\n');
  
  console.log('3. Logout e login com moderator@test.com');
  console.log('   → Deve ver botão "👑 Admin"');
  console.log('   → Deve ver botão "Rejeitar"');
  console.log('   → NÃO deve ver botão "Aprovar"\n');
  
  console.log('4. Logout e login com admin@test.com');
  console.log('   → Deve ver TODOS os botões administrativos');
  console.log('   → Deve ver "Aprovar" E "Rejeitar"');
  console.log('   → Acesso total ao sistema\n');

  console.log('════════════════════════════════════════════════════════\n');
}

createTestUsers()
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
