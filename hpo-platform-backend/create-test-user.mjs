import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Verificar se usuário já existe
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@raras.org' }
    });

    if (existing) {
      console.log('✅ Usuário já existe!');
      console.log('📧 Email: admin@raras.org');
      console.log('🔑 Password: Admin123!');
      console.log('👤 Nome:', existing.name);
      console.log('🎭 Role:', existing.role);
      return;
    }

    // Criar novo usuário
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'admin@raras.org',
        password: hashedPassword,
        name: 'Admin Local',
        role: 'ADMIN',
        points: 0,
        level: 1
      }
    });

    console.log('✅ Usuário criado com sucesso!');
    console.log('📧 Email: admin@raras.org');
    console.log('🔑 Password: Admin123!');
    console.log('👤 Nome:', user.name);
    console.log('🎭 Role:', user.role);
    console.log('\n🚀 Agora você pode fazer login em http://localhost:5173');

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
