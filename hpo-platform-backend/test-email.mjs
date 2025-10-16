/**
 * Script de teste para verificar configuração SMTP
 * Testa envio de email com as credenciais do Gmail
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '.env') });

console.log('\n🔍 Testando configuração de Email SMTP...\n');

// Verificar variáveis de ambiente
console.log('📋 Configurações carregadas:');
console.log(`   EMAIL_ENABLED: ${process.env.EMAIL_ENABLED}`);
console.log(`   SMTP_HOST: ${process.env.SMTP_HOST}`);
console.log(`   SMTP_PORT: ${process.env.SMTP_PORT}`);
console.log(`   SMTP_USER: ${process.env.SMTP_USER}`);
console.log(`   SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? '***' + process.env.SMTP_PASSWORD.slice(-4) : 'NÃO CONFIGURADA'}`);
console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM}\n`);

if (process.env.EMAIL_ENABLED !== 'true') {
  console.error('❌ EMAIL_ENABLED está como false no .env');
  process.exit(1);
}

if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
  console.error('❌ Credenciais SMTP não configuradas');
  process.exit(1);
}

// Criar transporter do nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  // Configurações adicionais para Gmail
  tls: {
    rejectUnauthorized: false, // Para desenvolvimento
  },
});

console.log('🔌 Testando conexão com servidor SMTP...');

try {
  // Verificar conexão
  await transporter.verify();
  console.log('✅ Conexão com servidor SMTP bem-sucedida!\n');

  // Enviar email de teste
  console.log('📧 Enviando email de teste...');
  
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.SMTP_USER, // Enviar para o próprio email
    subject: '✅ Teste de Email - HPO Translation Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">✅ Email SMTP Funcionando!</h1>
        
        <p>Este é um email de teste da <strong>HPO Translation Platform</strong>.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #1f2937;">📋 Configurações Testadas:</h2>
          <ul style="color: #4b5563;">
            <li><strong>Servidor SMTP:</strong> ${process.env.SMTP_HOST}</li>
            <li><strong>Porta:</strong> ${process.env.SMTP_PORT}</li>
            <li><strong>Usuário:</strong> ${process.env.SMTP_USER}</li>
            <li><strong>Remetente:</strong> ${process.env.EMAIL_FROM}</li>
          </ul>
        </div>
        
        <div style="background-color: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #166534;">
            <strong>✅ Sucesso!</strong> O serviço de email está configurado corretamente e pronto para uso.
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 14px;">
          <strong>Data do teste:</strong> ${new Date().toLocaleString('pt-BR')}<br>
          <strong>Ambiente:</strong> Development<br>
          <strong>Plataforma:</strong> HPO Translation Platform - CPLP
        </p>
      </div>
    `,
    text: `
      ✅ Email SMTP Funcionando!
      
      Este é um email de teste da HPO Translation Platform.
      
      Configurações Testadas:
      - Servidor SMTP: ${process.env.SMTP_HOST}
      - Porta: ${process.env.SMTP_PORT}
      - Usuário: ${process.env.SMTP_USER}
      - Remetente: ${process.env.EMAIL_FROM}
      
      ✅ Sucesso! O serviço de email está configurado corretamente e pronto para uso.
      
      Data do teste: ${new Date().toLocaleString('pt-BR')}
      Ambiente: Development
      Plataforma: HPO Translation Platform - CPLP
    `,
  });

  console.log('✅ Email enviado com sucesso!');
  console.log(`   Message ID: ${info.messageId}`);
  console.log(`   Destinatário: ${process.env.SMTP_USER}`);
  console.log('\n📬 Verifique a caixa de entrada de:', process.env.SMTP_USER);
  console.log('   (Pode estar na pasta de spam na primeira vez)\n');
  
  console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!\n');

} catch (error) {
  console.error('\n❌ ERRO ao testar email:\n');
  
  if (error.code === 'EAUTH') {
    console.error('🔒 ERRO DE AUTENTICAÇÃO');
    console.error('   Possíveis causas:');
    console.error('   1. Senha incorreta');
    console.error('   2. Gmail bloqueou acesso (verificação em 2 etapas ativada)');
    console.error('   3. Precisa ativar "Acesso a apps menos seguros" ou usar "Senha de app"');
    console.error('\n📖 Solução:');
    console.error('   Se você tem verificação em 2 etapas:');
    console.error('   1. Acesse: https://myaccount.google.com/apppasswords');
    console.error('   2. Crie uma "Senha de app" para "Email"');
    console.error('   3. Use essa senha no .env ao invés da senha normal\n');
  } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
    console.error('🌐 ERRO DE CONEXÃO');
    console.error('   Possíveis causas:');
    console.error('   1. Sem conexão com internet');
    console.error('   2. Firewall bloqueando porta 587');
    console.error('   3. Servidor SMTP incorreto\n');
  } else {
    console.error('   Código do erro:', error.code);
    console.error('   Mensagem:', error.message);
  }
  
  console.error('\n🔍 Detalhes técnicos:');
  console.error(error);
  
  process.exit(1);
}
