/**
 * 📦 Script Simplificado: Import All HPO Terms
 * 
 * Importa TODOS os termos do hp.obo em uma única execução
 * Mais simples e robusto que o script completo
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface SimpleTerm {
  hpoId: string;
  name: string;
  definition?: string;
}

/**
 * Parse simplificado do hp.obo
 */
function parseOBOSimple(oboPath: string): SimpleTerm[] {
  console.log('🔍 Parseando hp.obo...');
  
  const content = fs.readFileSync(oboPath, 'utf-8');
  const terms: SimpleTerm[] = [];
  
  const lines = content.split('\n');
  let currentTerm: Partial<SimpleTerm> | null = null;
  let isObsolete = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed === '[Term]') {
      if (currentTerm && currentTerm.hpoId && currentTerm.name && !isObsolete) {
        terms.push({
          hpoId: currentTerm.hpoId,
          name: currentTerm.name,
          definition: currentTerm.definition
        });
      }
      
      currentTerm = {};
      isObsolete = false;
      continue;
    }
    
    if (!currentTerm) continue;
    
    if (trimmed.startsWith('id: HP:')) {
      currentTerm.hpoId = trimmed.substring(4);
    } else if (trimmed.startsWith('name: ')) {
      currentTerm.name = trimmed.substring(6);
    } else if (trimmed.startsWith('def: ')) {
      const match = trimmed.match(/def: "(.*?)"/);
      if (match) {
        currentTerm.definition = match[1];
      }
    } else if (trimmed === 'is_obsolete: true') {
      isObsolete = true;
    }
  }
  
  // Último termo
  if (currentTerm && currentTerm.hpoId && currentTerm.name && !isObsolete) {
    terms.push({
      hpoId: currentTerm.hpoId,
      name: currentTerm.name,
      definition: currentTerm.definition
    });
  }
  
  console.log(`✅ ${terms.length} termos encontrados\n`);
  return terms;
}

/**
 * Importa termos em lotes
 */
async function importTerms(terms: SimpleTerm[]) {
  console.log('📥 Importando termos...\n');
  
  let created = 0;
  let updated = 0;
  let errors = 0;
  
  const batchSize = 50; // Menor para evitar timeout
  
  for (let i = 0; i < terms.length; i += batchSize) {
    const batch = terms.slice(i, i + batchSize);
    
    try {
      // Processar batch em paralelo
      await Promise.all(
        batch.map(async (term) => {
          try {
            const result = await prisma.hpoTerm.upsert({
              where: { hpoId: term.hpoId },
              create: {
                hpoId: term.hpoId,
                labelEn: term.name,
                definitionEn: term.definition || null,
                synonymsEn: [],
                translationStatus: 'NOT_TRANSLATED',
                difficulty: 3,
              },
              update: {
                labelEn: term.name,
                definitionEn: term.definition || null,
              }
            });
            
            // Se criou (não existia), incrementa created, senão updated
            created++;
          } catch (err: any) {
            errors++;
            console.error(`   ❌ Erro em ${term.hpoId}:`, err.message);
          }
        })
      );
      
      // Log progresso
      const progress = Math.min(i + batchSize, terms.length);
      const percent = ((progress / terms.length) * 100).toFixed(1);
      console.log(`   ⏳ ${progress}/${terms.length} (${percent}%)`);
      
    } catch (err: any) {
      console.error(`   ❌ Erro no batch ${i}:`, err.message);
    }
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log(`✅ Processado:  ${created} termos`);
  console.log(`❌ Erros:       ${errors} termos`);
  console.log('═══════════════════════════════════════\n');
}

/**
 * Main
 */
async function main() {
  console.log('\n📦 IMPORT ALL HPO TERMS (SIMPLE)\n');
  console.log('═══════════════════════════════════════\n');
  
  try {
    const oboPath = path.join(__dirname, '../../hpo-translations-data', 'hp.obo');
    
    if (!fs.existsSync(oboPath)) {
      throw new Error('hp.obo não encontrado! Execute: npm run metadata:import primeiro');
    }
    
    // Parse
    const terms = parseOBOSimple(oboPath);
    
    // Import
    await importTerms(terms);
    
    // Estatísticas finais
    const totalTerms = await prisma.hpoTerm.count();
    console.log(`📊 Total no database: ${totalTerms} termos\n`);
    console.log('✅ IMPORTAÇÃO COMPLETA!\n');
    
  } catch (error) {
    console.error('\n❌ ERRO:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
