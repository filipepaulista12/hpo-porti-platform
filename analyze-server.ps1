# Script PowerShell para análise do servidor via SSH
# Modo consultivo - apenas leitura

$server = "200.144.254.4"
$user = "ubuntu"
$password = "vFpyJS4FA"

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "ANÁLISE DO SERVIDOR - RARAS CPLP" -ForegroundColor Cyan
Write-Host "Data: $(Get-Date)" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# Lista de comandos para executar
$commands = @(
    @{
        Title = "1. INFORMAÇÕES BÁSICAS"
        Command = "hostname; uname -a; whoami; pwd"
    },
    @{
        Title = "2. ESPAÇO EM DISCO"
        Command = "df -h"
    },
    @{
        Title = "3. MEMÓRIA RAM"
        Command = "free -h"
    },
    @{
        Title = "4. DOCKER INSTALADO?"
        Command = "docker --version 2>&1; docker ps 2>&1 | head -10"
    },
    @{
        Title = "5. PM2 PROCESSOS"
        Command = "pm2 --version 2>&1; pm2 list 2>&1"
    },
    @{
        Title = "6. NGINX STATUS"
        Command = "nginx -v 2>&1; systemctl status nginx --no-pager 2>&1 | head -10"
    },
    @{
        Title = "7. SITES NGINX"
        Command = "ls -la /etc/nginx/sites-enabled/ 2>&1"
    },
    @{
        Title = "8. ESTRUTURA /var/www/"
        Command = "ls -la /var/www/ 2>&1"
    },
    @{
        Title = "9. ESTRUTURA /var/www/html/filipe/"
        Command = "ls -la /var/www/html/filipe/ 2>&1; echo '---'; du -sh /var/www/html/filipe/ 2>&1"
    },
    @{
        Title = "10. PORTAS EM USO"
        Command = "ss -tlnp 2>&1 | head -25"
    },
    @{
        Title = "11. PROCESSOS RODANDO"
        Command = "ps aux | grep -E 'node|python|php|nginx|apache|docker' | grep -v grep | head -15"
    },
    @{
        Title = "12. CERTIFICADOS SSL"
        Command = "ls -la /etc/letsencrypt/live/ 2>&1"
    },
    @{
        Title = "13. VERSÕES INSTALADAS"
        Command = "node --version 2>&1; npm --version 2>&1; python3 --version 2>&1; php --version 2>&1 | head -1"
    }
)

# Executar cada comando
foreach ($cmd in $commands) {
    Write-Host "`n$($cmd.Title)" -ForegroundColor Yellow
    Write-Host "-------------------------------------" -ForegroundColor Gray
    
    try {
        # Usar plink (PuTTY) se disponível, senão ssh
        $result = & ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$user@$server" $cmd.Command 2>&1
        Write-Host $result
    }
    catch {
        Write-Host "Erro ao executar: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "ANÁLISE CONCLUÍDA" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# Salvar resultado em arquivo
$outputFile = "analise-servidor-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
Write-Host "Salvando resultado em: $outputFile" -ForegroundColor Green
