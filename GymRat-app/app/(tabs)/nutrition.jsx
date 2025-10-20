import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Path, Text as SvgText, TSpan } from 'react-native-svg';
import JimRatNutrition from '../../components/jimRatNutrition';
import { NutOnboardModal } from '../../components/Onboarding/onboard';
import { UserContext, useUser } from '../../UserContext';
import { cals } from '../goal';
import FoodModal from '../../components/FoodModal.jsx';

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
              <TSpan fontSize="12" fontWeight="bold" fill="#e0e0e0">
                {s.label}
              </TSpan>
              <TSpan x={s.labelX} dy={14} fontSize="11" fill="#e0e0e0">
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
  const [isNutOnboardModal, setNutOnboardModal] = useState(false);
  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const sex = String((user?.sex || user?.gender || 'male')).toLowerCase();

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
  const calciumTotal   = dailyTotals?.totalCalcium   || 0;
  const sodiumTotal    = dailyTotals?.totalSodium    || 0;


  const proteinTarget = Math.round((cals * 0.25) / 4);
  const carbsTarget   = Math.round((cals * 0.45) / 4);
  const fatTarget     = Math.round((cals * 0.30) / 9);
  const sugarTarget   = Math.round((cals * 0.10) / 4);
  const fiberTarget = Math.round(cals * 0.014);
  const ironTarget = sex === 'female' ? 18: 8;
  const potassiumTarget = 4700;
  const sodiumTarget = 2.3;
  const calciumTarget = 1000;
  const vitATarget = sex === 'female' ? 700 : 900;
  const vitB6Target = sex === 'female' ? 1.1 : 1.3;
  const vitB12Target = 2.4
  const vitCTarget = sex === 'female' ? 70 : 90;
  const vitDTarget = 70;
  const vitETarget = 15;

const clampPct = (num) => Math.max(0, Math.min(100, Math.round(num)));
const pct = (val, tgt) => (tgt > 0 ? clampPct(((Number(val) || 0) / tgt) * 100) : 0);

  const percent = totalCalories > 0 ? Math.round((totalCalories / cals) * 100) : 0;
  const proteinPercent = proteinTarget > 0 ? Math.round((proteinTotal / proteinTarget) * 100) : 0;
  const carbsPercent   = carbsTarget   > 0 ? Math.round((carbsTotal   / carbsTarget)   * 100) : 0;
  const fatPercent     = fatTarget     > 0 ? Math.round((fatTotal     / fatTarget)     * 100) : 0;

  const [selectedFood, setSelectedFood] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const moreBars = [
    { key: 'sugar', label: 'Sugar', value: sugarTotal, target: sugarTarget, unit: 'g', barColor: '#f5d833'},
    { key: 'fiber', label: 'Fiber', value: fiberTotal, target: fiberTarget, unit: 'g', barColor: '#33f5d8'},
    { key: 'iron', label: 'Iron', value: ironTotal, target: ironTarget, unit: 'mg', barColor: '#d833f5'},
    { key: 'potassium', label: 'Potassium', value: potassiumTotal, target: potassiumTarget, unit: 'mg', barColor: '#f5338c'},
    { key: 'sodium', label: 'Sodium', value: sodiumTotal, target: sodiumTarget, unit: 'g', barColor: '#33f58c'},
    { key: 'calcium', label: 'Calcium', value: calciumTotal, target: calciumTarget, unit: 'mg', barColor: '#338cf5'},
    { key: 'vitamin_A', label: 'Vitamin A', value: vitATotal, target: vitATarget, unit: 'mcg', barColor: '#f5a833'},
    { key: 'vitamin_B6', label: 'Vitamin B6', value: vitB6Total, target: vitB6Target, unit: 'mg', barColor: '#a8f533'},
    { key: 'vitamin_B12', label: 'Vitamin B12', value: vitB12Total, target: vitB12Target, unit: 'mcg', barColor: '#33f57f'},
    { key: 'vitamin_C', label: 'Vitamin C', value: vitCTotal, target: vitCTarget, unit: 'mg', barColor: '#f53333'},
    { key: 'vitamin_D', label: 'Vitamin D', value: vitDTotal, target: vitDTarget, unit: 'mcg', barColor: '#33a8f5'},
    { key: 'vitamin_E', label: 'Vitamin E', value: vitETotal, target: vitETarget, unit: 'mg', barColor: '#8c33f5'},
  ]

  const pieValues = useMemo(() => {
  const fatC = Math.max(0, (Number(fatTotal) || 0) * 9);
  const carbC = Math.max(0, (Number(carbsTotal) || 0) * 4);
  const sugC = Math.max(0, (Number(sugarTotal) || 0) * 4);
  return [fatC, carbC, sugC];
}, [fatTotal, carbsTotal, sugarTotal]);

