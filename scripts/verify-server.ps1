# Verificar e limpar pastas no servidor HPO
ssh ubuntu@200.144.254.4 @"
echo '=== CONTEÚDO ATUAL ==='
echo ''
echo 'Backend dist/:'
ls -lh /var/www/html/hpo-platform/backend/dist/
echo ''
echo 'Frontend public/:'
ls -lh /var/www/html/hpo-platform/public/
"@
