// firebaseConfig.js
import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, browserSessionPersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1qnIUYIe48Uxl4X4ZTNENnGhalqVhKng",
  authDomain: "gymrat405-3afb8.firebaseapp.com",
  projectId: "gymrat405-3afb8",
  storageBucket: "gymrat405-3afb8.firebasestorage.app",
  messagingSenderId: "467813529391",
  appId: "1:467813529391:web:35d27d28d274ebd07a13da",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Use persistent auth with AsyncStorage for React Native

const persistence = Platform.OS === 'web'
           ? browserSessionPersistence
           : getReactNativePersistence(ReactNativeAsyncStorage);
       const auth = initializeAuth(app, {persistence});

export { auth };

// IOS: 467813529391-r54j585g28775613oglrohtr95seatvj.apps.googleusercontent.com
// WEB: 467813529391-sg1j5mr6r75ae2fn9gnaf1jvcjjau7g8.apps.googleusercontent.com
// ANDROID: 467813529391-nrsjikr6jga35neg0ijifu1ik0p0rs58.apps.googleusercontent.com