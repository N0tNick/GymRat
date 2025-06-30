import React from 'react'
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';


// look of the screen
export default function SplashScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/undraw_athletes-training_koqa.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome to GymRat</Text>
      <Text style={{color: '#fff', fontSize: 19, padding: 10, textAlign: 'center'}}>Track workouts. Plan meals. Crush goals.      All in one place.</Text>
      <Text style={{color: '#808080', fontSize: 13, padding: 5, textAlign: 'center', marginBottom: 20}}>Train hard, eat smart, and let your rat buddy lead the way.</Text>
      <TouchableOpacity style={styles.customButton} onPress={() => router.replace('/registration')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

// overall layout
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
