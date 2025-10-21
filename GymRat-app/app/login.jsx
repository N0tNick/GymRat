import React, { useState, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { deleteUser, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig.js';
import { useUser } from '../UserContext.js';
import { Platform } from 'react-native';
import { fbdb } from '../firebaseConfig.js';
import { collection, query, where, doc, getDocs, setDoc, addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import googleLogo from '../assets/images/googlebutton.png';
import { syncFirestoreToSQLite } from '../components/syncUser.jsx'

import * as Application from 'expo-application';

// Lazy imports to avoid crashing Expo Go
//let GoogleSigninButton;
let useGoogleSignIn;

const isExpoGo = Application.applicationName === "Expo Go";
if (Platform.OS === "android" && !isExpoGo) {
  //GoogleSigninButton = require('@react-native-google-signin/google-signin').GoogleSigninButton;
  useGoogleSignIn = require('../app/gogsignIn.jsx').useGoogleSignIn;
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUserId, setFirestoreUserId } = useUser();
  const db = useSQLiteContext();

  const googleSignIn = useGoogleSignIn ? useGoogleSignIn().signIn : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} />

      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={async () => {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          if (!user.emailVerified) {
            alert('Please verify your email before logging in.');
            return;
          }

        const usersRef = collection(fbdb, "users");
        const q = query(usersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
                
        let firestoreUserId;
                
        if (querySnapshot.empty) {
          console.log("No Firestore user found. Creating new user...");
        
          // Add new document with random ID (Firestore auto-generates it)
          const newUserRef = await addDoc(collection(fbdb, "users"), {
            dob: "2000-01-01",
            email: user.email,
            hasOnboarded: 0,
            profile_icon: "",
            username: user.email.split("@")[0],
          });
        
          firestoreUserId = newUserRef.id;
          console.log("Created new Firestore user with ID:", firestoreUserId);
        
          // Initialize empty subcollections
          const subcollections = ["customExercises", "historyLog", "userStats", "workoutLog", "workoutTemplates", "userStreaks"];
          for (const sub of subcollections) {
            const subRef = collection(fbdb, "users", firestoreUserId, sub);
            await addDoc(subRef, { initialized: true }); // dummy field so Firestore creates it
          }
        
        } else {
          // User already exists, get their doc ID
          firestoreUserId = querySnapshot.docs[0].id;
          console.log("Found existing Firestore user with ID:", firestoreUserId);
        }

          // check if user exists in SQLite
          let userId;
          const existingUser = await db.getFirstAsync(
            'SELECT id FROM users WHERE email = ?',
            [email]
          );

          if (existingUser) {
            userId = existingUser.id;
            console.log('Found existing user ID:', userId);
          } else {
            // create new user in local DB
            const username = email.split('@')[0]; // take from email
            const defaultIcon = 'default_icon'; // placeholder
            const dob = '2000-01-01'; // placeholder
            const hasOnboarded = 0
            
            const insertResult = await db.runAsync(
              'INSERT INTO users (username, email, dob, profile_icon, hasOnboarded) VALUES (?, ?, ?, ?, ?)',
              [username, email, dob, defaultIcon, hasOnboarded]
            );
            
            userId = insertResult.lastInsertRowId;
            console.log('Created new user with ID:', userId);
          }

          setUserId(userId)
          setFirestoreUserId(firestoreUserId)

          // --- SYNC FIRESTORE DATA INTO SQLITE FOR THIS USER ---
          await syncFirestoreToSQLite({ firestoreUserId, userId, db});

          console.log("Firestore to SQLite sync complete for user:", userId);


          await AsyncStorage.setItem('firestoreUserId', firestoreUserId)

          router.replace('/home');
        } catch (error) {
          console.error(error);
          alert(error.message);
        }
      }}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/registration')}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      {/* {GoogleSigninButton && googleSignIn && (
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <GoogleSigninButton
            style={{ width: 192, height: 48 }}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={googleSignIn}
          />
        </View>
      )} */}

      {googleSignIn && (
        <TouchableOpacity style={styles.googleCircle} onPress={googleSignIn}>
          <Image source={googleLogo} style={styles.googleIcon} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1b1c',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    label: {
        color: '#e0e0e0',
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        color: "#000"
    },
    button: {
      backgroundColor: "rgba(255,255,255,0.08)",
      borderColor: "#888",
      borderWidth: 2,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginTop: 10,
      alignItems: 'center'
    },
    buttonText: {
        color: '#e0e0e0',
        fontWeight: 'bold',
        fontSize: 16
    },
    linkText: {
        color: '#e0e0e0',
        textAlign: 'center',
        marginTop: 15,
    },
    title: {
      color: '#e0e0e0',
      fontSize: 35,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 80,
    },
    googleCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#e0e0e0',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginTop: 20,
      overflow: 'hidden',   
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 3,
      elevation: 4,         
    },
    googleIcon: {
      width: '65%',
      height: '65%',
      resizeMode: 'center', 
    },
});