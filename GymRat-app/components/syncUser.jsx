import { collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fbdb } from '../firebaseConfig.js';

async function ensureExampleWorkoutTemplates(firestoreUserId, db) {
  try {
    const colRef = collection(fbdb, 'users', firestoreUserId, 'exampleWorkoutTemplates');
    const snap = await getDocs(colRef);

    if (!snap.empty) {
      console.log('exampleWorkoutTemplates already exist in Firestore');
      return;
    }

    console.log('Uploading exampleWorkoutTemplates from local SQLite for:', firestoreUserId);

    // Pull all from local SQLite
    const localExamples = await db.getAllAsync(
      'SELECT id, name, data FROM exampleWorkoutTemplates'
    );

    if (localExamples && localExamples.length > 0) {
      for (const example of localExamples) {
        const fixedId = String(example.id); // "0", "1", etc.
        const docRef = doc(fbdb, `users/${firestoreUserId}/exampleWorkoutTemplates/${fixedId}`);

        await setDoc(docRef, {
          name: example.name ?? 'Untitled',
          data: JSON.parse(example.data ?? '{}'),
          initialized: true,
          lastUpdated: new Date().toISOString(),
        });
      }

      console.log(`Uploaded ${localExamples.length} exampleWorkoutTemplates with numeric IDs`);
    } else {
      console.warn('No local exampleWorkoutTemplates found to upload.');
    }
  } catch (err) {
    console.error('Failed to ensure exampleWorkoutTemplates:', err);
  }
}


