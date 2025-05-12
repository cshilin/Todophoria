import 'dotenv/config';

export default {
  expo: {
    name: 'Todophoria',
    slug: 'Todophoria',
    version: '1.0.0',
    entryPoint: "./App.js",
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.example.todophoria',
      runtimeVersion: {
        policy: 'appVersion',
      },
    },
    android: {
      package: 'com.example.todophoria',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      runtimeVersion: '1.0.0',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    owner: 'cshilin',
    updates: {
      url: 'https://u.expo.dev/5976b076-ed22-49b6-bd48-0aad0b2a99dc',
    },
    extra: {
      weatherApiKey: process.env.WEATHER_API_KEY,
      firebase: {
        apiKeyAndroid: process.env.FIREBASE_API_KEY_ANDROID,
        appIdAndroid: process.env.FIREBASE_APP_ID_ANDROID,
        apiKeyIOS: process.env.FIREBASE_API_KEY_IOS,
        appIdIOS: process.env.FIREBASE_APP_ID_IOS,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      },
      eas: {
        projectId: '5976b076-ed22-49b6-bd48-0aad0b2a99dc',
      },
    },
  },
};
