import { doc, setDoc } from "firebase/firestore";
import { fbdb } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TABLE_SQL = `
CREATE TABLE IF NOT EXISTS userStreaks (
  user_id TEXT PRIMARY KEY,
  current_streak INTEGER NOT NULL,
  best_streak INTEGER NOT NULL,
  last_open_date TEXT NOT NULL
);
`;

const getLocalDateStr = (d = new Date()) => {
    const local = new Date(d);
    local.setHours(0, 0, 0, 0);
    return local.toLocaleDateString('en-CA');
};

const diffInDays = (fromStr, toStr) => {
    const a = new Date(fromStr + 'T00:00:00');
    const b = new Date(toStr + 'T00:00:00');
    const ms = b - a;
    return Math.round(ms / 86400000);
};

export async function ensureStreakTable(db){
    await db.execAsync?.(TABLE_SQL) ?? db.runAsync?.(TABLE_SQL);
}

export async function updateStreakOnAppOpen(db, userId){
    if (!userId) return {current_streak: 0, best_streak: 0, last_open_date: getLocalDateStr()};

    await ensureStreakTable(db);

    const today = getLocalDateStr();
    const rows = await db.getAllAsync(
        'SELECT current_streak, best_streak, last_open_date FROM userStreaks WHERE user_id = ?',
        [userId]
    );

if (!rows || rows.length === 0) {
    await db.runAsync(
        'INSERT OR IGNORE INTO userStreaks (user_id, current_streak, best_streak, last_open_date) VALUES (?, ?, ?, ?)',
        [userId, 1, 1, today]
    );
    return {current_streak: 1, best_streak: 1, last_open_date: today};
}

const { current_streak, best_streak, last_open_date } = rows[0];

if (last_open_date === today) {
    return { current_streak, best_streak, last_open_date };
}

const gap = diffInDays(last_open_date, today);

let newCurrent = 1;
if (gap === 1){
    newCurrent = (Number(current_streak) || 0) + 1;
}

const newBest = Math.max(Number(best_streak) || 0, newCurrent);

await db.runAsync(
    'UPDATE userStreaks SET current_streak = ?, best_streak = ?, last_open_date = ? WHERE user_id = ?',
    [newCurrent, newBest, today, userId]
);

try {
  // Retrieve the Firestore user ID from AsyncStorage or context
  const firestoreUserId = await AsyncStorage.getItem('firestoreUserId');
  if (firestoreUserId) {
    const streakRef = doc(fbdb, "users", firestoreUserId, "userStreaks", "main");
    await setDoc(streakRef, {
      current_streak: newCurrent,
      best_streak: newBest,
      last_open_date: today
    }, { merge: true });
    console.log("synced streak to Firestore for user:", firestoreUserId);
  }
} catch (err) {
  console.error("failed to sync streak to Firestore:", err);
}

return { current_streak: newCurrent, best_streak: newBest, last_open_date: today };
}

export async function getStreak(db, userId){
    if (!userId) return {current_streak: 0, best_streak: 0, last_open_date: getLocalDateStr()};
    await ensureStreakTable(db);
    const rows = await db.getAllAsync(
        'SELECT current_streak, best_streak, last_open_date FROM userStreaks WHERE user_id = ?',
        [userId]
    );
    if (!rows || rows.length === 0) {
        return {current_streak: 0, best_streak: 0, last_open_date: getLocalDateStr()};
    }
    const { current_streak, best_streak, last_open_date } = rows[0];
    const today = getLocalDateStr();
    if (last_open_date === today){
        return {current_streak, best_streak, last_open_date};
    }
    const gap = diffInDays(last_open_date, today);
    if (gap === 1){
        return {current_streak, best_streak, last_open_date};
    }
    return { current_streak: 0, best_streak, last_open_date};
}