export async function syncFirestoreToSQLite({ firestoreUserId, userId, db }) {
  if (!firestoreUserId || !userId || !db) {
    console.warn('Missing required params for syncFirestoreToSQLite');
    return;
  }

  console.log(`Starting Firestore→SQLite sync for user: ${firestoreUserId}`);

  await ensureExampleWorkoutTemplates(firestoreUserId, db);

  const collectionsToSync = [
    'customExercises',
    'historyLog',
    'userStats',
    'workoutLog',
    'workoutTemplates',
    'userStreaks',
  ];

  for (const col of collectionsToSync) {
    try {
      const colRef = collection(fbdb, 'users', firestoreUserId, col);
      const snap = await getDocs(colRef);

      if (snap.empty) {
        console.log(`No Firestore data found for ${col}`);
        continue;
      }

      let imported = 0;

      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        if (data.initialized) continue;

        switch (col) {
          // ------------------ customExercises ------------------
          case 'customExercises': {
            const exists = await db.getFirstAsync(
              'SELECT id FROM customExercises WHERE name = ? AND user_id = ?',
              [data.name, userId]
            );
            if (!exists) {
              await db.runAsync(
                `INSERT INTO customExercises (user_id, name, equipment, primaryMuscle, instructions)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                  userId,
                  data.name ?? '',
                  data.equipment ?? '',
                  data.primaryMuscle ?? '',
                  data.instructions ?? '',
                ]
              );
              imported++;
            }
            break;
          }

          // ------------------ historyLog ------------------
          case 'historyLog': {
            const exists = await db.getFirstAsync(
              'SELECT id FROM historyLog WHERE date = ? AND name = ? AND user_id = ?',
              [data.date, data.name, userId]
            );
            if (!exists) {
              await db.runAsync(
                `INSERT INTO historyLog (
                  user_id, date, name, calories, protein, cholesterol, sodium,
                  total_Fat, saturated_Fat, trans_Fat, polyunsaturated_Fat,
                  monosaturated_Fat, total_Carbs, fiber, sugar, vitamin_A,
                  vitamin_C, vitamin_D, vitamin_E, vitamin_K, vitamin_B1,
                  vitamin_B2, vitamin_B3, vitamin_B5, vitamin_B6, vitamin_B7,
                  vitamin_B9, vitamin_B12, iron, calcium, potassium
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                  userId,
                  data.date ?? '',
                  data.name ?? '',
                  data.calories ?? '0',
                  data.protein ?? '0',
                  data.cholesterol ?? '0',
                  data.sodium ?? '0',
                  data.total_Fat ?? '0',
                  data.saturated_Fat ?? '0',
                  data.trans_Fat ?? '0',
                  data.polyunsaturated_Fat ?? '0',
                  data.monosaturated_Fat ?? '0',
                  data.total_Carbs ?? '0',
                  data.fiber ?? '0',
                  data.sugar ?? '0',
                  data.vitamin_A ?? '0',
                  data.vitamin_C ?? '0',
                  data.vitamin_D ?? '0',
                  data.vitamin_E ?? '0',
                  data.vitamin_K ?? '0',
                  data.vitamin_B1 ?? '0',
                  data.vitamin_B2 ?? '0',
                  data.vitamin_B3 ?? '0',
                  data.vitamin_B5 ?? '0',
                  data.vitamin_B6 ?? '0',
                  data.vitamin_B7 ?? '0',
                  data.vitamin_B9 ?? '0',
                  data.vitamin_B12 ?? '0',
                  data.iron ?? '0',
                  data.calcium ?? '0',
                  data.potassium ?? '0',
                ]
              );
              imported++;
            }
            break;
          }

          // ------------------ userStats ------------------
          case 'userStats': {
            const exists = await db.getFirstAsync(
              'SELECT user_id FROM userStats WHERE user_id = ?',
              [userId]
            );
            if (!exists) {
              await db.runAsync(
                `INSERT INTO userStats (
                  user_id, sex, weight, height, activity_lvl, BMI, BMR,
                  body_fat, nut_goal, goal_weight, gain_speed
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
                [
                  userId,
                  data.sex ?? 'unknown',
                  data.weight ?? '0',
                  data.height ?? '0',
                  data.activity_lvl ?? 'sedentary',
                  data.BMI ?? '0',
                  data.BMR ?? '0',
                  data.body_fat ?? '0',
                  data.nut_goal ?? 'maintenance',
                  data.goal_weight ?? '0',
                  data.gain_speed ?? 'moderate',
                ]
              );
              imported++;
            }
            break;
          }

          // ------------------ workoutLog ------------------
          case 'workoutLog': {
            const exists = await db.getFirstAsync(
              'SELECT id FROM workoutLog WHERE workout_name = ? AND date = ? AND user_id = ?',
              [data.workout_name, data.date, userId]
            );
            if (!exists) {
              await db.runAsync(
                `INSERT INTO workoutLog (user_id, workout_name, date)
                 VALUES (?, ?, ?)`,
                [
                  userId,
                  data.workout_name ?? 'Unnamed Workout',
                  data.date ?? new Date().toISOString(),
                ]
              );
              imported++;
            }
            break;
          }

          // ------------------ workoutTemplates ------------------
          case 'workoutTemplates': {
            const exists = await db.getFirstAsync(
              'SELECT id FROM workoutTemplates WHERE name = ? AND user_id = ?',
              [data.name, userId]
            );
            if (!exists) {
              await db.runAsync(
                `INSERT INTO workoutTemplates (user_id, name, data)
                 VALUES (?, ?, ?)`,
                [userId, data.name ?? 'Untitled', JSON.stringify(data.data ?? {})]
              );
              imported++;
            }
            break;
          }

          // ------------------ userStreaks ------------------
          case 'userStreaks': {
            const exists = await db.getFirstAsync(
              'SELECT user_id FROM userStreaks WHERE user_id = ?',
              [userId]
            );

            if (!exists) {
              await db.runAsync(
                `INSERT INTO userStreaks (user_id, current_streak, best_streak, last_open_date)
                 VALUES (?, ?, ?, ?)`,
                [
                  userId,
                  data.current_streak ?? 0,
                  data.best_streak ?? 0,
                  data.last_open_date ?? new Date().toISOString().split('T')[0],
                ]
              );
            } else {
              await db.runAsync(
                `UPDATE userStreaks SET current_streak = ?, best_streak = ?, last_open_date = ? WHERE user_id = ?`,
                [
                  data.current_streak ?? 0,
                  data.best_streak ?? 0,
                  data.last_open_date ?? new Date().toISOString().split('T')[0],
                  userId,
                ]
              );
            }
            break;
          }
        }
      }

      console.log(`Imported ${imported} records for ${col}`);
    } catch (err) {
      console.error(`Error syncing ${col}:`, err);
    }
  }

  await AsyncStorage.setItem('firestoreUserId', firestoreUserId);
  console.log('Firestore→SQLite sync complete for user:', userId);
}
