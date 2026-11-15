@echo off
title RailBus - Full Stack Platform Launcher
echo =================================================================
echo             RailBus Full-Stack Platform Launcher
echo       Starting Backend (Port 5000) + Frontend (Port 5173)
echo =================================================================
echo.
cd /d "%~dp0"
node scripts\start-site.js
pause
