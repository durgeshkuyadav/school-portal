@echo off
echo Fixing import paths...

cd /d "%~dp0"

:: Fix LoginPage.jsx
powershell -Command "(Get-Content 'frontend\src\pages\auth\LoginPage.jsx' -Raw) -replace [regex]::Escape(\"from '../store/slices/authSlice'\"), \"from '../../store/slices/authSlice'\" | Set-Content 'frontend\src\pages\auth\LoginPage.jsx' -NoNewline"

:: Fix StudentProfile.jsx  
powershell -Command "(Get-Content 'frontend\src\pages\student\StudentProfile.jsx' -Raw) -replace [regex]::Escape(\"from '../context/AppSettingsContext'\"), \"from '../../context/AppSettingsContext'\" | Set-Content 'frontend\src\pages\student\StudentProfile.jsx' -NoNewline"
powershell -Command "(Get-Content 'frontend\src\pages\student\StudentProfile.jsx' -Raw) -replace [regex]::Escape(\"from '../store/slices/authSlice'\"), \"from '../../store/slices/authSlice'\" | Set-Content 'frontend\src\pages\student\StudentProfile.jsx' -NoNewline"

:: Fix TeacherProfile.jsx
powershell -Command "(Get-Content 'frontend\src\pages\teacher\TeacherProfile.jsx' -Raw) -replace [regex]::Escape(\"from '../context/AppSettingsContext'\"), \"from '../../context/AppSettingsContext'\" | Set-Content 'frontend\src\pages\teacher\TeacherProfile.jsx' -NoNewline"
powershell -Command "(Get-Content 'frontend\src\pages\teacher\TeacherProfile.jsx' -Raw) -replace [regex]::Escape(\"from '../store/slices/authSlice'\"), \"from '../../store/slices/authSlice'\" | Set-Content 'frontend\src\pages\teacher\TeacherProfile.jsx' -NoNewline"

echo.
echo Verifying fixes...
findstr "authSlice" "frontend\src\pages\auth\LoginPage.jsx"
findstr "AppSettingsContext" "frontend\src\pages\student\StudentProfile.jsx"
findstr "AppSettingsContext" "frontend\src\pages\teacher\TeacherProfile.jsx"

echo.
echo Pushing to GitHub...
git add frontend/src/pages/auth/LoginPage.jsx
git add frontend/src/pages/student/StudentProfile.jsx
git add frontend/src/pages/teacher/TeacherProfile.jsx
git commit -m "fix: correct ../../ import paths in auth/student/teacher pages"
git push origin main

echo.
echo DONE! Check GitHub Actions.
pause
