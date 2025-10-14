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

async function importHPOTermsFromBabelon() {
  console.log('🚀 Starting HPO terms import from Babelon TSV...');
  
  const babelonPath = path.join(__dirname, '../../..', 'hpo-translations', 'babelon', 'hp-pt.babelon.tsv');
  
  if (!fs.existsSync(babelonPath)) {
    console.error('❌ Babelon file not found:', babelonPath);
    return;
  }
  
  // Read and parse TSV
  const fileContent = fs.readFileSync(babelonPath, 'utf-8');
  const records: BabelonRow[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    delimiter: '\t'
  });
  
  console.log(`📊 Found ${records.length} translation records`);
  
  let imported = 0;
  let errors = 0;
  
  for (const record of records) {
    try {
      // Check if term already exists
      let term = await prisma.hpoTerm.findUnique({
        where: { hpoId: record.subject_id }
      });
      
      // If term doesn't exist, create it
      if (!term) {
        term = await prisma.hpoTerm.create({
          data: {
            hpoId: record.subject_id,
            labelEn: record.source_value,
            definitionEn: null,
            synonymsEn: [],
            category: null,
            difficulty: 3, // Default
            translationStatus: 'LEGACY_PENDING'
          }
        });
      }
      
      // Create legacy translation
      await prisma.translation.create({
        data: {
          termId: term.id,
          userId: 'legacy-import', // Placeholder - você pode criar um usuário "system" depois
          labelPt: record.translation_value,
          definitionPt: null,
          synonymsPt: [],
          confidence: 3,
          status: 'LEGACY_PENDING',
          source: 'LEGACY',
          isLegacy: true
        }
      }).catch(() => {
        // Se já existe, ignora (pode ter duplicatas no arquivo)
      });
      
      imported++;
      
      if (imported % 100 === 0) {
        console.log(`✅ Imported ${imported} terms...`);
      }
    } catch (error) {
      errors++;
      console.error(`❌ Error importing ${record.subject_id}:`, error);
    }
  }
  
  console.log(`\n✅ Import complete!`);
  console.log(`   - Successfully imported: ${imported}`);
  console.log(`   - Errors: ${errors}`);
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');
  
  try {
    // Create system user for legacy imports
    const systemUser = await prisma.user.upsert({
      where: { email: 'system@hpo-platform.org' },
      update: {},
      create: {
        email: 'system@hpo-platform.org',
        name: 'Sistema',
        password: null,
        role: 'ADMIN',
        institution: 'HPO Platform',
        isActive: false
      }
    });
    
    console.log('✅ System user created\n');
    
    // Create some sample badges
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
        name: 'Em Chamas 🔥',
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
    
    console.log('✅ Badges created\n');
    
    // Import HPO terms from Babelon
    await importHPOTermsFromBabelon();
    
    console.log('\n✅ Database seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
