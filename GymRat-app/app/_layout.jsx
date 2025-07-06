import { Stack } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="splash">
      <Stack.Screen name="splash" />
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="registration" />

      <Stack.Screen
        name="nutsplash"
        options={{
          title: 'Personal Details',
          headerShown: true,
          headerTintColor: '#1a1b1c',
          headerStyle: { backgroundColor: '#32a852' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.replace('/')}>
              <Text style={{ color: "#1a1b1c", paddingHorizontal: 10, fontSize: 15 }}>Back</Text>
            </TouchableOpacity>
          ),
          headerTitleAlign: 'center',
          headerShadowVisible: false,
        }}
      />

      <Stack.Screen
        name="goal"
        options={{
          title: 'Goal',
          headerShown: true,
          headerTintColor: '#1a1b1c',
          headerStyle: { backgroundColor: '#32a852' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.replace('/nutsplash')}>
              <Text style={{ color: "#1a1b1c", paddingHorizontal: 10, fontSize: 15 }}>Back</Text>
            </TouchableOpacity>
          ),
          headerTitleAlign: 'center',
          headerShadowVisible: false,
        }}
      />

      <Stack.Screen name="nutrition" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="workout" options={{ headerShown: false }} />
      <Stack.Screen name="barcodeScanner" options={{ headerShown: false }} />
    </Stack>
  );
}
