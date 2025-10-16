#!/bin/bash

echo "=== Verificando estrutura atual ==="
ls -la /var/www/html/hpo-platform/

echo ""
echo "=== Verificando backend ==="
ls /var/www/html/hpo-platform/backend/

echo ""
echo "=== Verificando frontend ==="
ls /var/www/html/hpo-platform/frontend/

echo ""
echo "=== Corrigindo estrutura do backend ==="
if [ -d "/var/www/html/hpo-platform/backend/hpo-platform-backend" ]; then
    cd /var/www/html/hpo-platform/backend/hpo-platform-backend
    shopt -s dotglob
    mv * ../ 2>/dev/null
    cd ..
    rmdir hpo-platform-backend
    echo "Backend corrigido"
else
    echo "Backend já está no local correto"
fi

echo ""
echo "=== Corrigindo estrutura do frontend ==="
if [ -d "/var/www/html/hpo-platform/frontend/plataforma-raras-cpl" ]; then
    cd /var/www/html/hpo-platform/frontend/plataforma-raras-cpl
    shopt -s dotglob
    mv * ../ 2>/dev/null
    cd ..
    rmdir plataforma-raras-cpl
    echo "Frontend corrigido"
else
    echo "Frontend já está no local correto"
fi

echo ""
echo "=== Verificando arquivos essenciais ==="
echo "Backend package.json:"
test -f /var/www/html/hpo-platform/backend/package.json && echo "✓ OK" || echo "✗ FALTA"

echo "Backend tsconfig.json:"
test -f /var/www/html/hpo-platform/backend/tsconfig.json && echo "✓ OK" || echo "✗ FALTA"

echo "Backend src/server.ts:"
test -f /var/www/html/hpo-platform/backend/src/server.ts && echo "✓ OK" || echo "✗ FALTA"

echo "Backend prisma/schema.prisma:"
test -f /var/www/html/hpo-platform/backend/prisma/schema.prisma && echo "✓ OK" || echo "✗ FALTA"

echo "Frontend package.json:"
test -f /var/www/html/hpo-platform/frontend/package.json && echo "✓ OK" || echo "✗ FALTA"

echo "Frontend vite.config.ts:"
test -f /var/www/html/hpo-platform/frontend/vite.config.ts && echo "✓ OK" || echo "✗ FALTA"

echo "Frontend src/main.tsx:"
test -f /var/www/html/hpo-platform/frontend/src/main.tsx && echo "✓ OK" || echo "✗ FALTA"

echo ""
echo "=== Estrutura final ==="
echo "Backend:"
ls -1 /var/www/html/hpo-platform/backend/ | head -15

echo ""
echo "Frontend:"
ls -1 /var/www/html/hpo-platform/frontend/ | head -15
