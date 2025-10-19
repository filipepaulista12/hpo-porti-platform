/**
 * 📊 Script: Import HPO Metadata
 * 
 * Enriquece os termos HPO existentes no database com:
 * - category: Categoria raiz (ex: "Nervous system abnormality")
 * - parentId: ID do termo pai (hierarquia)
 * - depth: Profundidade na árvore (0 = raiz)
 * 
 * Fonte: hp.obo (Human Phenotype Ontology OBO Format)
 * Download: https://hpo.jax.org/data/ontology/hp.obo
 * 
 * Formato OBO:
 * [Term]
 * id: HP:0001250
 * name: Seizure
 * is_a: HP:0011097 ! Epilepsy
 * 
 * Uso:
 * 1. Baixar hp.obo → hpo-translations-data/hp.obo
 * 2. npm run metadata:import
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

const prisma = new PrismaClient();

interface OBOTerm {
  id: string;
  name: string;
  parents: string[];  // IDs dos termos pais (is_a relationships)
  obsolete: boolean;
  definition?: string;
  synonyms: string[];
  xrefs: string[];
}

// 25 Categorias Raiz do HPO (documentadas em INVESTIGACAO_NOVAS_TAREFAS.md)
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

/**
 * Baixa o arquivo hp.obo mais recente
 */
async function downloadHPOBO(): Promise<string> {
  const oboPath = path.join(__dirname, '../../hpo-translations-data', 'hp.obo');
  
  // Se já existe e foi modificado nas últimas 24h, usar o cache
  if (fs.existsSync(oboPath)) {
    const stats = fs.statSync(oboPath);
    const ageHours = (Date.now() - stats.mtimeMs) / 1000 / 60 / 60;
    
    if (ageHours < 24) {
      console.log(`✅ Usando hp.obo em cache (${ageHours.toFixed(1)}h atrás)`);
      return oboPath;
    }
  }
  
  console.log('📥 Baixando hp.obo mais recente...');
  
  try {
    const response = await axios.get('https://hpo.jax.org/data/ontology/hp.obo', {
      responseType: 'stream',
      timeout: 60000, // 60s timeout
    });
    
    const writer = fs.createWriteStream(oboPath);
    response.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    console.log(`✅ hp.obo baixado com sucesso! (${fs.statSync(oboPath).size} bytes)`);
    return oboPath;
    
  } catch (error: any) {
    console.error('❌ Erro ao baixar hp.obo:', error.message);
    
    // Fallback: verificar se existe versão antiga
    if (fs.existsSync(oboPath)) {
      console.log('⚠️  Usando versão antiga do hp.obo');
      return oboPath;
    }
    
    throw new Error('Não foi possível baixar hp.obo e nenhuma versão local encontrada');
  }
}

/**
 * Parseia o arquivo OBO e extrai termos com suas relações hierárquicas
 */
function parseOBO(oboPath: string): Map<string, OBOTerm> {
  console.log('\n🔍 Parseando hp.obo...');
  
  const content = fs.readFileSync(oboPath, 'utf-8');
  const terms = new Map<string, OBOTerm>();
  
  const lines = content.split('\n');
  let currentTerm: Partial<OBOTerm> | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Início de um novo termo
    if (trimmed === '[Term]') {
      if (currentTerm && currentTerm.id) {
        terms.set(currentTerm.id, {
          id: currentTerm.id,
          name: currentTerm.name || '',
          parents: currentTerm.parents || [],
          obsolete: currentTerm.obsolete || false,
          definition: currentTerm.definition,
          synonyms: currentTerm.synonyms || [],
          xrefs: currentTerm.xrefs || [],
        });
      }
      
      currentTerm = {
        parents: [],
        synonyms: [],
        xrefs: [],
        obsolete: false,
      };
      continue;
    }
    
    if (!currentTerm) continue;
    
    // Parsear campos
    if (trimmed.startsWith('id: ')) {
      currentTerm.id = trimmed.substring(4);
    } else if (trimmed.startsWith('name: ')) {
      currentTerm.name = trimmed.substring(6);
    } else if (trimmed.startsWith('is_a: ')) {
      // is_a: HP:0011097 ! Epilepsy
      const parentId = trimmed.substring(6).split('!')[0].trim();
      currentTerm.parents!.push(parentId);
    } else if (trimmed.startsWith('is_obsolete: true')) {
      currentTerm.obsolete = true;
    } else if (trimmed.startsWith('def: ')) {
      // def: "Definition text" [references]
      const match = trimmed.match(/def: "(.*?)"/);
      if (match) {
        currentTerm.definition = match[1];
      }
    } else if (trimmed.startsWith('synonym: ')) {
      // synonym: "Alternative name" EXACT []
      const match = trimmed.match(/synonym: "(.*?)"/);
      if (match) {
        currentTerm.synonyms!.push(match[1]);
      }
    } else if (trimmed.startsWith('xref: ')) {
      currentTerm.xrefs!.push(trimmed.substring(6));
    }
  }
  
  // Adicionar último termo
  if (currentTerm && currentTerm.id) {
    terms.set(currentTerm.id, {
      id: currentTerm.id,
      name: currentTerm.name || '',
      parents: currentTerm.parents || [],
      obsolete: currentTerm.obsolete || false,
      definition: currentTerm.definition,
      synonyms: currentTerm.synonyms || [],
      xrefs: currentTerm.xrefs || [],
    });
  }
  
  console.log(`✅ ${terms.size} termos parseados`);
  return terms;
}

