import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as Calendar from 'expo-calendar';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import JimRat from '../../components/jimRat';
import { HomeModal } from '../../components/Onboarding/onboard';
import { updateStreakOnAppOpen } from '../../components/streak';
import { useUser } from '../../UserContext';
import { cals } from '../goal';

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
  const [moduleOrder, setModuleOrder] = useState(['nutritionSummary', 'tasks', 'nutrition', 'weekly']);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  // check if daily log has entries for Jim rat
  const [hasEntries, setHasEntries] = useState(false);
  const [hasWorkout, setHasWorkout] = useState(false);

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
      handleOnboarding()
    }, [])
  )
  
  const handleOnboarding = async () => {
    try {
      const result = await db.getFirstAsync('SELECT * FROM users')
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

  useEffect(() => {
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
  }, [db, userId, foodModalVisible]);

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
        module_order TEXT DEFAULT '["nutritionSummary","tasks","nutrition","weekly"]'
      );
    `);
  } catch (error) {
    console.error('Error creating modulePreferences table:', error);
  }
};

const saveModulePreferences = async () => {
  if (!userId) return;
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO modulePreferences 
       (user_id, show_nutrition_summary, show_tasks, show_nutrition, show_weekly, module_order) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        showNutritionSummary ? 1 : 0,
        showTasks ? 1 : 0,
        showNutrition ? 1 : 0,
        showWeekly ? 1 : 0,
        JSON.stringify(moduleOrder)
      ]
    );
  } catch (error) {
    console.error('Error saving module preferences:', error);
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

      try {
        const order = JSON.parse(prefs.module_order);
        setModuleOrder(order);
      } catch (e) {
        console.error('Error parsing module order:', e);
      }
    }
    setPreferencesLoaded(true);
  } catch (error) {
    console.error('Error loading module preferences:', error);
    setPreferencesLoaded(true);
  }
};

const allModules = useMemo(() => {
  const enabled = [];
  if (showNutritionSummary) enabled.push('nutritionSummary');
  if (showTasks) enabled.push('tasks');
  if (showNutrition) enabled.push('nutrition');
  if (showWeekly) enabled.push('weekly');

  return moduleOrder.filter(k => enabled.includes(k)).map(k => ({ key: k }));
  }, [showNutritionSummary, showTasks, showNutrition, showWeekly, moduleOrder]);

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

      default:
        return null;
    }
  }, [events, dailyTotals, weekData, setDayModalVisible]);


  return (
    <SafeAreaProvider>
        <View style={styles.container}>
          <SafeAreaView style={{ flex: 1, height: screenHeight, width: screenWidth, alignItems:'center', justifyContent: 'center' }}>
          <Text style={styles.text}>GymRat</Text>
          
          <HomeModal isVisible={isHomeModal} onClose={() => setHomeModal(false)}/>
          {/* uncomment to see current gym streak for user. just a bandaid view till jim art is done or streak module done */}
          {streak > 0 && (
            <Text style={styles.streakText}> {streak} day streak</Text>
          )}

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
            />
          </View>

          {/* <View style={styles.homeModule}>
            <Text style={styles.moduleTitle}>Tasks to do today</Text>
            <ScrollView contentContainerStyle={styles.taskList}>
              {events.length === 0 ? (
                <Text style={styles.noTask}>No events for today</Text>
              ) : (
                events.map((event, index) => (
                  <View key={event.id}>
                    {index === 0 && <View style={styles.divider} />}
                    <View  style={styles.taskRow}>
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
              )}
            </ScrollView>
            <TouchableOpacity style={styles.addEventButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.addEventText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        

          
          
          <View style={styles.homeModule}>
            <Text style={styles.moduleTitle}>Nutrition Rundown</Text>

            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>Energy - {dailyTotals.totalCalories} / {cals} kcal</Text>
              <View style={styles.barContainer}>
                <View style={[styles.barFill, { backgroundColor: '#00eaff', width: `${Math.min((dailyTotals.totalCalories / cals) * 100, 100)}%` }]} />
              </View>
            </View>
              
            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>Protein - {dailyTotals.totalProtein} / {Math.round((cals * 0.25) / 4)}g</Text>
              <View style={styles.barContainer}>
                <View style={[styles.barFill, { backgroundColor: '#ff00ff', width: `${Math.min((dailyTotals.totalProtein / ((cals * 0.25) / 4)) * 100, 100)}%` }]} />
              </View>
            </View>
              
            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>Carbs - {dailyTotals.totalCarbs} / {Math.round((cals * 0.45) / 4)}g</Text>
              <View style={styles.barContainer}>
                <View style={[styles.barFill, { backgroundColor: '#00ff00', width: `${Math.min((dailyTotals.totalCarbs / ((cals * 0.45) / 4)) * 100, 100)}%` }]} />
              </View>
            </View>
              
            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>Fat - {dailyTotals.totalFat} / {Math.round((cals * 0.30) / 9)}g</Text>
              <View style={styles.barContainer}>
                <View style={[styles.barFill, { backgroundColor: '#ff0000', width: `${Math.min((dailyTotals.totalFat / ((cals * 0.30) / 9)) * 100, 100)}%` }]} />
              </View>
            </View>
          </View>
        

        
          <View style={styles.homeModule}>
            <Text style={styles.moduleTitle}>Weekly Calendar</Text>
            <View style={styles.weekRow}>
              {weekData.map((dayInfo, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dayColumn}
                  onPress={async () => {
                    setSelectedDate(dayInfo.date);
                    if (dayInfo.hasLog) {
                      const totals = await loadTotalsForDate(dayInfo.date, "historyLog"); // change to STOREDNUTLOG when it works
                      setDayTotals(totals);
                    } else {
                      setDayTotals(null); // no logs for that day
                    }
                    setDayModalVisible(true);
                  }}
                >
                  <Text style={styles.dayLabel}>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayInfo.date.getDay()]}
                  </Text>
                  <View style={styles.dayContent}>
                    <Text style={{ color: "#fff" }}>{dayInfo.date.getDate()}</Text>
                    <View
                      style={[
                        styles.logIndicator,
                        { backgroundColor: dayInfo.hasLog ? "green" : "transparent" }
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View> */}
        

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
          </SafeAreaView>
        </View>

        <TouchableOpacity
          style={styles.customizeButton}
          onPress={() => setCustomizeModalVisible(true)}
        >
          <Text style={styles.buttonText}>⚙️</Text>
        </TouchableOpacity>


        {/*<NavBar />*/}
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
          transparent={true}
          visible={customizeModalVisible}
          onRequestClose={() => setCustomizeModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Customize Home Modules</Text>

              <TouchableOpacity onPress={() => setShowNutritionSummary(!showNutritionSummary)}>
                <Text style={{ color: showNutritionSummary ? '#32a852' : '#888', marginBottom: 10 }}>
                  {showNutritionSummary ? '✔ ' : '○ '}Nutrition Summary
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowTasks(!showTasks)}>
                <Text style={{ color: showTasks ? '#32a852' : '#888', marginBottom: 10 }}>
                  {showTasks ? '✔ ' : '○ '}Tasks
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowNutrition(!showNutrition)}>
                <Text style={{ color: showNutrition ? '#00eaff' : '#888', marginBottom: 10 }}>
                  {showNutrition ? '✔ ' : '○ '}Nutrition Rundown
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowWeekly(!showWeekly)}>
                <Text style={{ color: showWeekly ? '#ffa500' : '#888', marginBottom: 10 }}>
                  {showWeekly ? '✔ ' : '○ '}Weekly Calendar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => {saveModulePreferences();
                setCustomizeModalVisible(false)}}>
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1b1c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  nutsplashButton: {
    marginTop: 10,
    backgroundColor: '#32a852',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
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
    color: '#fff',
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
    color: '#fff',
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
    color: '#fff',
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
    color: '#fff',
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
    color: '#fff',
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
    color: '#fff',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#444',
    color: '#fff',
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
    color: '#fff',
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
    color: '#fff',
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
    bottom: 100,
    left: 20,
    backgroundColor: '#444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    zIndex: 99,
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
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  smallValue: {
    color: '#ddd',
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
    color: '#fff',
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
    backgroundColor: '#rgba(255,255,255,0.08)',
    borderColor: '#32a852',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addFoodText: {
    color: '#fff',
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
    color: '#fff',
  },
  foodInputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  foodInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#fff',
  },
  foodTextInput: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#444',
    color: '#fff',
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
    color: '#fff',
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
    color: '#fff',
  },
  valueInput: {
    width: 80,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#444',
    color: '#fff',
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
    color: '#fff',
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
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  streakText: {
    color: '#ffcc00',
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
