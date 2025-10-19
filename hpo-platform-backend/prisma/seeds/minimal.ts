import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * 🌱 SEED MINIMAL - Para Desenvolvimento Rápido
 * 
 * Contém:
 * - 50 termos HPO mais comuns em doenças raras
 * - 10 usuários com roles variados
 * - Nenhuma tradução (para testar fluxo de tradução)
 * 
 * Tempo: ~10 segundos
 * Uso: Desenvolvimento local, testes rápidos
 */

// Top 50 termos HPO mais comuns (por frequência em estudos de doenças raras)
const TOP_50_HPO_TERMS = [
  { hpoId: 'HP:0001250', labelEn: 'Seizure', definitionEn: 'A seizure is an intermittent abnormality of nervous system physiology characterised by a transient occurrence of signs and/or symptoms due to abnormal excessive or synchronous neuronal activity in the brain.' },
  { hpoId: 'HP:0001263', labelEn: 'Global developmental delay', definitionEn: 'A delay in the achievement of motor or mental milestones in the domains of development of a child.' },
  { hpoId: 'HP:0001249', labelEn: 'Intellectual disability', definitionEn: 'Subnormal intellectual functioning which originates during the developmental period.' },
  { hpoId: 'HP:0001252', labelEn: 'Hypotonia', definitionEn: 'Hypotonia is an abnormally low muscle tone (the amount of tension or resistance to movement in a muscle).' },
  { hpoId: 'HP:0000252', labelEn: 'Microcephaly', definitionEn: 'Head circumference below 2 standard deviations below the mean for age and gender.' },
  { hpoId: 'HP:0001510', labelEn: 'Growth delay', definitionEn: 'A deficiency or slowing down of growth pre- and postnatally.' },
  { hpoId: 'HP:0002194', labelEn: 'Delayed gross motor development', definitionEn: 'A type of motor delay characterized by an delay in acquiring the ability to control the large muscles of the body for walking, running, sitting, and crawling.' },
  { hpoId: 'HP:0000750', labelEn: 'Delayed speech and language development', definitionEn: 'A degree of language development that is significantly below the norm for a child of a specified age.' },
  { hpoId: 'HP:0001371', labelEn: 'Flexion contracture', definitionEn: 'A flexion contracture is a bent (flexed) joint that cannot be straightened actively or passively.' },
  { hpoId: 'HP:0000618', labelEn: 'Blindness', definitionEn: 'Blindness is the condition of lacking visual perception.' },
  
  { hpoId: 'HP:0000365', labelEn: 'Hearing impairment', definitionEn: 'A decreased magnitude of the sensory perception of sound.' },
  { hpoId: 'HP:0001513', labelEn: 'Obesity', definitionEn: 'Abnormal increase in body weight.' },
  { hpoId: 'HP:0000520', labelEn: 'Proptosis', definitionEn: 'An eye that is protruding anterior to the plane of the face to a greater extent than is typical.' },
  { hpoId: 'HP:0000505', labelEn: 'Visual impairment', definitionEn: 'Visual impairment (or vision impairment) is vision loss (of a person) to such a degree as to qualify as an additional support need through a significant limitation of visual capability.' },
  { hpoId: 'HP:0001256', labelEn: 'Intellectual disability, mild', definitionEn: 'Mild intellectual disability is defined as an intelligence quotient (IQ) in the range of 50-69.' },
  { hpoId: 'HP:0002119', labelEn: 'Ventriculomegaly', definitionEn: 'An increase in size of the ventricular system of the brain.' },
  { hpoId: 'HP:0000365', labelEn: 'Hearing impairment', definitionEn: 'A decreased magnitude of the sensory perception of sound.' },
  { hpoId: 'HP:0001508', labelEn: 'Failure to thrive', definitionEn: 'Failure to thrive (FTT) refers to a child whose physical growth is substantially below the norm.' },
  { hpoId: 'HP:0002240', labelEn: 'Hepatomegaly', definitionEn: 'Abnormally increased size of the liver.' },
  { hpoId: 'HP:0001631', labelEn: 'Atrial septal defect', definitionEn: 'Atrial septal defect (ASD) is a congenital abnormality of the interatrial septum that enables blood flow between the left and right atria.' },
  
  { hpoId: 'HP:0000407', labelEn: 'Sensorineural hearing impairment', definitionEn: 'A type of hearing impairment in one or both ears related to an abnormal functionality of the cochlear nerve.' },
  { hpoId: 'HP:0002650', labelEn: 'Scoliosis', definitionEn: 'The presence of an abnormal lateral curvature of the spine.' },
  { hpoId: 'HP:0000154', labelEn: 'Wide mouth', definitionEn: 'Distance between the oral commissures more than 2 SD above the mean.' },
  { hpoId: 'HP:0000486', labelEn: 'Strabismus', definitionEn: 'A misalignment of the eyes such that the visual axes deviate from bifoveal fixation.' },
  { hpoId: 'HP:0000639', labelEn: 'Nystagmus', definitionEn: 'Rhythmic, involuntary oscillations of one or both eyes related to abnormality in fixation, conjugate gaze, or vestibular mechanisms.' },
  { hpoId: 'HP:0001290', labelEn: 'Generalized hypotonia', definitionEn: 'Generalized muscular hypotonia (abnormally low muscle tone).' },
  { hpoId: 'HP:0000175', labelEn: 'Cleft palate', definitionEn: 'Cleft palate is a developmental defect of the palate resulting from a failure of fusion of the palatine processes and manifesting as a separation of the roof of the mouth.' },
  { hpoId: 'HP:0000717', labelEn: 'Autism', definitionEn: 'Autism is a neurodevelopmental disorder characterized by impaired social interaction and communication, and by restricted and repetitive behavior.' },
  { hpoId: 'HP:0000821', labelEn: 'Hypothyroidism', definitionEn: 'Deficiency of thyroid hormone.' },
  { hpoId: 'HP:0002007', labelEn: 'Frontal bossing', definitionEn: 'Bilateral bulging of the lateral frontal bone prominences with relative sparing of the midline.' },
  
  { hpoId: 'HP:0001511', labelEn: 'Intrauterine growth retardation', definitionEn: 'An abnormal restriction of fetal growth with fetal weight below the tenth percentile for gestational age.' },
  { hpoId: 'HP:0000316', labelEn: 'Hypertelorism', definitionEn: 'Interpupillary distance more than 2 SD above the mean.' },
  { hpoId: 'HP:0000028', labelEn: 'Cryptorchidism', definitionEn: 'Testis in inguinal canal. That is, absence of one or both testes from the scrotum owing to failure of the testis or testes to descend through the inguinal canal to the scrotum.' },
  { hpoId: 'HP:0001508', labelEn: 'Failure to thrive', definitionEn: 'Failure to thrive (FTT) refers to a child whose physical growth is substantially below the norm.' },
  { hpoId: 'HP:0000347', labelEn: 'Micrognathia', definitionEn: 'Developmental hypoplasia of the mandible.' },
  { hpoId: 'HP:0002910', labelEn: 'Elevated hepatic transaminase', definitionEn: 'Elevations of the levels of SGOT and SGPT in the serum.' },
  { hpoId: 'HP:0000256', labelEn: 'Macrocephaly', definitionEn: 'Occipitofrontal (head) circumference greater than 97th centile compared to appropriate, age matched, sex-matched normal standards.' },
  { hpoId: 'HP:0000508', labelEn: 'Ptosis', definitionEn: 'The upper eyelid margin is positioned 3 mm or more lower than usual and covers the superior portion of the iris (objective).' },
  { hpoId: 'HP:0001263', labelEn: 'Global developmental delay', definitionEn: 'A delay in the achievement of motor or mental milestones in the domains of development of a child.' },
  { hpoId: 'HP:0000951', labelEn: 'Abnormality of the skin', definitionEn: 'An abnormality of the skin.' },
  
  { hpoId: 'HP:0000403', labelEn: 'Recurrent otitis media', definitionEn: 'Increased susceptibility to otitis media, as manifested by recurrent episodes of otitis media.' },
  { hpoId: 'HP:0000648', labelEn: 'Optic atrophy', definitionEn: 'Atrophy of the optic nerve.' },
  { hpoId: 'HP:0001762', labelEn: 'Talipes equinovarus', definitionEn: 'Talipes equinovarus (also called clubfoot) typically has four main components: inversion and adduction of the forefoot; inversion of the heel and hindfoot; equinus (limitation of extension) of the ankle and subtalar joint; and internal rotation of the leg.' },
  { hpoId: 'HP:0000545', labelEn: 'Myopia', definitionEn: 'An abnormality of refraction characterized by the ability to see objects nearby clearly, while objects in the distance appear blurry.' },
  { hpoId: 'HP:0002910', labelEn: 'Elevated hepatic transaminase', definitionEn: 'Elevations of the levels of SGOT and SGPT in the serum.' },
  { hpoId: 'HP:0000494', labelEn: 'Downslanted palpebral fissures', definitionEn: 'The palpebral fissure inclination is more than two standard deviations below the mean for age.' },
  { hpoId: 'HP:0001627', labelEn: 'Abnormal heart morphology', definitionEn: 'Any structural anomaly of the heart.' },
  { hpoId: 'HP:0000303', labelEn: 'Mandibular prognathia', definitionEn: 'Prognathism refers to a protrusion of the mandible (mandibular prognathia) or maxilla (maxillary prognathia).' },
  { hpoId: 'HP:0000286', labelEn: 'Epicanthus', definitionEn: 'A fold of skin starting above the medial aspect of the upper eyelid and arching downward to end below the inner corner of the eye.' },
  { hpoId: 'HP:0000098', labelEn: 'Tall stature', definitionEn: 'A height above that which is expected according to age and gender norms.' },
];

