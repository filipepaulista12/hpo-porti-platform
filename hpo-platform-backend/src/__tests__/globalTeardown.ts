/**
 * Jest Global Teardown
 * Para servidor depois de TODOS os testes
 */

import { readFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';

export default async function globalTeardown() {
  console.log('\n🛑 Parando servidor de teste...');
  
  const pidFile = join(__dirname, 'test-server.pid');
  
  if (existsSync(pidFile)) {
    try {
      const pid = parseInt(readFileSync(pidFile, 'utf-8'));
      
      if (process.platform === 'win32') {
        // Windows: mata processo e filhos
        const { execSync } = require('child_process');
        try {
          execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
        } catch (error) {
          // Processo já pode ter terminado
        }
      } else {
        // Unix: mata grupo de processos
        try {
          process.kill(-pid);
        } catch (error) {
          // Processo já pode ter terminado
        }
      }
      
      unlinkSync(pidFile);
      console.log('✅ Servidor parado com sucesso\n');
    } catch (error) {
      console.error('⚠️  Erro ao parar servidor:', error);
    }
  }
  
  // Remove arquivo de configuração
  const configFile = join(__dirname, 'test-config.json');
  if (existsSync(configFile)) {
    unlinkSync(configFile);
  }
}