const energyPie = useMemo(() => {
  const fatKcal = Math.max(0, (Number(fatTotal) || 0) * 9);
  const carbKcal = Math.max(0, (Number(carbsTotal) || 0) * 4);
  const sugKcal = Math.max(0, (Number(sugarTotal) || 0) * 4);
  return {
    values: [fatKcal, carbKcal, sugKcal],
    labels: ['Fat', 'Carbs', 'Sugar'],
    valueLabels: [
      `${Math.round(fatKcal)} g`,
      `${Math.round(carbKcal)} g`,
      `${Math.round(sugKcal)} g`,
    ],
    colors: ['#ff8800ff', '#c05208ff', '#f5d833ff'],
    title: 'Energy',
  };
}, [fatTotal, carbsTotal, sugarTotal]);

const mineralsPie = useMemo(() => {
  const ironMg = Math.max(0, (Number(ironTotal) || 0));
  const calciumMg = Math.max(0, (Number(calciumTotal) || 0));
  const potassiumMg = Math.max(0, (Number(potassiumTotal) || 0));
  const sodiumMg = Math.max(0, (Number(sodiumTotal) || 0) * 1000);
  return {
    values: [ironMg, calciumMg, potassiumMg, sodiumMg],
    labels: ['Iron', 'Calcium', 'Potassium', 'Sodium'],
    valueLabels: [
      `${Math.round(ironMg)} mg`,
      `${Math.round(calciumMg)} mg`,
      `${Math.round(potassiumMg)} mg`,
      `${Math.round(sodiumMg)} mg`,
    ],
    colors: ['#0088ffff', '#00c0ffff', '#00ff88ff', '#00ffc0ff'],
    title: 'Minerals',
  };
}, [ironTotal, calciumTotal, potassiumTotal, sodiumTotal]);

const vitaminsPie = useMemo(() => {
  const aMg = Math.max(0, (Number(vitATotal) || 0) / 1000);
  const b6Mg = Math.max(0, (Number(vitB6Total) || 0));
  const b12Mg = Math.max(0, (Number(vitB12Total) || 0) / 1000);
  const cMg = Math.max(0, (Number(vitCTotal) || 0));
  const dMg = Math.max(0, (Number(vitDTotal) || 0) / 1000);
  const eMg = Math.max(0, (Number(vitETotal) || 0));
  return {
    values: [aMg, b6Mg, b12Mg, cMg, dMg, eMg],
    labels: ['A', 'B6', 'B12', 'C', 'D', 'E'],
    valueLabels: [
      `${aMg.toFixed(2)} mg`,
      `${b6Mg.toFixed(2)} mg`,
      `${b12Mg.toFixed(2)} mg`,
      `${cMg.toFixed(2)} mg`,
      `${dMg.toFixed(2)} mg`,
      `${eMg.toFixed(2)} mg`,
    ],
    colors: ['#ff0088ff', '#ff00c0ff', '#ff00ffff', '#c000ffff', '#8800ffff', '#4400ffff'],
    title: 'Vitamins',
  };
}, [vitATotal, vitB6Total, vitB12Total, vitCTotal, vitDTotal, vitETotal]);

