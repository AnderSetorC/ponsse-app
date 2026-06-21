@echo off
chcp 65001 >nul
title Ponsse App - Servidor de Producao
cd /d "%~dp0"

echo ========================================
echo   Ponsse App - Modo Producao
echo ========================================
echo.

if not exist "node_modules" (
    echo Instalando dependencias (primeira vez)...
    call npm install
    if errorlevel 1 goto ERRO
    echo.
)

:MENU
echo O que deseja fazer?
echo.
echo   [1] Iniciar (sem rebuildar - mais rapido)
echo   [2] Rebuildar e iniciar
echo   [3] Limpar build antigo e rebuildar
echo   [4] Sair
echo.
set /p opcao="Escolha (1-4): "

if "%opcao%"=="1" goto INICIAR
if "%opcao%"=="2" goto BUILD
if "%opcao%"=="3" goto LIMPAR
if "%opcao%"=="4" exit /b 0

echo Opcao invalida.
goto MENU

:LIMPAR
echo.
if exist ".next" (
    echo Removendo build antigo...
    rmdir /s /q ".next"
)
echo.
goto BUILD

:BUILD
echo.
echo Gerando build de producao (pode demorar)...
echo.
call npm run build
if errorlevel 1 goto ERRO
echo.
echo Build concluido!
echo.
goto INICIAR

:INICIAR
echo.
echo ========================================
echo   Servidor rodando!
echo   Acesse: http://localhost:3000
echo   Admin:  http://localhost:3000/admin
echo.
echo   Para parar: Ctrl+C nesta janela
echo ========================================
echo.

REM Abre o navegador em 5 segundos
start "" cmd /c "timeout /t 5 /nobreak >nul & start http://localhost:3000"

call npx next start
goto FIM

:ERRO
echo.
echo Ocorreu um erro. Veja a mensagem acima.
pause
exit /b 1

:FIM
pause
