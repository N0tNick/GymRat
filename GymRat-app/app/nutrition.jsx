import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Path, Text as SvgText, TSpan } from 'react-native-svg';
import { SwipeGesture } from "react-native-swipe-gesture-handler";
import JimRatNutrition from '../components/jimRatNutrition';
import NavBar from '../components/NavBar';
import { UserContext, useUser } from '../UserContext';
import { cals } from './goal';

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
  { label: 'Fiber (g)',          value: 'fiber' },
  { label: 'Iron (mg)',          value: 'iron' },
  { label: 'Potassium (mg)',     value: 'potassium' },
  { label: 'Vitamin A (mcg)',     value: 'vitamin_A' },
  { label: 'Vitamin B6 (mg)',   value: 'vitamin_B6' },
  { label: 'Vitamin B12 (mcg)',  value: 'vitamin_B12' },
  { label: 'Vitamin C (mg)',     value: 'vitamin_C' },
  { label: 'Vitamin D (mcg)',     value: 'vitamin_D' },
  { label: 'Vitamin E (mg)',     value: 'vitamin_E' },
];

// Utility functions for pie chart
function polarToCartesian(cx, cy, r, angleDeg) {
  const angle = ((angleDeg - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}
function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${cx} ${cy} Z`;
}
function PieChart({ size = 220, values, colors, labels, valueLabels }) {
  const total = values.reduce((a, b) => a + (isFinite(b) ? b : 0), 0);
  const radius = size / 2;
  const cx = radius;
  const cy = radius;

  if (total <= 0) {
    return (
      <Svg width={size} height={size}>
        <G>
          <Circle cx={cx} cy={cy} r={radius - 2} fill="rgba(255,255,255,0.15)" />
        </G>
      </Svg>
    );
  }

  let startAngle = 0;
  const slices = values.map((v, i) => {
    const angle = (v / total) * 360;
    const midAngle = startAngle + angle / 2;

    const anchor = polarToCartesian(cx, cy, radius * 0.62, midAngle);

    const slice = {
      path: angle > 0 ? arcPath(cx, cy, radius, startAngle, startAngle + angle) : null,
      color: colors[i],
      label: labels[i],
      labelX: anchor.x,
      labelY: anchor.y,
      valueLabel: valueLabels?.[i] ?? '',
    };

    startAngle += angle;
    return slice;
  });

  return (
    <Svg width={size} height={size}>
      <G>
        {slices.map((s, i) =>
          s.path ? (
            <G key={i}>
              <Path d={s.path} fill={s.color} />
             <SvgText
              x={s.labelX}
              y={s.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              <TSpan fontSize="12" fontWeight="bold" fill="#fff">
                {s.label}
              </TSpan>
              <TSpan x={s.labelX} dy={14} fontSize="11" fill="#fff">
                {s.valueLabel}
              </TSpan>
            </SvgText>

            </G>
          ) : null
        )}
      </G>
    </Svg>
  );
}

export default function Nutrition() {
  const db = useSQLiteContext();
  const { user } = useContext(UserContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState('bars');
  const [foodName, setFoodName] = useState('');
  const [entries, setEntries] = useState([]);
  const { openModal } = useLocalSearchParams();
  const { userId } = useUser();
  const [nutrientEntries, setNutrientEntries] = useState([]);
  const router = useRouter();
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyByDate, setHistoryByDate] = useState({});
  const [dailyTotals, setDailyTotals] = useState(null);
  const [streak, setStreak] = useState(0);
  const [hasEntries, setHasEntries] = useState(false);
  const [hasWorkout, setHasWorkout] = useState(false);

  const totalCalories = dailyTotals?.totalCalories || 0;
  const proteinTotal = dailyTotals?.totalProtein || 0;
  const carbsTotal   = dailyTotals?.totalCarbs   || 0;
  const fatTotal     = dailyTotals?.totalFat     || 0;
  const sugarTotal   = dailyTotals?.totalSugar   || 0;
  const fiberTotal     = dailyTotals?.totalFiber     || 0;
  const ironTotal      = dailyTotals?.totalIron      || 0;
  const potassiumTotal = dailyTotals?.totalPotassium || 0;
  const vitATotal      = dailyTotals?.totalVitA      || 0;
  const vitB6Total     = dailyTotals?.totalVitB6     || 0;
  const vitB12Total    = dailyTotals?.totalVitB12    || 0;
  const vitCTotal      = dailyTotals?.totalVitC      || 0;
  const vitDTotal      = dailyTotals?.totalVitD      || 0;
  const vitETotal      = dailyTotals?.totalVitE      || 0;


  const proteinTarget = Math.round((cals * 0.25) / 4);
  const carbsTarget   = Math.round((cals * 0.45) / 4);
  const fatTarget     = Math.round((cals * 0.30) / 9);
  const sugarTarget   = Math.round((cals * 0.10) / 4);

  const percent = totalCalories > 0 ? Math.round((totalCalories / cals) * 100) : 0;
  const proteinPercent = proteinTarget > 0 ? Math.round((proteinTotal / proteinTarget) * 100) : 0;
  const carbsPercent   = carbsTarget   > 0 ? Math.round((carbsTotal   / carbsTarget)   * 100) : 0;
  const fatPercent     = fatTarget     > 0 ? Math.round((fatTotal     / fatTarget)     * 100) : 0;

  const pieValues = useMemo(() => {
  const cal = Math.max(0, Number(totalCalories) || 0);
  const fatC = Math.max(0, (Number(fatTotal) || 0) * 9);
  const carbC = Math.max(0, (Number(carbsTotal) || 0) * 4);
  const sugC = Math.max(0, (Number(sugarTotal) || 0) * 4);
  return [cal, fatC, carbC, sugC];
}, [totalCalories, fatTotal, carbsTotal, sugarTotal]);

const pieColors = ['#32a852', '#ff0000', '#ffa500', '#ff69b4'];

const onSwipePerformed = (action) => {
    switch(action){
      case 'left':{
        console.log('left Swipe performed');
        router.push('/profile') 
        break;
      }
        case 'right':{ 
        console.log('right Swipe performed');
        router.push('/barcodeScanner')
        break;
      }
        case 'up':{ 
        console.log('up Swipe performed'); 
        break;
      }
        case 'down':{ 
        console.log('down Swipe performed'); 
        break;
      }
        default : {
        console.log('Undeteceted action');
        }
    }
  }

  const loadTodaysTotals = async (userId) => {
    const date = new Date().toISOString().split('T')[0];

    try {
      const result = await db.getAllAsync(
        `SELECT 
          SUM(CAST(calories AS REAL)) AS totalCalories,
          SUM(CAST(protein AS REAL)) AS totalProtein,
          SUM(CAST(total_Carbs AS REAL)) AS totalCarbs,
          SUM(CAST(total_Fat AS REAL)) AS totalFat,
          SUM(CAST(sugar AS REAL)) AS totalSugar,
          SUM(CAST(fiber AS REAL)) AS totalFiber,
          SUM(CAST(iron AS REAL)) AS totalIron,
          SUM(CAST(potassium AS REAL)) AS totalPotassium,
          SUM(CAST(vitamin_A AS REAL)) AS totalVitA,
          SUM(CAST(vitamin_B6 AS REAL)) AS totalVitB6,
          SUM(CAST(vitamin_B12 AS REAL)) AS totalVitB12,
          SUM(CAST(vitamin_C AS REAL)) AS totalVitC,
          SUM(CAST(vitamin_D AS REAL)) AS totalVitD,
          SUM(CAST(vitamin_E AS REAL)) AS totalVitE
        FROM dailyNutLog
        WHERE user_id = ? AND date = ?`,
        [userId, date]
      );

      // error handing if there are no values for user
      const totals = result[0];
      setDailyTotals({
        totalCalories: totals?.totalCalories || 0,
        totalProtein: totals?.totalProtein || 0,
        totalCarbs: totals?.totalCarbs || 0,
        totalFat: totals?.totalFat || 0,
        totalSugar: totals?.totalSugar || 0,
        totalFiber: totals?.totalFiber || 0,
        totalIron: totals?.totalIron || 0,
        totalPotassium: totals?.totalPotassium || 0,
        totalVitA: totals?.totalVitA || 0,
        totalVitB6: totals?.totalVitB6 || 0,
        totalVitB12: totals?.totalVitB12 || 0,
        totalVitC: totals?.totalVitC || 0,
        totalVitD: totals?.totalVitD || 0,
        totalVitE: totals?.totalVitE || 0,
      });
    } catch (error) {
      console.error('Error loading totals:', error);
      // set default values if query fails
      setDailyTotals({
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      });
    }
  };

    const fmtDate = (d) => {
    if (!d) return '';
    const parts = String(d).split('-');
    if (parts.length !== 3) return d;
    const [y, m, day] = parts;
    return `${parseInt(m, 10)}/${parseInt(day, 10)}/${String(y).slice(2)}`;
  };

  const loadHistory = async () => {
    const uid = userId || user?.id;
    if (!uid) return;

    try {
      const rows = await db.getAllAsync(
        `SELECT 
          rowid AS id,
          date,
          name,
          COALESCE(CAST(calories     AS REAL), 0) AS calories,
          COALESCE(CAST(protein      AS REAL), 0) AS protein,
          COALESCE(CAST(total_Carbs  AS REAL), 0) AS carbs
        FROM historyLog
        WHERE user_id = ?
        ORDER BY date DESC, rowid DESC;`,
        [uid]
      );

      const grouped = rows.reduce((acc, r) => {
        const key = r.date || 'Unknown';
        if (!acc[key]) acc[key] = [];
        acc[key].push({
          id: r.id?.toString() ?? Math.random().toString(),
          name: r.name || 'Unnamed item',
          calories: r.calories,
          protein: r.protein,
          carbs: r.carbs,
        });
        return acc;
      }, {});
      setHistoryByDate(grouped);
    } catch (e) {
      console.error('load history failed', e);
    }
  };

  const ensureHistoryTable = async () => {
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS historyLog (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        name TEXT,
        calories TEXT, protein TEXT,
        cholesterol TEXT, sodium TEXT,
        total_Fat TEXT, saturated_Fat TEXT, trans_Fat TEXT,
        polyunsaturated_Fat TEXT, monosaturated_Fat TEXT,
        total_Carbs TEXT, fiber TEXT, sugar TEXT,
        vitamin_A TEXT, vitamin_C TEXT, vitamin_D TEXT, vitamin_E TEXT, vitamin_K TEXT,
        vitamin_B1 TEXT, vitamin_B2 TEXT, vitamin_B3 TEXT, vitamin_B5 TEXT, vitamin_B6 TEXT,
        vitamin_B7 TEXT, vitamin_B9 TEXT, vitamin_B12 TEXT,
        iron TEXT, calcium TEXT, potassium TEXT
      );
    `);
    await db.runAsync(
      `CREATE INDEX IF NOT EXISTS idx_history_user_date ON historyLog(user_id, date);`
    );
  };

  const clearDailyIfNeeded = async (uid) => {
    await db.runAsync(`CREATE TABLE IF NOT EXISTS appMeta (key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
    const today = new Date().toISOString().slice(0,10);
    const row = (await db.getAllAsync(`SELECT value FROM appMeta WHERE key='last_daily_clear' LIMIT 1;`))[0];
    const last = row?.value;
    if (last !== today) {
      await db.runAsync(`DELETE FROM dailyNutLog WHERE user_id = ? AND date <> ?;`, [uid, today]);
      await db.runAsync(
        `INSERT INTO appMeta(key,value) VALUES('last_daily_clear', ?)
        ON CONFLICT(key) DO UPDATE SET value=excluded.value;`,
        [today]
      );
    }
  };

  useEffect(() => {
  (async () => {
    const uid = userId || user?.id;
    if (!uid) return;
    try {
      const res = await db.getAllAsync(
        'SELECT current_streak FROM userStreaks WHERE user_id = ?',
        [uid]
      );
      if (res && res[0]) {
        setStreak(res[0].current_streak);
      }
    } catch (err) {
      console.warn('streak read failed', err);
    }
  })();
}, [db, userId, user?.id]);

useEffect(() => {
  (async () => {
    const uid = userId || user?.id;
    if (!uid) return;
    const today = new Date().toISOString().split("T")[0];
    const workoutRes = await db.getAllAsync(
      `SELECT COUNT(*) as count FROM workoutLog WHERE user_id = ? AND date = ?`,
      [uid, today]
    );
    setHasWorkout(workoutRes[0]?.count > 0);
    const entriesRes = await db.getAllAsync(
      `SELECT COUNT(*) as count FROM dailyNutLog WHERE user_id = ? AND date = ?`,
      [uid, today]
    );
    setHasEntries(entriesRes[0]?.count > 0);
  })();
}, [db, userId, user?.id, modalVisible]);


  useEffect(() => {
    if (historyVisible) loadHistory();
  }, [historyVisible, userId, user?.id]);

  // used to open the modal from barcode scanner screen via a button
  useEffect(() => {
    if (openModal === 'true') {
      setModalVisible(true);
    }
  }, [openModal]);

  useEffect(() => {
    const userIdToUse = userId || user?.id;
    if (!userIdToUse) return;
    
    const today = new Date().toISOString().slice(0, 10);

    
    // load entries for display
    db.getAllAsync(
      `SELECT * FROM dailyNutLog WHERE user_id = ? AND date = ?;`,
      [userIdToUse, today]
    )
      .then(rows => setEntries(rows))
      .catch(err => console.error('load entries failed', err));
    // load current totals
    loadTodaysTotals(userIdToUse);
  }, [userId, user?.id, modalVisible]);

    useEffect(() => {
    const uid = userId || user?.id;
    if (!uid) return;
    (async () => {
      await ensureHistoryTable();
      await clearDailyIfNeeded(uid);
      await loadTodaysTotals(uid);
    })();
  }, [userId, user?.id]);

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
      const userIdToUse = userId || user?.id;
      if (!userIdToUse || !foodName.trim()) {
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
        fiber: '0',
        iron: '0',
        potassium: '0',
        vitamin_A: '0',
        vitamin_B6: '0',
        vitamin_B12: '0',
        vitamin_C: '0',
        vitamin_D: '0',
        vitamin_E: '0',
      };


      validEntries.forEach(entry => {
        nutritionData[entry.nutrient] = entry.value;
      });


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
          userIdToUse,
          date,
          foodName,
          nutritionData.calories,
          nutritionData.protein,
          nutritionData.cholesterol,
          nutritionData.sodium,
          nutritionData.fat,
          '0', // saturated_fat
          '0', // trans_fat
          '0', // polyunsaturated_fat
          '0', // monounsaturated_fat
          '0', // total_Carbs
          nutritionData.fiber, // fiber
          nutritionData.sugar,
          nutritionData.vitamin_A, // vitamin_a
          nutritionData.vitamin_C, // vitamin_c
          nutritionData.vitamin_D, // vitamin_d
          nutritionData.vitamin_E, // vitamin_e
          '0', // vitamin_k
          '0', // thiamin
          '0', // riboflavin
          '0', // niacin
          '0', // pantothenic_acid
          nutritionData.vitamin_B6, // vitamin_b6
          '0', // biotin
          '0', // folate
          nutritionData.vitamin_B12, // vitamin_b12
          nutritionData.iron, // iron
          nutritionData.calcium,
          nutritionData.potassium, // potassium
        ]
      );

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
          userIdToUse,
          date,
          foodName,
          nutritionData.calories,
          nutritionData.protein,
          nutritionData.cholesterol,
          nutritionData.sodium,
          nutritionData.fat,
          '0',
          '0',
          '0',
          '0',       
          '0',
          nutritionData.fiber,               
          nutritionData.sugar,
          nutritionData.vitamin_A,
          nutritionData.vitamin_C,
          nutritionData.vitamin_D,
          nutritionData.vitamin_E,
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          nutritionData.vitamin_B6,
          '0',
          '0',
          nutritionData.vitamin_B12, 
          nutritionData.iron,              
          nutritionData.calcium,
          nutritionData.potassium,                    
        ]
      );



      setFoodName('');
      setNutrientEntries([]);
      setModalVisible(false);
      loadTodaysTotals(userIdToUse);
      alert('Food entry saved successfully!');
    } catch (error) {
      console.error('Error saving manual entry:', error);
      alert('Failed to save food entry');
    }
  };
  

  return (
    <SafeAreaProvider>
      <LinearGradient style={styles.gradient} colors={['#32a852', '#1a1b1c']} locations={[0,0.15,1]}>
        <SwipeGesture onSwipePerformed={onSwipePerformed}>
        <SafeAreaView style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              {dailyTotals && (
                <JimRatNutrition
                dailyTotals={dailyTotals}
                targets={{
                  calorieTarget: cals,
                  proteinTarget: proteinTarget,
                  carbsTarget: carbsTarget,
                  fatTarget: fatTarget,
                }}
                streak={streak}
                hasEntries={hasEntries}
                hasWorkout={hasWorkout}
              />
              )}
              {/* <Text style={styles.text}>Nutrition Screen</Text> */}
              <Text style={[styles.text, { fontSize: 18 }]}>
                Today's Calorie Goal: {cals}
              </Text>

              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, viewMode === 'bars' && styles.toggleBtnActive]}
                  onPress={() => setViewMode('bars')}
                  accessibilityRole="button"
                  accessibilityState={{ selected: viewMode === 'bars' }}
                >
                  <Text style={[styles.toggleText, viewMode === 'bars' && styles.toggleTextActive]}>
                    Progress
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toggleBtn, viewMode === 'macros' && styles.toggleBtnActive]}
                  onPress={() => setViewMode('macros')}
                  accessibilityRole="button"
                  accessibilityState={{ selected: viewMode === 'macros' }}
                >
                  <Text style={[styles.toggleText, viewMode === 'macros' && styles.toggleTextActive]}>
                    Macros
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toggleBtn, viewMode === 'pie' && styles.toggleBtnActive]}
                  onPress={() => setViewMode('pie')}
                  accessibilityRole="button"
                  accessibilityState={{ selected: viewMode === 'pie' }}
                >
                  <Text style={[styles.toggleText, viewMode === 'pie' && styles.toggleTextActive]}>
                    Pie
                  </Text>
                </TouchableOpacity>
              </View>

              {viewMode === 'pie' && (
                <Text style={styles.pieCaption}>
                  Keep Green and Blue larger than Red, Orange, and Pink to achieve goal of pie charts
                </Text>
              )}

              {viewMode === 'bars' && (
                <>
                  <View style={styles.progressGroup}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressTitle}>Calories</Text>
                      <Text style={styles.progressTopValue}>{totalCalories} / {cals}</Text>
                    </View>
                    <View style={styles.progressRow}>
                      <View style={styles.progressBarContainer}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${Math.min(percent, 100)}%` }
                          ]}
                        />
                      </View>
                      <Text style={[styles.text, styles.progressText]}>{percent}%</Text>
                    </View>
                  </View>

                  <View style={styles.progressGroup}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressTitle}>Protein</Text>
                      <Text style={styles.progressTopValue}>{proteinTotal} / {proteinTarget}g</Text>
                    </View>
                    <View style={styles.progressRow}>
                      <View style={styles.progressBarContainer}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { backgroundColor: '#ff00ff', width: `${Math.min(proteinPercent, 100)}%` }
                          ]}
                        />
                      </View>
                      <Text style={[styles.text, styles.progressText]}>{proteinPercent}%</Text>
                    </View>
                  </View>

                  <View style={styles.progressGroup}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressTitle}>Carbs</Text>
                      <Text style={styles.progressTopValue}>{carbsTotal} / {carbsTarget}g</Text>
                    </View>
                    <View style={styles.progressRow}>
                      <View style={styles.progressBarContainer}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { backgroundColor: '#00ff00', width: `${Math.min(carbsPercent, 100)}%` }
                          ]}
                        />
                      </View>
                      <Text style={[styles.text, styles.progressText]}>{carbsPercent}%</Text>
                    </View>
                  </View>

                  <View style={styles.progressGroup}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressTitle}>Fat</Text>
                      <Text style={styles.progressTopValue}>{fatTotal} / {fatTarget}g</Text>
                    </View>
                    <View style={styles.progressRow}>
                      <View style={styles.progressBarContainer}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { backgroundColor: '#ff0000', width: `${Math.min(fatPercent, 100)}%` }
                          ]}
                        />
                      </View>
                      <Text style={[styles.text, styles.progressText]}>{fatPercent}%</Text>
                    </View>
                  </View>
                </>
              )}

              {viewMode === 'macros' && (
                <>
                  <View style={styles.macroRow}>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{totalCalories}</Text>
                      <Text style={styles.macroLabel}>Calories</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{proteinTotal}</Text>
                      <Text style={styles.macroLabel}>Protein</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{fatTotal}</Text>
                      <Text style={styles.macroLabel}>Fat</Text>
                    </View>
                  </View>

                  <View style={styles.macroRow}>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{carbsTotal}</Text>
                      <Text style={styles.macroLabel}>Carbs</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{sugarTotal}</Text>
                      <Text style={styles.macroLabel}>Sugar</Text>
                    </View>
                  </View>
                  <View style={styles.nutrientGrid}>
                    {[
                      ['Fiber',      fiberTotal],
                      ['Iron',       ironTotal],
                      ['Potassium',  potassiumTotal],
                      ['Vitamin A',  vitATotal],
                      ['Vitamin B6', vitB6Total],
                      ['Vitamin B12',vitB12Total],
                      ['Vitamin C',  vitCTotal],
                      ['Vitamin D',  vitDTotal],
                      ['Vitamin E',  vitETotal],
                    ].map(([label, val]) => (
                      <View key={label} style={styles.nutrientItem}>
                        <Text style={styles.macroValue}>{Math.round(Number(val) || 0)}</Text>
                        <Text style={styles.macroLabel}>{label}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}


              {viewMode === 'pie' && (
                <View style={styles.pieWrap}>
                  <PieChart
                    size={240}
                    values={pieValues}
                    colors={pieColors}
                    labels={['Calories', 'Fat', 'Carbs', 'Sugar']}
                    valueLabels={[
                      `${Math.round(totalCalories)} kcal`,
                      `${Math.round(fatTotal)} g`,
                      `${Math.round(carbsTotal)} g`,
                      `${Math.round(sugarTotal)} g`,
                    ]}
                  />
                  <Text style={styles.pieTitle}>Weight Loss</Text>
                </View>
              )}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>
              Go to Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => setHistoryVisible(true)}
          >
            <Text style={styles.historyIcon}>≡</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.plusSign}>+</Text>
          </TouchableOpacity>
        </SafeAreaView>
        </SwipeGesture>
      </LinearGradient>

        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentWrapper}>
              <ScrollView
                style={styles.modalScroll}             
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={true}
              >
                <Text style={styles.modalTitle}>Add Food</Text>


                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Food Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter food name"
                    placeholderTextColor="#fff"
                    value={foodName}
                    onChangeText={setFoodName}
                  />
                </View>

                <TouchableOpacity
                  style={styles.addValueButton}
                  onPress={addEntry}
                >
                  <Text style={styles.addValueText}>Add Value</Text>
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
                        keyboardType="numeric"
                        value={entry.value}
                        onChangeText={val =>
                          updateEntry(entry.id, 'value', val)
                        }
                      />
                    </View>
                  );
                })}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={saveManualEntry}
                  >
                    <Text style={styles.saveButtonText}>Save Food Entry</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
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
          visible={historyVisible}
          animationType="slide"
          onRequestClose={() => setHistoryVisible(false)}
        >
          <View style={styles.historyOverlay}>
            <View style={styles.historyModal}>
              <View style={styles.historyHeaderRow}>
                <Text style={styles.historyTitle}>Your Food Log</Text>
                <TouchableOpacity onPress={() => setHistoryVisible(false)}>
                  <Text style={styles.historyClose}>Close</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={styles.historyScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {Object.keys(historyByDate).length === 0 ? (
                  <Text style={styles.historyEmpty}>No entries yet.</Text>
                ) : (
                  Object.entries(historyByDate).map(([date, items]) => (
                    <View key={date} style={styles.historySection}>
                      <Text style={styles.historyDate}>{fmtDate(date)}</Text>

                      {items.map((it, idx) => (
                        <View key={`${date}-${idx}-${it.id}`} style={styles.historyCard}>
                          <Text numberOfLines={2} style={styles.cardName}>{it.name}</Text>

                          <View style={styles.cardRight}>
                            <Text style={styles.cardLine}>
                              Calories: <Text style={styles.cardValue}>{it.calories}</Text>
                            </Text>
                            <Text style={styles.cardLine}>
                              Protein: <Text style={styles.cardValue}>{it.protein}</Text>
                            </Text>
                            <Text style={styles.cardLine}>
                              Carbs : <Text style={styles.cardValue}>{it.carbs}</Text>
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
        

        <NavBar />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
    container: { 
    flex: 1, 
    width: screenWidth, 
    height: screenHeight 
  },
  gradient: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  content: { 
    justifyContent: 'center', 
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  text: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },

  addButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    //elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#32a852',
  },
  plusSign: { 
    fontSize: 30, 
    color: '#32a852', 
    fontWeight: 'bold' 
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentWrapper: {
    backgroundColor: '#1a1b1c',
    borderRadius: 20,
    width: '90%',
    maxHeight: screenHeight * 0.7,
    minHeight: 400,
  },
  modalScroll: {
    flex: 1,
    borderRadius: 20,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  modalTitle: { 
    fontSize: 18,
    color: '#fff', 
    fontWeight: '600', 
    marginBottom: 15,
    textAlign: 'center',
  },

  inputGroup: { 
    width: '100%', 
    marginBottom: 15 
  },
  inputLabel: { 
    fontSize: 16, 
    color: '#fff',
    fontWeight: 'normal', 
    marginBottom: 5 
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#rgba(255,255,255,0.08)',
  },
  
  addValueButton: {
    backgroundColor: '#rgba(255,255,255,0.08)',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 15,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#32a852',
  },
  addValueText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
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
    borderColor: '#ccc',
    borderRadius: 8,
    marginRight: 8,
    overflow: 'hidden',
  },
  picker: { 
    height: 44, 
    width: '100%' 
  },

  valueInput: {
    width: 80,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },

  modalButtons: {
    marginTop: 20,
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  saveButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#32a852',
  },
  saveButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },

  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#32a852',
  },
  closeButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    width: '100%',
  },

  progressBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#444',
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 10,
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: '#f5a623',
  },

  progressText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'normal',
  },

  loginButton: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  loginButtonText: {
    color: '#32a852',
    fontWeight: 'bold',
    fontSize: 16,
  },
    macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginVertical: 12,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'normal',
  },
  macroLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  progressGroup: {
    width: '92%',
    marginTop: 10,
  },
  progressTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'normal',
  },
  progressHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  progressTopValue:{
    color: '#fff',
    fontSize: 12,
    fontWeight: 'normal',
  },
  toggleRow: {
  flexDirection: 'row',
  gap: 10,
  marginTop: 10,
  marginBottom: 8,
  },
  toggleBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#32a852',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  toggleBtnActive: {
    backgroundColor: '#32a852',
    borderColor: '#32a852',
  },
  toggleText: {
    color: '#fff',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#fff',
  },
  historyButton: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    //elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#32a852',
  },
  historyIcon: {
    fontSize: 26,
    color: '#32a852',
    fontWeight: 'bold',
  },

  historyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  historyModal: {
    width: '100%',
    height: screenHeight * 0.7,
    backgroundColor: '#1a1b1c',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  historyClose: { fontSize: 16, fontWeight: '700', color: '#32a852' },

  historyScrollContent: { paddingBottom: 24 },
  historySection: { marginBottom: 18 },
  historyDate: { marginLeft: 6, marginBottom: 6, color: '#fff', fontWeight: '700' },
  historyEmpty: { color: '#666', textAlign: 'center', marginTop: 16 },

  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 14,
    borderWidth: 2,
    borderColor: '#32a852',
    borderRadius: 8,
    backgroundColor: 'rgba(50,168,82,0.05)',
    marginBottom: 12,
  },
  cardName: { fontSize: 18, fontWeight: '800', maxWidth: '55%', color: '#e0e0e0' },
  cardRight: { alignItems: 'flex-end' },
  cardLine: { fontSize: 16, color: '#e0e0e0', marginBottom: 6 },
  cardUnderline: { borderBottomWidth: 2, borderColor: '#111', paddingBottom: 2 },
  cardValue: { fontWeight: '700' },

  pieWrap: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pieTitle: {
    marginTop: 6,
    fontSize: 12,
    color: '#fff',
    opacity: 0.85,
    fontWeight: '600',
  },
  pieCaption: {
    fontSize: 12,
    fontWeight: 'normal',
    fontStyle: 'italic',
    color: '#fff',
    opacity: 0.85,
    textAlign: 'center',
    marginTop: 4,
    marginHorizontal: 12,
  },
  nutrientGrid: {
    width: '92%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  nutrientItem: {
    width: '30%',
    alignItems: 'center',
    marginVertical: 8,
  },

});