import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useSQLiteContext } from 'expo-sqlite';
import { useUser } from '../UserContext.js';
import { syncFirestoreToSQLite } from '../components/syncUser.jsx';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const db = useSQLiteContext();
  const { setUserId, setFirestoreUserId } = useUser();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user && user.emailVerified) {
          const email = user.email;
          const username = email.split('@')[0];

          let firestoreUserId = await AsyncStorage.getItem('firestoreUserId');
          if (!firestoreUserId) {
            const usersRef = collection(fbdb, 'users');
            const q = query(usersRef, where('email', '==', email));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
              firestoreUserId = snapshot.docs[0].id;
              console.log('Found Firestore user ID for persistent login:', firestoreUserId);
            } else {
              console.warn('No Firestore user found for:', email);
              setCheckingAuth(false); 
              return;
            }
          }

          const result = await db.getFirstAsync(
            'SELECT id FROM users WHERE email = ?',
            [email]
          );

          if (result) {
            const userId = result.id;
            setUserId(userId);
            setFirestoreUserId(firestoreUserId);
            await AsyncStorage.setItem('firestoreUserId', firestoreUserId);
            console.log('Persistent login user ID:', userId);
            await syncFirestoreToSQLite({ firestoreUserId, userId, db });

            // route to home
            router.replace('/home');
          } else {
            console.warn('No local SQLite user found for:', user.email);
            // login if SQLite record is missing
            router.replace('/login');
          }
        } else {
          // No user or not verified show splash content
          setCheckingAuth(false);
        }
      } catch (err) {
        console.error('Failed to get user ID on auto-login:', err);
        // If anything fails
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  if (checkingAuth) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#e0e0e0" />
        <Text style={{ color: '#fff', fontSize: 18, marginTop: 10 }}>Checking login...</Text>
      </View>
    );
  }

  // Show splash screen content if not logged in
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to GymRat</Text>
      <Text style={{color: '#fff', fontSize: 19, padding: 10, textAlign: 'center'}}>Track workouts. Plan meals. Crush goals.</Text>
      <Text style={{color: '#fff', fontSize: 19, padding: 10, textAlign: 'center'}}>All in one place.</Text>
      <Text style={{color: '#808080', fontSize: 13, padding: 5, textAlign: 'center', marginBottom: 20}}>
        Train hard, eat smart, and let your rat buddy lead the way.
      </Text>
      <TouchableOpacity style={styles.customButton} onPress={() => router.replace('/registration')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

// layout
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1b1c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#e0e0e0',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  customButton: {
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
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logo: {
    width: 240,
    height: 180,
    borderRadius: 20,
    marginBottom: 0,
    resizeMode: 'contain',
  },
});
