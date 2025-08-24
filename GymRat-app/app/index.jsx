import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useSQLiteContext } from 'expo-sqlite';
import { useUser } from '../UserContext.js';

export default function SplashScreen() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const db = useSQLiteContext();
  const { setUserId } = useUser();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
      try {
          // Lookup user ID by email
          const result = await db.getFirstAsync(
            'SELECT id FROM users WHERE email = ?',
            [user.email]
          );

          if (result) {
            setUserId(result.id);
            console.log('Persistent login user ID:', result.id);
          } else {
            console.warn('No local SQLite user found for:', user.email);
          }
          // Now route to home
          router.replace('/home');
        } catch (err) {
          console.error('Failed to get user ID on auto-login:', err);
        }
      } else {
        setCheckingAuth(false); // Show splash if not logged in
      }
    });

    return () => unsubscribe();
  }, []);

  if (checkingAuth) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ color: '#fff', fontSize: 18, marginTop: 10 }}>Checking login...</Text>
      </View>
    );
  }

  // Show splash screen content if not logged in
  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/undraw_athletes-training_koqa.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome to GymRat</Text>
      <Text style={{color: '#fff', fontSize: 19, padding: 10, textAlign: 'center'}}>Track workouts. Plan meals. Crush goals.</Text>
      <Text style={{color: '#fff', fontSize: 19, padding: 10, textAlign: 'center'}}>All in one place.</Text>
      <Text style={{color: '#808080', fontSize: 13, padding: 5, textAlign: 'center', marginBottom: 20}}>
        Train hard, eat smart, and let your rat buddy lead the way.
      </Text>
      <TouchableOpacity style={styles.customButton} onPress={() => router.replace('/registration')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => Linking.openURL("https://www.fatsecret.com")}>
        {/*<!-- Begin fatsecret Platform API HTML Attribution Snippet -->*/}
        <Text href="https://www.fatsecret.com">Powered by fatsecret</Text>
        {/*<!-- End fatsecret Platform API HTML Attribution Snippet -->*/}
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
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  customButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
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
