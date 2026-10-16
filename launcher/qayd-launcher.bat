@echo off
chcp 65001 >nul
REM ============================================================
REM  قيد للمحاسبة والأنظمة الرقمية - المشغّل
REM  يشغّل قاعدة البيانات وسيرفر الويب ويفتح النظام
REM  المنافذ: قاعدة البيانات 3307 - الويب 8082 (لا تتعارض مع فينكس)
REM ============================================================
setlocal

REM مجلد التثبيت = مجلد هذا الملف (بدون شرطة مائلة زائدة)
set "QAYD_ROOT=%~dp0"
if "%QAYD_ROOT:~-1%"=="\" set "QAYD_ROOT=%QAYD_ROOT:~0,-1%"
set PHP_DIR=%QAYD_ROOT%\components\php
set DB_DIR=%QAYD_ROOT%\components\mariadb
set APP_DIR=%QAYD_ROOT%\app
set DB_PORT=3307
set WEB_PORT=8082

echo.
echo  ========================================
echo   قيد للمحاسبة والأنظمة الرقمية
echo  ========================================
echo.

REM --- بدء قاعدة البيانات ---
echo [1/3] بدء قاعدة البيانات (منفذ %DB_PORT%)...
start "Qayd-DB" /min "%DB_DIR%\bin\mariadbd.exe" --port=%DB_PORT% --datadir="%DB_DIR%\data" --console

REM انتظار جاهزية قاعدة البيانات (حتى 30 ثانية)
set /a TRIES=0
:waitdb
set /a TRIES+=1
"%DB_DIR%\bin\mariadb-admin.exe" --port=%DB_PORT% -u root ping >nul 2>&1
if %ERRORLEVEL%==0 goto dbready
if %TRIES% GEQ 30 (
    echo خطأ: تعذّر بدء قاعدة البيانات
    pause
    exit /b 1
)
timeout /t 1 /nobreak >nul
goto waitdb
:dbready
echo       تم بدء قاعدة البيانات بنجاح

REM --- بدء سيرفر الويب ---
echo [2/3] بدء سيرفر الويب (منفذ %WEB_PORT%)...
start "Qayd-Web" /min "%PHP_DIR%\php.exe" -S 127.0.0.1:%WEB_PORT% -t "%APP_DIR%"

REM انتظار جاهزية السيرفر
timeout /t 3 /nobreak >nul

REM --- فتح المتصفح ---
echo [3/3] فتح النظام...
start "" "http://127.0.0.1:%WEB_PORT%/"

echo.
echo  النظام يعمل الآن على: http://127.0.0.1:%WEB_PORT%/
echo  لإيقاف النظام استخدم: qayd-stop.bat
echo.
endlocal
