#!/bin/bash
# Script para corrigir Apache ProxyPass - Remover /api da URL enviada ao backend

# Backup
sudo cp /etc/apache2/sites-enabled/hpo.raras-cplp.org.conf /tmp/hpo.conf.backup.$(date +%s)

# Substituir linhas do ProxyPass /api
sudo sed -i '/ProxyPass \/api http/d' /etc/apache2/sites-enabled/hpo.raras-cplp.org.conf
sudo sed -i '/ProxyPassReverse \/api http/d' /etc/apache2/sites-enabled/hpo.raras-cplp.org.conf

# Adicionar nova configuração com RewriteRule (remover /api do caminho)
sudo sed -i '/ProxyPass \/socket.io/i\  # API Backend - Remover /api do caminho\n  RewriteEngine On\n  RewriteCond %{REQUEST_URI} ^/api/\n  RewriteRule ^/api/(.*)$ /$1 [P,L]\n  ProxyPassReverse / http://localhost:3002/\n' /etc/apache2/sites-enabled/hpo.raras-cplp.org.conf

# Reload Apache
sudo systemctl reload apache2

echo "✅ Apache configurado!"
echo ""
echo "Testando:"
curl -s https://hpo.raras-cplp.org/api/health
