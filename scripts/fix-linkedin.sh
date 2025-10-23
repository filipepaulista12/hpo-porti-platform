#!/bin/bash
# Corrigir LinkedIn OAuth no servidor

cd /var/www/html/hpo-platform/backend

# Remover linhas LinkedIn antigas
sed -i '/LINKEDIN/d' .env

# Adicionar LinkedIn correto
cat >> .env << 'EOF'

# LinkedIn OAuth - PRODUÇÃO
LINKEDIN_CLIENT_ID=77x5k5zmu04ct4
LINKEDIN_CLIENT_SECRET=WPL_AP1.INTjMTNN6PAEty4b.xVZLgw==
LINKEDIN_REDIRECT_URI=https://hpo.raras-cplp.org/api/auth/linkedin/callback
EOF

echo "LinkedIn configurado!"
echo ""
echo "Últimas linhas do .env:"
tail -5 .env
