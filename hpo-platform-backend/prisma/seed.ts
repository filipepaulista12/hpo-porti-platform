import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface BabelonRow {
  source_language: string;
  translation_language: string;
  subject_id: string; // HP:0000001
  predicate_id: string;
  source_value: string;
  translation_value: string;
  translation_status: string;
  translator: string;
}

/**
 * FASE 1: Importa TODOS os termos HPO oficiais (em inglês)
 * Extrai todos os subject_id + source_value únicos do arquivo babelon
 */
async function importAllHPOTerms() {
  console.log('\n📥 FASE 1: Importando TODOS os termos HPO oficiais (inglês)...');
  
  const babelonPath = path.join(__dirname, '../../hpo-translations', 'babelon', 'hp-pt.babelon.tsv');
  
  if (!fs.existsSync(babelonPath)) {
    console.error('❌ Arquivo Babelon não encontrado:', babelonPath);
    throw new Error(`Arquivo hp-pt.babelon.tsv não encontrado em: ${babelonPath}`);
  }
  
  // Ler e parsear TSV
  const fileContent = fs.readFileSync(babelonPath, 'utf-8');
  const records: BabelonRow[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    delimiter: '\t'
  });
  
  console.log(`📊 Encontrados ${records.length} registros no Babelon`);
  
  // Extrair termos únicos (em inglês)
  const uniqueTerms = new Map<string, BabelonRow>();
  
  for (const record of records) {
    if (!uniqueTerms.has(record.subject_id)) {
      uniqueTerms.set(record.subject_id, record);
    }
  }
  
  console.log(`🔍 Identificados ${uniqueTerms.size} termos HPO únicos`);
  
  let imported = 0;
  let skipped = 0;
  
  // Importar termos em lotes de 100
  const termsArray = Array.from(uniqueTerms.values());
  const batchSize = 100;
  
  for (let i = 0; i < termsArray.length; i += batchSize) {
    const batch = termsArray.slice(i, i + batchSize);
    
    for (const record of batch) {
      try {
        // Verificar se já existe
        const existing = await prisma.hpoTerm.findUnique({
          where: { hpoId: record.subject_id }
        });
        
        if (existing) {
          skipped++;
          continue;
        }
        
        // Criar termo HPO oficial (SEM tradução ainda)
        await prisma.hpoTerm.create({
          data: {
            hpoId: record.subject_id,
            labelEn: record.source_value,
            definitionEn: null, // Poderia buscar da API oficial HPO depois
            synonymsEn: [],
            category: null,
            difficulty: 3, // Dificuldade padrão
            translationStatus: 'NOT_TRANSLATED' // Ainda não traduzido
          }
        });
        
        imported++;
      } catch (error: any) {
        console.error(`❌ Erro ao importar termo ${record.subject_id}:`, error.message);
      }
    }
    
    console.log(`   ✅ Processados ${Math.min(i + batchSize, termsArray.length)}/${termsArray.length} termos...`);
  }
  
  console.log(`\n✅ FASE 1 COMPLETA:`);
  console.log(`   - Termos importados: ${imported}`);
  console.log(`   - Já existiam: ${skipped}`);
  console.log(`   - Total de termos no banco: ${imported + skipped}\n`);
  
  return uniqueTerms.size;
}

/**
 * FASE 2: Importa as traduções portuguesas existentes
 * Marca como LEGACY_PENDING (precisam validação)
 */
async function importPortugueseTranslations(systemUserId: string) {
  console.log('\n📥 FASE 2: Importando traduções portuguesas existentes...');
  
  const babelonPath = path.join(__dirname, '../../hpo-translations', 'babelon', 'hp-pt.babelon.tsv');
  
  const fileContent = fs.readFileSync(babelonPath, 'utf-8');
  const records: BabelonRow[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    delimiter: '\t'
  });
  
  let imported = 0;
  let errors = 0;
  let notFound = 0;
  
  for (const record of records) {
    try {
      // Buscar termo HPO
      const term = await prisma.hpoTerm.findUnique({
        where: { hpoId: record.subject_id }
      });
      
      if (!term) {
        notFound++;
        console.warn(`⚠️  Termo ${record.subject_id} não encontrado no banco`);
        continue;
      }
      
      // Verificar se já existe tradução
      const existingTranslation = await prisma.translation.findFirst({
        where: {
          termId: term.id,
          isLegacy: true
        }
      });
      
      if (existingTranslation) {
        continue; // Já existe, pula
      }
      
      // Criar tradução LEGACY
      await prisma.translation.create({
        data: {
          termId: term.id,
          userId: systemUserId,
          labelPt: record.translation_value,
          definitionPt: null,
          synonymsPt: [],
          confidence: 3,
          status: 'LEGACY_PENDING', // Precisa validação!
          source: 'LEGACY',
          isLegacy: true
        }
      });
      
      // Atualizar status do termo
      await prisma.hpoTerm.update({
        where: { id: term.id },
        data: { translationStatus: 'LEGACY_PENDING' }
      });
      
      imported++;
      
      if (imported % 100 === 0) {
        console.log(`   ✅ Importadas ${imported} traduções...`);
      }
    } catch (error: any) {
      errors++;
      if (errors < 10) { // Mostrar apenas primeiros 10 erros
        console.error(`❌ Erro ao importar tradução ${record.subject_id}:`, error.message);
      }
    }
  }
  
  console.log(`\n✅ FASE 2 COMPLETA:`);
  console.log(`   - Traduções importadas: ${imported}`);
  console.log(`   - Termos não encontrados: ${notFound}`);
  console.log(`   - Erros: ${errors}\n`);
  
  return imported;
}

