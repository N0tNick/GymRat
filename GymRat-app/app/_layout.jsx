import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { syncStorage } from 'use-state-persist';
import exampleTemplates from '../assets/presetWorkoutTemplates.json';

// required for userId's
import { SQLiteProvider } from 'expo-sqlite';
import { UserProvider } from '../UserContext';

const MyTheme = {

};

export default function App() {
  const router = useRouter();

  useEffect(() => {
    async function setUpTimer() {
      try {
        // used for workout timer
        await syncStorage.init();
      } catch (err) {
          console.error(err.message);
      }
    }
    setUpTimer()
  }, []);

  const loadExampleTemplates = (db) => {
    exampleTemplates.forEach(async t => {
      await db.execAsync("UPSERT INTO workoutTemplates (id, user_id, name, data) VALUES (?, ?, ?, ?)",
        [t.id, 1, t.name, t.data]
      )
    })
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <ApplicationProvider {...eva} theme={MyTheme}>
    <SQLiteProvider
      databaseName="UserDatabase.db"
      onInit={async (db) => {
        await db.execAsync(
          `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          username TEXT NOT NULL, 
          email TEXT NOT NULL UNIQUE, 
          dob TEXT NOT NULL, 
          profile_icon TEXT NOT NULL,
          hasOnboarded INTEGER NOT NULL DEFAULT 0);`
        ); 

        await db.execAsync(
          `CREATE TABLE IF NOT EXISTS userSettings (
          user_id INTEGER NOT NULL, 
          FOREIGN KEY(user_id) 
          REFERENCES users(id) ON DELETE CASCADE);`
        );

        await db.execAsync (
          `CREATE TABLE IF NOT EXISTS userStats (
          user_id INTEGER NOT NULL, 
          sex TEXT DEFAULT 'unknown' NOT NULL, 
          weight TEXT DEFAULT '0' NOT NULL, 
          height TEXT DEFAULT '0' NOT NULL, 
          activity_lvl TEXT DEFAULT 'sedentary' NOT NULL, 
          BMI TEXT DEFAULT '0' NOT NULL, 
          BMR TEXT DEFAULT '0' NOT NULL, 
          body_fat TEXT DEFAULT '0' NOT NULL, 
          nut_goal TEXT DEFAULT 'maintenance' NOT NULL, 
          goal_weight TEXT DEFAULT '0' NOT NULL,
          gain_speed TEXT DEFAULT 'moderate' NOT NULL, 
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);`
        );

        await db.execAsync(
          `CREATE TABLE IF NOT EXISTS dailyNutLog (
          user_id INTEGER NOT NULL, date TEXT NOT NULL, 
          name TEXT NOT NULL, calories TEXT NOT NULL, 
          protein TEXT NOT NULL, cholesterol TEXT NOT NULL, 
          sodium TEXT NOT NULL, total_Fat TEXT NOT NULL, 
          saturated_Fat TEXT NOT NULL, trans_Fat TEXT NOT NULL, 
          polyunsaturated_Fat TEXT NOT NULL, 
          monosaturated_Fat TEXT NOT NULL, 
          total_Carbs TEXT NOT NULL, 
          fiber TEXT NOT NULL, 
          sugar TEXT NOT NULL, 
          vitamin_A TEXT NOT NULL, 
          vitamin_C TEXT NOT NULL, 
          vitamin_D TEXT NOT NULL, 
          vitamin_E TEXT NOT NULL, 
          vitamin_K TEXT NOT NULL, 
          vitamin_B1 TEXT NOT NULL, 
          vitamin_B2 TEXT NOT NULL, 
          vitamin_B3 TEXT NOT NULL, 
          vitamin_B5 TEXT NOT NULL, 
          vitamin_B6 TEXT NOT NULL, 
          vitamin_B7 TEXT NOT NULL, 
          vitamin_B9 TEXT NOT NULL, 
          vitamin_B12 TEXT NOT NULL, 
          iron TEXT NOT NULL, 
          calcium TEXT NOT NULL,
          potassium TEXT NOT NULL, 
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);`
        );

        await db.execAsync(
          `CREATE TABLE IF NOT EXISTS historyLog (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          date TEXT NOT NULL,
          name TEXT,
          calories TEXT, 
          protein TEXT,
          cholesterol TEXT, 
          sodium TEXT,
          total_Fat TEXT, 
          saturated_Fat TEXT, 
          trans_Fat TEXT,
          polyunsaturated_Fat TEXT, 
          monosaturated_Fat TEXT,
          total_Carbs TEXT, 
          fiber TEXT, 
          sugar TEXT,
          vitamin_A TEXT, 
          vitamin_C TEXT, 
          vitamin_D TEXT, 
          vitamin_E TEXT, 
          vitamin_K TEXT,
          vitamin_B1 TEXT, 
          vitamin_B2 TEXT, 
          vitamin_B3 TEXT, 
          vitamin_B5 TEXT, 
          vitamin_B6 TEXT,
          vitamin_B7 TEXT, 
          vitamin_B9 TEXT, 
          vitamin_B12 TEXT,
          iron TEXT, 
          calcium TEXT, 
          potassium TEXT);`
        );

        await db.execAsync(
          `CREATE TABLE IF NOT EXISTS workoutTemplates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          data TEXT
          );`
        );

        //db.execAsync(`DROP TABLE IF EXISTS exampleWorkoutTemplates;`);
        await db.execAsync(
          `CREATE TABLE IF NOT EXISTS exampleWorkoutTemplates (
          id INTEGER PRIMARY KEY NOT NULL,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          data TEXT
          );`
        );

        for (const t of exampleTemplates) {
          try {
            console.log('Inserting id=', t.id, 'name=', t.name);
            const res = await db.runAsync(
              "INSERT OR IGNORE INTO exampleWorkoutTemplates (id, user_id, name, data) VALUES (?, ?, ?, ?)",
              [t.id, 1, t.name, JSON.stringify(t.data)]
            );
            console.log('Insert returned:', res);
          } catch (err) {
            console.error('Insert error for id', t.id, err);
          }
        }

        // Debug: Log the contents of exampleWorkoutTemplates after insertion
        /*try {
          const rows = await db.getAllAsync("SELECT * FROM exampleWorkoutTemplates");
          console.log('Example Workout Templates:', rows);
        } catch (err) {
          console.error('Error reading exampleWorkoutTemplates:', err.message);
        }*/

        await db.execAsync(
          `CREATE TABLE IF NOT EXISTS customExercises (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          equipment TEXT NOT NULL,
          primaryMuscle TEXT NOT NULL,
          instructions TEXT
          );`
        )
        
        //db.execAsync(`DROP TABLE IF EXISTS workoutLog;`);
        await db.execAsync(
          `CREATE TABLE IF NOT EXISTS workoutLog (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            workout_name TEXT NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
          );`
        );

        //await db.execAsync(`DROP TABLE IF EXISTS weightHistory;`);  
        //await db.runAsync('UPDATE users SET hasOnboarded = ?', [0])

        await db.execAsync(
          `CREATE TABLE IF NOT EXISTS weightHistory (
            date TEXT PRIMARY KEY NOT NULL,
            weight TEXT NOT NULL
          );`
        )

        await db.execAsync('PRAGMA journal_mode=WAL');
        try {
           await db.execAsync(`ALTER TABLE users ADD COLUMN hasOnboarded INTEGER NOT NULL DEFAULT 0;`);
           console.log('Added hasOnboarded column to existing table');
         } catch (error) {
           // Column already exists or other error, which is fine
           console.log('hasOnboarded column migration skipped:', error.message);
         }
         }}
        options={{useNewConnection: true, enableCRSQLite: false}}
      >
      <UserProvider>
        <Stack screenOptions={{ 
          headerShown: false,
          animationMatchesGesture: true,
          animationDuration:100,
          }} initialRouteName="splash">
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="splash"/>
          <Stack.Screen name="index"/>
          <Stack.Screen name="login"/>
          <Stack.Screen name="registration"/>
          {/*<Stack.Screen name="home"/>*/}

          <Stack.Screen name="nutsplash"/>

          <Stack.Screen name="goal"/>

          {/*<Stack.Screen name="nutrition"/>*/}
          {/*<Stack.Screen name="profile"/>*/}
          {/*<Stack.Screen name="workout"/>*/}
          {/*<Stack.Screen name="barcodeScanner"/>*/}
          <Stack.Screen name="createTemplate"/>
        </Stack>
      </UserProvider>
    </SQLiteProvider>
    </ApplicationProvider>
    </GestureHandlerRootView>
  );
}
  