import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function Layout() {
  // for persisten login
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser && currentUser.emailVerified ? currentUser : null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1a1b1c', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 20 }}>Loading...</Text>
      </View>
    );
  }
  // end of persistent login

  return (
    <Stack screenOptions={{headerShown: false}} initialRouteName="splash">
      
      <Stack.Screen name="index" />

      <Stack.Screen name="nutsplash" options={{ 
        title: 'Personal Details', 
        headerShown: true,
        headerTintColor: '#1a1b1c',
        headerStyle: { backgroundColor: '#32a852' },
        headerLeft: () => (<TouchableOpacity onPress={() => router.replace('/')}>
          <Text style={{color: "1a1b1c", paddingHorizontal: 10, fontSize: 15}}>Back</Text>
        </TouchableOpacity>), 
        headerTitleAlign: 'center',
        headerShadowVisible: false,
      }}/>

      <Stack.Screen name="nutrition" options={{ headerShown: false}} />
      <Stack.Screen name="profile" options={{ headerShown: false}} />
      <Stack.Screen name="workout" options={{ headerShown: false }} />
      <Stack.Screen name="barcodeScanner" options={{ headerShown: false }} />
      <Stack.Screen name="splash" />

    </Stack>
  );
}