/**
 * Função principal de seed
 */
async function seedDatabase() {
  console.log('🌱 INICIANDO SEED DO BANCO DE DADOS');
  console.log('════════════════════════════════════════════════════════');
  console.log('📋 ESTRATÉGIA:');
  console.log('   1. Criar usuário Sistema');
  console.log('   2. Criar badges iniciais');
  console.log('   3. FASE 1: Importar TODOS termos HPO oficiais (inglês)');
  console.log('   4. FASE 2: Importar traduções PT como "legacy pending"');
  console.log('════════════════════════════════════════════════════════\n');
  
  try {
    // 1. Criar usuário Sistema
    console.log('👤 Criando usuário Sistema...');
    const systemUser = await prisma.user.upsert({
      where: { email: 'system@hpo-platform.org' },
      update: {},
      create: {
        email: 'system@hpo-platform.org',
        name: 'Sistema (Importação Legacy)',
        password: '$2b$10$invalidhashjusttoblocklogin', // Hash inválido para bloquear login
        role: 'ADMIN',
        institution: 'HPO Platform',
        specialty: 'Sistema',
        country: 'Global',
        isActive: false // Usuário técnico, não ativo
      }
    });
    console.log('✅ Usuário Sistema criado:', systemUser.email);
    
    // 2. Criar badges
    console.log('\n🏆 Criando badges...');
    const badges = [
      {
        code: 'FIRST_TRANSLATION',
        name: 'Primeira Tradução',
        description: 'Completou sua primeira tradução',
        points: 10,
        rarity: 'COMMON'
      },
      {
        code: 'STREAK_7',
        name: 'Em Chamas',
        description: '7 dias consecutivos contribuindo',
        points: 50,
        rarity: 'RARE'
      },
      {
        code: 'PERFECTIONIST',
        name: 'Perfeccionista',
        description: '100% de aprovação em 20+ traduções',
        points: 100,
        rarity: 'EPIC'
      },
      {
        code: 'TOP_10',
        name: 'Top 10',
        description: 'Entrou para o top 10 do leaderboard',
        points: 150,
        rarity: 'EPIC'
      },
      {
        code: 'MASTER',
        name: 'Mestre HPO',
        description: '500+ traduções aprovadas',
        points: 500,
        rarity: 'LEGENDARY'
      }
    ];
    
    for (const badge of badges) {
      await prisma.badge.upsert({
        where: { code: badge.code },
        update: {},
        create: badge as any
      });
    }
    console.log('✅ 5 badges criados');
    
    // 3. FASE 1: Importar termos oficiais
    const totalTerms = await importAllHPOTerms();
    
    // 4. FASE 2: Importar traduções portuguesas
    const totalTranslations = await importPortugueseTranslations(systemUser.id);
    
    // Resumo final
    console.log('════════════════════════════════════════════════════════');
    console.log('🎉 SEED COMPLETO COM SUCESSO!');
    console.log('════════════════════════════════════════════════════════');
    console.log(`📊 ESTATÍSTICAS FINAIS:`);
    console.log(`   - Termos HPO totais: ${totalTerms}`);
    console.log(`   - Traduções legacy: ${totalTranslations}`);
    console.log(`   - Termos SEM tradução: ${totalTerms - totalTranslations}`);
    console.log(`   - Badges disponíveis: 5`);
    console.log(`   - Usuários: 1 (Sistema)\n`);
    console.log('💡 PRÓXIMOS PASSOS:');
    console.log('   1. Iniciar servidor: npm run dev');
    console.log('   2. Registrar usuários reais');
    console.log('   3. Começar traduções dos termos sem tradução');
    console.log('   4. Validar traduções legacy\n');
    
  } catch (error) {
    console.error('❌ ERRO DURANTE O SEED:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar seed
seedDatabase()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
