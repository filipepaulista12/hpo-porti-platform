#!/usr/bin/env pwsh
# Script para limpar cache e iniciar dev server

Write-Host "🧹 Limpando cache do Vite..." -ForegroundColor Cyan

# Remove cache do Vite
if (Test-Path "node_modules/.vite") {
    Remove-Item -Recurse -Force "node_modules/.vite"
    Write-Host "✓ Cache do Vite removido" -ForegroundColor Green
}

# Remove dist
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✓ Pasta dist removida" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Iniciando dev server..." -ForegroundColor Yellow
Write-Host "💡 Dica: Use Ctrl+F5 no navegador para forçar reload" -ForegroundColor Magenta
Write-Host ""

# Inicia dev server
npm run dev
