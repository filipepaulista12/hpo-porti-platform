import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface BabelonRow {
  source_language: string;
  source_value: string;
  subject_id: string; // HP:0000001
  predicate_id: string;
  translation_language: string;
  translation_value: string;
  translation_status: string;
  translator?: string;
  translator_expertise?: string;
  translation_date?: string;
}

/**
 * Importa TODOS os termos HPO oficiais do arquivo mais completo (holandês)
 * Extrai apenas os termos únicos em INGLÊS (source_value)
 */
async function importAllHPOTermsFromDutch() {
  console.log('\n🌍 Importando TODOS os termos HPO oficiais...');
  console.log('📂 Fonte: hp-nl.babelon.tsv (arquivo mais completo: ~31.000 termos)');
  
  // ✅ Path ajustado: subir 2 níveis (prisma/ -> backend/ -> hpo_translation/) e entrar em hpo-translations-data/
  const dutchBabelonPath = path.join(__dirname, '../../hpo-translations-data', 'babelon', 'hp-nl.babelon.tsv');
  
  console.log(`🔍 Procurando arquivo em: ${dutchBabelonPath}`);
  
  if (!fs.existsSync(dutchBabelonPath)) {
    console.error(`❌ Arquivo não encontrado: ${dutchBabelonPath}`);
    console.log('\n💡 SOLUÇÃO: Execute o comando para baixar:');
    console.log('   Invoke-WebRequest -Uri "https://raw.githubusercontent.com/obophenotype/hpo-translations/main/babelon/hp-nl.babelon.tsv" -OutFile "hpo-translations-data/babelon/hp-nl.babelon.tsv"');
    throw new Error(`Arquivo hp-nl.babelon.tsv não encontrado em: ${dutchBabelonPath}`);
  }
  
  // Ler e parsear TSV
  const fileContent = fs.readFileSync(dutchBabelonPath, 'utf-8');
  const records: BabelonRow[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    delimiter: '\t',
    relax_column_count: true // Permite colunas faltantes
  });
  
  console.log(`📊 Total de registros no arquivo: ${records.length}`);
  
  // Extrair termos únicos (apenas rdfs:label - os labels principais)
  const uniqueTerms = new Map<string, BabelonRow>();
  
  for (const record of records) {
    // Pegar apenas os labels (rdfs:label), ignorar definições (IAO:0000115)
    if (record.predicate_id === 'rdfs:label' && !uniqueTerms.has(record.subject_id)) {
      uniqueTerms.set(record.subject_id, record);
    }
  }
  
  console.log(`🔍 Termos HPO únicos identificados: ${uniqueTerms.size}`);
  
  let imported = 0;
  let skipped = 0;
  let updated = 0;
  
  // Processar em lotes
  const termsArray = Array.from(uniqueTerms.values());
  const batchSize = 100;
  
  for (let i = 0; i < termsArray.length; i += batchSize) {
    const batch = termsArray.slice(i, i + batchSize);
    
    for (const record of batch) {
      try {
        // Verificar se o termo já existe
        const existing = await prisma.hpoTerm.findUnique({
          where: { hpoId: record.subject_id }
        });
        
        if (existing) {
          // Se já existe, apenas garantir que tem o label em inglês
          if (!existing.labelEn || existing.labelEn !== record.source_value) {
            await prisma.hpoTerm.update({
              where: { id: existing.id },
              data: { labelEn: record.source_value }
            });
            updated++;
          } else {
            skipped++;
          }
          continue;
        }
        
        // Criar novo termo HPO
        await prisma.hpoTerm.create({
          data: {
            hpoId: record.subject_id,
            labelEn: record.source_value,
            definitionEn: null, // Poderia buscar do arquivo também
            synonymsEn: [],
            category: null,
            difficulty: 3, // Padrão médio
            translationStatus: 'NOT_TRANSLATED' // Sem tradução PT ainda
          }
        });
        
        imported++;
      } catch (error: any) {
        console.error(`❌ Erro ao processar ${record.subject_id}:`, error.message);
      }
    }
    
    if ((i + batchSize) % 1000 === 0 || i + batchSize >= termsArray.length) {
      console.log(`   ✅ Processados ${Math.min(i + batchSize, termsArray.length)}/${termsArray.length} termos...`);
    }
  }
  
  // Estatísticas finais
  const totalTermsInDB = await prisma.hpoTerm.count();
  const termsWithTranslation = await prisma.hpoTerm.count({
    where: { translationStatus: 'LEGACY_PENDING' }
  });
  const termsWithoutTranslation = await prisma.hpoTerm.count({
    where: { translationStatus: 'NOT_TRANSLATED' }
  });
  
  console.log(`\n✅ IMPORTAÇÃO COMPLETA!`);
  console.log(`   - Novos termos importados: ${imported}`);
  console.log(`   - Termos atualizados: ${updated}`);
  console.log(`   - Já existiam: ${skipped}`);
  console.log(`\n📊 ESTATÍSTICAS FINAIS DO BANCO:`);
  console.log(`   - Total de termos HPO: ${totalTermsInDB}`);
  console.log(`   - Com tradução PT (LEGACY): ${termsWithTranslation}`);
  console.log(`   - SEM tradução PT: ${termsWithoutTranslation}`);
  console.log(`\n🎯 PRÓXIMOS PASSOS:`);
  console.log(`   1. ${termsWithTranslation} termos precisam VALIDAÇÃO (traduções legacy)`);
  console.log(`   2. ${termsWithoutTranslation} termos precisam TRADUÇÃO (ainda em inglês)`);
  
  return {
    imported,
    updated,
    skipped,
    totalTermsInDB,
    termsWithTranslation,
    termsWithoutTranslation
  };
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 IMPORTAÇÃO DE TERMOS HPO COMPLETOS');
  console.log('════════════════════════════════════════════════════════');
  console.log('📋 OBJETIVO:');
  console.log('   - Importar TODOS os ~31.000 termos HPO oficiais');
  console.log('   - Adicionar os ~24.000 termos que ainda não estão no banco');
  console.log('   - Manter os 7.214 termos já importados com traduções legacy');
  console.log('════════════════════════════════════════════════════════\n');
  
  try {
    await importAllHPOTermsFromDutch();
    
    console.log('\n════════════════════════════════════════════════════════');
    console.log('🎉 MISSÃO CUMPRIDA!');
    console.log('════════════════════════════════════════════════════════');
    console.log('✅ Banco de dados agora contém HPO COMPLETO');
    console.log('✅ Pronto para iniciar traduções e validações');
    console.log('✅ Execute: npm run dev\n');
    
  } catch (error) {
    console.error('❌ ERRO:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
