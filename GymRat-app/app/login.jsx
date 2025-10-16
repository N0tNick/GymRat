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

import * as Application from 'expo-application';

// Lazy imports to avoid crashing Expo Go
let GoogleSigninButton;
let useGoogleSignIn;

const isExpoGo = Application.applicationName === "Expo Go";
if (Platform.OS === "android" && !isExpoGo) {
  GoogleSigninButton = require('@react-native-google-signin/google-signin').GoogleSigninButton;
  useGoogleSignIn = require('../app/gogsignIn.jsx').useGoogleSignIn;
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUserId, setFirestoreUserId } = useUser();
  const db = useSQLiteContext();

  const googleSignIn = useGoogleSignIn ? useGoogleSignIn().signIn : null;

  //useEffect(() => {
  //  const testFirestore = async () => {
  //    try {
  //      const usersSnap = await getDocs(collection(db, "users"));
  //      console.log("Firestore connection successful! Found", usersSnap.size, "users.");
  //    } catch (err) {
  //      console.error("Firestore test failed:", err);
  //    }
  //  };
  //
  //  testFirestore();
  //}, []);

  return (
    <View style={styles.container}>
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
          const subcollections = ["customExercises", "historyLog", "userStats", "workoutLog", "workoutTemplates"];
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
          console.log("Starting Firestore to SQLite sync for:", firestoreUserId);

          const collectionsToSync = [
            "customExercises",
            "historyLog",
            "userStats",
            "workoutLog",
            "workoutTemplates",
            "userStreaks"
          ];

          for (const col of collectionsToSync) {
            try {
              const colRef = collection(fbdb, "users", firestoreUserId, col);
              const snap = await getDocs(colRef);
            
              if (snap.empty) {
                console.log(`No Firestore data found for ${col}`);
                continue;
              }
            
              let imported = 0;
            
              for (const docSnap of snap.docs) {
                const data = docSnap.data();
                if (data.initialized) continue; // skip placeholder docs
              
                switch (col) {
                  // ------------------ customExercises ------------------
                  case "customExercises": {
                    const exists = await db.getFirstAsync(
                      "SELECT id FROM customExercises WHERE name = ? AND user_id = ?",
                      [data.name, userId]
                    );
                    if (!exists) {
                      await db.runAsync(
                        `INSERT INTO customExercises 
                         (user_id, name, equipment, primaryMuscle, instructions)
                         VALUES (?, ?, ?, ?, ?)`,
                        [
                          userId,
                          data.name ?? "",
                          data.equipment ?? "",
                          data.primaryMuscle ?? "",
                          data.instructions ?? ""
                        ]
                      );
                      imported++;
                    }
                    break;
                  }
                
                  // ------------------ historyLog ------------------
                  case "historyLog": {
                    const exists = await db.getFirstAsync(
                      "SELECT id FROM historyLog WHERE date = ? AND name = ? AND user_id = ?",
                      [data.date, data.name, userId]
                    );
                    if (!exists) {
                      await db.runAsync(
                      `INSERT INTO historyLog (
                        user_id, date, name, calories, protein, cholesterol, sodium,
                        total_Fat, saturated_Fat, trans_Fat, polyunsaturated_Fat,
                        monosaturated_Fat, total_Carbs, fiber, sugar, vitamin_A,
                        vitamin_C, vitamin_D, vitamin_E, vitamin_K, vitamin_B1,
                        vitamin_B2, vitamin_B3, vitamin_B5, vitamin_B6, vitamin_B7,
                        vitamin_B9, vitamin_B12, iron, calcium, potassium
                      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                      [
                        userId, data.date ?? "", data.name ?? "", data.calories ?? "0", data.protein ?? "0",
                        data.cholesterol ?? "0", data.sodium ?? "0", data.total_Fat ?? "0",
                        data.saturated_Fat ?? "0", data.trans_Fat ?? "0", data.polyunsaturated_Fat ?? "0",
                        data.monosaturated_Fat ?? "0", data.total_Carbs ?? "0", data.fiber ?? "0",
                        data.sugar ?? "0", data.vitamin_A ?? "0", data.vitamin_C ?? "0", data.vitamin_D ?? "0",
                        data.vitamin_E ?? "0", data.vitamin_K ?? "0", data.vitamin_B1 ?? "0", data.vitamin_B2 ?? "0",
                        data.vitamin_B3 ?? "0", data.vitamin_B5 ?? "0", data.vitamin_B6 ?? "0", data.vitamin_B7 ?? "0",
                        data.vitamin_B9 ?? "0", data.vitamin_B12 ?? "0", data.iron ?? "0", data.calcium ?? "0", data.potassium ?? "0"
                      ]
                    );
                      imported++;
                    }
                    break;
                  }
                
                  // ------------------ userStats ------------------
                  case "userStats": {
                    const exists = await db.getFirstAsync(
                      "SELECT user_id FROM userStats WHERE user_id = ?",
                      [userId]
                    );
                    if (!exists) {
                      await db.runAsync(
                        `INSERT INTO userStats (
                          user_id, sex, weight, height, activity_lvl, BMI, BMR,
                          body_fat, nut_goal, goal_weight, gain_speed
                        ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
                        [
                          userId,
                          data.sex ?? "unknown",
                          data.weight ?? "0",
                          data.height ?? "0",
                          data.activity_lvl ?? "sedentary",
                          data.BMI ?? "0",
                          data.BMR ?? "0",
                          data.body_fat ?? "0",
                          data.nut_goal ?? "maintenance",
                          data.goal_weight ?? "0",
                          data.gain_speed ?? "moderate"
                        ]
                      );
                      imported++;
                    }
                    break;
                  }
                
                  // ------------------ workoutLog ------------------
                  case "workoutLog": {
                    const exists = await db.getFirstAsync(
                      "SELECT id FROM workoutLog WHERE workout_name = ? AND date = ? AND user_id = ?",
                      [data.workout_name, data.date, userId]
                    );
                    if (!exists) {
                      await db.runAsync(
                        `INSERT INTO workoutLog (user_id, workout_name, date)
                         VALUES (?, ?, ?)`,
                        [
                          userId,
                          data.workout_name ?? "Unnamed Workout",
                          data.date ?? new Date().toISOString()
                        ]
                      );
                      imported++;
                    }
                    break;
                  }
                
                  // ------------------ workoutTemplates ------------------
                  case "workoutTemplates": {
                    const exists = await db.getFirstAsync(
                      "SELECT id FROM workoutTemplates WHERE name = ? AND user_id = ?",
                      [data.name, userId]
                    );
                    if (!exists) {
                      await db.runAsync(
                        `INSERT INTO workoutTemplates (user_id, name, data)
                         VALUES (?, ?, ?)`,
                        [userId, data.name ?? "Untitled", JSON.stringify(data.data ?? {})]
                      );
                      imported++;
                    }
                    break;
                  }

                  case "userStreaks": {
                    const streakDoc = docSnap.data();
                    if (streakDoc.initialized) continue;

                    const exists = await db.getFirstAsync(
                      "SELECT user_id FROM userStreaks WHERE user_id = ?",
                      [userId]
                    );
                  
                    if (!exists) {
                      await db.runAsync(
                        `INSERT INTO userStreaks (user_id, current_streak, best_streak, last_open_date)
                         VALUES (?, ?, ?, ?)`,
                        [
                          userId,
                          streakDoc.current_streak ?? 0,
                          streakDoc.best_streak ?? 0,
                          streakDoc.last_open_date ?? new Date().toISOString().split("T")[0]
                        ]
                      );
                    } else {
                      await db.runAsync(
                        `UPDATE userStreaks SET current_streak = ?, best_streak = ?, last_open_date = ? WHERE user_id = ?`,
                        [
                          streakDoc.current_streak ?? 0,
                          streakDoc.best_streak ?? 0,
                          streakDoc.last_open_date ?? new Date().toISOString().split("T")[0],
                          userId
                        ]
                      );
                    }
                  
                    break;
                  } 
                }
              }
              
            
              console.log(`Imported ${imported} new records for ${col}`);
            } catch (err) {
              console.error(`Error syncing ${col}:`, err);
            }
          }

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

      {GoogleSigninButton && googleSignIn && (
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <GoogleSigninButton
            style={{ width: 192, height: 48 }}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={googleSignIn}
          />
        </View>
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
        color: '#fff',
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    linkText: {
        color: '#ccc',
        textAlign: 'center',
        marginTop: 15,
    },
});