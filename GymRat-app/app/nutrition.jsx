import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useContext, useEffect, useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
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
];

export default function Nutrition() {
  const db = useSQLiteContext();
  const { user } = useContext(UserContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [entries, setEntries] = useState([]);
  const { openModal } = useLocalSearchParams();
  const { userId } = useUser();
  const [nutrientEntries, setNutrientEntries] = useState([]);
  const router = useRouter();
  const [dailyTotals, setDailyTotals] = useState(null)

  const totalCalories = dailyTotals?.totalCalories || 0;
  const proteinTotal = dailyTotals?.totalProtein || 0;
  const carbsTotal   = dailyTotals?.totalCarbs   || 0;
  const fatTotal     = dailyTotals?.totalFat     || 0;

  const proteinTarget = Math.round((cals * 0.25) / 4); 
  const carbsTarget   = Math.round((cals * 0.45) / 4); 
  const fatTarget     = Math.round((cals * 0.30) / 9); 

  const percent = totalCalories > 0 ? Math.round((totalCalories / cals) * 100) : 0;
  const proteinPercent = proteinTarget > 0 ? Math.round((proteinTotal / proteinTarget) * 100) : 0;
  const carbsPercent   = carbsTarget   > 0 ? Math.round((carbsTotal   / carbsTarget)   * 100) : 0;
  const fatPercent     = fatTarget     > 0 ? Math.round((fatTotal     / fatTarget)     * 100) : 0;

  const loadTodaysTotals = async (userId) => {
    const date = new Date().toISOString().split('T')[0];

    try {
      const result = await db.getAllAsync(
        `SELECT 
          SUM(CAST(calories AS REAL)) AS totalCalories,
          SUM(CAST(protein AS REAL)) AS totalProtein,
          SUM(CAST(total_Carbs AS REAL)) AS totalCarbs,
          SUM(CAST(total_Fat AS REAL)) AS totalFat
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
          '0', // fiber
          nutritionData.sugar,
          '0', // vitamin_a
          '0', // vitamin_c
          '0', // vitamin_d
          '0', // vitamin_e
          '0', // vitamin_k
          '0', // thiamin
          '0', // riboflavin
          '0', // niacin
          '0', // pantothenic_acid
          '0', // vitamin_b6
          '0', // biotin
          '0', // folate
          '0', // vitamin_b12
          '0', // iron
          nutritionData.calcium,
          '0', // potassium
        ]
      );


      setFoodName('');
      setNutrientEntries([]);
      setModalVisible(false);

      // reloads the progress bar
      loadTodaysTotals(userIdToUse);

      alert('Food entry saved successfully!');
    } catch (error) {
      console.error('Error saving manual entry:', error);
      alert('Failed to save food entry');
    }
  };
  

  return (
    <SafeAreaProvider>
        <LinearGradient style={styles.gradient} colors={['#32a852', '#1a1b1c']}>
          <SafeAreaView style={styles.container}>
             <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
      <View style={styles.content}>
        <Text style={styles.text}>Nutrition Screen</Text>
        <Text style={[styles.text, { fontSize: 20 }]}>
          Today's Calorie Goal: {cals}
        </Text>


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

        <View style={styles.macroRow}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>
              {dailyTotals?.totalProtein || 0}
            </Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>
              {dailyTotals?.totalCarbs || 0}
            </Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>
              {dailyTotals?.totalFat || 0}
            </Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>

        {/* <View style={styles.debugInfo}>
          <Text style={styles.debugText}>Debug - Daily Totals:</Text>
          <Text style={styles.debugText}>State: {dailyTotals ? 'Loaded' : 'Not loaded'}</Text>
          <Text style={styles.debugText}>UserID: {userId || user?.id || 'No user ID'}</Text>
          <Text style={styles.debugText}>Calories: {dailyTotals?.totalCalories || 0}</Text>
          <Text style={styles.debugText}>Protein: {dailyTotals?.totalProtein || 0}g</Text>
          <Text style={styles.debugText}>Carbs: {dailyTotals?.totalCarbs || 0}g</Text>
          <Text style={styles.debugText}>Fat: {dailyTotals?.totalFat || 0}g</Text>
        </View> */}
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
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.plusSign}>+</Text>
          </TouchableOpacity>
          </SafeAreaView>
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
    fontSize: 28, 
    fontWeight: 'bold' 
  },

  addButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    backgroundColor: '#fff',
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
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 15,
    textAlign: 'center',
  },

  inputGroup: { 
    width: '100%', 
    marginBottom: 15 
  },
  inputLabel: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 5 
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
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
    fontWeight: 'bold' 
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
    fontWeight: 'bold',
  },
  
  // debugInfo: {
  //   marginTop: 20,
  //   padding: 10,
  //   backgroundColor: 'rgba(255,255,255,0.9)',
  //   borderRadius: 8,
  //   borderWidth: 2,
  //   borderColor: '#fff',
  //   width: '90%',
  // },
  // debugText: {
  //   color: '#000',
  //   fontSize: 14,
  //   fontWeight: 'bold',
  //   marginBottom: 2,
  // },
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
    fontSize: 24,
    fontWeight: 'bold',
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
    fontWeight: '600',
  },
  progressHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItens: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  progressTopValue:{
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  }
});