$ErrorActionPreference = "Stop"
$path = "c:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\hpo-platform-backend"
Set-Location -Path $path
Write-Host "Current directory: $(Get-Location)"
npm run dev
