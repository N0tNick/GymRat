import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Linking } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useUser } from "../UserContext";
import axios from "axios";
import { encode as btoa } from "base-64";

// ---------------- FatSecret API Config ----------------
const FATSECRET_CONFIG = {
  clientId: "2bb8564827ba480ca37359d401027be6",
  clientSecret: "d1ab7c9c3a1646bb9885fb37aef349be",
  tokenUrl: "https://oauth.fatsecret.com/connect/token",
  apiUrl: "https://platform.fatsecret.com/rest/server.api",
};

// grab an oauth access token from fatsecret
const getAccessToken = async () => {
  const authString = `${FATSECRET_CONFIG.clientId}:${FATSECRET_CONFIG.clientSecret}`;
  const encodedAuth = btoa(authString);

  const response = await axios.post(
    FATSECRET_CONFIG.tokenUrl,
    new URLSearchParams({ grant_type: "client_credentials" }).toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded", "Authorization": `Basic ${encodedAuth}` } }
  );
  return response.data.access_token;
};

// search fatsecret by name using the foods.search
// search fatsecret by name using the foods.search
const searchFatSecretByName = async (query) => {
  const accessToken = await getAccessToken();
  try {
    const response = await axios.post(
      FATSECRET_CONFIG.apiUrl,
      new URLSearchParams({
        method: "foods.search",
        search_expression: query,
        region: "US",
        format: "json",
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const foods = response.data.foods?.food;
    if (!foods || foods.length === 0) throw new Error("No results found");
    return Array.isArray(foods) ? foods : [foods];
  } catch (err) {
    console.error("Manual search failed:", err.response?.data || err.message);
    throw err;
  }
};

// grab the nutrition info for a given food
const getFoodDetails = async (foodId) => {
  try {
    const response = await axios.post(
      FATSECRET_CONFIG.apiUrl,
      new URLSearchParams({
        method: "food.get",
        food_id: foodId,
        format: "json",
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      }
    );

    console.log("Food details response:", JSON.stringify(response.data, null, 2));
    if (!response.data.food) throw new Error("No food data in response");
    return response.data.food;
  } catch (err) {
    console.error("Error getting food details:", err.response?.data || err.message);
    throw err;
  }
};

// ---------------- Nutrition Builder ----------------
const buildNutritionData = (serving, customEntries = []) => {
  // base template
  const template = {
    calories: "0",
    protein: "0",
    cholesterol: "0",
    sodium: "0",
    total_Fat: "0",
    saturated_Fat: "0",
    trans_Fat: "0",
    polyunsaturated_Fat: "0",
    monosaturated_Fat: "0",
    total_Carbs: "0",
    fiber: "0",
    sugar: "0",
    vitamin_A: "0",
    vitamin_C: "0",
    vitamin_D: "0",
    vitamin_E: "0",
    vitamin_K: "0",
    vitamin_B1: "0",
    vitamin_B2: "0",
    vitamin_B3: "0",
    vitamin_B5: "0",
    vitamin_B6: "0",
    vitamin_B7: "0",
    vitamin_B9: "0",
    vitamin_B12: "0",
    iron: "0",
    calcium: "0",
    potassium: "0",
  };

  // merge from FatSecret serving if available
  const fromServing = serving
    ? {
        calories: serving.calories || "0",
        protein: serving.protein || "0",
        cholesterol: serving.cholesterol || "0",
        sodium: serving.sodium || "0",
        total_Fat: serving.fat || "0",
        saturated_Fat: serving.saturated_fat || "0",
        trans_Fat: serving.trans_fat || "0",
        polyunsaturated_Fat: serving.polyunsaturated_fat || "0",
        monosaturated_Fat: serving.monounsaturated_fat || "0",
        total_Carbs: serving.carbohydrate || "0",
        fiber: serving.fiber || "0",
        sugar: serving.sugar || "0",
        calcium: serving.calcium || "0",
        potassium: serving.potassium || "0",
      }
    : {};

  // merge from custom entries (overrides everything else)
  const fromCustom = {};
  customEntries.forEach((entry) => {
    if (entry.nutrient) {
      const key = entry.nutrient === "fat" ? "total_Fat" : entry.nutrient;
      fromCustom[key] = entry.value;
    }
  });

  return { ...template, ...fromServing, ...fromCustom };
};

export default function FoodModal({ visible, onClose }) {
  const db = useSQLiteContext();
  const { userId } = useUser();

  const [isCustomFood, setIsCustomFood] = useState(false);
  const [manualQuery, setManualQuery] = useState("");
  const [manualResults, setManualResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [foodName, setFoodName] = useState("");
  const [nutrientEntries, setNutrientEntries] = useState([]);

  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedNutrition, setSelectedNutrition] = useState(null);

  // ---------------- Search Food ----------------
  const handleSearch = async () => {
    if (!manualQuery.trim()) {
        setManualResults([]); // clear if nothing typed
        return;
    }
    try {
      setLoading(true);
      setError(null);
      const results = await searchFatSecretByName(manualQuery);
      setManualResults(results || []);
    } catch (err) {
      console.error("Manual search error:", err);
      setError("Manual search failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFood = async (foodId, foodName) => {
    try {
      setLoading(true);
      const food = await getFoodDetails(foodId);

      const serving = Array.isArray(food.servings.serving)
        ? food.servings.serving[0]
        : food.servings.serving;

      const date = new Date().toISOString().split("T")[0];
      const nutritionData = buildNutritionData(serving);

      // save into dailyNutLog
      await db.runAsync(
        `INSERT INTO dailyNutLog (
          user_id, date, name,
          calories, protein, cholesterol, sodium,
          total_Fat, saturated_Fat, trans_Fat, polyunsaturated_Fat, monosaturated_Fat,
          total_Carbs, fiber, sugar,
          vitamin_A, vitamin_C, vitamin_D, vitamin_E, vitamin_K,
          vitamin_B1, vitamin_B2, vitamin_B3, vitamin_B5, vitamin_B6, vitamin_B7, vitamin_B9, vitamin_B12,
          iron, calcium, potassium
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          userId, date, foodName,
          nutritionData.calories, nutritionData.protein, nutritionData.cholesterol, nutritionData.sodium,
          nutritionData.total_Fat, nutritionData.saturated_Fat, nutritionData.trans_Fat, nutritionData.polyunsaturated_Fat, nutritionData.monosaturated_Fat,
          nutritionData.total_Carbs, nutritionData.fiber, nutritionData.sugar,
          nutritionData.vitamin_A, nutritionData.vitamin_C, nutritionData.vitamin_D, nutritionData.vitamin_E, nutritionData.vitamin_K,
          nutritionData.vitamin_B1, nutritionData.vitamin_B2, nutritionData.vitamin_B3, nutritionData.vitamin_B5, nutritionData.vitamin_B6, nutritionData.vitamin_B7, nutritionData.vitamin_B9, nutritionData.vitamin_B12,
          nutritionData.iron, nutritionData.calcium, nutritionData.potassium
        ]
      );

      // save into historyLog
      await db.runAsync(
        `INSERT INTO historyLog (
          user_id, date, name,
          calories, protein, cholesterol, sodium,
          total_Fat, saturated_Fat, trans_Fat, polyunsaturated_Fat, monosaturated_Fat,
          total_Carbs, fiber, sugar,
          vitamin_A, vitamin_C, vitamin_D, vitamin_E, vitamin_K,
          vitamin_B1, vitamin_B2, vitamin_B3, vitamin_B5, vitamin_B6, vitamin_B7, vitamin_B9, vitamin_B12,
          iron, calcium, potassium
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          userId, date, foodName,
          nutritionData.calories, nutritionData.protein, nutritionData.cholesterol, nutritionData.sodium,
          nutritionData.total_Fat, nutritionData.saturated_Fat, nutritionData.trans_Fat, nutritionData.polyunsaturated_Fat, nutritionData.monosaturated_Fat,
          nutritionData.total_Carbs, nutritionData.fiber, nutritionData.sugar,
          nutritionData.vitamin_A, nutritionData.vitamin_C, nutritionData.vitamin_D, nutritionData.vitamin_E, nutritionData.vitamin_K,
          nutritionData.vitamin_B1, nutritionData.vitamin_B2, nutritionData.vitamin_B3, nutritionData.vitamin_B5, nutritionData.vitamin_B6, nutritionData.vitamin_B7, nutritionData.vitamin_B9, nutritionData.vitamin_B12,
          nutritionData.iron, nutritionData.calcium, nutritionData.potassium
        ]
      );

      setManualQuery("");
      setManualResults([]);
      onClose();
      alert("Food added from search!");
    } catch (e) {
      console.error("Failed to load food details", e);
      setError("Failed to load food details.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Custom Food ----------------
  const addEntry = () => {
    setNutrientEntries((prev) => [
      ...prev,
      { id: Date.now().toString(), nutrient: "", value: "" },
    ]);
  };

  const updateEntry = (id, key, val) => {
    setNutrientEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [key]: val } : e))
    );
  };

  const saveManualEntry = async () => {
    if (!userId || !foodName.trim()) {
      alert("Please enter a food name");
      return;
    }

    const validEntries = nutrientEntries.filter(
      (entry) => entry.nutrient && entry.value
    );
    if (validEntries.length === 0) {
      alert("Please add at least one nutrient value");
      return;
    }

    const date = new Date().toISOString().split("T")[0];
    const nutritionData = buildNutritionData(null, validEntries);

    try {
      await db.runAsync(
        `INSERT INTO dailyNutLog (
          user_id, date, name,
          calories, protein, cholesterol, sodium,
          total_Fat, saturated_Fat, trans_Fat, polyunsaturated_Fat, monosaturated_Fat,
          total_Carbs, fiber, sugar,
          vitamin_A, vitamin_C, vitamin_D, vitamin_E, vitamin_K,
          vitamin_B1, vitamin_B2, vitamin_B3, vitamin_B5, vitamin_B6, vitamin_B7, vitamin_B9, vitamin_B12,
          iron, calcium, potassium
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          userId, date, foodName,
          nutritionData.calories, nutritionData.protein, nutritionData.cholesterol, nutritionData.sodium,
          nutritionData.total_Fat, nutritionData.saturated_Fat, nutritionData.trans_Fat, nutritionData.polyunsaturated_Fat, nutritionData.monosaturated_Fat,
          nutritionData.total_Carbs, nutritionData.fiber, nutritionData.sugar,
          nutritionData.vitamin_A, nutritionData.vitamin_C, nutritionData.vitamin_D, nutritionData.vitamin_E, nutritionData.vitamin_K,
          nutritionData.vitamin_B1, nutritionData.vitamin_B2, nutritionData.vitamin_B3, nutritionData.vitamin_B5, nutritionData.vitamin_B6, nutritionData.vitamin_B7, nutritionData.vitamin_B9, nutritionData.vitamin_B12,
          nutritionData.iron, nutritionData.calcium, nutritionData.potassium
        ]
      );

      await db.runAsync(
        `INSERT INTO historyLog (
          user_id, date, name,
          calories, protein, cholesterol, sodium,
          total_Fat, saturated_Fat, trans_Fat, polyunsaturated_Fat, monosaturated_Fat,
          total_Carbs, fiber, sugar,
          vitamin_A, vitamin_C, vitamin_D, vitamin_E, vitamin_K,
          vitamin_B1, vitamin_B2, vitamin_B3, vitamin_B5, vitamin_B6, vitamin_B7, vitamin_B9, vitamin_B12,
          iron, calcium, potassium
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          userId, date, foodName,
          nutritionData.calories, nutritionData.protein, nutritionData.cholesterol, nutritionData.sodium,
          nutritionData.total_Fat, nutritionData.saturated_Fat, nutritionData.trans_Fat, nutritionData.polyunsaturated_Fat, nutritionData.monosaturated_Fat,
          nutritionData.total_Carbs, nutritionData.fiber, nutritionData.sugar,
          nutritionData.vitamin_A, nutritionData.vitamin_C, nutritionData.vitamin_D, nutritionData.vitamin_E, nutritionData.vitamin_K,
          nutritionData.vitamin_B1, nutritionData.vitamin_B2, nutritionData.vitamin_B3, nutritionData.vitamin_B5, nutritionData.vitamin_B6, nutritionData.vitamin_B7, nutritionData.vitamin_B9, nutritionData.vitamin_B12,
          nutritionData.iron, nutritionData.calcium, nutritionData.potassium
        ]
      );

      setFoodName("");
      setNutrientEntries([]);
      setIsCustomFood(false);
      onClose();
      alert("Custom food saved!");
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save food entry");
    }
  };

  // ---------------- Render ----------------
   return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>

        {/* Header with close + toggle */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleBtnSmall}
            onPress={() => setIsCustomFood((prev) => !prev)}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              {isCustomFood ? "Search Food" : "Custom Food"}
            </Text>
          </TouchableOpacity>
        </View>

        {!isCustomFood ? (
          // ---------- SEARCH MODE ----------
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Search Food</Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Enter food name"
              placeholderTextColor="#888"
              value={manualQuery}
              onChangeText={setManualQuery}
            />

            <TouchableOpacity style={styles.rescanButton} onPress={handleSearch}>
              <Text style={styles.rescanButtonText}>Search</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => Linking.openURL("https://www.fatsecret.com")}>
              <Text style={{ color: "#888", fontSize: 12 }}>Powered by FatSecret</Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="small" color="#32a852" style={{ marginTop: 10 }} />}
            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Scrollable results */}
            {manualResults.length > 0 && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsHeader}>Select a result:</Text>
                    <ScrollView style={{ maxHeight: 200 }} contentContainerStyle={{ paddingBottom: 10}} showsHorizontalScrollIndicator={true}>
                        {manualResults.map((item) => (
                            <TouchableOpacity
                                key={item.food_id}
                                onPress={async () => {
                                    setLoading(true);
                                    try {
                                        const food = await getFoodDetails(item.food_id);
                                        const serving = Array.isArray(food.servings.serving)
                                            ? food.servings.serving[0]
                                            : food.servings.serving;
                                    
                                        setSelectedFood({ id: item.food_id, name: item.food_name });
                                        setSelectedNutrition(buildNutritionData(serving));
                                    } catch (err) {
                                        console.error("Preview error:", err);
                                        setError("Failed to preview nutrition.");
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                style={[
                                    styles.resultItem,
                                    selectedFood?.id === item.food_id && { backgroundColor: "#2a2a2a" }
                                ]}
                            >
                                <Text style={{ fontSize: 16, color: "#e0e0e0" }}>{item.food_name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
            {selectedNutrition && (
                <View style={styles.previewBox}>
                    <Text style={styles.previewTitle}>Preview Nutrition</Text>
                    <Text style={styles.previewItem}>Calories: {selectedNutrition.calories}</Text>
                    <Text style={styles.previewItem}>Protein: {selectedNutrition.protein} g</Text>
                    <Text style={styles.previewItem}>Carbs: {selectedNutrition.total_Carbs} g</Text>
                    <Text style={styles.previewItem}>Fat: {selectedNutrition.total_Fat} g</Text>
                    <Text style={styles.previewItem}>Sugar: {selectedNutrition.sugar} g</Text>
                    <Text style={styles.previewItem}>Sodium: {selectedNutrition.sodium} mg</Text>

                    <TouchableOpacity
                        style={styles.logBtn}
                        onPress={() =>
                            handleSelectFood(selectedFood.id, selectedFood.name)
                        }
                    >
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>Log It</Text>
                    </TouchableOpacity>
                </View>
                )}
            </View>
        ) : (
          // ---------- CUSTOM FOOD MODE ----------
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Food</Text>

            <TextInput
              placeholder="Enter food name"
              placeholderTextColor="#888"
              value={foodName}
              onChangeText={setFoodName}
              style={styles.searchInput}
            />

            <TouchableOpacity style={styles.rescanButton} onPress={addEntry}>
              <Text style={{ color: "#e0e0e0", fontSize: 16, fontWeight: 600 }}>Add Nutrient</Text>
            </TouchableOpacity>

            {nutrientEntries.map((entry) => (
              <View key={entry.id} style={{ flexDirection: "row", marginBottom: 10 }}>
                <Picker
                  selectedValue={entry.nutrient}
                  style={[styles.input, { color: "#e0e0e0" }]}
                  dropdownIconColor="#e0e0e0"
                  onValueChange={(val) => updateEntry(entry.id, "nutrient", val)}
                >
                  <Picker.Item label="Select nutrient" value="" color="#888" />
                  <Picker.Item label="Calories" value="calories" />
                  <Picker.Item label="Protein" value="protein" />
                  <Picker.Item label="Fat" value="fat" />
                  <Picker.Item label="Carbs" value="total_Carbs" />
                  <Picker.Item label="Sugar" value="sugar" />
                  <Picker.Item label="Cholesterol" value="cholesterol" />
                  <Picker.Item label="Sodium" value="sodium" />
                  <Picker.Item label="Calcium" value="calcium" />
                </Picker>
                <TextInput
                  placeholder="Value"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={entry.value}
                  onChangeText={(val) => updateEntry(entry.id, "value", val)}
                  style={styles.input}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.rescanButton} onPress={saveManualEntry}>
              <Text style={{ color: "#e0e0e0", fontWeight: 600, fontSize: 16 }}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: "#1a1b1c",
        padding: 20,
    },
    modalContent: {
        flex: 1,
    },
    closeButton: { 
        alignSelf: "flex-left",
        marginBottom: 10,
    },
    closeButtonText: { 
        color: "#e0e0e0", 
        fontSize: 18,
    },
    modalTitle: { 
        fontSize: 18,
        fontWeight: "bold", 
        color: "#e0e0e0", 
        marginBottom: 20,
    },
    searchInput: { 
        borderWidth: 1, 
        borderColor: "#e0e0e0", 
        borderRadius: 8, 
        padding: 10, 
        marginBottom: 15, 
        color: "#fff",
    },
    rescanButton: { 
        backgroundColor: "#32a852", 
        padding: 10, 
        borderRadius: 6, 
        alignItems: "center", 
        marginBottom: 15,
    },
    rescanButtonText: { 
        color: "#e0e0e0", 
        fontWeight: 600,
    },
    errorText: { 
        color: "red", 
        marginTop: 10,
    },
    resultItem: { 
        paddingVertical: 10, 
        borderBottomColor: "#444", 
        borderBottomWidth: 1,
    },
    addBtn: { 
        backgroundColor: "#32a852", 
        padding: 10, 
        borderRadius: 6, 
        marginBottom: 10, 
        alignItems: "center",
    },
    saveBtn: { 
        backgroundColor: "#32a852", 
        padding: 10, 
        borderRadius: 6, 
        marginTop: 10, 
        alignItems: "center",
    },
    toggleBtn: { 
        backgroundColor: "#32a852", 
        padding: 15, 
        borderRadius: 8, 
        marginTop: 20, 
        alignItems: "center",
    },
    input: { 
        flex: 1, 
        borderWidth: 1, 
        borderColor: "#e0e0e0", 
        borderRadius: 8, 
        padding: 8, 
        marginRight: 5, 
        color: "#e0e0e0",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    toggleBtnSmall: {
        backgroundColor: "#32a852",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    previewBox: {
        backgroundColor: "#2a2a2a",
        padding: 12,
        borderRadius: 8,
        marginTop: 15,
    },
    previewTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#e0e0e0",
        marginBottom: 8,
    },
    previewItem: {
        fontSize: 14,
        color: "#e0e0e0",
        marginBottom: 4,
    },
    logBtn: {
        backgroundColor: "#32a852",
        padding: 10,
        borderRadius: 6,
        alignItems: "center",
        marginTop: 10,
    },
    resultsContainer: {
        width: "100%",
        marginTop: 15,
        backgroundColor: "#2a2b2d",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#888",
        maxHeight: 250,
    },
    resultsHeader: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#e0e0e0",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#888",
    },
});
