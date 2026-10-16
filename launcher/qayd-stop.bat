@echo off
REM ============================================================
REM  قيد - إيقاف النظام (قاعدة البيانات + سيرفر الويب)
REM ============================================================
echo إيقاف نظام قيد...
taskkill /FI "WINDOWTITLE eq Qayd-DB" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Qayd-Web" /F >nul 2>&1
REM إيقاف احتياطي عبر اسم العملية
taskkill /IM mariadbd.exe /F >nul 2>&1
echo تم إيقاف النظام.
timeout /t 2 /nobreak >nul
