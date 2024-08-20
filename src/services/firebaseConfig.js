import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const androidConfig = {
  apiKey: 'AIzaSyAusXQ9BU7vyP-uqLWTKj5KkPcpILwVSLQ',
  authDomain: 'todophoria.firebaseapp.com',
  projectId: 'todophoria',
  storageBucket: 'todophoria.appspot.com',
  messagingSenderId: '706599628149',
  appId: '1:706599628149:android:b4e7e209e97e9a5912f73c',
};

const iosConfig = {
  apiKey: 'AIzaSyAJaQG0Tphzu9vOTrx6KabQgkpJ4dzw92s',
  authDomain: 'todophoria.firebaseapp.com',
  projectId: 'todophoria',
  storageBucket: 'todophoria.appspot.com',
  messagingSenderId: '706599628149',
  appId: '1:706599628149:ios:95c8eb70d3b057e312f73c',
};

const firebaseConfig = Constants.platform.ios ? iosConfig : androidConfig;

// initialize Firebase
const FIREBASE_APP = initializeApp(firebaseConfig);

// initialize persistance storage
initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// initialize Firebase services
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);

export { FIREBASE_APP };