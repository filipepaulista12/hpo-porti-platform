/**
 * Jest Test Environment Setup
 * Configura variáveis de ambiente para cada teste
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Set NODE_ENV to test to disable rate limiting
process.env.NODE_ENV = 'test';

// Disable rate limiting for tests
process.env.RATE_LIMIT_MAX_REQUESTS = '10000';

// Lê URL do servidor do arquivo de configuração (criado pelo globalSetup)
const configFile = join(__dirname, 'test-config.json');
if (existsSync(configFile)) {
  const config = JSON.parse(readFileSync(configFile, 'utf-8'));
  process.env.API_URL = config.API_URL;
} else {
  // Fallback se globalSetup ainda não rodou
  process.env.API_URL = process.env.API_URL || 'http://localhost:3001';
}
