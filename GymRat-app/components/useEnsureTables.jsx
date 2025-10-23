import { useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import exampleTemplates from '../assets/presetWorkoutTemplates.json';

/**
 * Ensures that all required tables exist in the SQLite database.
 * Safe to call on startup — it only creates missing tables.
 */
export const useEnsureTables = () => {
  const db = useSQLiteContext();

  useEffect(() => {
    const ensureTables = async () => {
      console.log('Ensuring SQLite tables exist...');
      try {
        // === USERS ===
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            dob TEXT NOT NULL,
            profile_icon TEXT NOT NULL,
            hasOnboarded INTEGER NOT NULL DEFAULT 0
          );
        `);

        // === USER SETTINGS ===
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS userSettings (
            user_id INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
          );
        `);

        // === USER STATS ===
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS userStats (
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
            dailyCals TEXT DEFAULT '0' NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
          );
        `);

        // add column migration (safe)
        try {
          await db.execAsync(`ALTER TABLE userStats ADD COLUMN dailyCals TEXT DEFAULT '0';`);
        } catch (_) {}

        // === DAILY NUTRITION LOG ===
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS dailyNutLog (
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            name TEXT NOT NULL,
            calories TEXT NOT NULL,
            protein TEXT NOT NULL,
            cholesterol TEXT NOT NULL,
            sodium TEXT NOT NULL,
            total_Fat TEXT NOT NULL,
            saturated_Fat TEXT NOT NULL,
            trans_Fat TEXT NOT NULL,
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
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
          );
        `);

        // === HISTORY LOG ===
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS historyLog (
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
            potassium TEXT
          );
        `);

        // === WORKOUT TEMPLATES ===
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS workoutTemplates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            data TEXT
          );
        `);

        // === EXAMPLE WORKOUT TEMPLATES ===
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS exampleWorkoutTemplates (
            id INTEGER PRIMARY KEY NOT NULL,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            data TEXT
          );
        `);

        // repopulate example templates if missing
        for (const t of exampleTemplates) {
          try {
            await db.runAsync(
              "INSERT OR IGNORE INTO exampleWorkoutTemplates (id, user_id, name, data) VALUES (?, ?, ?, ?)",
              [t.id, 1, t.name, JSON.stringify(t.data)]
            );
          } catch (err) {
            console.warn('⚠️ Failed inserting example template', t.name, err.message);
          }
        }

        // === CUSTOM EXERCISES ===
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS customExercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            equipment TEXT NOT NULL,
            primaryMuscle TEXT NOT NULL,
            instructions TEXT
          );
        `);

        // === WORKOUT LOG ===
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS workoutLog (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            workout_name TEXT NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
          );
        `);

        // === WEIGHT HISTORY ===
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS weightHistory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            weight TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, date)
          );
        `);

        await db.execAsync('PRAGMA journal_mode=WAL;');

        console.log('✅ SQLite tables ensured.');
      } catch (err) {
        console.error('❌ Error ensuring tables:', err);
      }
    };

    ensureTables();
  }, [db]);
};
