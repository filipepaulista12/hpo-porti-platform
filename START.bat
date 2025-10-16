@echo off
echo ========================================
echo HPO TRANSLATION PLATFORM
echo ========================================
echo.

cd /d "C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation"

echo [1/3] Parando processos anteriores...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul
echo   OK - Portas liberadas
echo.

echo [2/3] Iniciando BACKEND (porta 3001)...
start "HPO Backend" cmd /k "cd /d C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\hpo-platform-backend && npm run dev"
timeout /t 8 /nobreak >nul
echo   OK - Backend iniciando...
echo.

echo [3/3] Iniciando FRONTEND (porta 5173)...
start "HPO Frontend" cmd /k "cd /d C:\Users\up739088\Desktop\aplicaçoes,sites,etc\hpo_translation\plataforma-raras-cpl && npm run dev"
timeout /t 5 /nobreak >nul
echo   OK - Frontend iniciando...
echo.

echo ========================================
echo ABRINDO NAVEGADOR...
echo ========================================
timeout /t 3 /nobreak >nul
start http://localhost:5173
echo.

echo ========================================
echo SISTEMA RODANDO!
echo ========================================
echo.
echo Frontend:  http://localhost:5173
echo Backend:   http://localhost:3001
echo WebSocket: ws://localhost:3001/socket.io/
echo.
echo Database: 16.942 termos HPO
echo.
echo Para PARAR: Feche as janelas "HPO Backend" e "HPO Frontend"
echo.
pause