const openFoodDetail = async (foodItem, date) => {
  const uid = userId || user?.id;
  if (!uid) return;
  try {
    const rows = await db.getAllAsync(
      `SELECT * FROM historyLog WHERE user_id = ? AND date = ? AND name = ? LIMIT 1;`,
      [uid, date, foodItem.name]
    );
    if (rows && rows[0]) {
      const food = rows[0];
      const details = {
        name: food.name,
        date: date,
        calories: parseFloat(food.calories) || 0,
        protein: parseFloat(food.protein) || 0,
        sugar: parseFloat(food.sugar) || 0,
        cholesterol: parseFloat(food.cholesterol) || 0,
        total_fat: parseFloat(food.total_Fat) || 0,
        calcium: parseFloat(food.calcium) || 0,
        sodium: parseFloat(food.sodium) || 0,
        fiber: parseFloat(food.fiber) || 0,
        iron: parseFloat(food.iron) || 0,
        potassium: parseFloat(food.potassium) || 0,
        vitamin_A: parseFloat(food.vitamin_A) || 0,
        vitamin_B6: parseFloat(food.vitamin_B6) || 0,
        vitamin_B12: parseFloat(food.vitamin_B12) || 0,
        vitamin_C: parseFloat(food.vitamin_C) || 0,
        vitamin_D: parseFloat(food.vitamin_D) || 0,
        vitamin_E: parseFloat(food.vitamin_E) || 0,
      };
      setSelectedFood(details);
      setDetailModalVisible(true);
    }
  } catch (error) {
    console.error('Error fetching food details:', error);
  }
};

const formatNutrientDisplay = (key, value) => {
  const displayNames = {
    calories: 'Calories',
    protein: 'Protein',
    sugar: 'Sugar',
    cholesterol: 'Cholesterol',
    fat: 'Total Fat',
    calcium: 'Calcium',
    sodium: 'Sodium',
    fiber: 'Fiber',
    iron: 'Iron',
    potassium: 'Potassium',
    vitamin_A: 'Vitamin A',
    vitamin_B6: 'Vitamin B6',
    vitamin_B12: 'Vitamin B12',
    vitamin_C: 'Vitamin C',
    vitamin_D: 'Vitamin D',
    vitamin_E: 'Vitamin E',
  };
  const units = {
    calories: 'kcal',
    protein: 'g',
    sugar: 'g',
    cholesterol: 'mg',
    fat: 'g',
    calcium: 'mg',
    sodium: 'mg',
    fiber: 'g',
    iron: 'mg',
    potassium: 'mg',
    vitamin_A: 'mcg',
    vitamin_B6: 'mg',
    vitamin_B12: 'mcg',
    vitamin_C: 'mg',
    vitamin_D: 'mcg',
    vitamin_E: 'mg',
  };
  return {
    name: displayNames[key] || key,
    value: value.toFixed(value < 1 ? 2 : 1),
    unit: units[key] || '',
  };
};

useEffect(() => {
  const uid = userId || user?.id;
  if (!uid) return;

  const today = new Date().toISOString().split('T')[0];

  const fetchNutritionData = async () => {
    try {
      const rows = await db.getAllAsync(
        `SELECT * FROM dailyNutLog WHERE user_id = ? AND date = ?;`,
        [uid, today]
      );
      setEntries(rows);
      await loadTodaysTotals(uid);
    } catch (err) {
      console.error('Auto refresh nutrition failed:', err);
    }
  };

  // Run once immediately
  fetchNutritionData();

  // Then run every 2 seconds
  const intervalId = setInterval(fetchNutritionData, 5000);

  // Cleanup on unmount
  return () => clearInterval(intervalId);
}, [db, userId, user?.id]);


