import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function SplashScreen() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        router.replace('/home'); // go to Home
      } else {
        setCheckingAuth(false); // Show splash if not logged in
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
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  customButton: {
    backgroundColor: '#e6e6e6ff',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 40,
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
