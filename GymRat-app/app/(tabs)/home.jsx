import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as Calendar from 'expo-calendar';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { doc, setDoc } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { SafeAreaView } from 'react-native-safe-area-context';
import JimRat from '../../components/jimRat';
import { HomeModal } from '../../components/Onboarding/onboard';
import { WeightTouchable } from '../../components/Profile/bodyTabModals';
import { updateStreakOnAppOpen } from '../../components/streak';
import { fbdb } from '../../firebaseConfig.js';
import { useUser } from '../../UserContext';

const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

const nutrientOptions = [
  { label: 'Calories (kcal)',    value: 'calories' },
  { label: 'Protein (g)',        value: 'protein' },
  { label: 'Sugar (g)',          value: 'sugar' },
  { label: 'Cholesterol (mg)',   value: 'cholesterol' },
  { label: 'Total Fat (g)',      value: 'fat' },
  { label: 'Calcium (mg)',       value: 'calcium' },
  { label: 'Sodium (g)',         value: 'sodium' },
];


export default function HomeScreen() {
  const router = useRouter();
  const { refresh } = useLocalSearchParams();
  const [isHomeModal, setHomeModal] = useState(false);
  const [events, setEvents] = useState([]);
  const db = useSQLiteContext();
  const { userId, setFirestoreUserId, firestoreUserId } = useUser();
  const [streak, setStreak] = useState(0);
  const [dailyTotals, setDailyTotals] = useState(null);
  // add a task
  const [modalVisible, setModalVisible] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventTime, setNewEventTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  // weekly calendar
  const [dayModalVisible, setDayModalVisible] = useState(false);
  const [dayTotals, setDayTotals] = useState(null);
  const [weekData, setWeekData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const [customizeModalVisible, setCustomizeModalVisible] = useState(false);
  const [showTasks, setShowTasks] = useState(true);
  const [showNutrition, setShowNutrition] = useState(true);
  const [showWeekly, setShowWeekly] = useState(true);
  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [nutrientEntries, setNutrientEntries] = useState([]);
  const [showNutritionSummary, setShowNutritionSummary] = useState(true);
  const DEFAULT_ORDER = ['nutritionSummary', 'tasks', 'nutrition', 'weekly', 'streak', 'weightLog', 'buildWorkout'];
  const [moduleOrder, setModuleOrder] = useState([...DEFAULT_ORDER]);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [bestStreak, setBestStreak] = useState(0);
  const [showStreak, setShowStreak] = useState(true);
  const [showWeightLog, setShowWeightLog] = useState(true);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [currentWeight, setCurrentWeight] = useState(null);
  const [showBuildWorkout, setShowBuildWorkout] = useState(true);

  // check if daily log has entries for Jim rat
  const [hasEntries, setHasEntries] = useState(false);
  const [hasWorkout, setHasWorkout] = useState(false);

  const [cals, setCals] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const userCals = await db.getFirstAsync('SELECT dailyCals FROM userStats WHERE user_id = ?',
          [userId]
        );
        if (userCals) setCals(Number(userCals.dailyCals));
      } catch (e) {
        console.error('Error loading cals from userStats:', e);
      }
    })();
  }, [db]);

  useEffect(() => {
    (async () => {
      try {
        const userWeight = await db.getFirstAsync('SELECT weight FROM userStats WHERE user_id = ?',
          [userId]
        );
        if (userWeight) setCurrentWeight(Number(userWeight.weight));
      } catch (e) {
        console.error('Error loading weight from userStats:', e);
      }
    })();
  }, [db, userId]);


  useEffect(() => {
    if (!userId) return;

    const refreshHomeData = async () => {
      try {
        // Refresh daily cals target
        const userCals = await db.getFirstAsync(
          'SELECT dailyCals FROM userStats WHERE user_id = ?',
          [userId]
        );
        if (userCals) setCals(Number(userCals.dailyCals));

        const userWeight = await db.getFirstAsync(
          'SELECT weight FROM userStats WHERE user_id = ?',
          [userId]
        );
        if (userWeight) setCurrentWeight(Number(userWeight.weight));

        // Refresh daily totals
        const todayTotals = await loadTotalsForDate(new Date(), "dailyNutLog");
        if (JSON.stringify(todayTotals) !== JSON.stringify(dailyTotals)) {
          setDailyTotals(todayTotals);
        }

        // Refresh streak
        const streakRes = await db.getAllAsync(
          'SELECT current_streak, best_streak FROM userStreaks WHERE user_id = ?',
          [userId]
        );
        if (streakRes && streakRes[0]) {
          setStreak(streakRes[0].current_streak);
          setBestStreak(streakRes[0].best_streak);
        }

        // Refresh week data
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(startOfWeek);
          d.setDate(d.getDate() + i);
          return d;
        });

        const results = [];
        for (const dateObj of days) {
          const dateStr = dateObj.toISOString().split("T")[0];
          const nutRes = await db.getAllAsync(
            `SELECT COUNT(*) as count FROM historyLog WHERE user_id = ? AND date = ?`,
            [userId, dateStr]
          );
          const workoutRes = await db.getAllAsync(
            `SELECT COUNT(*) as count FROM workoutLog WHERE user_id = ? AND date = ?`,
            [userId, dateStr]
          );
          results.push({
            date: dateObj,
            hasLog: nutRes[0]?.count > 0,
            hasWorkout: workoutRes[0]?.count > 0,
          });
        }
        setWeekData(results);

      } catch (err) {
        console.error("Auto-refresh HomeScreen failed:", err);
      }
    };

    // Run immediately once
    refreshHomeData();

    // Then run every 2 seconds
    const intervalId = setInterval(refreshHomeData, 2000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [db, userId]);

  useEffect(() => {
    const loadUser = async () => {
      const storedFirestoreId = await AsyncStorage.getItem('firestoreUserId');
      if (storedFirestoreId) {
        setFirestoreUserId(storedFirestoreId);
        console.log("Loaded Firestore user ID:", storedFirestoreId);
      }
    };
    loadUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if(!userId) return;
      handleOnboarding()
    }, [])
  )
  
  const handleOnboarding = async () => {
    try {
      const result = await db.getFirstAsync('SELECT * FROM users WHERE id = ?', [userId])
      console.log(`the current user signed in is ${result['username']}`)
      console.log(result)
      if (result['hasOnboarded'] == 0) {
        setHomeModal(true)
      }
    } catch (error) {
      console.error('Error getting hasOnboarded:', error)
    }
  }

  // function to add daily event
  const handleAddEvent = () => {
    const newEvent = {
      id: Date.now().toString(),
      title: newEventName,
      startDate: newEventTime.toISOString(),
    };

    const updatedEvents = [...events, newEvent].sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );

    setEvents(updatedEvents);

    // reset modal
    setNewEventName('');
    setNewEventTime(new Date());
    setModalVisible(false);
  };

  useEffect(() => {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });

    const loadWeekData = async () => {
      const results = [];
      for (const dateObj of days) {
        const dateStr = dateObj.toISOString().split("T")[0];
        // check nutrition
        const nutRes = await db.getAllAsync(
          `SELECT COUNT(*) as count FROM historyLog WHERE user_id = ? AND date = ?`, // change to FROM storedNutLog when it works
          [userId, dateStr]
        );

        const workoutRes = await db.getAllAsync(
          `SELECT COUNT(*) as count FROM workoutLog WHERE user_id = ? AND date = ?`,
          [userId, dateStr]
        );
        results.push({
          date: dateObj,
          hasLog: nutRes[0]?.count > 0,
          hasWorkout: workoutRes[0]?.count > 0
        });
      }
      setWeekData(results);
    };

    loadWeekData();
  }, [db, userId]);

  useEffect(() => {
    (async () => {
      try {
        await updateStreakOnAppOpen(db, userId);
      } catch (e) {
        console.warn('streak updated failed', e);
      }
    })();
  }, [db, userId]);

    useEffect(() => {
    (async () => {
      try {
        const res = await db.getAllAsync(
          'SELECT current_streak FROM userStreaks WHERE user_id = ?',
          [userId]
        );
        if (res && res[0]) {
          setStreak(res[0].current_streak);
        }
      } catch (err) {
        console.warn('streak read failed', err);
      }
    })();
  }, [db, userId]);

  // first get calendar permissions
  useEffect(() => {
    (async () => {
      const {status} = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        //console.log(calendars)
        const calendarIds = calendars.map(calendar => calendar.id);

        // set the times for the start and end of the day
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todaysEvents = await Calendar.getEventsAsync(
          calendarIds,
          startOfDay,
          endOfDay
        );

        const sortedEvents = todaysEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        setEvents(sortedEvents);
      }
    })();
  }, []);

  const formatTime = (dateStr) => {
    const data = new Date(dateStr);
    return data.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
  };

  const loadTotalsForDate = async (date, tableName = "dailyNutLog") => {
    const dateStr = date.toISOString().split("T")[0];

    try {
      const result = await db.getAllAsync(
        `SELECT 
          SUM(CAST(calories AS REAL)) AS totalCalories,
          SUM(CAST(protein AS REAL)) AS totalProtein,
          SUM(CAST(total_Carbs AS REAL)) AS totalCarbs,
          SUM(CAST(total_Fat AS REAL)) AS totalFat,
          SUM(CAST(sugar AS REAL)) AS totalSugar
        FROM ${tableName}
        WHERE user_id = ? AND date = ?`,
        [userId, dateStr]
      );

      const totals = result[0];
      return {
        totalCalories: totals?.totalCalories || 0,
        totalProtein: totals?.totalProtein || 0,
        totalCarbs: totals?.totalCarbs || 0,
        totalFat: totals?.totalFat || 0,
        totalSugar: totals?.totalSugar || 0,
      };
    } catch (error) {
      console.error(`Error loading totals from ${tableName}:`, error);
      return {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      };
    }
  };

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const today = new Date().toISOString().split("T")[0];
        const res = await db.getAllAsync(
          `SELECT COUNT(*) as count FROM workoutLog WHERE user_id = ? AND date = ?`,
          [userId, today]
        );
        setHasWorkout(res[0]?.count > 0);
      
        const todayTotals = await loadTotalsForDate(new Date(), "dailyNutLog");
        setDailyTotals(todayTotals);
      
        const entriesExist = await checkIfFoodLoggedToday(db, userId);
        setHasEntries(entriesExist);
      })();
    }, [db, userId])
  );

  useEffect(() => {
    (async () => {
      if (!userId) return;
      await initializeModulePreferences();
      await loadModulePreferences();
    })();
  }, [userId]);

    useEffect(() => {
    if (userId && preferencesLoaded) {
      saveModulePreferences();
    }
  }, [showNutritionSummary, showTasks, showNutrition, showWeekly, showStreak, moduleOrder, userId, preferencesLoaded]);

  useEffect(() => {
  (async () => {
    try {
      const streakData = await updateStreakOnAppOpen(db, userId);
      if (streakData) {
        setStreak(streakData.current_streak);
        setBestStreak(streakData.best_streak);
      }

      if (firestoreUserId) {
        const streakRef = doc(fbdb, "users", firestoreUserId, "userStreaks", "streakData");
        await setDoc(streakRef, {
          current_streak: streakData.current_streak,
          best_streak: streakData.best_streak,
          last_open_date: streakData.last_open_date,
        }, { merge: true });
      }
    } catch (e) {
      console.error('Error updating streak on app open:', e);
    }
  })();
}, [db, userId]);

  useEffect(() => {
    if (userId && preferencesLoaded) {
      saveModulePreferences();
    }
  }, [showNutritionSummary, showTasks, showNutrition, showWeekly, moduleOrder, userId, preferencesLoaded]);

  const checkIfFoodLoggedToday = async (db, userId) => {
    const today = new Date().toISOString().split("T")[0];
    try {
      const result = await db.getAllAsync(
        `SELECT COUNT(*) as count FROM dailyNutLog WHERE user_id = ? AND date = ?`,
        [userId, today]
      );
      return result[0]?.count > 0; // true if there are entries
    } catch (err) {
      console.error("Error checking food log:", err);
      return false;
    }
  };

  const addEntry = () => {
    setNutrientEntries(prev => [
      ...prev,
      { id: Date.now().toString(), nutrient: '', value: '' }
    ]);
  };

  const updateEntry = (id, key, val) => {
    setNutrientEntries(prev =>
      prev.map(e => e.id === id ? { ...e, [key]: val } : e)
    );
  };

  const saveManualEntry = async () => {
    if (!userId || !foodName.trim()) {
      alert('Please enter a food name');
      return;
    }

    const validEntries = nutrientEntries.filter(entry => entry.nutrient && entry.value);
    if (validEntries.length === 0) {
      alert('Please add at least one nutrient value');
      return;
    }

    const date = new Date().toISOString().split('T')[0];

    try {
      const nutritionData = {
        calories: '0',
        protein: '0',
        sugar: '0',
        cholesterol: '0',
        fat: '0',
        calcium: '0',
        sodium: '0',
        total_Carbs: '0',
      };

      validEntries.forEach(entry => {
        if (entry.nutrient === 'fat') {
          nutritionData.fat = entry.value;
        } else {
          nutritionData[entry.nutrient] = entry.value;
        }
      });

      // save to dailyNutLog
      await db.runAsync(
        `INSERT INTO dailyNutLog (
          user_id, date, name, calories, protein,
          cholesterol, sodium, total_Fat, saturated_Fat, trans_Fat,
          polyunsaturated_Fat, monosaturated_Fat, total_Carbs, fiber, sugar,
          vitamin_A, vitamin_C, vitamin_D, vitamin_E, vitamin_K,
          vitamin_B1, vitamin_B2, vitamin_B3, vitamin_B5, vitamin_B6,
          vitamin_B7, vitamin_B9, vitamin_B12, iron, calcium, potassium
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, date, foodName,
          nutritionData.calories, nutritionData.protein,
          nutritionData.cholesterol, nutritionData.sodium,
          nutritionData.fat,
          '0', '0', '0', '0', // saturated, trans, poly, mono fats
          nutritionData.total_Carbs,
          '0', // fiber
          nutritionData.sugar,
          '0', '0', '0', '0', '0', // vitamins A,C,D,E,K
          '0', '0', '0', '0', '0', // B vitamins
          '0', '0', '0', // more B vitamins
          '0', // iron
          nutritionData.calcium,
          '0' // potassium
        ]
      );

      // Save to historyLog
      await db.runAsync(
        `INSERT INTO historyLog (
          user_id, date, name, calories, protein,
          cholesterol, sodium, total_Fat, saturated_Fat, trans_Fat,
          polyunsaturated_Fat, monosaturated_Fat, total_Carbs, fiber, sugar,
          vitamin_A, vitamin_C, vitamin_D, vitamin_E, vitamin_K,
          vitamin_B1, vitamin_B2, vitamin_B3, vitamin_B5, vitamin_B6,
          vitamin_B7, vitamin_B9, vitamin_B12, iron, calcium, potassium
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          userId, date, foodName,
          nutritionData.calories, nutritionData.protein,
          nutritionData.cholesterol, nutritionData.sodium,
          nutritionData.fat,
          '0', '0', '0', '0',
          nutritionData.total_Carbs,
          '0',
          nutritionData.sugar,
          '0', '0', '0', '0', '0',
          '0', '0', '0', '0', '0',
          '0', '0', '0', '0',
          nutritionData.calcium,
          '0'
        ]
      );

      setFoodName('');
      setNutrientEntries([]);
      setFoodModalVisible(false);
      
      // Reload totals
      const todayTotals = await loadTotalsForDate(new Date(), "dailyNutLog");
      setDailyTotals(todayTotals);
      
      alert('Food entry saved successfully!');
    } catch (error) {
      console.error('Error saving manual entry:', error);
      alert('Failed to save food entry');
    }
  };

