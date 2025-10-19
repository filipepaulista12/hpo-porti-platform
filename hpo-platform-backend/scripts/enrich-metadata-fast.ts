/**
 * 🚀 Script RÁPIDO: Enriquece metadados usando RAW SQL
 * 
 * Muito mais rápido que updates individuais
 * Usa SQL direto para batch updates
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface OBOTerm {
  id: string;
  name: string;
  parents: string[];
  obsolete: boolean;
}

// 25 Categorias Raiz do HPO
const ROOT_CATEGORIES: Record<string, string> = {
  'HP:0000118': 'Phenotypic abnormality',
  'HP:0000707': 'Abnormality of the nervous system',
  'HP:0001626': 'Abnormality of the cardiovascular system',
  'HP:0000478': 'Abnormality of the eye',
  'HP:0000598': 'Abnormality of the ear',
  'HP:0000152': 'Abnormality of head or neck',
  'HP:0002715': 'Abnormality of the immune system',
  'HP:0000818': 'Abnormality of the endocrine system',
  'HP:0025031': 'Abnormality of the digestive system',
  'HP:0000924': 'Abnormality of the skeletal system',
  'HP:0001574': 'Abnormality of the integument',
  'HP:0000119': 'Abnormality of the genitourinary system',
  'HP:0002086': 'Abnormality of the respiratory system',
  'HP:0001197': 'Abnormality of prenatal development',
  'HP:0001507': 'Growth abnormality',
  'HP:0001939': 'Abnormality of metabolism/homeostasis',
  'HP:0025142': 'Constitutional symptom',
  'HP:0040064': 'Abnormality of limbs',
  'HP:0002664': 'Neoplasm',
  'HP:0001871': 'Abnormality of blood and blood-forming tissues',
  'HP:0025354': 'Abnormal cellular phenotype',
  'HP:0032443': 'Past medical history',
  'HP:0031797': 'Clinical course',
  'HP:0000005': 'Mode of inheritance',
  'HP:0012823': 'Clinical modifier',
};

function parseOBOSimple(oboPath: string): Map<string, OBOTerm> {
  console.log('🔍 Parseando hp.obo...');
  
  const content = fs.readFileSync(oboPath, 'utf-8');
  const terms = new Map<string, OBOTerm>();
  
  const lines = content.split('\n');
  let currentTerm: Partial<OBOTerm> | null = null;
  let isObsolete = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed === '[Term]') {
      if (currentTerm && currentTerm.id) {
        terms.set(currentTerm.id, {
          id: currentTerm.id,
          name: currentTerm.name || '',
          parents: currentTerm.parents || [],
          obsolete: isObsolete
        });
      }
      
      currentTerm = { parents: [] };
      isObsolete = false;
      continue;
    }
    
    if (!currentTerm) continue;
    
    if (trimmed.startsWith('id: HP:')) {
      currentTerm.id = trimmed.substring(4);
    } else if (trimmed.startsWith('name: ')) {
      currentTerm.name = trimmed.substring(6);
    } else if (trimmed.startsWith('is_a: HP:')) {
      const parentId = trimmed.substring(6).split('!')[0].trim();
      currentTerm.parents!.push(parentId);
    } else if (trimmed === 'is_obsolete: true') {
      isObsolete = true;
    }
  }
  
  if (currentTerm && currentTerm.id) {
    terms.set(currentTerm.id, {
      id: currentTerm.id,
      name: currentTerm.name || '',
      parents: currentTerm.parents || [],
      obsolete: isObsolete
    });
  }
  
  console.log(`✅ ${terms.size} termos parseados\n`);
  return terms;
}

function findRootCategory(
  termId: string,
  terms: Map<string, OBOTerm>,
  visited: Set<string> = new Set()
): string | null {
  if (visited.has(termId)) return null;
  visited.add(termId);
  
  if (ROOT_CATEGORIES[termId]) {
    return ROOT_CATEGORIES[termId];
  }
  
  const term = terms.get(termId);
  if (!term || term.parents.length === 0) {
    return null;
  }
  
  for (const parentId of term.parents) {
    const category = findRootCategory(parentId, terms, visited);
    if (category) return category;
  }
  
  return null;
}

async function enrichMetadataFast() {
  console.log('\n🚀 ENRIQUECIMENTO RÁPIDO DE METADADOS\n');
  console.log('═══════════════════════════════════════\n');
  
  try {
    const oboPath = path.join(__dirname, '../../hpo-translations-data', 'hp.obo');
    
    if (!fs.existsSync(oboPath)) {
      throw new Error('hp.obo não encontrado!');
    }
    
    // Parse OBO
    const oboTerms = parseOBOSimple(oboPath);
    
    // Buscar todos os termos do database
    console.log('📊 Buscando termos do database...');
    const dbTerms = await prisma.hpoTerm.findMany({
      select: { id: true, hpoId: true }
    });
    console.log(`✅ ${dbTerms.length} termos encontrados\n`);
    
    // Criar mapa hpoId → dbId
    console.log('🗺️  Criando mapa de IDs...');
    const hpoIdToDbId = new Map<string, string>();
    for (const term of dbTerms) {
      hpoIdToDbId.set(term.hpoId, term.id);
    }
    console.log(`✅ Mapa criado\n`);
    
    // FASE 1: Batch update categories
    console.log('📦 FASE 1/2: Atualizando categories (batch)...\n');
    
    const categoryUpdates: Array<{ id: string; category: string | null }> = [];
    
    for (const dbTerm of dbTerms) {
      const oboTerm = oboTerms.get(dbTerm.hpoId);
      if (!oboTerm) continue;
      
      const category = findRootCategory(dbTerm.hpoId, oboTerms);
      categoryUpdates.push({
        id: dbTerm.id,
        category: category
      });
    }
    
    console.log(`   Preparando ${categoryUpdates.length} updates...`);
    
    // Executar em batches menores (100 por vez para evitar timeout)
    const batchSize = 100;
    for (let i = 0; i < categoryUpdates.length; i += batchSize) {
      const batch = categoryUpdates.slice(i, i + batchSize);
      
      // Usar transaction para batch update
      await prisma.$transaction(
        batch.map(update =>
          prisma.hpoTerm.update({
            where: { id: update.id },
            data: { category: update.category }
          })
        )
      );
      
      // Log a cada 1000 termos
      if ((i + batchSize) % 1000 === 0 || (i + batchSize) >= categoryUpdates.length) {
        const progress = Math.min(i + batchSize, categoryUpdates.length);
        const percent = ((progress / categoryUpdates.length) * 100).toFixed(1);
        console.log(`   ⏳ ${progress}/${categoryUpdates.length} (${percent}%)`);
      }
    }
    
    console.log(`\n✅ Categories atualizadas!\n`);
    
    // FASE 2: Batch update parentId
    console.log('🔗 FASE 2/2: Atualizando hierarquia (parentId)...\n');
    
    const hierarchyUpdates: Array<{ id: string; parentId: string }> = [];
    
    for (const dbTerm of dbTerms) {
      const oboTerm = oboTerms.get(dbTerm.hpoId);
      if (!oboTerm || oboTerm.parents.length === 0) continue;
      
      const parentHpoId = oboTerm.parents[0];
      const parentDbId = hpoIdToDbId.get(parentHpoId);
      
      if (parentDbId) {
        hierarchyUpdates.push({
          id: dbTerm.id,
          parentId: parentDbId
        });
      }
    }
    
    console.log(`   Preparando ${hierarchyUpdates.length} updates...`);
    
    for (let i = 0; i < hierarchyUpdates.length; i += batchSize) {
      const batch = hierarchyUpdates.slice(i, i + batchSize);
      
      await prisma.$transaction(
        batch.map(update =>
          prisma.hpoTerm.update({
            where: { id: update.id },
            data: { parentId: update.parentId }
          })
        )
      );
      
      // Log a cada 1000 termos
      if ((i + batchSize) % 1000 === 0 || (i + batchSize) >= hierarchyUpdates.length) {
        const progress = Math.min(i + batchSize, hierarchyUpdates.length);
        const percent = ((progress / hierarchyUpdates.length) * 100).toFixed(1);
        console.log(`   ⏳ ${progress}/${hierarchyUpdates.length} (${percent}%)`);
      }
    }
    
    console.log(`\n✅ Hierarquia atualizada!\n`);
    
    // Estatísticas finais
    const categoryCounts = await prisma.hpoTerm.groupBy({
      by: ['category'],
      _count: true,
    });
    
    console.log('═══════════════════════════════════════');
    console.log(`✅ Categories:  ${categoryUpdates.length} termos`);
    console.log(`🔗 Hierarquia:  ${hierarchyUpdates.length} relações`);
    console.log('═══════════════════════════════════════\n');
    
    console.log('📊 DISTRIBUIÇÃO POR CATEGORIA (Top 15):\n');
    for (const cat of categoryCounts.sort((a, b) => (b._count || 0) - (a._count || 0)).slice(0, 15)) {
      console.log(`   ${cat.category || '(sem categoria)'}: ${cat._count} termos`);
    }
    
    console.log('\n✅ ENRIQUECIMENTO COMPLETO!\n');
    
  } catch (error) {
    console.error('\n❌ ERRO:', error);
    process.exit(1);
  }
}

enrichMetadataFast()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
