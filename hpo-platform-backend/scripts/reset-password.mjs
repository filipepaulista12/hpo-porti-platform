import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = process.argv[2];
    const newPassword = process.argv[3] || 'Test123!@#';

    if (!email) {
      console.log('\n❌ Erro: Email não fornecido!');
      console.log('\n💡 Uso correto:');
      console.log('   node scripts/reset-password.mjs EMAIL [NOVA_SENHA]');
      console.log('\n   Exemplos:');
      console.log('   node scripts/reset-password.mjs admin@hpo.test');
      console.log('   node scripts/reset-password.mjs admin@hpo.test MinhaSenh@123\n');
      process.exit(1);
    }

    console.log(`\n🔍 Procurando usuário: ${email}...`);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user) {
      console.log(`\n❌ Usuário não encontrado: ${email}\n`);
      process.exit(1);
    }

    console.log(`\n📋 Usuário encontrado:`);
    console.log(`   Nome: ${user.name || 'Sem nome'}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    
    console.log(`\n🔐 Resetando senha para: ${newPassword}`);
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword
      }
    });

    console.log('\n✅ SUCESSO! Senha resetada.');
    console.log('\n📝 Credenciais de acesso:');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${newPassword}`);
    console.log(`   Role: ${user.role}\n`);

  } catch (error) {
    console.error('\n❌ Erro ao resetar senha:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
