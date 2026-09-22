@echo off
cd /d "%~dp0"
call npm run portfolio:preview
if errorlevel 1 pause
