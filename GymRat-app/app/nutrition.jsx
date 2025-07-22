import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../components/NavBar';
import { cals } from './goal';
import { useLocalSearchParams } from 'expo-router';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [entries, setEntries] = useState([]);
  const { openModal } = useLocalSearchParams();

  // used to open the modal from barcode scanner screen via a button
  useEffect(() => {
    if (openModal === 'true') {
      setModalVisible(true);
    }
  }, [openModal]);

  const addEntry = () => {
    setEntries(prev => [
      ...prev,
      { id: Date.now().toString(), nutrient: '', value: '' }
    ]);
  };

  const updateEntry = (id, key, val) => {
    setEntries(prev =>
      prev.map(e => e.id === id ? { ...e, [key]: val } : e)
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <LinearGradient style={styles.gradient} colors={['#32a852', '#1a1b1c']}>
          <View style={styles.content}>
            <Text style={styles.text}>Nutrition Screen</Text>
            <Text style={[styles.text, { fontSize: 20 }]}>
              Today's Calorie Goal: {cals}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.plusSign}>+</Text>
          </TouchableOpacity>
        </LinearGradient>

        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Food</Text>

              {/* Food Name */}
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

              {entries.map(entry => {

                const available = nutrientOptions.filter(opt =>
                  opt.value === entry.nutrient ||
                  !entries.some(e => e.nutrient === opt.value)
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

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>

        <NavBar />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 28, fontWeight: 'bold' },

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
  },
  plusSign: { fontSize: 30, color: '#32a852', fontWeight: 'bold' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },

  inputGroup: { width: '100%', marginBottom: 15 },
  inputLabel: { fontSize: 16, fontWeight: '600', marginBottom: 5 },
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
  },
  addValueText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

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
  picker: { height: 44, width: '100%' },

  valueInput: {
    width: 80,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },

  closeButton: {
    backgroundColor: '#32a852',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  closeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});