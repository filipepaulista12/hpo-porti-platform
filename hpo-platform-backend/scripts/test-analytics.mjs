const API_URL = 'http://localhost:3001';
const ADMIN_EMAIL = 'admin@hpo.test';
const ADMIN_PASSWORD = 'Test123!@#';

async function testAnalyticsDashboard() {
  try {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║     🧪 TESTE: ANALYTICS DASHBOARD (ADMIN)              ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Step 1: Login como ADMIN
    console.log('🔐 Step 1: Fazendo login como ADMIN...');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.log(`\n❌ ERRO no login: ${loginResponse.status}`);
      console.log('   Detalhes:', JSON.stringify(errorData, null, 2));
      console.log('\n💡 DICA: O usuário admin@hpo.test precisa ter senha cadastrada!');
      console.log('   Use: docker exec hpo-backend node scripts/reset-password.mjs admin@hpo.test\n');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    console.log('✅ Login bem-sucedido!');
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log(`   User ID: ${loginData.user.id}`);
    console.log(`   Role: ${loginData.user.role}\n`);

    // Step 2: Testar endpoint /api/analytics/dashboard
    console.log('📊 Step 2: Testando /api/analytics/dashboard...');
    
    const analyticsResponse = await fetch(`${API_URL}/api/analytics/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`   Status: ${analyticsResponse.status} ${analyticsResponse.statusText}`);

    if (!analyticsResponse.ok) {
      const errorData = await analyticsResponse.text();
      console.log(`\n❌ ERRO: ${analyticsResponse.status}`);
      console.log('   Resposta:', errorData);
      return;
    }

    const analyticsData = await analyticsResponse.json();
    
    console.log('\n✅ SUCESSO! Dados recebidos:\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📈 OVERVIEW:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   Total Users: ${analyticsData.totalUsers || 0}`);
    console.log(`   Total Translations: ${analyticsData.totalTranslations || 0}`);
    console.log(`   Active Users (24h): ${analyticsData.activeUsers24h || 0}`);
    console.log(`   Pending Validations: ${analyticsData.pendingValidations || 0}`);
    
    if (analyticsData.translationsPerDay && analyticsData.translationsPerDay.length > 0) {
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('📅 TRANSLATIONS PER DAY (últimos 7 dias):');
      console.log('═══════════════════════════════════════════════════════════');
      analyticsData.translationsPerDay.slice(-7).forEach((day) => {
        console.log(`   ${day.date}: ${day.count} traduções`);
      });
    }
    
    if (analyticsData.usersByCountry && analyticsData.usersByCountry.length > 0) {
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('🌍 USERS BY COUNTRY (Top 5):');
      console.log('═══════════════════════════════════════════════════════════');
      analyticsData.usersByCountry.slice(0, 5).forEach((country) => {
        console.log(`   ${country.country || 'Unknown'}: ${country._count.id} sessions`);
      });
    }
    
    if (analyticsData.deviceDistribution && analyticsData.deviceDistribution.length > 0) {
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('📱 DEVICE DISTRIBUTION:');
      console.log('═══════════════════════════════════════════════════════════');
      analyticsData.deviceDistribution.forEach((device) => {
        console.log(`   ${device.device}: ${device._count.id} sessions`);
      });
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('🔗 PRÓXIMO PASSO: Conectar frontend');
    console.log('   Arquivo: plataforma-raras-cpl/src/components/AnalyticsDashboard.tsx');
    console.log('   Linha 87: Descomentar fetchAnalyticsData()');
    console.log('   Linhas 120-135: Remover alert "Modo Demonstração"\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    if (error.cause) {
      console.error('   Causa:', error.cause);
    }
    console.log('\n💡 Certifique-se de que:');
    console.log('   1. Backend está rodando: docker ps');
    console.log('   2. Porta 3001 está acessível: curl http://localhost:3001/health\n');
  }
}

testAnalyticsDashboard();
