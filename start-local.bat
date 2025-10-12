@echo off
echo ========================================
echo    EDUCSTATION - INICIO LOCAL BACKEND
echo ========================================
echo.

echo Verificando archivo .env...
if not exist .env (
    echo Copiando configuracion local...
    copy .env_local .env
    echo ✅ Archivo .env creado desde .env_local
) else (
    echo ✅ Archivo .env ya existe
)

echo.
echo Iniciando servidor backend en puerto 5000...
echo URL: http://localhost:5000
echo.
echo Presiona Ctrl+C para detener el servidor
echo ========================================

npm run dev 