// 10 usuários de teste com roles variados
const TEST_USERS: Array<{name: string, email: string, role: UserRole, password: string}> = [
  { name: 'Admin Master', email: 'admin@hpo.test', role: 'ADMIN', password: 'Test123!@#' },
  { name: 'Super Admin', email: 'superadmin@hpo.test', role: 'SUPER_ADMIN', password: 'Test123!@#' },
  { name: 'Revisor Senior', email: 'revisor@hpo.test', role: 'REVIEWER', password: 'Test123!@#' },
  { name: 'Tradutor Expert PT', email: 'tradutor-pt@hpo.test', role: 'TRANSLATOR', password: 'Test123!@#' },
  { name: 'Tradutor Expert BR', email: 'tradutor-br@hpo.test', role: 'TRANSLATOR', password: 'Test123!@#' },
  { name: 'Validador Médico', email: 'validador@hpo.test', role: 'VALIDATOR', password: 'Test123!@#' },
  { name: 'Moderador', email: 'moderador@hpo.test', role: 'MODERATOR', password: 'Test123!@#' },
  { name: 'Membro Comitê', email: 'comite@hpo.test', role: 'COMMITTEE_MEMBER', password: 'Test123!@#' },
  { name: 'Novo Tradutor', email: 'new-translator@hpo.test', role: 'TRANSLATOR', password: 'Test123!@#' },
  { name: 'QA Tester', email: 'qa@hpo.test', role: 'MODERATOR', password: 'Test123!@#' },
];

