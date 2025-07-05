// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA1qnIUYIe48Uxl4X4ZTNENnGhalqVhKng",
  authDomain: "gymrat405-3afb8.firebaseapp.com",
  projectId: "gymrat405-3afb8",
  storageBucket: "gymrat405-3afb8.firebasestorage.app",
  messagingSenderId: "467813529391",
  appId: "1:467813529391:web:35d27d28d274ebd07a13da",
};

// initialize firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// repushing, this might help
export { auth };


// IOS: 467813529391-r54j585g28775613oglrohtr95seatvj.apps.googleusercontent.com
// WEB: 467813529391-sg1j5mr6r75ae2fn9gnaf1jvcjjau7g8.apps.googleusercontent.com
// ANDROID: 467813529391-nrsjikr6jga35neg0ijifu1ik0p0rs58.apps.googleusercontent.com