# 🔧 Troubleshooting - Docker Hybrid Approach

## Problemas Comuns e Soluções

### 1. 🔴 Container não inicia (Development)

#### Sintoma
```
ERROR: Cannot start service postgres: port is already allocated
```

#### Solução
```powershell
# Verificar se já existe container usando a porta
docker ps -a | Select-String "5433"

# Parar container existente
docker stop hpo-postgres-dev
docker rm hpo-postgres-dev

# Ou usar porta diferente no docker-compose.dev.yml
```

---

### 2. 🔴 Erro de conexão do Prisma

#### Sintoma
```
Error: Can't reach database server at `localhost:5433`
```

#### Solução
```powershell
# 1. Verificar se PostgreSQL está rodando
docker ps | Select-String "postgres"

# 2. Verificar .env do backend
# DATABASE_URL deve ser: postgresql://postgres:postgres@localhost:5433/hpo_platform

# 3. Testar conexão manualmente
docker exec -it hpo-postgres-dev psql -U postgres -d hpo_platform
```

---

### 3. 🔴 Migrations falham no Backend

#### Sintoma
```
Error: P3009 - migrations directory does not exist
```

#### Solução
```powershell
cd hpo-platform-backend

# Resetar migrations (CUIDADO: perde dados!)
npx prisma migrate reset

# Ou aplicar migrations pendentes
npx prisma migrate deploy

# Gerar Prisma Client
npx prisma generate
```

---

### 4. 🔴 Frontend não conecta ao Backend

#### Sintoma
```
GET http://localhost:3001/api/health net::ERR_CONNECTION_REFUSED
```

#### Solução
```powershell
# 1. Verificar se backend está rodando
cd hpo-platform-backend
npm run dev

# 2. Verificar VITE_API_URL no frontend
# Deve ser: http://localhost:3001

# 3. Verificar CORS no backend
# src/server.ts deve ter:
# app.use(cors({ origin: 'http://localhost:5173' }))
```

---

### 5. 🔴 Erro 502 Bad Gateway (Production)

#### Sintoma
Nginx retorna erro 502 ao acessar frontend

#### Solução
```bash
# 1. Verificar logs do nginx
docker logs hpo-nginx-prod

# 2. Verificar se backend está respondendo
docker exec hpo-nginx-prod curl http://backend:3001/health

# 3. Verificar se frontend foi buildado
docker exec hpo-frontend-prod ls -la /usr/share/nginx/html

# 4. Reiniciar containers
docker-compose -f docker-compose.prod.yml restart
```

---

### 6. 🔴 WebSocket não conecta (Production)

#### Sintoma
```
WebSocket connection failed: Error in connection establishment
```

#### Solução
```bash
# 1. Verificar configuração do Nginx
docker exec hpo-nginx-prod cat /etc/nginx/nginx.conf | grep socket.io

# Deve ter:
# location /socket.io/ {
#   proxy_http_version 1.1;
#   proxy_set_header Upgrade $http_upgrade;
#   proxy_set_header Connection "upgrade";
# }

# 2. Verificar variável no frontend
# VITE_WS_URL deve ser: https://seu-dominio (ou http://localhost)

# 3. Testar WebSocket manualmente
wscat -c ws://localhost/socket.io/?EIO=4&transport=websocket
```

---

### 7. 🔴 Prisma Client desatualizado

#### Sintoma
```
Error: The Prisma Client is not up-to-date
```

#### Solução
```powershell
cd hpo-platform-backend

# Regenerar Prisma Client
npx prisma generate

# Se estiver em container
docker exec hpo-backend-prod npx prisma generate
```

---

### 8. 🔴 Porta 5433 já está em uso

#### Sintoma
```
Error: bind: address already in use
```

#### Solução
```powershell
# Encontrar processo usando a porta
netstat -ano | findstr :5433

# Matar processo (substitua PID)
taskkill /PID 1234 /F

# Ou mudar porta no docker-compose.dev.yml
ports:
  - "5434:5432"  # Usar porta diferente
```

---

### 9. 🔴 Redis não conecta

#### Sintoma
```
Error: Redis connection to localhost:6379 failed
```

#### Solução
```powershell
# 1. Verificar se Redis está rodando
docker ps | Select-String "redis"

# 2. Testar conexão
docker exec -it hpo-redis-dev redis-cli ping
# Deve retornar: PONG

# 3. Verificar REDIS_URL no .env
# REDIS_URL=redis://localhost:6379
```

---

### 10. 🔴 Build do Docker demora muito

#### Sintoma
`docker-compose build` demora mais de 10 minutos

#### Solução
```bash
# 1. Limpar cache do Docker
docker builder prune

# 2. Usar build com cache (remover --no-cache)
docker-compose -f docker-compose.prod.yml build

# 3. Aumentar recursos do Docker Desktop
# Settings > Resources > Memory: 4GB+
```

---

### 11. 🔴 Erro de permissão no volume

#### Sintoma
```
Error: EACCES: permission denied, open '/app/data'
```

#### Solução
```bash
# Ajustar permissões do volume
docker exec hpo-backend-prod chown -R node:node /app
docker exec hpo-postgres-prod chown -R postgres:postgres /var/lib/postgresql/data
```

---

### 12. 🔴 Variáveis de ambiente não funcionam

#### Sintoma
Backend não lê variáveis do `.env.production.local`

#### Solução
```powershell
# 1. Verificar se arquivo existe
Test-Path .env.production.local

# 2. Usar --env-file explicitamente
docker-compose -f docker-compose.prod.yml --env-file .env.production.local up -d

# 3. Verificar no container
docker exec hpo-backend-prod env | grep DATABASE_URL
```

---

## 🔍 Comandos Úteis de Debug

### Logs em tempo real
```bash
# Todos os containers
docker-compose -f docker-compose.prod.yml logs -f

# Container específico
docker logs -f hpo-backend-prod
docker logs -f hpo-nginx-prod
docker logs -f hpo-postgres-prod
```

### Entrar no container
```bash
docker exec -it hpo-backend-prod sh
docker exec -it hpo-postgres-prod psql -U postgres -d hpo_platform
docker exec -it hpo-redis-dev redis-cli
```

### Verificar saúde dos containers
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Inspecionar rede
```bash
docker network inspect hpo_network
```

### Verificar uso de recursos
```bash
docker stats
```

---

## 📞 Suporte

Se o problema persistir:

1. **Verificar logs detalhados:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs --tail=100
   ```

2. **Coletar informações do sistema:**
   ```powershell
   docker version
   docker-compose version
   docker ps -a
   docker images
   ```

3. **Criar issue no GitHub** com:
   - Descrição do problema
   - Logs completos
   - Versões do Docker/Node/NPM
   - Sistema operacional
   - Passos para reproduzir

---

## ✅ Checklist Pré-Deploy

Antes de fazer deploy, verifique:

- [ ] `.env.production.local` configurado
- [ ] PostgreSQL acessível (porta 5432)
- [ ] Redis acessível (porta 6379)
- [ ] Migrations aplicadas (`npx prisma migrate deploy`)
- [ ] Termos HPO importados (`npm run prisma:import-all`)
- [ ] SSL/TLS configurado (HTTPS)
- [ ] Firewall liberado (portas 80, 443)
- [ ] Backup do banco de dados criado
- [ ] Health checks respondendo (GET /health)
- [ ] CORS configurado corretamente
- [ ] Variáveis de ambiente de produção definidas

---

**Última atualização:** 2025-01-25
