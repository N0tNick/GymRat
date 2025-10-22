import React from 'react';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
const isExpoGo = Application.applicationName === "Expo Go";

// require variables
let GoogleSignin, isErrorWithCode, statusCodes;

if (Platform.OS === 'android' && !isExpoGo) {
  const googleModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleModule.GoogleSignin;
  isErrorWithCode = googleModule.isErrorWithCode;
  statusCodes = googleModule.statusCodes;

  GoogleSignin.configure({
    webClientId: '467813529391-sg1j5mr6r75ae2fn9gnaf1jvcjjau7g8.apps.googleusercontent.com',
    scopes: ['email', 'profile'],
    offlineAccess: true,
    forceCodeForRefreshToken: true,
    iosClientId: '467813529391-r54j585g28775613oglrohtr95seatvj.apps.googleusercontent.com',
  });
}

import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useSQLiteContext } from 'expo-sqlite';
import { useUser } from '../UserContext';
import { useRouter } from 'expo-router';
import { fbdb } from '../firebaseConfig.js';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncFirestoreToSQLite } from '../components/syncUser.jsx'

export const useGoogleSignIn = () => {
  const db = useSQLiteContext();
  const { setUserId, setFirestoreUserId } = useUser();
  const router = useRouter();

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut(); // ensure clean login state

      const userInfo = await GoogleSignin.signIn();
      const { idToken } = userInfo.data;

      if (!idToken) throw new Error('No ID token returned from Google Sign-In');

      // convert to firebase credential
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      const user = userCredential.user;
      const email = user.email;
      const username = email.split('@')[0];
      const profileIcon = user.photoURL || `default_icon_${Date.now()}`;
      const dob = '2000-01-01';

      console.log('Google user signed in:', email);

      // check firestore user
      const usersRef = collection(fbdb, 'users');
      const q = query(usersRef, where('email', '==', email));
      const snapshot = await getDocs(q);

      let firestoreUserId;
      if (snapshot.empty) {
        console.log('No Firestore user found. Creating new one...');
        const newUserRef = await addDoc(usersRef, {
          dob,
          email,
          hasOnboarded: 0,
          profile_icon: profileIcon,
          username,
        });
        firestoreUserId = newUserRef.id;

        // initialize subcollections
        const subcollections = ['customExercises', 'historyLog', 'userStats', 'workoutLog', 'workoutTemplates'];
        for (const sub of subcollections) {
          await addDoc(collection(fbdb, 'users', firestoreUserId, sub), { initialized: true });
        }

        console.log('Created new Firestore user:', firestoreUserId);
      } else {
        firestoreUserId = snapshot.docs[0].id;
        console.log('Found existing Firestore user:', firestoreUserId);
      }

      // 🗄️ Check SQLite user
      const result = await db.getFirstAsync('SELECT id FROM users WHERE email = ?', [email]);
      let userId;

      if (result) {
        userId = result.id;
        console.log('Found existing SQLite user:', userId);
      } else {
        const insert = await db.runAsync(
          'INSERT INTO users (username, email, dob, profile_icon, hasOnboarded) VALUES (?, ?, ?, ?, ?)',
          [username, email, dob, profileIcon, 0]
        );
        userId = insert.lastInsertRowId;
        console.log('Created new SQLite user with ID:', userId);
      }

      // Save context + AsyncStorage
      setUserId(userId);
      setFirestoreUserId(firestoreUserId);
      await AsyncStorage.setItem('firestoreUserId', firestoreUserId);
      // sync with firestore
      await syncFirestoreToSQLite({ firestoreUserId, userId, db });

      router.replace('/home');
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            console.warn('Google Sign-in already in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            alert('Play services not available');
            break;
          default:
            console.log('Google Sign-In error:', JSON.stringify(error, null, 2));
        }
      } else {
        console.error('Non-Google Sign-In error:', error);
        alert(error.message);
      }
    }
  };

  return { signIn };
};
