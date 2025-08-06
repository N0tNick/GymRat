import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { StyleSheet, Text, TouchableOpacity, View, Button, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../components/NavBar';
import { auth } from '../firebaseConfig';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { encode as btoa } from 'base-64';
import { Linking } from 'react-native';

import { useSQLiteContext } from 'expo-sqlite';
import { useUser } from '../UserContext';

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
  const [manualQuery, setManualQuery] = useState('');
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [manualResults, setManualResults] = useState([]);
  // logging test modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [dailyTotals, setDailyTotals] = useState(null);

  const { userId } = useUser();
  const db = useSQLiteContext();

  const currentDate = new Date();
  const day = currentDate.getDate();

  const loadTodaysTotals = async (userId) => {
    const date = new Date().toISOString().split('T')[0];

    try {
      const result = await db.getAllAsync(
        `SELECT 
          SUM(CAST(calories AS REAL)) AS totalCalories,
          SUM(CAST(protein AS REAL)) AS totalProtein,
          SUM(CAST(total_Carbs AS REAL)) AS totalCarbs,
          SUM(CAST(total_Fat AS REAL)) AS totalFat,
          date AS day
        FROM dailyNutLog
        WHERE user_id = ? AND date = ?`,
        [userId, date]
      );

      setDailyTotals(result[0]);
      setShowLogModal(true);
    } catch (error) {
      console.error('Error loading totals:', error);
    }
  };

  const insertIntoDailyLog = async (userId, productInfo) => {
    const serving = Array.isArray(productInfo.servings.serving)
      ? productInfo.servings.serving[0]
      : productInfo.servings.serving;

    const day = new Date().toISOString().split('T')[0];

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
      return true;
    } catch (err) {
      console.error('Insert error:', err);
      throw err;
    }
  };

  // set scanner state to initial
  useEffect(() => {
    setScanned(false);
    setProductInfo(null);
    setError(null);
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

  // sign out button MOVE TO PROFILE SCREEN
  const handleSignOut = () => {
    signOut(auth)
      .then(() => router.replace('/login'))
      .catch(console.error);
  };

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

  // search fatsecret by name using the foods.search
  const searchFatSecretByName = async (query) => {
    const accessToken = await getAccessToken();

    try {
      // post request to api to search food by name
      const response = await axios.post(
        FATSECRET_CONFIG.apiUrl,
        new URLSearchParams({
          method: 'foods.search',
          search_expression: query,
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

      const foods = response.data.foods?.food;
      if (!foods || foods.length === 0) throw new Error('No results found');

      // normalize the results to an array
      const results = Array.isArray(foods) ? foods : [foods];
      setManualResults(results); // save results for showing list
    } catch (err) {
      console.error('Manual search failed:', err.response?.data || err.message);
      throw err;
    }
  };  

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
        <LinearGradient colors={['#FFFFFF', '#808080']} style={styles.container}>
          <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.overlay}>
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
            </CameraView>

            <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity styles={styles.logoutButton} onPress={() => Linking.openURL("https://www.fatsecret.com")}>
              {/*<!-- Begin fatsecret Platform API HTML Attribution Snippet -->*/}
              <Text href="https://www.fatsecret.com">Powered by fatsecret</Text>
              {/*<!-- End fatsecret Platform API HTML Attribution Snippet -->*/}
            </TouchableOpacity>
            
            
          </View>
          </SafeAreaView>
        </LinearGradient>
        <NavBar />


        {/* NUTRITION MODAL WHEN SCAN WORKS : shows the nutrition info */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showNutritionModal}
          onRequestClose={() => setShowNutritionModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowNutritionModal(false)}>
                <Text style={styles.closeButtonText}>X</Text>
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
                      <View style={styles.nutritionList}>
                        <Text style={styles.foodName}>{productInfo.food_name}</Text>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionLabel}>Calories:</Text>
                          <Text style={styles.nutritionValue}>{serving?.calories ?? 'N/A'}</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionLabel}>Protein:</Text>
                          <Text style={styles.nutritionValue}>{serving?.protein ?? 'N/A'}g</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionLabel}>Carbs:</Text>
                          <Text style={styles.nutritionValue}>{serving?.carbohydrate ?? 'N/A'}g</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionLabel}>Fat:</Text>
                          <Text style={styles.nutritionValue}>{serving?.fat ?? 'N/A'}g</Text>
                        </View>
                      </View>

                      <TouchableOpacity style={styles.rescanButton} onPress={resetScanner}>
                        <Text style={styles.rescanButtonText}>Scan Another Item</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.rescanButton} onPress={async () => {
                        try {
                          await insertIntoDailyLog(userId, productInfo);
                          await loadTodaysTotals(userId);
                        } catch (e) {
                          console.error('Error:', e);
                        }
                      }}>
                        <Text style={styles.rescanButton}>Log This Food</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => Linking.openURL("https://www.fatsecret.com")}>
                        {/*<!-- Begin fatsecret Platform API HTML Attribution Snippet -->*/}
                        <Text href="https://www.fatsecret.com">Powered by fatsecret</Text>
                        {/*<!-- End fatsecret Platform API HTML Attribution Snippet -->*/}
                      </TouchableOpacity>
                    </>
                  );
                })()
              ) : (
                <>
                  {/* if no nutrition info shows option to manually search */}
                  <Text style={styles.errorText}>{error || 'No product information available'}</Text>
                  <TouchableOpacity
                    style={styles.rescanButton}
                    onPress={() => {
                      setManualModalVisible(true);
                      setShowNutritionModal(false);
                    }}
                  >
                    <Text style={styles.rescanButtonText}>Search Manually</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rescanButton}
                    onPress={() => {
                      router.replace('/nutrition?openModal=true');
                    }}
                  >
                    <Text style={styles.rescanButtonText}>Manual Entry</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.rescanButton, { backgroundColor: '#888' }]} onPress={resetScanner}>
                    <Text style={styles.rescanButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* MANUAL SEARCH MODAL: search the name of food through api */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={manualModalVisible}
          onRequestClose={() => setManualModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setManualModalVisible(false)}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Manual Food Search</Text>

              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 8,
                  width: '100%',
                  padding: 10,
                  marginBottom: 10,
                }}
                placeholder="Enter food name"
                value={manualQuery}
                onChangeText={setManualQuery}
              />

              <TouchableOpacity
                style={styles.rescanButton}
                onPress={async () => {
                  try {
                    setLoading(true);
                    setError(null);
                    await searchFatSecretByName(manualQuery);
                  } catch (err) {
                    setError('Manual search failed.');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <Text style={styles.rescanButtonText}>Search</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => Linking.openURL("https://www.fatsecret.com")}>
                {/*<!-- Begin fatsecret Platform API HTML Attribution Snippet -->*/}
                <Text href="https://www.fatsecret.com">Powered by fatsecret</Text>
                {/*<!-- End fatsecret Platform API HTML Attribution Snippet -->*/}
              </TouchableOpacity>
              {loading && <ActivityIndicator size="small" color="#0000ff" style={{ marginTop: 10 }} />}
              
              {error && <Text style={styles.errorText}>{error}</Text>}
              
              {manualResults.length > 0 && (
                <View style={{ width: '100%', marginTop: 15 }}>
                  <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Select a result:</Text>
                  {manualResults.map((item) => (
                    <TouchableOpacity
                      key={item.food_id}
                      onPress={async () => {
                        try {
                          setLoading(true);
                          const food = await getFoodDetails(item.food_id, await getAccessToken());
                          setProductInfo(food);
                          setManualModalVisible(false); 
                          setShowNutritionModal(true); // show nutrition modal with new details
                          setManualResults([]); // clear search
                          setManualQuery(''); // clear field
                        } catch (e) {
                          setError('Failed to load food details');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      style={{
                        paddingVertical: 10,
                        borderBottomColor: '#ccc',
                        borderBottomWidth: 1,
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>{item.food_name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </Modal>


        {/* TODAYS TOTALS MODAL */}
        <Modal
          visible={showLogModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowLogModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                onPress={() => setShowLogModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Today's Totals</Text>
              {dailyTotals ? (
                <>
                  <Text>Calories: {dailyTotals.totalCalories}</Text>
                  <Text>Protein: {dailyTotals.totalProtein}g</Text>
                  <Text>Carbs: {dailyTotals.totalCarbs}g</Text>
                  <Text>Fat: {dailyTotals.totalFat}g</Text>
                  <Text>{dailyTotals.day}</Text>
                </>
              ) : (
                <Text>Loading totals...</Text>
              )}
            </View>
          </View>
        </Modal>
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
    color: 'white', 
    fontSize: 16, 
    marginTop: 20, 
    textAlign: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    padding: 8, 
    borderRadius: 5 
  },
  logoutButton: { 
    position: 'absolute', 
    bottom: 30, 
    backgroundColor: '#a83232', 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  logoutButtonText: { 
    color: '#fff', 
    fontSize: 18 
  },
  message: { 
    fontSize: 18, 
    textAlign: 'center', 
    marginBottom: 20 
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)' 
  },
  modalContent: { 
    width: '80%', 
    backgroundColor: 'white', 
    borderRadius: 15, 
    padding: 20, 
    alignItems: 'center', 
    elevation: 5 },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    color: '#333' },
  closeButton: { 
    position: 'absolute', 
    right: 15, 
    top: 15, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 15, 
    width: 30, 
    height: 30, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  closeButtonText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333' },
  foodName: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    textAlign: 'center', 
    color: '#444' },
  nutritionList: { 
    width: '100%', 
    marginBottom: 20 
  },
  nutritionItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  nutritionLabel: { 
    fontSize: 16, 
    color: '#666' 
  },
  nutritionValue: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  errorText: { 
    fontSize: 16, 
    color: 'red', 
    textAlign: 'center',
    marginVertical: 15 
  },
  rescanButton: { 
    marginTop: 10, 
    backgroundColor: '#4CAF50', 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  rescanButtonText: { 
    color: '#fff', 
    fontSize: 16 
  }
});
