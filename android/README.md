# Mentis — Turnkey Android Studio & APK Project

This directory contains the standalone native Android shell for **Mentis**, engineered with Kotlin, AndroidX, and modern Android 14 (API 34) architectural components.

## Priority Guarantees
- **Private & Personal Use**: Zero multi-user accounts, zero social feeds, zero cloud analytics, zero ads.
- **Offline-First**: All data is stored locally on your device in SQLite / WebStorage.
- **Native Android Capabilities**:
  - `MainActivity.kt`: Hardware-accelerated full-screen WebView with dark AMOLED status and navigation bars.
  - `FocusForegroundService.kt`: Ongoing system tray notification showing remaining focus countdown with pause/resume actions.
  - `FocusAccessibilityService.kt`: On-device package detector for intercepting distraction apps (Instagram, TikTok, YouTube Shorts, etc.) during active shield sessions.
  - `MentisAndroidBridge`: JavaScript interface for native haptic vibrations and system permission flows.

## How to Build the APK

### Method 1: Open in Android Studio (Recommended)
1. Open **Android Studio**.
2. Select **Open** and select the `/android` folder.
3. Allow Gradle to sync.
4. Click **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
5. Transfer the generated `app-debug.apk` directly to your phone via USB or Google Drive / AirDrop and install!

### Method 2: Command Line (Gradle)
```bash
cd android
./gradlew assembleDebug
# The APK will be generated at:
# app/build/outputs/apk/debug/app-debug.apk
```

### Method 3: 1-Tap Direct WebAPK Installation (Zero Setup Needed)
You can also install Mentis directly from your Android phone's browser (Chrome, Brave, Samsung Internet):
1. Open the app URL on your phone: `https://ais-pre-5vxjv4ib22qu3biy6cscpj-771594126117.asia-east1.run.app`
2. Tap the in-app **"Install Mentis App on Phone"** button or Chrome menu (`⋮`) → **Install app**.
3. Android creates an official standalone WebAPK directly on your phone's home screen and app drawer.
