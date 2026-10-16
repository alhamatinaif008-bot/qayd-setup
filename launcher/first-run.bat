@echo off
REM ============================================================
REM  قيد - إعداد أول تشغيل
REM  يُنفّذ مرة واحدة: تهيئة قاعدة البيانات وإنشاء الشركة
REM ============================================================
setlocal

set QAYD_ROOT=%~dp0..
set DB_DIR=%QAYD_ROOT%\components\mariadb
set DB_PORT=3307
set SETUP_DIR=%QAYD_ROOT%\setup

echo.
echo  ========================================
echo   إعداد نظام قيد - أول تشغيل
echo  ========================================
echo.

REM --- تهيئة مجلد البيانات (أول مرة فقط) ---
if exist "%DB_DIR%\data\mysql" (
    echo مجلد البيانات موجود مسبقاً - تخطي التهيئة
) else (
    echo [1/4] تهيئة قاعدة البيانات...
    "%DB_DIR%\bin\mariadb-install-db.exe" --datadir="%DB_DIR%\data" --port=%DB_PORT%
    if %ERRORLEVEL% NEQ 0 (
        echo خطأ في تهيئة قاعدة البيانات
        pause
        exit /b 1
    )
)

REM --- بدء قاعدة البيانات مؤقتاً ---
echo [2/4] بدء قاعدة البيانات...
start "Qayd-DB-Setup" /min "%DB_DIR%\bin\mariadbd.exe" --port=%DB_PORT% --datadir="%DB_DIR%\data" --console
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

REM --- إنشاء قاعدة البيانات والجداول ---
echo [3/4] إنشاء قاعدة البيانات والجداول...
"%DB_DIR%\bin\mariadb.exe" --port=%DB_PORT% -u root -e "CREATE DATABASE IF NOT EXISTS qayd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
"%DB_DIR%\bin\mariadb.exe" --port=%DB_PORT% -u root qayd < "%SETUP_DIR%\schema.sql"
if %ERRORLEVEL% NEQ 0 (
    echo خطأ في إنشاء الجداول
    pause
    exit /b 1
)

REM --- إنشاء المستخدم الإداري ---
echo [4/4] إنشاء المستخدم الإداري...
"%DB_DIR%\bin\mariadb.exe" --port=%DB_PORT% -u root qayd < "%SETUP_DIR%\seed.sql"

REM --- إيقاف قاعدة البيانات المؤقتة ---
taskkill /FI "WINDOWTITLE eq Qayd-DB-Setup" /F >nul 2>&1

echo.
echo  ========================================
echo   تم الإعداد بنجاح!
echo   شغّل qayd-launcher.bat لبدء النظام
echo  ========================================
echo.
pause
endlocal
