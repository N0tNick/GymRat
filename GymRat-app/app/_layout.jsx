import * as eva from '@eva-design/eva';
import { ApplicationProvider, Text } from '@ui-kitten/components';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';

// required for userId's
import { SQLiteProvider } from 'expo-sqlite';
import { UserProvider } from '../UserContext';

const MyTheme = {

};

export default function App() {
  const router = useRouter();
  return (
    <ApplicationProvider {...eva} theme={MyTheme}>
    <SQLiteProvider
      databaseName="UserDatabase.db"
      onInit={async (db) => {
        await db.execAsync(
          `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, email TEXT NOT NULL UNIQUE, dob TEXT NOT NULL, profile_icon TEXT NOT NULL UNIQUE);`
        ); 
        await db.execAsync(
          `CREATE TABLE IF NOT EXISTS userSettings (user_id INTEGER NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);`
        );
        await db.execAsync (
          `CREATE TABLE IF NOT EXISTS userStats (user_id INTEGER NOT NULL, sex TEXT DEFAULT 'unknown' NOT NULL, weight TEXT DEFAULT '0' NOT NULL, height TEXT DEFAULT '0' NOT NULL, activity_lvl TEXT DEFAULT 'sedentary' NOT NULL, BMI TEXT DEFAULT '0' NOT NULL, BMR TEXT DEFAULT '0' NOT NULL, body_fat TEXT DEFAULT '0' NOT NULL, nut_goal TEXT DEFAULT 'maintenance' NOT NULL, goal_weight TEXT DEFAULT '0' NOT NULL, gain_speed TEXT DEFAULT 'moderate' NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);`
        );
        await db.execAsync(
          `CREATE TABLE IF NOT EXISTS dailyNutLog (user_id INTEGER NOT NULL, date TEXT NOT NULL, name TEXT NOT NULL, calories TEXT NOT NULL, protein TEXT NOT NULL, cholesterol TEXT NOT NULL, sodium TEXT NOT NULL, total_Fat TEXT NOT NULL, saturated_Fat TEXT NOT NULL, trans_Fat TEXT NOT NULL, polyunsaturated_Fat TEXT NOT NULL, monosaturated_Fat TEXT NOT NULL, total_Carbs TEXT NOT NULL, fiber TEXT NOT NULL, sugar TEXT NOT NULL, vitamin_A TEXT NOT NULL, vitamin_C TEXT NOT NULL, vitamin_D TEXT NOT NULL, vitamin_E TEXT NOT NULL, vitamin_K TEXT NOT NULL, vitamin_B1 TEXT NOT NULL, vitamin_B2 TEXT NOT NULL, vitamin_B3 TEXT NOT NULL, vitamin_B5 TEXT NOT NULL, vitamin_B6 TEXT NOT NULL, vitamin_B7 TEXT NOT NULL, vitamin_B9 TEXT NOT NULL, vitamin_B12 TEXT NOT NULL, iron TEXT NOT NULL, calcium TEXT NOT NULL, potassium TEXT NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);`
        );
        await db.execAsync(
          `CREATE TABLE IF NOT EXISTS storedNutLog (user_id INTEGER NOT NULL, date TEXT NOT NULL PRIMARY KEY, name TEXT NOT NULL, calories TEXT NOT NULL, protein TEXT NOT NULL, cholesterol TEXT NOT NULL, sodium TEXT NOT NULL, total_Fat TEXT NOT NULL, saturated_Fat TEXT NOT NULL, trans_Fat TEXT NOT NULL, polyunsaturated_Fat TEXT NOT NULL, monosaturated_Fat TEXT NOT NULL, total_Carbs TEXT NOT NULL, fiber TEXT NOT NULL, sugar TEXT NOT NULL, vitamin_A TEXT NOT NULL, vitamin_C TEXT NOT NULL, vitamin_D TEXT NOT NULL, vitamin_E TEXT NOT NULL, vitamin_K TEXT NOT NULL, vitamin_B1 TEXT NOT NULL, vitamin_B2 TEXT NOT NULL, vitamin_B3 TEXT NOT NULL, vitamin_B5 TEXT NOT NULL, vitamin_B6 TEXT NOT NULL, vitamin_B7 TEXT NOT NULL, vitamin_B9 TEXT NOT NULL, vitamin_B12 TEXT NOT NULL, iron TEXT NOT NULL, calcium TEXT NOT NULL, potassium TEXT NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);`
        );
        await db.execAsync(
          `CREATE TABLE IF NOT EXISTS workoutTemplates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          data TEXT
          );`
        );

        await db.execAsync('PRAGMA journal_mode=WAL');
        }}
        options={{useNewConnection: true, enableCRSQLite: false}}
      >
      <UserProvider>
        <Stack screenOptions={{ 
          headerShown: false, 
          animation: 'fade', 
          animationDuration:150,
          }} initialRouteName="splash">
          <Stack.Screen name="splash"/>
          <Stack.Screen name="index"/>
          <Stack.Screen name="login"/>
          <Stack.Screen name="registration"/>
          <Stack.Screen name="home"/>

          <Stack.Screen
            name="nutsplash"
            options={{
              title: 'Personal Details',
              headerShown: true,
              headerTintColor: '#1a1b1c',
              headerStyle: { backgroundColor: '#32a852' },
              headerLeft: () => (
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={{ color: "#1a1b1c", paddingHorizontal: 10, fontSize: 15 }}>Back</Text>
                </TouchableOpacity>
              ),
              headerTitleAlign: 'center',
              headerShadowVisible: false, 
              animation: 'fade'
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
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={{ color: "#1a1b1c", paddingHorizontal: 10, fontSize: 15 }}>Back</Text>
                </TouchableOpacity>
              ),
              headerTitleAlign: 'center',
              headerShadowVisible: false,
              animation: 'fade'
            }}
          />

          <Stack.Screen name="nutrition"/>
          <Stack.Screen name="profile"/>
          <Stack.Screen name="workout"/>
          <Stack.Screen name="barcodeScanner"/>
          <Stack.Screen name="createTemplate"/>
        </Stack>
      </UserProvider>
    </SQLiteProvider>
    </ApplicationProvider>
  );
}
