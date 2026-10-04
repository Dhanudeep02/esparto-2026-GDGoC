@echo off
title ESPARTO 2026 - Firebase Deployer
color 0E
cd /d "c:\Users\K Dhanudeep\Desktop\GDGoC"
cls
echo ===================================================================
echo               ESPARTO 2026 - FIREBASE HOSTING DEPLOY
echo ===================================================================
echo.
echo  =================================================================
echo   CRITICAL WARNING:
echo   The terminal will show a 5-letter "session ID" (e.g. E2A53).
echo.
echo   *** DO NOT PASTE THAT 5-LETTER SESSION ID! ***
echo.
echo   The REAL authorization code starts with:  4/0A...
echo  =================================================================
echo.
echo  STEPS:
echo   1. Press any key below to start.
echo   2. When the URL appears, copy and open that URL in your browser.
echo   3. Sign in with your Google account and click Allow.
echo   4. Google will give you a code starting with:  4/0A...
echo   5. Right-click here to paste that "4/0A..." code, and press ENTER.
echo.
echo ===================================================================
echo  Press any key when you are ready to begin...
pause >nul
echo.
echo Starting Firebase login...
echo (Remember: ONLY paste the code that starts with 4/0A...)
echo.
firebase login --no-localhost
if errorlevel 1 (
    echo.
    echo ===================================================================
    echo  [ERROR] Login failed.
    echo  Make sure to paste the code starting with 4/0A... (not the session ID).
    echo ===================================================================
    pause
    exit /b 1
)
echo.
echo ===================================================================
echo  [SUCCESS] Logged in! Deploying to Firebase Hosting...
echo ===================================================================
echo.
firebase deploy --only hosting
echo.
echo ===================================================================
echo  [SUCCESS] Deployment complete!
echo  Your website is live at:
echo  https://esparto-2026-gdgoc.web.app
echo  https://esparto-2026-gdgoc.firebaseapp.com
echo ===================================================================
echo.
pause
