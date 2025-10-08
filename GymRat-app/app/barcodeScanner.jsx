import axios from 'axios';
import { encode as btoa } from 'base-64';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Linking, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../components/NavBar';
import { auth } from '../firebaseConfig';
import { Picker } from '@react-native-picker/picker';
import { useSQLiteContext } from 'expo-sqlite';
import { useUser } from '../UserContext';
import FoodModal from '../components/FoodModal';
import { color } from '@rneui/base';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';

import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";
const dbFirestore = getFirestore(app);

// configuration needed for fatsecret api 
const FATSECRET_CONFIG = {
  clientId: '2bb8564827ba480ca37359d401027be6',
  clientSecret: 'd1ab7c9c3a1646bb9885fb37aef349be',
  tokenUrl: 'https://oauth.fatsecret.com/connect/token',
  apiUrl: 'https://platform.fatsecret.com/rest/server.api'
};

// function to fetch OAuth access token from fatsecret 
const getAccessToken = async () => {
  // need to combine id and secret and encode base64 
  const authString = `${FATSECRET_CONFIG.clientId}:${FATSECRET_CONFIG.clientSecret}`;
  const encodedAuth = btoa(authString);


  try {
    // make a post request to tokenUrl with a grant type of client credentials
    const response = await axios.post(
      FATSECRET_CONFIG.tokenUrl,
      new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'premier barcode' // SET TO BARCODE AFTER APPROVED HOPEFULLY
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${encodedAuth}`,
        },
      }
    );

    // return the access token string for API calls
    return response.data.access_token;
  } catch (err) {
    console.error('Token fetch error:', err.response?.data || err.message);
    throw new Error('Could not fetch access token');
  }
};

export default function BarcodeScannerScreen() {
  const router = useRouter();
  // camera permission state to get camera working
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productInfo, setProductInfo] = useState(null);
  const [error, setError] = useState(null);
  const [type] = useState('back');
  // nutrition modal
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  // manual food search modal
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [manualResults, setManualResults] = useState([]);
  // selecting serving and setting quantity
  const [selectedServingIndex, setSelectedServingIndex] = useState(0);
  const [quantity, setQuantity] = useState("1");

  const { userId, firestoreUserId } = useUser();
  const db = useSQLiteContext();

  const currentDate = new Date();
  const day = currentDate.getDate();
  const todayLocal = () => new Date().toLocaleDateString('en-CA'); // "YYYY-MM-DD"

  // helper to get servings
  const getServingsArray = () => {
    const s = productInfo?.servings?.serving;
    if (!s) return [];

    const arr = Array.isArray(s) ? s : [s];

    // Check if any serving is already per gram
    const hasPerGram = arr.some(
      (srv) =>
        srv.metric_serving_unit?.toLowerCase() === "g" &&
        parseFloat(srv.metric_serving_amount) === 1
    );

    if (!hasPerGram) {
      const first = arr[0];
      if (first.metric_serving_unit?.toLowerCase() === "g") {
        const grams = parseFloat(first.metric_serving_amount);
        if (grams > 1) {
          const perGram = {
            serving_description: "1 g",
            metric_serving_amount: "1",
            metric_serving_unit: "g",
            calories: (parseFloat(first.calories) / grams).toFixed(2),
            protein: (parseFloat(first.protein) / grams).toFixed(2),
            carbohydrate: (parseFloat(first.carbohydrate) / grams).toFixed(2),
            fat: (parseFloat(first.fat) / grams).toFixed(2),
          };
          arr.push(perGram);
        }
      }
    }

    return arr;
  };

  const servingsArray = getServingsArray();

  // calculate scaled nutrition
  const getScaledNutrition = () => {
    if (!servingsArray.length) return null;
    const serving = servingsArray[selectedServingIndex];
    const q = parseFloat(quantity) || 1;

    return {
      calories: (parseFloat(serving.calories) || 0) * q,
      protein: (parseFloat(serving.protein) || 0) * q,
      carbs: (parseFloat(serving.carbohydrate) || 0) * q,
      fat: (parseFloat(serving.fat) || 0) * q,
    };
  };

  const scaled = getScaledNutrition();

  //const loadTodaysTotals = async (userId) => {
  //  const date = new Date().toISOString().split('T')[0];
//
  //  try {
  //    const result = await db.getAllAsync(
  //      `SELECT 
  //        SUM(CAST(calories AS REAL)) AS totalCalories,
  //        SUM(CAST(protein AS REAL)) AS totalProtein,
  //        SUM(CAST(total_Carbs AS REAL)) AS totalCarbs,
  //        SUM(CAST(total_Fat AS REAL)) AS totalFat,
  //        date AS day
  //      FROM dailyNutLog
  //      WHERE user_id = ? AND date = ?`,
  //      [userId, date]
  //    );
//
  //    setDailyTotals(result[0]);
  //    setShowLogModal(true);
  //  } catch (error) {
  //    console.error('Error loading totals:', error);
  //  }
  //};

  const insertIntoDailyLog = async (userId, productInfo) => {
    const serving = Array.isArray(productInfo.servings.serving)
      ? productInfo.servings.serving[0]
      : productInfo.servings.serving;

    const day = todayLocal();

    try {
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
            userId,
            day,
            productInfo.food_name || '',
            serving.calories || '0',
            serving.protein || '0',
            serving.cholesterol || '0',
            serving.sodium || '0',
            serving.fat || '0',
            serving.saturated_fat || '0',
            serving.trans_fat || '0',
            serving.polyunsaturated_fat || '0',
            serving.monounsaturated_fat || '0',
            serving.carbohydrate || '0',
            serving.fiber || '0',
            serving.sugar || '0',
            serving.vitamin_a || '0',
            serving.vitamin_c || '0',
            serving.vitamin_d || '0',
            serving.vitamin_e || '0',
            serving.vitamin_k || '0',
            serving.thiamin || '0',
            serving.riboflavin || '0',
            serving.niacin || '0',
            serving.pantothenic_acid || '0',
            serving.vitamin_b6 || '0',
            serving.biotin || '0',
            serving.folate || '0',
            serving.vitamin_b12 || '0',
            serving.iron || '0',
            serving.calcium || '0',
            serving.potassium || '0',
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        day,
        productInfo.food_name || '',
        serving.calories || '0',
        serving.protein || '0',
        serving.cholesterol || '0',
        serving.sodium || '0',
        serving.fat || '0',
        serving.saturated_fat || '0',
        serving.trans_fat || '0',
        serving.polyunsaturated_fat || '0',
        serving.monounsaturated_fat || '0',
        serving.carbohydrate || '0',
        serving.fiber || '0',
        serving.sugar || '0',
        serving.vitamin_a || '0',
        serving.vitamin_c || '0',
        serving.vitamin_d || '0',
        serving.vitamin_e || '0',
        serving.vitamin_k || '0',
        serving.thiamin || '0',
        serving.riboflavin || '0',
        serving.niacin || '0',
        serving.pantothenic_acid || '0',
        serving.vitamin_b6 || '0',
        serving.biotin || '0',
        serving.folate || '0',
        serving.vitamin_b12 || '0',
        serving.iron || '0',
        serving.calcium || '0',
        serving.potassium || '0',
      ]
    );
      return true;
    } catch (err) {
      console.error('Insert error:', err);
      throw err;
    }
  };

  const insertHistoryLogToFirestore = async (userId, foodName, nutritionData) => {
    try {
      const historyRef = collection(dbFirestore, `users/${userId}/historyLog`);
      await addDoc(historyRef, {
        name: foodName,
        date: new Date().toISOString().split("T")[0],
        nutrition: nutritionData,
        timestamp: new Date().toISOString(),
      });
      console.log("History log added to Firestore");
    } catch (error) {
      console.error("Error adding Firestore history log:", error);
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

  // set scanner state to initial
  useEffect(() => {
    setScanned(false);
    setProductInfo(null);
    setError(null);
  }, []);

  useEffect(() => {
  (async () => {
    try {
      await ensureHistoryTable();
    } catch (e) {
      console.warn('ensureHistoryTable failed:', e);
    }
  })();
  }, []);


  // if unknown permission render view empty
  if (!permission) return <View />;

  // if no permission then ask for permission
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // handles barcode scanner from expo-camera
  const handleBarCodeScanned = async (scanningResult) => {
    console.log('--- NEW SCAN ---');
    console.log('Raw barcode:', scanningResult.data, 'Type:', scanningResult.type, 'Length:', scanningResult.data.length);

    setScanned(true);

    setTimeout(async () => {
      let processedBarcode = scanningResult.data;
      let searchAttempts = [];

      if (scanningResult.type === 'upc_a' && scanningResult.data.length === 12) {
        processedBarcode = '0' + scanningResult.data;
        console.log('Converted to EAN-13:', processedBarcode);
        searchAttempts.push(processedBarcode);
      }

      searchAttempts.push(scanningResult.data);

      setLoading(true);
      setError(null);

      for (const barcode of searchAttempts) {
        try {
          console.log('Attempting search for barcode:', barcode);
          const foodItem = await searchFatSecretByBarcode(barcode);
          setProductInfo(foodItem);
          setShowNutritionModal(true);
          setLoading(false);
          return;
        } catch (err) {
          console.log(`Barcode ${barcode} error:`, err);
        }
      }

      setError('Product not found');
      setShowNutritionModal(true);
      setLoading(false);
    }, 500);
  };

  // search fatsecret using food.find_id_for_barcode
  const searchFatSecretByBarcode = async (barcode) => {
    console.log('Starting barcode search...');
    const accessToken = await getAccessToken();

    try {
      // post request to fatsecret to get food id's mathing the barcode
      const response = await axios.post(
        FATSECRET_CONFIG.apiUrl,
        new URLSearchParams({
          method: 'food.find_id_for_barcode',
          barcode: barcode,
          region: 'US',
          format: 'json'
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

    console.log('FatSecret raw response:', JSON.stringify(response.data, null, 2));
    
    // take first matching food id and get nutrition info
    const foodId = response.data?.food_id?.value;
    if (!foodId) throw new Error('No food ID found in barcode response');

    return await getFoodDetails(foodId, accessToken);
  } catch (err) {
    console.error('FatSecret API call failed:', err.response?.data || err.message);
    throw err;
  }
};

  //// search fatsecret by name using the foods.search
  //const searchFatSecretByName = async (query) => {
  //  const accessToken = await getAccessToken();
  //
  //  try {
  //    // post request to api to search food by name
  //    const response = await axios.post(
  //      FATSECRET_CONFIG.apiUrl,
  //      new URLSearchParams({
  //        method: 'foods.search',
  //        search_expression: query,
  //        region: 'US',
  //        format: 'json'
  //      }).toString(),
  //      {
  //        headers: {
  //          'Content-Type': 'application/x-www-form-urlencoded',
  //          'Authorization': `Bearer ${accessToken}`,
  //        },
  //      }
  //    );
    //
  //    const foods = response.data.foods?.food;
  //    if (!foods || foods.length === 0) throw new Error('No results found');
    //
  //    // normalize the results to an array
  //    const results = Array.isArray(foods) ? foods : [foods];
  //    setManualResults(results); // save results for showing list
  //  } catch (err) {
  //    console.error('Manual search failed:', err.response?.data || err.message);
  //    throw err;
  //  }
  //};  

  // grab the nutrition info for a given food
  const getFoodDetails = async (foodId, accessToken) => {
    try {
      const response = await axios.post(
        FATSECRET_CONFIG.apiUrl,
        new URLSearchParams({
          method: 'food.get',
          food_id: foodId,
          format: 'json'
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      console.log('Food details response:', JSON.stringify(response.data, null, 2));

      if (!response.data.food) {
        throw new Error('No food data in response');
      }

      return response.data.food;
    } catch (err) {
      console.error('Error getting food details:', err.response?.data || err.message);
      throw err;
    }
  };

  // resets scanner
  const resetScanner = () => {
    setScanned(false);
    setProductInfo(null);
    setError(null);
    setShowNutritionModal(false);
  };

  return (
    <SafeAreaProvider>
        <LinearGradient colors={['#1a1b1c', '#1a1b1c']} style={styles.container}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.overlay}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.replace("/")} style={{ padding: 5 }}>
                <Text style={{fontSize: 18,fontWeight: "bold", color: "#e0e0e0"}}>X</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#e0e0e0" }}>Scan a barcode</Text>
            </View>
            <CameraView
              style={styles.camera}
              facing={type}
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code39', 'code128'],
              }}
              // only scan if not already scanned to prevent dupes
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            >
              <View style={styles.scanFrame} />
              <Text style={styles.scanText}>Align barcode within the frame</Text>  

              <TouchableOpacity color="#e0e0e0" onPress={() => Linking.openURL("https://www.fatsecret.com")}>
              {/*<!-- Begin fatsecret Platform API HTML Attribution Snippet -->*/}
              <Text style={styles.linkText} href="https://www.fatsecret.com">Powered by fatsecret</Text>
              {/*<!-- End fatsecret Platform API HTML Attribution Snippet -->*/}
            </TouchableOpacity>
            </CameraView>
          </View>
          </SafeAreaView>
        </LinearGradient>
        <NavBar />


        {/* NUTRITION MODAL WHEN SCAN WORKS : shows the nutrition info */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={showNutritionModal}
          onRequestClose={() => setShowNutritionModal(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={{ alignSelf: 'flex-start', marginBottom: 10 }}
                onPress={() => { setShowNutritionModal(false); resetScanner() }} // close modal
              >
                <Text style={{ color: '#e0e0e0', fontSize: 18, fontWeight: "bold" }}>X</Text>
              </TouchableOpacity>

              {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : productInfo ? (
                // if product exists then show
                (() => {
                  const serving = (() => {
                    const s = productInfo?.servings?.serving;
                    if (!s) return null;
                    if (Array.isArray(s)) return s[0];
                    return s;
                  })();
                
                  return (
                    <>
                      <Text style={styles.modalTitle}>Nutrition Information</Text>
                      <Text style={styles.foodName}>{productInfo.brand_name}: {productInfo.food_name}</Text>

                      {/* Dropdown for serving options */}
                      <View style={{ width: "100%", marginBottom: 10 , color: "#e0e0e0"}}>
                        <Text style={{ marginBottom: 5, color: "#e0e0e0" }}>Select Serving:</Text>
                        <View style={{ borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 8, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                          <Picker
                            selectedValue={selectedServingIndex}
                            onValueChange={(val) => setSelectedServingIndex(val)}
                            style={{ flex: 1, color: "#e0e0e0" }} // picker text color
                            dropdownIconColor="#888"
                          >
                            {servingsArray.map((s, idx) => (
                              <Picker.Item
                                key={idx}
                                label={`${s.serving_description || "Serving"} (${s.metric_serving_amount || ""} ${s.metric_serving_unit || ""})`}
                                value={idx}
                              />
                            ))}
                          </Picker>
                        </View>
                      </View>

                      {/* Quantity input */}
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15, color: "#e0e0e0" }}>
                        <Text style={{ marginRight: 10, color: "#e0e0e0", }}>Quantity:</Text>
                        <TextInput
                          style={{
                            borderWidth: 1,
                            borderColor: "#e0e0e0",
                            borderRadius: 8,
                            padding: 8,
                            width: 80,
                            textAlign: "center",
                            color: "#e0e0e0"
                          }}
                          keyboardType="numeric"
                          value={quantity}
                          onChangeText={setQuantity}
                        />
                      </View>

                      {/* Nutrition List */}
                      <View style={styles.nutritionList}>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionLabel}>Calories:</Text>
                          <Text style={styles.nutritionValue}>{scaled?.calories.toFixed(0)}</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionLabel}>Protein:</Text>
                          <Text style={styles.nutritionValue}>{scaled?.protein.toFixed(1)} g</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionLabel}>Carbs:</Text>
                          <Text style={styles.nutritionValue}>{scaled?.carbs.toFixed(1)} g</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionLabel}>Fat:</Text>
                          <Text style={styles.nutritionValue}>{scaled?.fat.toFixed(1)} g</Text>
                        </View>
                      </View>

                      <TouchableOpacity style={styles.rescanButton} onPress={async () => {
                        try {
                          const serving = servingsArray[selectedServingIndex];
                          const scaledServing = {
                            ...serving,
                            calories: scaled.calories,
                            protein: scaled.protein,
                            carbohydrate: scaled.carbs,
                            fat: scaled.fat,
                          }

                          const nutritionData = scaledServing;
                          await insertIntoDailyLog(userId, {...productInfo, servings: { serving: scaledServing } });
                          if (firestoreUserId) {
                            await insertHistoryLogToFirestore(firestoreUserId, productInfo.food_name, nutritionData);
                          } else {
                            console.warn("No Firestore user ID found; skipping cloud sync");
                          }
                          alert("Food logged!"); 
                        } catch (e) {
                          console.error('Error:', e);
                        }
                      }}>
                        <Text style={styles.rescanButtonText}>Log This Food</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.rescanButton} onPress={resetScanner}>
                        <Text style={styles.rescanButtonText}>Scan Another Item</Text>
                      </TouchableOpacity>

                      <TouchableOpacity color="#e0e0e0" onPress={() => Linking.openURL("https://www.fatsecret.com")}>
                        {/*<!-- Begin fatsecret Platform API HTML Attribution Snippet -->*/}
                        <Text color="#e0e0e0" href="https://www.fatsecret.com">Powered by fatsecret</Text>
                        {/*<!-- End fatsecret Platform API HTML Attribution Snippet -->*/}
                      </TouchableOpacity>
                    </>
                  );
                })()
              ) : (
                <>
                  {/* if no nutrition info shows option to manually search */}
                  <Text style={styles.errorText}>No product information available</Text>
                  <TouchableOpacity
                    style={styles.rescanButton}
                    onPress={() => {
                      setShowNutritionModal(false);
                      setManualModalVisible("search"); // open FoodModal in search mode
                    }}
                  >
                    <Text style={styles.rescanButtonText}>Search Manually</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.rescanButton}
                    onPress={() => {
                      setShowNutritionModal(false);
                      setManualModalVisible("manual"); // open FoodModal in manual-entry mode
                    }}
                  >
                    <Text style={styles.rescanButtonText}>Manual Entry</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* MANUAL SEARCH MODAL: search the name of food through api */}
        <FoodModal
          visible={!!manualModalVisible}
          mode={manualModalVisible} // "search" or "manual"
          onClose={() => { setManualModalVisible(false); resetScanner() }}
        />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1 
  },
  camera: { 
    flex: 1, 
    width: '100%', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  overlay: {
    flex: 1, 
    backgroundColor: 'transparent', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  scanFrame: { 
    width: 250, 
    height: 150, 
    borderWidth: 2, 
    borderColor: 'white', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 10 
  },
  scanText: { 
    color: '#e0e0e0', 
    fontSize: 16,
    fontWeight: 600,
    marginTop: 20, 
    textAlign: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    padding: 8, 
    borderRadius: 5 
  },
  linkText: { 
    color: '#888', 
    fontSize: 12,
    paddingTop: 6
  },
  message: { 
    fontSize: 16,
    fontWeight: 600, 
    textAlign: 'center', 
    marginBottom: 20 
  },
  modalContainer: { 
    flex: 1, 
    backgroundColor: "#1a1b1c",
  },
  modalContent: { 
    flex: 1,
    width: '100%', 
    backgroundColor: '#1a1b1c', 
    padding: 20, 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    color: '#e0e0e0' 
  },
  closeButton: { 
    position: 'absolute', 
    right: 15, 
    top: 15, 
    backgroundColor: '#e0e0e0', 
    borderRadius: 25, 
    width: 30, 
    height: 30, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  closeButtonText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#e0e0e0' 
  },
  foodName: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    textAlign: 'center', 
    color: '#e0e0e0' 
  },
  nutritionList: { 
    width: '100%', 
    marginBottom: 20 
  },
  nutritionItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: '#e0e0e0' 
  },
  nutritionLabel: { 
    fontSize: 16, 
    color: '#e0e0e0',
    fontWeight: 600
  },
  nutritionValue: { 
    fontSize: 16, 
    fontWeight: 600, 
    color: '#e0e0e0' 
  },
  errorText: { 
    fontSize: 16, 
    fontWeight: 600,
    color: 'red', 
    textAlign: 'center',
    marginVertical: 15 
  },
  rescanButton: { 
    marginTop: 10, 
    backgroundColor: 'rgba(255,255,255,0.08)', 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  rescanButtonText: { 
    color: '#e0e0e0', 
    fontSize: 16,
    fontWeight: 600
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#1a1b1c",
    position: "absolute",
    top: 0,
    zIndex: 10,
  },
});
