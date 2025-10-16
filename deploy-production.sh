#!/bin/bash

# ==============================================
# DEPLOY PARA PRODUÇÃO - Docker Compose
# ==============================================

set -e  # Exit on error

echo "🚀 HPO Translation Platform - Deploy para Produção"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ==============================================
# 1. VERIFICAÇÕES PRÉ-DEPLOY
# ==============================================
echo -e "${YELLOW}[1/7] Verificando pré-requisitos...${NC}"

if [ ! -f .env.production.local ]; then
    echo -e "${RED}❌ Erro: .env.production.local não encontrado!${NC}"
    echo "Copie .env.production.example para .env.production.local e configure"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Erro: Docker não está instalado!${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Erro: Docker Compose não está instalado!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Pré-requisitos OK${NC}"
echo ""

# ==============================================
# 2. BACKUP DO BANCO DE DADOS (se existir)
# ==============================================
echo -e "${YELLOW}[2/7] Backup do banco de dados...${NC}"

if docker ps -a | grep -q hpo-postgres-prod; then
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker exec hpo-postgres-prod pg_dump -U postgres hpo_platform > "./backups/$BACKUP_FILE" || true
    echo -e "${GREEN}✅ Backup criado: $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}⚠️  Nenhum container de produção encontrado (primeira vez?)${NC}"
fi
echo ""

# ==============================================
# 3. PARAR CONTAINERS ANTIGOS
# ==============================================
echo -e "${YELLOW}[3/7] Parando containers antigos...${NC}"
docker-compose -f docker-compose.prod.yml down || true
echo -e "${GREEN}✅ Containers parados${NC}"
echo ""

# ==============================================
# 4. BUILD DAS IMAGENS
# ==============================================
echo -e "${YELLOW}[4/7] Building Docker images...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache
echo -e "${GREEN}✅ Build concluído${NC}"
echo ""

# ==============================================
# 5. INICIAR CONTAINERS
# ==============================================
echo -e "${YELLOW}[5/7] Iniciando containers...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production.local up -d
echo -e "${GREEN}✅ Containers iniciados${NC}"
echo ""

# ==============================================
# 6. AGUARDAR SERVIÇOS FICAREM PRONTOS
# ==============================================
echo -e "${YELLOW}[6/7] Aguardando serviços ficarem prontos...${NC}"
sleep 10

# Check database
until docker exec hpo-postgres-prod pg_isready -U postgres > /dev/null 2>&1; do
    echo "⏳ Aguardando PostgreSQL..."
    sleep 2
done
echo -e "${GREEN}✅ PostgreSQL pronto${NC}"

# Check backend
until curl -f http://localhost:80/health > /dev/null 2>&1; do
    echo "⏳ Aguardando Backend..."
    sleep 2
done
echo -e "${GREEN}✅ Backend pronto${NC}"
echo ""

# ==============================================
# 7. APLICAR MIGRATIONS
# ==============================================
echo -e "${YELLOW}[7/7] Aplicando migrations do Prisma...${NC}"
docker exec hpo-backend-prod npx prisma migrate deploy
echo -e "${GREEN}✅ Migrations aplicadas${NC}"
echo ""

# ==============================================
# RESUMO FINAL
# ==============================================
echo "=================================================="
echo -e "${GREEN}🎉 DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
echo "=================================================="
echo ""
echo "📊 Status dos serviços:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "🌐 URLs:"
echo "  Frontend:       http://seu-servidor (porta 80)"
echo "  API:            http://seu-servidor/api"
echo "  Health Check:   http://seu-servidor/health"
echo ""
echo "📝 Logs úteis:"
echo "  Ver logs:       docker-compose -f docker-compose.prod.yml logs -f"
echo "  Logs backend:   docker logs -f hpo-backend-prod"
echo "  Logs nginx:     docker logs -f hpo-nginx-prod"
echo ""
echo "🛑 Para parar:"
echo "  docker-compose -f docker-compose.prod.yml down"
echo ""
