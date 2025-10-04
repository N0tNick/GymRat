import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity, Touchable} from "react-native";
import { useRouter } from "expo-router";

// Tip definitions for daily nutrition
const tips = [
  {
    id: "no_food_today",
    weight: 100,
    getMessage: () => "No food logged today! Let's log your first meal.",
    condition: (totals, targets, hasEntries) => !hasEntries,
    action: {
      label: "Log a Food",
      route: "/barcodeScanner"
    }
  },
  {
    id: "no_workout_today",
    weight: 100,
    getMessage: () => "No workout logged today! Log one!",
    condition: (totals, targets, hasEntries, hasWorkout) => !hasWorkout,
    action: {
      label: "Go to Workouts",
      route: "/workout"  // 👈 adjust to your workout page route
    }
  },
  {
    id: "low_protein",
    weight: 90,
    getMessage: (totals, targets) =>
      `Protein is low (${totals.totalProtein}/${targets.proteinTarget}g). Add a protein-rich food`,
    condition: (totals, targets) =>
      totals.totalCalories > 0 &&
      totals.totalProtein < targets.proteinTarget * 0.5,
  },
  {
    id: "low_carbs",
    weight: 70,
    getMessage: (totals, targets) =>
      `Carbs are only ${totals.totalCarbs}/${targets.carbsTarget}g. Try adding some healthy carbs`,
    condition: (totals, targets) =>
      totals.totalCalories > 0 &&
      totals.totalCarbs < targets.carbsTarget * 0.5,
  },
  {
    id: "low_fat",
    weight: 60,
    getMessage: (totals, targets) =>
      `Fats are on the low side (${totals.totalFat}/${targets.fatTarget}g). Add some healthy fats`,
    condition: (totals, targets) =>
      totals.totalCalories > 0 &&
      totals.totalFat < targets.fatTarget * 0.5,
  },
];

function getApplicableTips(totals, targets, hasEntries, hasWorkout) {
  const validTips = tips.filter((tip) => tip.condition(totals, targets, hasEntries, hasWorkout));
  validTips.sort((a, b) => b.weight - a.weight);
  return validTips;
}

export default function JimRat({ dailyTotals, targets, hasEntries, hasWorkout }) {
  const [messages, setMessages] = useState([]);
  const [index, setIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (dailyTotals && targets) {
      const results = getApplicableTips(dailyTotals, targets, hasEntries, hasWorkout);
      setMessages(results);
      setIndex(0);
    }
  }, [dailyTotals, targets, hasEntries, hasWorkout]);

  const nextMessage = () => {
    setIndex((prev) => (prev + 1) % messages.length);
  };

  if (!messages.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Jim Rat:</Text>
        <Text style={styles.message}>Looking good! Keep logging</Text>
      </View>
    );
  }

  const currentTip = messages[index]

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Jim Rat:</Text>
      <Text style={styles.message}>
        {currentTip.getMessage(dailyTotals, targets)}
      </Text>

      {/* Render action button if tip has an action */}
      {currentTip.action && (
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push(currentTip.action.route)}>
          <Text style={styles.actionButtonText}>{currentTip.action.label}</Text>
        </TouchableOpacity>
      )}

      {/* Button to cycle through tips if multiple */}
      {messages.length > 1 && (
        <TouchableOpacity style={styles.actionButton} onPress={nextMessage}>
          <Text style={styles.actionButtonText}>Next Tip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#27282aff",
    borderRadius: 12
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#e0e0e0"
  },
  message: {
    fontSize: 16,
    marginBottom: 10,
    color: "#e0e0e0"
  },
  actionButton: {
    backgroundColor: "#888",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  actionButtonText: {
    color: "#e0e0e0",
    fontWeight: 600,
    fontSize: 16,
    alignSelf: "center"
  },
});