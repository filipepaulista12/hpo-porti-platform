import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteToAdmin() {
  try {
    const user = await prisma.user.update({
      where: { email: 'teste@hpo.com' },
      data: { role: 'ADMIN' }
    });

    console.log('✅ User promoted successfully!');
    console.log({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      points: user.points
    });
  } catch (error) {
    console.error('❌ Error promoting user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

promoteToAdmin();