const pieColors = ['#ff8800ff', '#c05208ff', '#f5d833ff'];

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
        setNutOnboardModal(true)
      }
    } catch (error) {
      console.error('Error getting hasOnboarded:', error)
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
          SUM(CAST(vitamin_E AS REAL)) AS totalVitE,
          SUM(CAST(calcium AS REAL)) AS totalCalcium,
          SUM(CAST(sodium AS REAL)) AS totalSodium
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
        totalCalcium: totals?.totalCalcium || 0,
        totalSodium: totals?.totalSodium || 0,
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
    <View style={styles.container}>
      <LinearGradient style={styles.gradient} colors={['#32a852', '#1a1b1c']} locations={[0,0.15]}>
        <SafeAreaView style={[styles.container]}>
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
              <NutOnboardModal isVisible={isNutOnboardModal} onClose={() => setNutOnboardModal(false)}/>
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
                  Below shows comparisons for Energy, Minerals, and Vitamins
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

                  <View style={{width: '92%', marginTop: 14}}>
                    <TouchableOpacity
                      onPress={() => setShowMore(v => !v)}
                      style={styles.seeMoreBtn}
                      accessibilityRole="button"
                      accessibilityLabel="See more nutrients"
                      >
                        <Text style={styles.seeMoreText}>{showMore ? 'See less' : 'See more'}</Text>
                        <Text style={styles.seeMoreChevron}>{showMore ? '▲' : '▼'}</Text>
                      </TouchableOpacity>
                  </View>

                  {showMore && (
                    <View style={{ width: '92%', marginTop: 6}}>
                      {moreBars.map(item => {
                        const percentage = pct(item.value, item.target);
                        return (
                          <View key={item.key} style={styles.progressGroup}>
                            <View style={styles.progressHeader}>
                              <Text style={styles.progressTitle}>{item.label}</Text>
                              <Text style={styles.progressTopValue}>
                                {Math.round(Number(item.value) || 0)} / {item.target}{item.unit}
                              </Text>
                            </View>
                            <View style={styles.progressRow}>
                              <View style={styles.progressBarContainer}>
                                <View
                                  style={[
                                    styles.progressBarFill,
                                    { width: `${percentage}%`, backgroundColor: item.barColor }
                                  ]}
                                  />
                              </View>
                              <Text style={[styles.text, styles.progressText]}>{percentage}%</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                    <View style={styles.fabRow}>
                      <TouchableOpacity
                        style={styles.historyButton}
                        onPress={() => setHistoryVisible(true)}
                      >
                        <Text style={styles.historyIcon}>≡</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setFoodModalVisible(true)}
                      >
                        <Text style={styles.plusSign}>+</Text>
                      </TouchableOpacity>
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
                <>
                {/* Energy Pie Chart */}
                <View style={styles.pieWrap}>
                  <PieChart
                    size={240}
                    values={energyPie.values}
                    labels={energyPie.labels}
                    colors={energyPie.colors}
                    valueLabels={energyPie.valueLabels}
                  />
                  <Text style={styles.pieTitle}>{energyPie.title}</Text>
                </View>

                {/* Minerals Pie Chart */}
              <View style={styles.pieWrap}>
                  <PieChart
                    size={240}
                    values={mineralsPie.values}
                    labels={mineralsPie.labels}
                    colors={mineralsPie.colors}
                    valueLabels={mineralsPie.valueLabels}
                  />
                  <Text style={styles.pieTitle}>{mineralsPie.title}</Text>
                </View>

                {/* Vitamins Pie Chart */}
                <View style={styles.pieWrap}>
                  <PieChart
                    size={240}
                    values={vitaminsPie.values}
                    labels={vitaminsPie.labels}
                    colors={vitaminsPie.colors}
                    valueLabels={vitaminsPie.valueLabels}
                  />
                  <Text style={styles.pieTitle}>{vitaminsPie.title}</Text>
                </View>
                </>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>


      <FoodModal
        visible={foodModalVisible}
        onClose={() => setFoodModalVisible(false)}
      />
        {/* <Modal
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
        </Modal> */}

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
                        <TouchableOpacity
                          key={`${date}-${idx}-${it.id}`}
                          style={styles.historyCard}
                          onPress={() => openFoodDetail(it, date)}
                          activeOpacity={0.7}
                        >
                          <Text numberOfLines={2} style={styles.cardName}>{it.name}</Text>
                          <View style={styles.cardRight}>
                            <Text style={styles.cardLine}>
                              Calories: <Text style={styles.cardValue}>{it.calories}</Text>
                            </Text>
                            <Text style={styles.cardLine}>
                              Protein: <Text style={styles.cardValue}>{it.protein}g</Text>
                            </Text>
                            <Text style={styles.cardLine}>
                              Carbs: <Text style={styles.cardValue}>{it.carbs}g</Text>
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal
        transparent
        visible={detailModalVisible}
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.detailOverlay}>
          <View style={styles.detailModal}>
            <View style={styles.detailHeader}>
              <View style={styles.detailTitleSection}>
                <Text style={styles.detailTitle}>{selectedFood?.name}</Text>
                <Text style={styles.detailDate}>{fmtDate(selectedFood?.date)}</Text>
              </View>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Text style={styles.detailClose}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              contentContainerStyle={styles.detailScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {selectedFood &&(
                <>
                {/* Main Nutrients */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Main Nutrients</Text>
                  {['calories', 'protein', 'sugar', 'cholesterol', 'total_fat'].map(key => {
                    const val = selectedFood[key];
                    if (val > 0) {
                      const formatted = formatNutrientDisplay(key, val);
                      return (
                        <View key={key} style={styles.nutrientRow}>
                          <Text style={styles.nutrientName}>{formatted.name}</Text>
                          <Text style={styles.nutrientValue}>
                            {formatted.value} {formatted.unit}
                          </Text>
                        </View>
                      );
                    }
                    return null;
                  })}
                </View>

                {/* Minerals */}
                {(selectedFood.calcium > 0 || selectedFood.sodium > 0 || 
                  selectedFood.fiber > 0 || selectedFood.iron > 0 || selectedFood.potassium > 0) && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Minerals</Text>
                    {['calcium', 'sodium', 'fiber', 'iron', 'potassium'].map(key => {
                      const val = selectedFood[key];
                      if (val > 0) {
                        const formatted = formatNutrientDisplay(key, val);
                        return (
                          <View key={key} style={styles.nutrientRow}>
                            <Text style={styles.nutrientName}>{formatted.name}</Text>
                            <Text style={styles.nutrientValue}>
                              {formatted.value} {formatted.unit}
                            </Text>
                          </View>
                        );
                      }
                      return null;
                    })}
                  </View>
                )}

                {/* Vitamins */}
                {(selectedFood.vitamin_A > 0 || selectedFood.vitamin_B6 > 0 || 
                  selectedFood.vitamin_B12 > 0 || selectedFood.vitamin_C > 0 ||
                  selectedFood.vitamin_D > 0 || selectedFood.vitamin_E > 0) && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Vitamins</Text>
                    {['vitamin_A', 'vitamin_B6', 'vitamin_B12', 'vitamin_C', 'vitamin_D', 'vitamin_E'].map(key => {
                      const val = selectedFood[key];
                      if (val > 0) {
                        const formatted = formatNutrientDisplay(key, val);
                        return (
                          <View key={key} style={styles.nutrientRow}>
                            <Text style={styles.nutrientName}>{formatted.name}</Text>
                            <Text style={styles.nutrientValue}>
                              {formatted.value} {formatted.unit}
                            </Text>
                          </View>
                        );
                      }
                      return null;
                    })}
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { 
    flex: 1, 
    width: screenWidth, 
    height: screenHeight, 
  },
  gradient: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 100,
  },
  content: { 
    justifyContent: 'flex-start', 
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  text: { 
    color: '#e0e0e0', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },

  addButton: {
    //position: 'absolute',
    bottom: 10,
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
    color: '#e0e0e0', 
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
    color: '#e0e0e0',
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
    color: '#e0e0e0', 
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
    //position: 'absolute',
    bottom: 10,
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
    marginBottom: 12,
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
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModal: {
    width: '90%',
    maxHeight: screenHeight * 0.75,
    backgroundColor: '#1a1b1c',
    borderRadius: 20,
    padding: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(50,168,82,0.3)',
  },
  detailTitleSection: {
    flex: 1,
    marginRight: 10,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e0e0e0',
    marginBottom: 4,
  },
  detailDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  detailClose: {
    fontSize: 16,
    fontWeight: '700',
    color: '#32a852',
  },
  detailScrollContent: {
    paddingBottom: 10,
  },
  detailSection: {
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(50,168,82,0.2)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#32a852',
    marginBottom: 12,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  nutrientName: {
    fontSize: 14,
    color: '#e0e0e0',
    flex: 1,
  },
  nutrientValue: {
    fontSize: 14,
    color: '#e0e0e0',
    fontWeight: '600',
  },
  detailSectionTitle: {
    color: '#32a852',
  },
  seeMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#32a852',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  seeMoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  seeMoreChevron: {
    color: '#32a852',
    fontSize: 14,
    fontWeight: '700',
  },
  actionsWrap: {
    width: '92%',
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 8,
  },

primaryAction: {
  flex: 1,
  height: 48,
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#32a852',
  borderWidth: 1,
  borderColor: '#32a852',
},

secondaryAction: {
  flex: 1,
  height: 48,
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255,255,255,0.08)',
  borderWidth: 1,
  borderColor: '#32a852',
},

actionText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
},
fabInlineRow: {
  width: '92%',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginTop: 12,
  marginBottom: 4,
},

fabInline: {
  width: 60,
  height: 60,
  backgroundColor: 'rgba(255,255,255,0.08)',
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  borderWidth: 1,
  borderColor: '#32a852',
},
fabRow: {
  width: '92%',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 14,
  marginBottom: 8,
  marginTop: 20,
},
});