const { PrismaClient } = require('@prisma/client');

// Use DATABASE_URL from .env
process.env.DATABASE_URL = "postgresql://postgres:hpo_password@localhost:5433/hpo_platform?schema=public";

const prisma = new PrismaClient();

async function checkTerms() {
  const count = await prisma.hpoTerm.count();
  console.log('Total HPO Terms:', count);
  await prisma.$disconnect();
}

checkTerms();
