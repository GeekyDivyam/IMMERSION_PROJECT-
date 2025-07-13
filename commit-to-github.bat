@echo off
echo Initializing Git repository and committing to GitHub...
echo.

REM Initialize git repository
git init

REM Add remote origin
git remote add origin https://github.com/GeekyDivyam/IMMERSION_PROJECT-.git

REM Add all files
git add .

REM Commit with message
git commit -m "Initial commit: E-Library Management System - MERN Stack Application"

REM Push to GitHub
git push -u origin main

echo.
echo Project successfully committed to GitHub!
echo Repository: https://github.com/GeekyDivyam/IMMERSION_PROJECT-.git
pause