export async function seedMinimal() {
  console.log('\n🌱 SEED MINIMAL: Iniciando...\n');
  
  try {
    // 1️⃣ Limpar database
    console.log('🧹 Limpando database...');
    await prisma.translation.deleteMany({});
    await prisma.conflictReview.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.hpoTerm.deleteMany({});
    console.log('✅ Database limpa!\n');
    
    // 2️⃣ Criar 50 termos HPO
    console.log('📥 Criando 50 termos HPO mais comuns...');
    let termsCreated = 0;
    
    for (const term of TOP_50_HPO_TERMS) {
      try {
        await prisma.hpoTerm.create({
          data: {
            hpoId: term.hpoId,
            labelEn: term.labelEn,
            definitionEn: term.definitionEn,
            synonymsEn: [],
            translationStatus: 'NOT_TRANSLATED',
            difficulty: 3, // Média
          }
        });
        termsCreated++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Termo ${term.hpoId} já existe, pulando...`);
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ ${termsCreated} termos HPO criados!\n`);
    
    // 3️⃣ Criar 10 usuários
    console.log('👥 Criando 10 usuários de teste...');
    let usersCreated = 0;
    
    for (const user of TEST_USERS) {
      try {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        await prisma.user.create({
          data: {
            name: user.name,
            email: user.email,
            password: hashedPassword,
            role: user.role,
            country: user.role === 'TRANSLATOR' && user.email.includes('-br') ? 'Brazil' : 'Portugal',
            institution: user.role === 'ADMIN' ? 'HPO Admin Team' : 
                         user.role === 'SUPER_ADMIN' ? 'HPO Super Admin' :
                         user.role === 'REVIEWER' ? 'Medical Review Board' :
                         user.role === 'VALIDATOR' ? 'Medical Validation Team' :
                         user.role === 'MODERATOR' ? 'Content Moderation' :
                         user.role === 'COMMITTEE_MEMBER' ? 'Scientific Committee' :
                         'Translation Team',
          }
        });
        usersCreated++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Usuário ${user.email} já existe, pulando...`);
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ ${usersCreated} usuários criados!\n`);
    
    // 4️⃣ Estatísticas finais
    const stats = {
      terms: await prisma.hpoTerm.count(),
      users: await prisma.user.count(),
      translations: await prisma.translation.count(),
    };
    
    console.log('📊 SEED MINIMAL COMPLETO!\n');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Termos HPO:       ${stats.terms}`);
    console.log(`✅ Usuários:         ${stats.users}`);
    console.log(`✅ Traduções:        ${stats.translations}`);
    console.log('═══════════════════════════════════════\n');
    
    console.log('🔑 CREDENCIAIS DE ACESSO:');
    console.log('─────────────────────────────────────');
    console.log('Admin:       admin@hpo.test / Test123!@#');
    console.log('Super Admin: superadmin@hpo.test / Test123!@#');
    console.log('Reviewer:    revisor@hpo.test / Test123!@#');
    console.log('Translator:  tradutor-pt@hpo.test / Test123!@#');
    console.log('─────────────────────────────────────\n');
    
    console.log('⚡ Tempo: ~10 segundos');
    console.log('🎯 Uso: Desenvolvimento local, testes rápidos\n');
    
  } catch (error) {
    console.error('❌ Erro no seed minimal:', error);
    throw error;
  }
}

// Se executado diretamente
if (require.main === module) {
  seedMinimal()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
