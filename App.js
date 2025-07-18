import { SQLiteProvider } from "expo-sqlite"


export default function app() {
  return (
    <SQLiteProvider
      databaseName="UserDatabase.db"
      onInit={async (db) => {
        await db.execAsync(
          'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, email TEXT NOT NULL UNIQUE, dob TEXT NOT NULL, profile_icon TEXT NOT NULL UNIQUE) PRAGMA journal_mode=WAL',
        ); 
        await db.execAsync(
          'CREATE TABLE IF NOT EXISTS userSettings (user_id INTEGER NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id)); PRAGMA journal_mode=WAL'
        );
        await db.execAsync (
          'CREATE TABLE IF NOT EXISTS userStats (user_id INTEGER NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id), gender TEXT NOT NULL, weight TEXT NOT NULL, height TEXT NOT NULL, activity_lvl TEXT NOT NULL, BMI TEXT NOT NULL, BMR TEXT NOT NULL, body_fat TEXT NOT NULL, nut_goal TEXT NOT NULL, goal_weight TEXT NOT NULL, gain_speed TEXT NOT NULL);  PRAGMA journal_mode=WAL'
        );
        await db.execAsync(
          'CREATE TABLE IF NOT EXISTS dailyNutLog (user_id INTEGER NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id), date TEXT NOT NULL, name TEXT NOT NULL, calories TEXT NOT NULL, protein TEXT NOT NULL, cholesterol TEXT NOT NULL, sodium TEXT NOT NULL, total_Fat TEXT NOT NULL, saturated_Fat TEXT NOT NULL, trans_Fat TEXT NOT NULL, polyunsaturated_Fat TEXT NOT NULL, monosaturated_Fat TEXT NOT NULL, total_Carbs TEXT NOT NULL, fiber TEXT NOT NULL, sugar TEXT NOT NULL, vitamin_A TEXT NOT NULL, vitamin_C TEXT NOT NULL, vitamin_D TEXT NOT NULL, vitamin_E TEXT NOT NULL, vitamin_K TEXT NOT NULL, vitamin_B1 TEXT NOT NULL, vitamin_B2 TEXT NOT NULL, vitamin_B3 TEXT NOT NULL, vitamin_B5 TEXT NOT NULL, vitamin_B6 TEXT NOT NULL, vitamin_B7 TEXT NOT NULL, vitamin_B9 TEXT NOT NULL, vitamin_B12 TEXT NOT NULL, iron TEXT NOT NULL, calcium TEXT NOT NULL, potassium TEXT NOT NULL); PRAGMA journal_mode=WAL'
        );
        await db.execAsync(
          'CREATE TABLE IF NOT EXISTS storedNutLog (user_id INTEGER NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id), date PRIMARY KEY TEXT NOT NULL, name TEXT NOT NULL, calories TEXT NOT NULL, protein TEXT NOT NULL, cholesterol TEXT NOT NULL, sodium TEXT NOT NULL, total_Fat TEXT NOT NULL, saturated_Fat TEXT NOT NULL, trans_Fat TEXT NOT NULL, polyunsaturated_Fat TEXT NOT NULL, monosaturated_Fat TEXT NOT NULL, total_Carbs TEXT NOT NULL, fiber TEXT NOT NULL, sugar TEXT NOT NULL, vitamin_A TEXT NOT NULL, vitamin_C TEXT NOT NULL, vitamin_D TEXT NOT NULL, vitamin_E TEXT NOT NULL, vitamin_K TEXT NOT NULL, vitamin_B1 TEXT NOT NULL, vitamin_B2 TEXT NOT NULL, vitamin_B3 TEXT NOT NULL, vitamin_B5 TEXT NOT NULL, vitamin_B6 TEXT NOT NULL, vitamin_B7 TEXT NOT NULL, vitamin_B9 TEXT NOT NULL, vitamin_B12 TEXT NOT NULL, iron TEXT NOT NULL, calcium TEXT NOT NULL, potassium TEXT NOT NULL); PRAGMA journal_mode=WAL'
        );
        }}
        options={{useNewConnection: false}}
      >
      </SQLiteProvider>
  )
}
