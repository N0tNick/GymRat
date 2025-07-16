import { SQLiteProvider } from "expo-sqlite"


export default function app() {
  return (
    <SQLiteProvider
      databaseName="UserDatabase.db"
      onInit={async (db) => {
        await db.execAsync(
          'CREATE TABLE IF NOT EXISTS users ( id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, email TEXT NOT NULL UNIQUE, dob TEXT NOT NULL, gender TEXT NOT NULL, weight TEXT NOT NULL, height TEXT NOT NULL, activity_lvl TEXT NOT NULL, goal TEXT NOT NULL, goal_weight TEXT NOT NULL, gain_speed TEXT NOT NULL) PRAGMA journal_mode=WAL',
        ); 
        await db.execAsync(
          'CREATE TABLE IF NOT EXISTS userSettings ( user_id INTEGER NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id), ); PRAGMA journal_mode=WAL'
        );
        await db.execAsync(
          'CREATE TABLE IF NOT EXISTS dailyNutLog ( user_id INTEGER NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id), date PRIMARY KEY TEXT NOT NULL, name TEXT NOT NULL, calories TEXT NOT NULL, protein TEXT NOT NULL, cholesterol TEXT NOT NULL, sodium TEXT NOT NULL, totalFat TEXT NOT NULL, saturatedFat TEXT NOT NULL, transFat TEXT NOT NULL, polyunsaturatedFat TEXT NOT NULL, monosaturatedFat TEXT NOT NULL, totalCarbs TEXT NOT NULL, fiber TEXT NOT NULL, sugar TEXT NOT NULL, ); PRAGMA journal_mode=WAL'
        );
        await db.execAsync(
          'CREATE TABLE IF NOT EXISTS storedNutLogs ( user_id INTEGER NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id), date PRIMARY KEY TEXT NOT NULL, name TEXT NOT NULL, calories TEXT NOT NULL, protein TEXT NOT NULL, cholesterol TEXT NOT NULL, sodium TEXT NOT NULL, totalFat TEXT NOT NULL, saturatedFat TEXT NOT NULL, transFat TEXT NOT NULL, polyunsaturatedFat TEXT NOT NULL, monosaturatedFat TEXT NOT NULL, totalCarbs TEXT NOT NULL, fiber TEXT NOT NULL, sugar TEXT NOT NULL, ); PRAGMA journal_mode=WAL'
        );
        }}
        options={{useNewConnection: false}}
      >
      </SQLiteProvider>
  )
}