/**
 * Determina a categoria raiz de um termo seguindo a hierarquia
 */
function findRootCategory(
  termId: string, 
  terms: Map<string, OBOTerm>, 
  visited: Set<string> = new Set()
): string | null {
  // Evitar loops infinitos
  if (visited.has(termId)) return null;
  visited.add(termId);
  
  // É uma categoria raiz?
  if (ROOT_CATEGORIES[termId]) {
    return ROOT_CATEGORIES[termId];
  }
  
  const term = terms.get(termId);
  if (!term || term.parents.length === 0) {
    return null;
  }
  
  // Recursivamente subir na hierarquia
  for (const parentId of term.parents) {
    const category = findRootCategory(parentId, terms, visited);
    if (category) return category;
  }
  
  return null;
}

/**
 * Calcula a profundidade do termo na árvore
 */
function calculateDepth(
  termId: string,
  terms: Map<string, OBOTerm>,
  visited: Set<string> = new Set()
): number {
  if (visited.has(termId)) return 0;
  visited.add(termId);
  
  // Categorias raiz têm depth 0
  if (ROOT_CATEGORIES[termId]) return 0;
  
  const term = terms.get(termId);
  if (!term || term.parents.length === 0) return 0;
  
  // Depth = 1 + max(depth dos pais)
  let maxParentDepth = 0;
  for (const parentId of term.parents) {
    const parentDepth = calculateDepth(parentId, terms, new Set(visited));
    maxParentDepth = Math.max(maxParentDepth, parentDepth);
  }
  
  return 1 + maxParentDepth;
}

/**
 * Atualiza o database com os metadados
 */
async function enrichDatabase(terms: Map<string, OBOTerm>) {
  console.log('\n📊 Enriquecendo database...\n');
  
  // Buscar todos os termos HPO do database
  const dbTerms = await prisma.hpoTerm.findMany({
    select: { id: true, hpoId: true }
  });
  
  console.log(`🔍 ${dbTerms.length} termos no database`);
  
  let updated = 0;
  let notFound = 0;
  let errors = 0;
  
  for (const dbTerm of dbTerms) {
    const oboTerm = terms.get(dbTerm.hpoId);
    
    if (!oboTerm) {
      notFound++;
      continue;
    }
    
    try {
      // Determinar categoria raiz
      const category = findRootCategory(dbTerm.hpoId, terms);
      
      // Calcular profundidade
      const depth = calculateDepth(dbTerm.hpoId, terms);
      
      // Buscar parentId no database (primeiro pai apenas)
      let parentDbId: string | null = null;
      if (oboTerm.parents.length > 0) {
        const parentHpoId = oboTerm.parents[0];
        const parentInDb = await prisma.hpoTerm.findUnique({
          where: { hpoId: parentHpoId },
          select: { id: true }
        });
        
        if (parentInDb) {
          parentDbId = parentInDb.id;
        }
      }
      
      // Atualizar database
      await prisma.hpoTerm.update({
        where: { id: dbTerm.id },
        data: {
          category: category || undefined,
          parentId: parentDbId || undefined,
          isObsolete: oboTerm.obsolete,
        }
      });
      
      updated++;
      
      // Log progresso a cada 100 termos
      if (updated % 100 === 0) {
        console.log(`   ⏳ ${updated}/${dbTerms.length} termos atualizados...`);
      }
      
    } catch (error: any) {
      console.error(`   ❌ Erro em ${dbTerm.hpoId}:`, error.message);
      errors++;
    }
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log(`✅ Atualizado:  ${updated} termos`);
  console.log(`⚠️  Não encontrado: ${notFound} termos`);
  console.log(`❌ Erros:       ${errors} termos`);
  console.log('═══════════════════════════════════════\n');
  
  // Estatísticas por categoria
  const categoryCounts = await prisma.hpoTerm.groupBy({
    by: ['category'],
    _count: true,
  });
  
  console.log('📊 DISTRIBUIÇÃO POR CATEGORIA:\n');
  for (const cat of categoryCounts.sort((a, b) => (b._count || 0) - (a._count || 0))) {
    console.log(`   ${cat.category || '(sem categoria)'}: ${cat._count} termos`);
  }
}

/**
 * Main
 */
async function main() {
  console.log('\n📊 IMPORT HPO METADATA\n');
  console.log('═══════════════════════════════════════\n');
  
  try {
    // 1. Baixar hp.obo
    const oboPath = await downloadHPOBO();
    
    // 2. Parsear OBO
    const terms = parseOBO(oboPath);
    
    // 3. Enriquecer database
    await enrichDatabase(terms);
    
    console.log('\n✅ IMPORTAÇÃO COMPLETA!\n');
    
  } catch (error) {
    console.error('\n❌ ERRO:', error);
    process.exit(1);
  }
}

// Executar
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
