import React from 'react';
import { Platform } from 'react-native';

import * as Application from 'expo-application';

import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

const isExpoGo = Application.applicationName === "Expo Go";

if (Platform.OS === 'android' && !isExpoGo) {
  GoogleSignin.configure({
    webClientId: '467813529391-sg1j5mr6r75ae2fn9gnaf1jvcjjau7g8.apps.googleusercontent.com',
    scopes: ['email', 'profile'],
    offlineAccess: true,
    forceCodeForRefreshToken: true,
    iosClientId: '467813529391-r54j585g28775613oglrohtr95seatvj.apps.googleusercontent.com',
  })
}


import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useSQLiteContext } from 'expo-sqlite';
import { useUser } from '../UserContext';
import { useRouter } from 'expo-router';

export const useGoogleSignIn = () => {
  const db = useSQLiteContext();
  const { setUserId } = useUser();
  const router = useRouter();

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();

      await GoogleSignin.signOut();

      const userInfo = await GoogleSignin.signIn();
      const { idToken } = userInfo.data;

      if (!idToken) {
        throw new Error('No ID token returned from Google Sign-In');
      }

      // Convert to Firebase credential
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      const user = userCredential.user;

      const email = user.email
      const username = user.email.split('@')[0];
      const profileIcon = user.photoURL || `default_icon_${Date.now()}`;
      const dob = '2000-01-01'; // placeholder

      console.log('Google user signed in:', email);

      // Check if user exists in local SQLite
      const result = await db.getFirstAsync('SELECT id FROM users WHERE email = ?', [email]);
      let userId;

      if (result) {
        userId = result.id;
        console.log('Found existing Google user:', userId);
      } else {
        try {
          const insertResult = await db.runAsync(
            'INSERT INTO users (username, email, dob, profile_icon) VALUES (?, ?, ?, ?)',
            [username, email, dob, profileIcon] 
          );
          userId = insertResult.lastInsertRowId;
        } catch (dbError) {
          console.error("Sqlite insert error", dbError);
          throw dbError;
        }
      
        const insertResult = await db.runAsync(
          'INSERT INTO users (username, email, dob, profile_icon) VALUES (?, ?, ?, ?)',
          [username, email, dob, profileIcon]
        );

        userId = insertResult.lastInsertRowId;
        console.log('Created new Google user with ID:', userId);
      }

      setUserId(userId);
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
            console.log("Google Sign-In error:", JSON.stringify(error, null, 2));
        }
      } else {
        console.error('Non-Google Sign-In error:', error);
      }
    }
  };

  return { signIn };
};
