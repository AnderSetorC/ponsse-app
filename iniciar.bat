@echo off
chcp 65001 >nul
title Ponsse App - Servidor de Desenvolvimento
cd /d "%~dp0"

echo ========================================
echo   Ponsse App - Servidor de Desenvolvimento
echo ========================================
echo.

if not exist "node_modules" (
    echo Instalando dependencias (primeira vez)...
    call npm install
    if errorlevel 1 goto ERRO
    echo.
)

echo Iniciando servidor...
echo A pagina abrira automaticamente no navegador.
echo.
echo Para parar o servidor, pressione Ctrl+C nesta janela.
echo ========================================
echo.

REM Abre o navegador em 10 segundos
start "" cmd /c "timeout /t 10 /nobreak >nul & start http://localhost:3000"

call npm run dev
goto FIM

:ERRO
echo.
echo Ocorreu um erro. Verifique se o Node.js esta instalado.
pause
exit /b 1

:FIM
pause