const initializeModulePreferences = async () => {
  try {
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS modulePreferences (
        user_id INTEGER PRIMARY KEY,
        show_nutrition_summary INTEGER DEFAULT 1,
        show_tasks INTEGER DEFAULT 1,
        show_nutrition INTEGER DEFAULT 1,
        show_weekly INTEGER DEFAULT 1,
        show_streak INTEGER DEFAULT 1,
        show_weight_log INTEGER DEFAULT 1,
        module_order TEXT DEFAULT '["nutritionSummary","tasks","nutrition","weekly","streak","weightLog","buildWorkout"]'
      )
    `);
  } catch (e) {
    console.error('Create modulePreferences failed:', e);
  }
  try {
    await db.getFirstAsync(`SELECT show_streak FROM modulePreferences LIMIT 1`);
  } catch {
    try {
      await db.runAsync(`ALTER TABLE modulePreferences ADD COLUMN show_streak INTEGER DEFAULT 1`);
      await db.runAsync(`UPDATE modulePreferences SET show_streak = 1 WHERE show_streak IS NULL`);
    } catch (e) {
      console.error('Add show_streak failed:', e);
    }
  }
  try {
    await db.getFirstAsync(`SELECT show_weight_log FROM modulePreferences LIMIT 1`);
  } catch {
    try {
      await db.runAsync(`ALTER TABLE modulePreferences ADD COLUMN show_weight_log INTEGER DEFAULT 1`);
      await db.runAsync(`UPDATE modulePreferences SET show_weight_log = 1 WHERE show_weight_log IS NULL`);
    } catch (e) {
      console.error('Add show_weight_log failed:', e);
    }
  }
  try {
    await db.getFirstAsync(`SELECT show_build_workout FROM modulePreferences LIMIT 1`);
  } catch {
    try {
      await db.runAsync(`ALTER TABLE modulePreferences ADD COLUMN show_build_workout INTEGER DEFAULT 1`);
      await db.runAsync(`UPDATE modulePreferences SET show_build_workout = 1 WHERE show_build_workout IS NULL`);
    } catch (e) {
      console.error('Add show_build_workout failed:', e);
    }
  }
  if (userId) {
    try {
      await db.runAsync(
        `INSERT OR IGNORE INTO modulePreferences
          (user_id, show_nutrition_summary, show_tasks, show_nutrition, show_weekly, show_streak, show_weight_log, show_build_workout, module_order)
          VALUES (?, 1, 1, 1, 1, 1, 1, 1, ?)`,
          [userId, JSON.stringify(DEFAULT_ORDER)]
      );
    } catch (e) {
      console.error('Seed default for modulePreferences failed:', e);
    }
  }
};



const saveModulePreferences = async () => {
  JSON.stringify(moduleOrder && moduleOrder.length ? moduleOrder : DEFAULT_ORDER)
  if (!userId) return;
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO modulePreferences 
       (user_id, show_nutrition_summary, show_tasks, show_nutrition, show_weekly, show_streak, show_weight_log, show_build_workout, module_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        showNutritionSummary ? 1 : 0,
        showTasks ? 1 : 0,
        showNutrition ? 1 : 0,
        showWeekly ? 1 : 0,
        showStreak ? 1 : 0,
        showWeightLog ? 1 : 0,
        showBuildWorkout ? 1 : 0,
        JSON.stringify(moduleOrder)
      ]
    );
  } catch (error) {
    console.error('Error saving module preferences:', error);
  }
};

const safeParseOrder = (raw) => {
  try {
    const parsed = Array.isArray(raw) ? raw : JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : [...DEFAULT_ORDER];
  } catch {
    return [...DEFAULT_ORDER];
  }
};

const loadModulePreferences = async () => {
  if (!userId) return;
  try {
    const result = await db.getAllAsync(
      'SELECT * FROM modulePreferences WHERE user_id = ?',
      [userId]
    );

    if (result && result[0]) {
      const prefs = result[0];
      setShowNutritionSummary(prefs.show_nutrition_summary === 1);
      setShowTasks(prefs.show_tasks === 1);
      setShowNutrition(prefs.show_nutrition === 1);
      setShowWeekly(prefs.show_weekly === 1);
      setShowStreak(prefs.show_streak === 1 || prefs.show_streak == null);
      setShowWeightLog(prefs.show_weight_log === 1 || prefs.show_weight_log == null);
      setShowBuildWorkout(prefs.show_build_workout === 1 || prefs.show_build_workout == null);

      const order = safeParseOrder(prefs.module_order);
      for (const key of ['streak','weightLog','buildWorkout']) {
        if (!order.includes(key)) order.push(key);
      }
      setModuleOrder(order);
    } else {
      setModuleOrder([...DEFAULT_ORDER]);
    }
    setPreferencesLoaded(true);
  } catch (error) {
    console.error('Error loading module preferences:', error);
    setModuleOrder([...DEFAULT_ORDER]);
    setPreferencesLoaded(true);
  }
};

const allModules = useMemo(() => {
  const enabled = [];
  if (showNutritionSummary) enabled.push('nutritionSummary');
  if (showTasks) enabled.push('tasks');
  if (showNutrition) enabled.push('nutrition');
  if (showWeekly) enabled.push('weekly');
  if (showStreak) enabled.push('streak');
  if (showWeightLog) enabled.push('weightLog');
  if (showBuildWorkout) enabled.push('buildWorkout');

  return (moduleOrder ?? []).filter(k => enabled.includes(k)).map(k => ({ key: k }));
  }, [showNutritionSummary, showTasks, showNutrition, showWeekly, showStreak, showWeightLog, showBuildWorkout, moduleOrder]);

  const renderItem = useCallback(({ item, drag, isActive }) => {
    switch (item.key) {
      case 'nutritionSummary':
        return (
          <ScaleDecorator>
            <TouchableOpacity
              activeOpacity={0.9}
              onLongPress={drag}
              disabled={isActive}
              style={styles.gridItem}
            >
              <View style={styles.homeModule}>
                <Text style={styles.moduleTitle}>Nutrition Summary</Text>
                <View style={styles.nutritionSummaryContent}>
                  <View style={styles.calorieInfo}>
                    <Text style={styles.calorieLabel}>Today's Calories</Text>
                    <Text style={styles.calorieValue}>
                      {Math.round(dailyTotals?.totalCalories ?? 0)} / {cals} kcal
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.addFoodButton} 
                    onPress={() => setFoodModalVisible(true)}
                  >
                    <Text style={styles.addFoodText}>Add Food</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </ScaleDecorator>
        );

      case 'tasks':
        return (
          <ScaleDecorator>
            <TouchableOpacity
              activeOpacity={0.9}
              onLongPress={drag}
              disabled={isActive}
              style={styles.gridItem}
            >
              <View style={styles.homeModule}>
                <Text style={styles.moduleTitle}>Tasks to do today</Text>
                <ScrollView contentContainerStyle={styles.taskList}>
                  {Array.isArray(events) && events.length > 0 ? (
                    events.map((event, index) => (
                      <View key={event.id}>
                        {index === 0 && <View style={styles.divider} />}
                        <View style={styles.taskRow}>
                          <View style={styles.timeWrapper}>
                            <Text style={styles.time}>{formatTime(event.startDate)}</Text>
                          </View>
                          <View style={styles.textWrapper}>
                            <Text style={styles.task}>{event.title}</Text>
                          </View>
                        </View>
                        {index < events.length - 1 && <View style={styles.divider} />}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noTask}>No events for today</Text>
                  )}
                </ScrollView>
                <TouchableOpacity style={styles.addEventButton} onPress={() => setModalVisible(true)}>
                  <Text style={styles.addEventText}>Add Event</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </ScaleDecorator>
        );

      case 'nutrition':
        const proteinTarget = Math.round((cals * 0.25) / 4);
        const carbsTarget = Math.round((cals * 0.45) / 4);
        const fatTarget = Math.round((cals * 0.30) / 9);

        return (
          <ScaleDecorator>
            <TouchableOpacity
              activeOpacity={0.9}
              onLongPress={drag}
              disabled={isActive}
              style={styles.gridItem}
            >
              <View style={styles.homeModule}>
                <Text style={styles.moduleTitle}>Nutrition Rundown</Text>

                <View style={styles.nutrientRow}>
                  <Text style={styles.nutrientLabel}>Calories - {Math.round(dailyTotals?.totalCalories ?? 0)} / {cals} kcal</Text>
                  <View style={styles.barContainer}>
                    <View style={[styles.barFill, { backgroundColor: '#f5a623', width: `${Math.min(((dailyTotals?.totalCalories ?? 0) / cals) * 100, 100)}%` }]} />
                  </View>
                </View>

                <View style={styles.nutrientRow}>
                  <Text style={styles.nutrientLabel}>Protein - {Math.round(dailyTotals?.totalProtein ?? 0)} / {proteinTarget}g</Text>
                  <View style={styles.barContainer}>
                    <View style={[styles.barFill, { backgroundColor: '#ff00ff', width: `${Math.min(((dailyTotals?.totalProtein ?? 0) / proteinTarget) * 100, 100)}%` }]} />
                  </View>
                </View>

                <View style={styles.nutrientRow}>
                  <Text style={styles.nutrientLabel}>Carbs - {Math.round(dailyTotals?.totalCarbs ?? 0)} / {carbsTarget}g</Text>
                  <View style={styles.barContainer}>
                    <View style={[styles.barFill, { backgroundColor: '#00ff00', width: `${Math.min(((dailyTotals?.totalCarbs ?? 0) / carbsTarget) * 100, 100)}%` }]} />
                  </View>
                </View>

                <View style={styles.nutrientRow}>
                  <Text style={styles.nutrientLabel}>Fat - {Math.round(dailyTotals?.totalFat ?? 0)} / {fatTarget}g</Text>
                  <View style={styles.barContainer}>
                    <View style={[styles.barFill, { backgroundColor: '#ff0000', width: `${Math.min(((dailyTotals?.totalFat ?? 0) / fatTarget) * 100, 100)}%` }]} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </ScaleDecorator>
        );

      case 'weekly':
        return (
          <ScaleDecorator>
            <TouchableOpacity
              activeOpacity={0.9}
              onLongPress={drag}
              disabled={isActive}
              style={styles.gridItem}
            >
              <View style={styles.homeModule}>
                <Text style={styles.moduleTitle}>Weekly Calendar</Text>
                <View style={styles.weekRow}>
                  {weekData.map((dayInfo, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dayColumn}
                      onPress={async () => {
                        setSelectedDate(dayInfo.date);

                        let totals = null;
                        let workout = null;

                        if (dayInfo.hasLog) {
                          totals = await loadTotalsForDate(dayInfo.date, "historyLog");
                        } 

                        if (dayInfo.hasWorkout) {
                          const res = await db.getAllAsync(
                            `SELECT workout_name FROM workoutLog
                            WHERE user_id = ? AND date = ?`,
                            [userId, dayInfo.date.toISOString().split("T")[0]]
                          );
                          workout = res[0]?.workout_name;
                        } 

                        setDayTotals({ ...(totals || {}), workout});
                          setDayModalVisible(true);
                        }}
                      >
                      <Text style={styles.dayLabel}>
                        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dayInfo.date.getDay()]}
                      </Text>
                      <View style={styles.dayContent}>
                        <Text style={{ color: "#fff" }}>{dayInfo.date.getDate()}</Text>
                        <View style={[
                          styles.logIndicator,
                          { backgroundColor: dayInfo.hasLog ? "green" : "transparent" }
                        ]}/>
                      </View>

                      <View style={[
                        styles.logIndicator,
                        { backgroundColor: dayInfo.hasWorkout ? "red" : "transparent", marginTop: 3 }
                      ]}/>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          </ScaleDecorator>
        );

        case 'streak':
          return (
            <ScaleDecorator>
              <TouchableOpacity
                activeOpacity={0.9}
                onLongPress={drag}
                disabled={isActive}
                style={styles.gridItem}
              >
                <View style={styles.homeModule}>
                  <Text style={styles.moduleTitle}>Streak Stats</Text>
                  <View style={styles.streakContainer}>
                    {/* Current Streak */}
                    <View style={styles.streakItem}>
                      <View style={styles.fireIconRed}>
                        <Text style={styles.fireEmoji}>🔥</Text>
                      </View>
                      <Text style={styles.streakLabel}>Current</Text>
                      <Text style={styles.streakValue}>{streak}</Text>
                      <Text style={styles.streakDays}>days</Text>
                    </View>

                    {/* Best Streak */}
                    <View style={styles.streakItem}>
                      <View style={styles.fireIconGold}>
                        <Text style={styles.fireEmoji}>🔥</Text>
                      </View>
                      <Text style={styles.streakLabel}>Best</Text>
                      <Text style={styles.streakValue}>{bestStreak}</Text>
                      <Text style={styles.streakDays}>days</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </ScaleDecorator>
          );

          case 'weightLog':
            return (
              <ScaleDecorator>
                <TouchableOpacity
                  style={[styles.gridItem]}
                  onLongPress={drag}
                  disabled={isActive}
                  activeOpacity={0.9}
                >
                  <View style={styles.homeModule}>
                    <Text style={[styles.cardTitle, { alignSelf: 'center' , color: '#e0e0e0', fontSize: 16, fontWeight: 'bold' }]}>Weight Log</Text>
                    <View style={styles.nutritionSummaryContent}>
                      <View style={styles.calorieInfo}>
                        <Text style={styles.calorieLabel}>Current Weight</Text>
                        <Text style={styles.calorieValue}>
                          {currentWeight ? `${currentWeight} lbs` : '-- lbs'}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => setWeightModalVisible(true)}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          borderColor: '#32a852',
                          borderWidth: 1,
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          alignSelf: 'center',
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={{ color: '#e0e0e0', fontWeight: 'bold', fontSize: 14 }}>
                          Log Weight
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </ScaleDecorator>
            );

            case 'buildWorkout':
              return (
                <ScaleDecorator>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onLongPress={drag}
                    disabled={isActive}
                    style={styles.gridItem}
                  >
                    <View style={[styles.homeModule, { minHeight: 100, justifyContent: 'center' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={styles.moduleTitle}>Create Template</Text>

                        <View style={{ gap: 8 }}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push('/createTemplate')}
                            activeOpacity={0.85}
                          >
                            <Text style={styles.actionButtonText}>+ Template</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </ScaleDecorator>
              );



      default:
        return null;
    }
  }, [events, dailyTotals, weekData, setDayModalVisible, streak, bestStreak]);


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.text}>GymRat</Text>
        
        <HomeModal isVisible={isHomeModal} onClose={() => setHomeModal(false)}/>

        {dailyTotals && (
          <JimRat
            dailyTotals={dailyTotals}
            targets={{
              proteinTarget: Math.round((cals * 0.25) / 4),
              carbsTarget: Math.round((cals * 0.45) / 4),
              fatTarget: Math.round((cals * 0.30) / 9),
            }}
            hasEntries={hasEntries}
            hasWorkout={hasWorkout}
            streak={streak}
          />
        )}

        <View style={styles.modulesContainer}>
          <DraggableFlatList
            data={allModules}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            contentContainerStyle={styles.flatListContent}
            onDragEnd={({ data }) => setModuleOrder(data.map(d => d.key))}
            showsVerticalScrollIndicator={false}
            activationDistance={10}
          />
        </View>

        {/* Day Modal */}
        <Modal
          transparent={true}
          visible={dayModalVisible}
          onRequestClose={() => setDayModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                {selectedDate?.toDateString()}
              </Text>
              <Text style={{ color: "#fff", fontStyle: "italic", marginBottom: 10 }}>
                {dayTotals?.workout
                  ? `Workout: ${dayTotals.workout}`
                  : "No workout logged today"}
              </Text>

              {dayTotals && (dayTotals.totalCalories || dayTotals.totalProtein) ? (
                <>
                  <Text style={{ color: "#fff" }}>Calories: {dayTotals.totalCalories}g</Text>
                  <Text style={{ color: "#fff" }}>Protein: {dayTotals.totalProtein}g</Text>
                  <Text style={{ color: "#fff" }}>Carbs: {dayTotals.totalCarbs}g</Text>
                  <Text style={{ color: "#fff" }}>Fat: {dayTotals.totalFat}g</Text>
                </>
              ) : (
                <Text style={{ color: "#fff", fontStyle: "italic" }}>No food logged this day</Text>
              )}
              <TouchableOpacity onPress={() => setDayModalVisible(false)}>
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <WeightTouchable
          isVisible={weightModalVisible}
          onClose={() => setWeightModalVisible(false)}
        />
        
        <TouchableOpacity
          style={styles.customizeButton}
          onPress={() => setCustomizeModalVisible(true)}
        >
          <Text style={styles.buttonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New Event</Text>
            <TextInput style={styles.input} placeholder="Event Name" placeholderTextColor="#888" value={newEventName} onChangeText={setNewEventName}/>
            <TouchableOpacity 
              style={styles.timeButton} 
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timeButtonText}>
                Select Time: {newEventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={newEventTime}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  if (event.type === "set" && selectedTime) { // "set" means OK pressed
                    setNewEventTime(selectedTime);
                  }
                  setShowTimePicker(false); // hides picker regardless of OK or cancel
                }}
              />
            )}

            <TouchableOpacity style={styles.modalAddButton} onPress={handleAddEvent}>
              <Text style={styles.modalAddText}>Add</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={foodModalVisible}
        onRequestClose={() => setFoodModalVisible(false)}
      >
        <View style={styles.foodModalOverlay}>
          <View style={styles.foodModalContentWrapper}>
            <ScrollView
              style={styles.foodModalScroll}
              contentContainerStyle={styles.foodModalScrollContent}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.foodModalTitle}>Add Food</Text>

              <View style={styles.foodInputGroup}>
                <Text style={styles.foodInputLabel}>Food Name</Text>
                <TextInput
                  style={styles.foodTextInput}
                  placeholder="Enter food name"
                  placeholderTextColor="#888"
                  value={foodName}
                  onChangeText={setFoodName}
                />
              </View>

              <TouchableOpacity
                style={styles.addValueButton}
                onPress={addEntry}
              >
                <Text style={styles.addValueText}>Add Nutrient Value</Text>
              </TouchableOpacity>

              {nutrientEntries.map(entry => {
                const available = nutrientOptions.filter(opt =>
                  opt.value === entry.nutrient ||
                  !nutrientEntries.some(e => e.nutrient === opt.value)
                );

                return (
                  <View style={styles.entryRow} key={entry.id}>
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={entry.nutrient}
                        onValueChange={val =>
                          updateEntry(entry.id, 'nutrient', val)
                        }
                        style={styles.picker}
                      >
                        <Picker.Item label="Select…" value="" />
                        {available.map(opt => (
                          <Picker.Item
                            key={opt.value}
                            label={opt.label}
                            value={opt.value}
                          />
                        ))}
                      </Picker>
                    </View>

                    <TextInput
                      style={styles.valueInput}
                      placeholder="Value"
                      placeholderTextColor="#888"
                      keyboardType="numeric"
                      value={entry.value}
                      onChangeText={val =>
                        updateEntry(entry.id, 'value', val)
                      }
                    />
                  </View>
                );
              })}

              <View style={styles.foodModalButtons}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveManualEntry}
                >
                  <Text style={styles.saveButtonText}>Save Food Entry</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setFoodModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={customizeModalVisible}
        onRequestClose={() => setCustomizeModalVisible(false)}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Customize Home</Text>
              <Text style={styles.sheetSubtitle}>
                Toggle modules on/off. Long-press on Home to reorder.
              </Text>
            </View>
            <ScrollView style={{maxHeight: screenHeight * 0.55}} contentContainerStyle={{paddingBottom: 12}}>

              <View style={styles.sheetDivider} />


              <Text style={styles.sectionTitle}>Modules</Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowNutritionSummary(!showNutritionSummary)}
                style={styles.row}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.rowLabel}>🍽️ Nutrition Summary</Text>
                  <Text style={styles.rowSub}>Quick calories viewer + food log</Text>
                </View>
                <Switch
                  value={showNutritionSummary}
                  onValueChange={setShowNutritionSummary}
                  trackColor={{false:'#444', true:'#e0e0e062'}}
                  thumbColor={showNutritionSummary ? '#e0e0e0' : '#999'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowTasks(!showTasks)}
                style={styles.row}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.rowLabel}>🗓️ Tasks</Text>
                  <Text style={styles.rowSub}>Current Tasks</Text>
                </View>
                <Switch
                  value={showTasks}
                  onValueChange={setShowTasks}
                  trackColor={{false:'#444', true:'#e0e0e062'}}
                  thumbColor={showTasks ? '#e0e0e0' : '#999'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowNutrition(!showNutrition)}
                style={styles.row}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.rowLabel}>📊 Nutrition Rundown</Text>
                  <Text style={styles.rowSub}>Calories / Protein / Carbs / Fat bars</Text>
                </View>
                <Switch
                  value={showNutrition}
                  onValueChange={setShowNutrition}
                  trackColor={{false:'#444', true:'#e0e0e062'}}
                  thumbColor={showNutrition ? '#e0e0e0' : '#999'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowWeekly(!showWeekly)}
                style={styles.row}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.rowLabel}>🗂️ Weekly Calendar</Text>
                  <Text style={styles.rowSub}>7-day activity view</Text>
                </View>
                <Switch
                  value={showWeekly}
                  onValueChange={setShowWeekly}
                  trackColor={{false:'#444', true:'#e0e0e062'}}
                  thumbColor={showWeekly ? '#e0e0e0' : '#999'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowStreak(!showStreak)}
                style={styles.row}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.rowLabel}>🔥 Streak Stats</Text>
                  <Text style={styles.rowSub}>Current & best streak</Text>
                </View>
                <Switch
                  value={showStreak}
                  onValueChange={setShowStreak}
                  trackColor={{false:'#444', true:'#e0e0e062'}}
                  thumbColor={showStreak ? '#e0e0e0' : '#999'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowWeightLog(!showWeightLog)}
                style={styles.row}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.rowLabel}>⚖️ Weight Log</Text>
                  <Text style={styles.rowSub}>Latest weight + log button</Text>
                </View>
                <Switch
                  value={showWeightLog}
                  onValueChange={setShowWeightLog}
                  trackColor={{false:'#444', true:'#e0e0e062'}}
                  thumbColor={showWeightLog ? '#e0e0e0' : '#999'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowBuildWorkout(!showBuildWorkout)}
                style={styles.row}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.rowLabel}>🏋️‍♂️ Create Template</Text>
                  <Text style={styles.rowSub}>Quick jump to Template Creation</Text>
                </View>
                <Switch
                  value={showBuildWorkout}
                  onValueChange={setShowBuildWorkout}
                  trackColor={{false:'#444', true:'#e0e0e062'}}
                  thumbColor={showBuildWorkout ? '#e0e0e0' : '#999'}
                />
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.sheetButtonsRow}>
              <TouchableOpacity
                style={styles.buttonSecondary}
                onPress={() => {
                  setShowNutritionSummary(true);
                  setShowTasks(true);
                  setShowNutrition(true);
                  setShowWeekly(true);
                  setShowStreak(true);
                  setShowWeightLog(true);
                  setShowBuildWorkout(true);
                  setModuleOrder(['nutritionSummary', 'tasks', 'nutrition', 'weekly', 'streak', 'weightLog', 'buildWorkout']);
                }}
              >
                <Text style={styles.buttonSecondaryText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonSecondary}
                onPress={() => setCustomizeModalVisible(false)}
              >
                <Text style={styles.buttonSecondaryText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonPrimary}
                onPress={() => {
                  saveModulePreferences();
                  setCustomizeModalVisible(false);
                }}
              >
                <Text style={styles.buttonPrimaryText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      <WeightTouchable
        isVisible={weightModalVisible}
        onClose={() =>{
          setWeightModalVisible(false);
          (async () => {
            try {
              const userWeight = await db.getFirstAsync('SELECT weight FROM userStats WHERE user_id = ?', [userId]);
              if (userWeight) setCurrentWeight(Number(userWeight.weight));
            } catch (e) {
              console.error('Error refreshing weight:', e);
            }
          })();
        }}
        />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height:screenHeight,
    width:screenWidth,
    backgroundColor: '#1a1b1c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#e0e0e0',
    fontSize: 28,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#e0e0e0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  homeModule: {
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    // borderColor: '#fff',
    // borderWidth: 1,
    padding: 4,
    paddingTop: 10,
    marginTop: 20,
    width: '95%',
    maxHeight: 300,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e0e0e0',
    marginBottom: 10,
    textAlign: 'center',
  },
  taskList: {
    paddingBottom: 10,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  time: {
    color: '#e0e0e0',
    fontWeight: 'bold',
    textAlign: 'left',
    flex: 1,
  },
  task: {
    color: '#ccc',
    textAlign: 'right',
    flex: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#444',
    marginHorizontal: 20,
  },
  noTask: {
    color: '#999',
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  timeWrapper: {
    flex: 1,
    justifyContent: 'center'
  },
  textWrapper: {
    flex: 2,
    justifyContent: 'center'
  },
  nutrientRow: {
    marginBottom: 12,
  },
  nutrientLabel: {
    color: '#e0e0e0',
    marginBottom: 4,
    fontWeight: 'bold',
    fontSize: 14,
    paddingLeft: 12
  },
  barContainer: {
    height: 16,
    backgroundColor: '#111',
    borderRadius: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    borderTopWidth: 1,
    borderColor: '#444',
  },
  dayColumn: {
    flex: 1,
    backgroundColor: '#3a3a3c',
    borderRightWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  dayLabel: {
    color: '#e0e0e0',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dayContent: {
    flex: 1,
    minHeight: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addEventButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: '#32a852',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 10,
  },
  addEventText: {
    color: '#e0e0e0',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#2c2c2e',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e0e0e0',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#444',
    color: '#e0e0e0',
    padding: 10,
    borderRadius: 8,
    width: '100%',
    marginBottom: 15,
  },
  modalAddButton: {
    backgroundColor: '#32a852',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  modalAddText: {
    color: '#e0e0e0',
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#ff5555',
    marginTop: 10,
  },
  timeButton: {
    backgroundColor: '#444',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  timeButtonText: {
    color: '#e0e0e0',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "green",
    marginTop: 4,
  },
  customizeButton: {
    position: 'absolute',
    bottom: "15%",
    left: 20,
    backgroundColor: '#444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    zIndex: 99,
    borderWidth: 1,
    borderColor: '#888',
  },
  gridItem: { 
    width: screenWidth * 0.90, 
    alignItems: 'center'
  },
  smallItem: {
    flexBasis: (screenWidth - 12*2 - 12) / 2,
    marginBottom: 12,
  },
  smallCard: {
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  smallLabel: {
    color: '#e0e0e0',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  smallValue: {
    color: '#e0e0e0',
    fontSize: 12,
    fontWeight: '600',
  },
    modulesContainer: {
    flex: 1,
    paddingBottom: '15%',
    paddingHorizontal: 10,
  },
   nutritionSummaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  calorieInfo: {
    flex: 1,
  },
  calorieLabel: {
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  calorieValue: {
    color: '#00eaff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addFoodButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: '#32a852',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 10,
  },
  addFoodText: {
    color: '#e0e0e0',
    fontWeight: 'bold',
    fontSize: 14,
  },
  foodModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodModalContentWrapper: {
    backgroundColor: '#2c2c2e',
    borderRadius: 20,
    width: '90%',
    maxHeight: screenHeight * 0.7,
    minHeight: 400,
  },
  foodModalScroll: {
    flex: 1,
    borderRadius: 20,
  },
  foodModalScrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  foodModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#e0e0e0',
  },
  foodInputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  foodInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#e0e0e0',
  },
  foodTextInput: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#444',
    color: '#e0e0e0',
  },
  addValueButton: {
    backgroundColor: '#32a852',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 15,
    alignSelf: 'center',
  },
  addValueText: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    marginRight: 8,
    overflow: 'hidden',
    backgroundColor: '#444',
  },
  picker: {
    height: 44,
    width: '100%',
    color: '#e0e0e0',
  },
  valueInput: {
    width: 80,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#444',
    color: '#e0e0e0',
  },
  foodModalButtons: {
    marginTop: 20,
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: '#555',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#32a852',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  streakText: {
    color: '#ffcc00',
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
    streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  streakItem: {
    alignItems: 'center',
    flex: 1,
  },
  fireIconRed: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 69, 58, 0.2)',
    borderWidth: 3,
    borderColor: '#FF453A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  fireIconGold: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 204, 0, 0.2)',
    borderWidth: 3,
    borderColor: '#FFD60A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  fireEmoji: {
    fontSize: 36,
  },
  streakLabel: {
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  streakValue: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  streakDays: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#375573',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 120,
  },
  actionButtonText: {
    color: '#e0e0e0',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  sheetContainer: {
    backgroundColor: '#2c2c2e',
    width: '90%',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  sheetHeader: {
    paddingHorizontal: 4,
    paddingTop: 6,
    paddingBottom: 8,
  },
  sheetTitle: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  sheetSubtitle: {
    color: '#aaa',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
  sectionTitle: {
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  chipText: {
    color: '#e0e0e0',
    fontSize: 12,
    fontWeight: '700',
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#3a3a3c',
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#3a3a3c',
  },
  rowLeft: { flexShrink: 1, paddingRight: 12 },
  rowLabel: { color: '#e0e0e0', fontSize: 16, fontWeight: '700' },
  rowSub: { color: '#9a9a9a', fontSize: 12, marginTop: 2 },
  sheetButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  buttonSecondary: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4b4b4d',
  },
  buttonSecondaryText: {
    color: '#e0e0e0',
    fontWeight: '700',
  },
  buttonPrimary: {
    backgroundColor: '#32a852',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  buttonPrimaryText: {
    color: '#0b0b0c',
    fontWeight: '800',
  },
});
