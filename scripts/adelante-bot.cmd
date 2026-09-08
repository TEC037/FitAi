@echo off
rem adelante-bot.cmd
rem Lanzador de doble clic para el vigilante de inactividad.
rem Evita el cierre instantaneo por ExecutionPolicy y arranca minimizado.
title adelante-bot
powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Minimized -File "%~dp0adelante-bot.ps1" %*