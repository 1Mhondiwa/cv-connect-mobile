# 📱 CV-Connect Mobile

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-0.81+-blue?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-54+-black?style=for-the-badge&logo=expo)
![Redux](https://img.shields.io/badge/Redux_Toolkit-2.8+-purple?style=for-the-badge&logo=redux)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8+-black?style=for-the-badge&logo=socket.io)

**Mobile application for CV-Connect freelance platform**
<br>
Real-time messaging, video calling, seamless mobile experience
<br>
<br>

[📖 Documentation](#-overview) •
[🚀 Quick Start](#-quick-start) •
[📱 Features](#-features) •
[🛠️ Tech Stack](#-tech-stack)

</div>

---

## 📋 Overview

CV-Connect Mobile is a React Native application that brings the full power of the CV-Connect freelance platform to mobile devices. Featuring real-time messaging, video calling, and comprehensive freelancer tools.

### 🎯 Key Features
- **🎨 Native Mobile Experience** - Smooth, responsive UI optimized for touch
- **💬 Real-time Messaging** - Live chat with typing indicators
- **📹 Video Calling** - WebRTC-powered video interviews
- **📄 CV Management** - Upload, preview, and manage documents
- **🤝 Smart Matching** - AI-powered job recommendations
- **📊 Mobile Analytics** - Real-time insights and metrics
- **🔔 Push Notifications** - Instant alerts for messages and opportunities

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Studio

### Installation
```bash
# Clone and install
git clone https://github.com/1Mhondiwa/cv-connect-mobile.git
cd cv-connect-mobile
npm install

# Setup configuration
cp src/config/config.example.js src/config/config.js
# Edit config.js with your API URLs

# Start development
npm start
```

### Running on Devices
```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Physical Device (Expo Go)
npm start
# Scan QR code with Expo Go app
```

---

## 📱 Features

### Core Functionality
- **User Authentication** - Secure login and registration
- **Profile Management** - Edit freelancer/company profiles
- **Job Search** - Advanced filtering and recommendations
- **Real-time Messaging** - Live chat with notifications
- **Video Calls** - WebRTC-powered interviews
- **Document Upload** - CV and portfolio management

### Mobile-Specific Features
- **Push Notifications** - Real-time alerts
- **Offline Support** - Core functionality without internet
- **Camera Integration** - Profile pictures and document scanning
- **Location Services** - Job recommendations based on location
- **Biometric Authentication** - Secure login options

---

## 🛠️ Tech Stack

- **Framework**: React Native 0.81
- **Platform**: Expo 54
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation 7
- **Real-time**: Socket.io Client
- **Video Calling**: WebRTC
- **File Handling**: Expo Document Picker
- **Notifications**: Expo Notifications

---

## 🏗️ Architecture

```
┌─────────────────┐
│ React Native    │
│ App             │
├─────────────────┤
│ Screens         │
│ Components      │
│ Navigation      │
├─────────────────┤
│ Redux Store     │
│ Services        │
│ Utils           │
├─────────────────┤
│ Socket.io       │
│ WebRTC          │
│ Expo Modules    │
└─────────────────┘
         │
    ┌─────────┐
    │   API   │
    └─────────┘
```

---

## 📱 App Structure

### Main Screens
- **Dashboard** - Overview and quick actions
- **Search** - Job and talent discovery
- **Messages** - Real-time conversations
- **Profile** - User profile management
- **Settings** - App configuration

### Navigation
- **Tab Navigation** - Main app sections
- **Stack Navigation** - Screen-to-screen navigation
- **Modal Navigation** - Overlays and dialogs

---

## 🔧 Configuration

### App Configuration
```javascript
// src/config/config.js
export const config = {
  API_BASE_URL: 'https://your-api-url.com/api',
  SOCKET_URL: 'https://your-api-url.com',
  APP_NAME: 'CV-Connect',
};
```

### Environment Setup
```json
// app.json
{
  "expo": {
    "name": "CV-Connect",
    "slug": "cv-connect",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["ios", "android"]
  }
}
```

---

## 📊 Performance

- **App Start Time**: <3s
- **Screen Transitions**: <500ms
- **API Response Handling**: <200ms
- **Memory Usage**: <100MB
- **Battery Usage**: Optimized

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Generate coverage
npm run test:coverage
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 🚀 Deployment

### Build for Production
```bash
# Android
expo build:android

# iOS
expo build:ios

# Both platforms
expo build:all
```

### App Store Deployment
- **Google Play Store** - Android APK/AAB
- **Apple App Store** - iOS IPA
- **Expo Go** - OTA updates

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ using React Native and Expo**

[🔝 Back to top](#-cv-connect-mobile)

</div>
