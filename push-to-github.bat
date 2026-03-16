@echo off
:: ═══════════════════════════════════════════════════════
:: PUSH TO GITHUB — school-portal V6
:: Run this from: school-portal\ folder
:: ═══════════════════════════════════════════════════════

echo.
echo ╔══════════════════════════════════════════╗
echo ║   School Portal — Push to GitHub V6     ║
echo ╚══════════════════════════════════════════╝
echo.

:: Check if git is initialized
if not exist ".git" (
    echo [SETUP] Git not initialized. Setting up...
    git init
    git remote add origin https://github.com/durgeshkuyadav/school-portal.git
    git branch -M main
    echo [OK] Git initialized and remote added.
) else (
    echo [OK] Git repository found.
)

:: Check remote
echo.
echo [INFO] Remote URL:
git remote get-url origin

:: Stage all changes
echo.
echo [STEP 1] Staging all changes...
git add .

:: Show what will be committed
echo.
echo [STEP 2] Changes to commit:
git status --short

:: Commit
echo.
echo [STEP 3] Committing...
git commit -m "feat: V6 - bilingual Hindi/English, dark/light mode, teacher/student profiles with photo, science lab theory+practical, nginx performance, init:true for kafka/zookeeper"

:: Push
echo.
echo [STEP 4] Pushing to GitHub...
git push -u origin main

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║  ✅ DONE! Check: github.com/durgeshkuyadav/school-portal ║
echo ╚══════════════════════════════════════════════════════╝
echo.
pause
