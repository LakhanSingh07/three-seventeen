@echo off
echo ===================================================
echo   3:17 Case 001 - Android APK Build Script
echo ===================================================

set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=C:\Users\lakha\AppData\Local\Android\Sdk"
set "ANDROID_SDK_ROOT=C:\Users\lakha\AppData\Local\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"

echo [1/4] Building web application (Vite)...
call npm run build
if errorlevel 1 (
    echo [ERROR] Web build failed!
    exit /b 1
)

echo [2/4] Syncing assets with Android project (Capacitor)...
call npx cap sync android
if errorlevel 1 (
    echo [ERROR] Capacitor sync failed!
    exit /b 1
)

echo [3/4] Compiling Android Release APK (Gradle)...
cd android
call gradlew.bat :app:assembleRelease --no-daemon
if errorlevel 1 (
    echo [ERROR] Gradle build failed!
    cd ..
    exit /b 1
)
cd ..

echo [4/4] Copying final APK to dist-apk/...
if not exist dist-apk mkdir dist-apk
copy /y android\app\build\outputs\apk\release\app-release.apk dist-apk\three-seventeen-latest.apk >nul
copy /y android\app\build\outputs\apk\release\app-release.apk dist-apk\three-seventeen-v1.0.0-release.apk >nul

echo ===================================================
echo   BUILD SUCCESSFUL!
echo   APK: dist-apk\three-seventeen-latest.apk
echo ===================================================
