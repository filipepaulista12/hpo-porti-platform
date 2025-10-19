import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteToAdmin() {
  try {
    const email = process.argv[2];

    if (!email) {
      console.log('\n❌ Erro: Email não fornecido!');
      console.log('\n💡 Uso correto:');
      console.log('   node scripts/promote-admin.mjs seuemail@example.com\n');
      process.exit(1);
    }

    console.log(`\n🔍 Procurando usuário com email: ${email}...`);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`\n❌ Usuário não encontrado: ${email}`);
      console.log('\n💡 Usuários disponíveis:');
      
      const allUsers = await prisma.user.findMany({
        select: { email: true, name: true, role: true }
      });
      
      allUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.name || 'Sem nome'}) - ${u.role}`);
      });
      
      process.exit(1);
    }

    if (user.role === 'ADMIN') {
      console.log(`\n✅ Usuário ${user.email} já é ADMIN!\n`);
      process.exit(0);
    }

    console.log(`\n🔄 Promovendo ${user.name || user.email} para ADMIN...`);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });

    console.log('\n✅ SUCESSO! Usuário promovido para ADMIN:');
    console.log(`   Nome: ${updatedUser.name || 'Sem nome'}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Role: ${updatedUser.role}`);
    console.log(`   ID: ${updatedUser.id}\n`);

  } catch (error) {
    console.error('\n❌ Erro ao promover usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

promoteToAdmin();
