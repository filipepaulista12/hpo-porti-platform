import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * SEED SIMPLIFICADO - SEM DEPENDÊNCIA DE ARQUIVOS EXTERNOS
 * Cria dados de teste suficientes para o sistema funcionar
 */

async function seedDatabaseSimple() {
  console.log('\n🌱 INICIANDO SEED SIMPLIFICADO (SEM ARQUIVOS EXTERNOS)');
  console.log('══════════════════════════════════════════════════════════');
  
  // 1. Criar usuário Sistema
  console.log('\n👤 Criando usuário Sistema...');
  const systemUser = await prisma.user.upsert({
    where: { email: 'system@hpo-platform.org' },
    update: {},
    create: {
      email: 'system@hpo-platform.org',
      name: 'Sistema HPO',
      password: await bcrypt.hash('system123!@#', 10),
      role: 'SUPER_ADMIN',
      isActive: true,
      points: 0,
      level: 10,
      streak: 0
    }
  });
  console.log(`✅ Usuário Sistema criado: ${systemUser.email}`);

  // 2. Criar badges
  console.log('\n🏆 Criando badges...');
  const badgeData = [
    {
      code: 'FIRST_TRANSLATION',
      name: 'Primeira Tradução',
      description: 'Completou sua primeira tradução',
      iconUrl: '🏅',
      points: 10,
      rarity: 'COMMON'
    },
    {
      code: 'TRANSLATION_10',
      name: '10 Traduções',
      description: 'Completou 10 traduções',
      iconUrl: '🎖️',
      points: 50,
      rarity: 'COMMON'
    },
    {
      code: 'TRANSLATION_100',
      name: '100 Traduções',
      description: 'Completou 100 traduções',
      iconUrl: '🏆',
      points: 200,
      rarity: 'RARE'
    },
    {
      code: 'STREAK_7',
      name: 'Streak de 7 Dias',
      description: 'Manteve um streak de 7 dias',
      iconUrl: '🔥',
      points: 100,
      rarity: 'RARE'
    },
    {
      code: 'TOP_CONTRIBUTOR',
      name: 'Top Contributor',
      description: 'Entrou no top 10 do ranking',
      iconUrl: '👑',
      points: 500,
      rarity: 'EPIC'
    }
  ];

  for (const badge of badgeData) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: {},
      create: badge as any
    });
  }
  console.log(`✅ ${badgeData.length} badges criados`);

  // 3. Criar usuários de teste
  console.log('\n👥 Criando usuários de teste...');
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  const testUsers = [
    {
      email: 'admin@test.com',
      name: 'Admin Teste',
      role: 'SUPER_ADMIN',
      points: 1000,
      level: 5
    },
    {
      email: 'tradutor@test.com',
      name: 'Tradutor Teste',
      role: 'TRANSLATOR',
      points: 50,
      level: 1
    },
    {
      email: 'revisor@test.com',
      name: 'Revisor Teste',
      role: 'COMMITTEE_MEMBER',
      points: 500,
      level: 3
    }
  ];

  for (const userData of testUsers) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: passwordHash,
        isActive: true,
        streak: 0
      }
    });
  }
  console.log(`✅ ${testUsers.length} usuários de teste criados`);

  // 4. Criar termos HPO de teste (100 termos reais)
  console.log('\n📝 Criando termos HPO de teste...');
  
  const realHPOTerms = [
    { hpoId: 'HP:0000001', labelEn: 'All', category: 'General', difficulty: 1 },
    { hpoId: 'HP:0000118', labelEn: 'Phenotypic abnormality', category: 'General', difficulty: 2 },
    { hpoId: 'HP:0000707', labelEn: 'Abnormality of the nervous system', category: 'Nervous system', difficulty: 3 },
    { hpoId: 'HP:0001298', labelEn: 'Encephalopathy', category: 'Nervous system', difficulty: 4 },
    { hpoId: 'HP:0001250', labelEn: 'Seizure', category: 'Nervous system', difficulty: 3 },
    { hpoId: 'HP:0002180', labelEn: 'Neurodegeneration', category: 'Nervous system', difficulty: 4 },
    { hpoId: 'HP:0001263', labelEn: 'Global developmental delay', category: 'Nervous system', difficulty: 3 },
    { hpoId: 'HP:0001249', labelEn: 'Intellectual disability', category: 'Nervous system', difficulty: 3 },
    { hpoId: 'HP:0000729', labelEn: 'Autistic behavior', category: 'Nervous system', difficulty: 3 },
    { hpoId: 'HP:0001252', labelEn: 'Hypotonia', category: 'Nervous system', difficulty: 3 },
    
    { hpoId: 'HP:0001626', labelEn: 'Abnormality of the cardiovascular system', category: 'Cardiovascular', difficulty: 2 },
    { hpoId: 'HP:0001627', labelEn: 'Abnormal heart morphology', category: 'Cardiovascular', difficulty: 3 },
    { hpoId: 'HP:0001631', labelEn: 'Atrial septal defect', category: 'Cardiovascular', difficulty: 4 },
    { hpoId: 'HP:0001629', labelEn: 'Ventricular septal defect', category: 'Cardiovascular', difficulty: 4 },
    { hpoId: 'HP:0001642', labelEn: 'Abnormal pulmonary valve morphology', category: 'Cardiovascular', difficulty: 4 },
    
    { hpoId: 'HP:0000924', labelEn: 'Abnormality of the skeletal system', category: 'Skeletal', difficulty: 2 },
    { hpoId: 'HP:0002650', labelEn: 'Scoliosis', category: 'Skeletal', difficulty: 3 },
    { hpoId: 'HP:0002757', labelEn: 'Recurrent fractures', category: 'Skeletal', difficulty: 3 },
    { hpoId: 'HP:0000925', labelEn: 'Abnormality of the vertebral column', category: 'Skeletal', difficulty: 3 },
    { hpoId: 'HP:0002808', labelEn: 'Kyphosis', category: 'Skeletal', difficulty: 3 },
    
    { hpoId: 'HP:0000478', labelEn: 'Abnormality of the eye', category: 'Eye', difficulty: 2 },
    { hpoId: 'HP:0000501', labelEn: 'Glaucoma', category: 'Eye', difficulty: 3 },
    { hpoId: 'HP:0000518', labelEn: 'Cataract', category: 'Eye', difficulty: 3 },
    { hpoId: 'HP:0000505', labelEn: 'Visual impairment', category: 'Eye', difficulty: 3 },
    { hpoId: 'HP:0000486', labelEn: 'Strabismus', category: 'Eye', difficulty: 3 },
    
    { hpoId: 'HP:0000598', labelEn: 'Abnormality of the ear', category: 'Ear', difficulty: 2 },
    { hpoId: 'HP:0000365', labelEn: 'Hearing impairment', category: 'Ear', difficulty: 3 },
    { hpoId: 'HP:0008551', labelEn: 'Microtia', category: 'Ear', difficulty: 4 },
    { hpoId: 'HP:0000384', labelEn: 'Preauricular skin tag', category: 'Ear', difficulty: 3 },
    { hpoId: 'HP:0000369', labelEn: 'Low-set ears', category: 'Ear', difficulty: 2 },
    
    { hpoId: 'HP:0002086', labelEn: 'Abnormality of the respiratory system', category: 'Respiratory', difficulty: 2 },
    { hpoId: 'HP:0002098', labelEn: 'Respiratory distress', category: 'Respiratory', difficulty: 3 },
    { hpoId: 'HP:0002090', labelEn: 'Pneumonia', category: 'Respiratory', difficulty: 3 },
    { hpoId: 'HP:0002094', labelEn: 'Dyspnea', category: 'Respiratory', difficulty: 3 },
    { hpoId: 'HP:0012378', labelEn: 'Fatigue', category: 'Constitutional', difficulty: 2 },
    
    { hpoId: 'HP:0000819', labelEn: 'Diabetes mellitus', category: 'Endocrine', difficulty: 3 },
    { hpoId: 'HP:0000821', labelEn: 'Hypothyroidism', category: 'Endocrine', difficulty: 3 },
    { hpoId: 'HP:0000824', labelEn: 'Growth hormone deficiency', category: 'Endocrine', difficulty: 4 },
    { hpoId: 'HP:0000823', labelEn: 'Delayed puberty', category: 'Endocrine', difficulty: 3 },
    { hpoId: 'HP:0008209', labelEn: 'Premature ovarian insufficiency', category: 'Endocrine', difficulty: 4 },
    
    { hpoId: 'HP:0001507', labelEn: 'Growth abnormality', category: 'Growth', difficulty: 2 },
    { hpoId: 'HP:0004322', labelEn: 'Short stature', category: 'Growth', difficulty: 2 },
    { hpoId: 'HP:0000098', labelEn: 'Tall stature', category: 'Growth', difficulty: 2 },
    { hpoId: 'HP:0001508', labelEn: 'Failure to thrive', category: 'Growth', difficulty: 3 },
    { hpoId: 'HP:0001520', labelEn: 'Large for gestational age', category: 'Growth', difficulty: 3 },
    
    { hpoId: 'HP:0001574', labelEn: 'Abnormality of the integument', category: 'Skin', difficulty: 2 },
    { hpoId: 'HP:0000951', labelEn: 'Abnormality of the skin', category: 'Skin', difficulty: 2 },
    { hpoId: 'HP:0000962', labelEn: 'Hyperkeratosis', category: 'Skin', difficulty: 3 },
    { hpoId: 'HP:0000982', labelEn: 'Palmoplantar keratoderma', category: 'Skin', difficulty: 4 },
    { hpoId: 'HP:0000964', labelEn: 'Eczema', category: 'Skin', difficulty: 2 },
    
    { hpoId: 'HP:0000119', labelEn: 'Abnormality of the genitourinary system', category: 'Genitourinary', difficulty: 2 },
    { hpoId: 'HP:0000077', labelEn: 'Abnormality of the kidney', category: 'Genitourinary', difficulty: 2 },
    { hpoId: 'HP:0000083', labelEn: 'Renal insufficiency', category: 'Genitourinary', difficulty: 3 },
    { hpoId: 'HP:0000085', labelEn: 'Horseshoe kidney', category: 'Genitourinary', difficulty: 3 },
    { hpoId: 'HP:0000107', labelEn: 'Renal cyst', category: 'Genitourinary', difficulty: 3 },
    
    { hpoId: 'HP:0025031', labelEn: 'Abnormality of the digestive system', category: 'Digestive', difficulty: 2 },
    { hpoId: 'HP:0002019', labelEn: 'Constipation', category: 'Digestive', difficulty: 2 },
    { hpoId: 'HP:0002024', labelEn: 'Malabsorption', category: 'Digestive', difficulty: 3 },
    { hpoId: 'HP:0002014', labelEn: 'Diarrhea', category: 'Digestive', difficulty: 2 },
    { hpoId: 'HP:0002017', labelEn: 'Nausea and vomiting', category: 'Digestive', difficulty: 2 },
    
    { hpoId: 'HP:0001871', labelEn: 'Abnormality of blood and blood-forming tissues', category: 'Hematologic', difficulty: 3 },
    { hpoId: 'HP:0001903', labelEn: 'Anemia', category: 'Hematologic', difficulty: 3 },
    { hpoId: 'HP:0001873', labelEn: 'Thrombocytopenia', category: 'Hematologic', difficulty: 4 },
    { hpoId: 'HP:0001882', labelEn: 'Leukopenia', category: 'Hematologic', difficulty: 4 },
    { hpoId: 'HP:0001909', labelEn: 'Leukemia', category: 'Hematologic', difficulty: 4 },
    
    { hpoId: 'HP:0002715', labelEn: 'Abnormality of the immune system', category: 'Immunologic', difficulty: 3 },
    { hpoId: 'HP:0002721', labelEn: 'Immunodeficiency', category: 'Immunologic', difficulty: 4 },
    { hpoId: 'HP:0002960', labelEn: 'Autoimmunity', category: 'Immunologic', difficulty: 4 },
    { hpoId: 'HP:0012647', labelEn: 'Abnormal inflammatory response', category: 'Immunologic', difficulty: 3 },
    { hpoId: 'HP:0003212', labelEn: 'Increased IgE level', category: 'Immunologic', difficulty: 4 },
    
    { hpoId: 'HP:0002664', labelEn: 'Neoplasm', category: 'Neoplasm', difficulty: 3 },
    { hpoId: 'HP:0002668', labelEn: 'Paraganglioma', category: 'Neoplasm', difficulty: 5 },
    { hpoId: 'HP:0100242', labelEn: 'Sarcoma', category: 'Neoplasm', difficulty: 4 },
    { hpoId: 'HP:0002861', labelEn: 'Melanoma', category: 'Neoplasm', difficulty: 4 },
    { hpoId: 'HP:0009726', labelEn: 'Renal neoplasm', category: 'Neoplasm', difficulty: 4 },
    
    { hpoId: 'HP:0000707', labelEn: 'Abnormality of the nervous system', category: 'Nervous system', difficulty: 2 },
    { hpoId: 'HP:0100022', labelEn: 'Abnormality of movement', category: 'Nervous system', difficulty: 2 },
    { hpoId: 'HP:0001337', labelEn: 'Tremor', category: 'Nervous system', difficulty: 3 },
    { hpoId: 'HP:0002072', labelEn: 'Chorea', category: 'Nervous system', difficulty: 4 },
    { hpoId: 'HP:0001332', labelEn: 'Dystonia', category: 'Nervous system', difficulty: 4 },
    
    { hpoId: 'HP:0100545', labelEn: 'Arterial stenosis', category: 'Cardiovascular', difficulty: 4 },
    { hpoId: 'HP:0004944', labelEn: 'Cerebral aneurysm', category: 'Cardiovascular', difficulty: 5 },
    { hpoId: 'HP:0001635', labelEn: 'Congestive heart failure', category: 'Cardiovascular', difficulty: 4 },
    { hpoId: 'HP:0001638', labelEn: 'Cardiomyopathy', category: 'Cardiovascular', difficulty: 4 },
    { hpoId: 'HP:0001644', labelEn: 'Dilated cardiomyopathy', category: 'Cardiovascular', difficulty: 5 },
    
    { hpoId: 'HP:0001939', labelEn: 'Abnormality of metabolism/homeostasis', category: 'Metabolic', difficulty: 3 },
    { hpoId: 'HP:0003119', labelEn: 'Abnormal circulating lipid concentration', category: 'Metabolic', difficulty: 4 },
    { hpoId: 'HP:0003124', labelEn: 'Hypercholesterolemia', category: 'Metabolic', difficulty: 3 },
    { hpoId: 'HP:0001943', labelEn: 'Hypoglycemia', category: 'Metabolic', difficulty: 3 },
    { hpoId: 'HP:0001942', labelEn: 'Metabolic acidosis', category: 'Metabolic', difficulty: 4 },
    
    { hpoId: 'HP:0000152', labelEn: 'Abnormality of head or neck', category: 'Head/Neck', difficulty: 2 },
    { hpoId: 'HP:0000234', labelEn: 'Abnormality of the head', category: 'Head/Neck', difficulty: 2 },
    { hpoId: 'HP:0000252', labelEn: 'Microcephaly', category: 'Head/Neck', difficulty: 3 },
    { hpoId: 'HP:0000256', labelEn: 'Macrocephaly', category: 'Head/Neck', difficulty: 3 },
    { hpoId: 'HP:0000280', labelEn: 'Coarse facial features', category: 'Head/Neck', difficulty: 3 },
    
    { hpoId: 'HP:0000818', labelEn: 'Abnormality of the endocrine system', category: 'Endocrine', difficulty: 2 },
    { hpoId: 'HP:0000820', labelEn: 'Abnormality of the thyroid gland', category: 'Endocrine', difficulty: 3 },
    { hpoId: 'HP:0000845', labelEn: 'Growth hormone excess', category: 'Endocrine', difficulty: 4 },
    { hpoId: 'HP:0008163', labelEn: 'Decreased circulating cortisol level', category: 'Endocrine', difficulty: 5 },
    { hpoId: 'HP:0000829', labelEn: 'Hypoparathyroidism', category: 'Endocrine', difficulty: 4 }
  ];

  let termsCreated = 0;
  for (const term of realHPOTerms) {
    await prisma.hpoTerm.upsert({
      where: { hpoId: term.hpoId },
      update: {},
      create: {
        hpoId: term.hpoId,
        labelEn: term.labelEn,
        definitionEn: null,
        synonymsEn: [],
        category: term.category,
        difficulty: term.difficulty,
        translationStatus: 'NOT_TRANSLATED'
      }
    });
    termsCreated++;
  }
  console.log(`✅ ${termsCreated} termos HPO reais criados`);

  // 5. Criar algumas traduções de teste
  console.log('\n📝 Criando traduções de teste...');
  const admin = await prisma.user.findUnique({ where: { email: 'admin@test.com' } });
  const tradutor = await prisma.user.findUnique({ where: { email: 'tradutor@test.com' } });
  
  if (admin && tradutor) {
    const seizureTerm = await prisma.hpoTerm.findUnique({ where: { hpoId: 'HP:0001250' } });
    
    if (seizureTerm) {
      await prisma.translation.create({
        data: {
          termId: seizureTerm.id,
          userId: tradutor.id,
          labelPt: 'Convulsão',
          definitionPt: 'Atividade elétrica anormal no cérebro que pode causar movimentos involuntários',
          synonymsPt: ['Crise convulsiva', 'Ataque epiléptico'],
          confidence: 5,
          status: 'APPROVED',
          approvedAt: new Date()
        }
      });
      console.log('✅ Tradução de teste criada: Seizure → Convulsão');
    }
  }

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('✅ SEED SIMPLIFICADO CONCLUÍDO COM SUCESSO!');
  console.log('══════════════════════════════════════════════════════════');
  console.log('\n📊 RESUMO:');
  console.log(`   • Usuários: ${testUsers.length + 1} (incluindo Sistema)`);
  console.log(`   • Badges: ${badgeData.length}`);
  console.log(`   • Termos HPO: ${termsCreated}`);
  console.log(`   • Traduções: 1 (teste)`);
  console.log('\n🔐 CREDENCIAIS DE ACESSO:');
  console.log('   • admin@test.com / admin123 (SUPER_ADMIN)');
  console.log('   • tradutor@test.com / admin123 (TRANSLATOR)');
  console.log('   • revisor@test.com / admin123 (COMMITTEE_MEMBER)');
  console.log('\n🚀 Sistema pronto para uso!\n');
}

seedDatabaseSimple()
  .catch((e) => {
    console.error('❌ ERRO DURANTE O SEED:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
