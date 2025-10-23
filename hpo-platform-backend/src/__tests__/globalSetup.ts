/**
 * Jest Global Setup
 * Inicia servidor antes de TODOS os testes
 */

import { spawn, ChildProcess } from 'child_process';
import { createServer } from 'net';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Carregar .env.test
const testEnvPath = join(__dirname, '../../.env.test');
if (existsSync(testEnvPath)) {
  const envConfig = dotenv.parse(readFileSync(testEnvPath));
  Object.keys(envConfig).forEach(key => {
    process.env[key] = envConfig[key];
  });
  console.log('✅ .env.test carregado com sucesso');
}

let serverProcess: ChildProcess | null = null;

/**
 * Verifica se uma porta está disponível
 */
async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

/**
 * Encontra uma porta disponível
 */
async function findAvailablePort(startPort: number): Promise<number> {
  let port = startPort;
  while (port < startPort + 100) {
    if (await isPortAvailable(port)) {
      return port;
    }
    port++;
  }
  throw new Error('Nenhuma porta disponível encontrada');
}

/**
 * Verifica se servidor está respondendo
 */
async function waitForServer(url: string, maxAttempts = 30): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${url}/health`);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      // Servidor ainda não está pronto
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

/**
 * Global Setup - Roda UMA VEZ antes de todos os testes
 */
export default async function globalSetup() {
  console.log('\n🔍 Verificando se servidor está rodando...');
  
  // Tenta conectar ao servidor na porta padrão
  const defaultUrl = 'http://localhost:3001';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`${defaultUrl}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log('✅ Servidor já está rodando na porta 3001\n');
      
      // Salva URL para os testes
      process.env.API_URL = defaultUrl;
      writeFileSync(
        join(__dirname, 'test-config.json'),
        JSON.stringify({ API_URL: defaultUrl })
      );
      
      return;
    }
  } catch (error) {
    console.log('📌 Servidor não está rodando, iniciando automaticamente...');
  }

  // Encontra porta disponível
  const serverPort = await findAvailablePort(3001);
  console.log(`🔌 Usando porta ${serverPort}`);

  // Inicia o servidor
  const isWindows = process.platform === 'win32';
  const command = isWindows ? 'npm.cmd' : 'npm';
  
  serverProcess = spawn(command, ['run', 'dev'], {
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: serverPort.toString(),
      RATE_LIMIT_MAX_REQUESTS: '10000',
    },
    stdio: 'pipe',
    shell: true,
    detached: !isWindows,
  });

  // Marca processo para cleanup
  if (serverProcess.pid) {
    writeFileSync(
      join(__dirname, 'test-server.pid'),
      serverProcess.pid.toString()
    );
  }

  // Log apenas erros críticos
  serverProcess.stderr?.on('data', (data) => {
    const message = data.toString();
    if (message.includes('Error') && !message.includes('ExperimentalWarning')) {
      console.error('❌ Server error:', message);
    }
  });

  // Aguarda servidor ficar pronto
  const serverUrl = `http://localhost:${serverPort}`;
  console.log('⏳ Aguardando servidor iniciar...');
  
  const isReady = await waitForServer(serverUrl, 30);
  
  if (!isReady) {
    serverProcess?.kill();
    throw new Error('❌ Servidor não iniciou a tempo');
  }

  console.log(`✅ Servidor iniciado com sucesso em ${serverUrl}\n`);
  
  // Salva URL para os testes
  process.env.API_URL = serverUrl;
  writeFileSync(
    join(__dirname, 'test-config.json'),
    JSON.stringify({ API_URL: serverUrl })
  );
}
