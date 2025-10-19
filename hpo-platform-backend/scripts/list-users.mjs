import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('\n========================================');
    console.log('📋 USUÁRIOS CADASTRADOS');
    console.log('========================================\n');

    if (users.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado!\n');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'Sem nome'}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Criado: ${user.createdAt.toLocaleString('pt-BR')}`);
        console.log('');
      });
    }

    console.log(`Total: ${users.length} usuário(s)\n`);
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
