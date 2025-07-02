import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, TextInput, View, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  
  // State for input fields
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [bmi, setBmi] = useState('');
  const [bodyFat, setBodyFat] = useState('');  

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>        
        <LinearGradient
          colors={['#6a5acd', '#1a1b1c']}
          style={styles.container}
        >
           <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.text}>Profile Screen</Text>
            
            <View style={styles.inputContainer}>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Height:</Text>
                <TextInput
                  style={styles.inputFieldTest}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="cm"
                  placeholderTextColor="white"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Weight:</Text>
                <TextInput
                  style={styles.inputFieldTest}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="lbs"
                  placeholderTextColor="white"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Age:</Text>
                <TextInput
                  style={styles.inputFieldTest}
                  value={age}
                  onChangeText={setAge}
                  placeholder="years"
                  placeholderTextColor="white"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>BMI:</Text>
                <TextInput
                  style={styles.inputFieldTest}
                  value={bmi}
                  onChangeText={setBmi}
                  placeholder="kg/m²"
                  placeholderTextColor="white"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Body Fat:</Text>
                <TextInput
                  style={styles.inputFieldTest}
                  value={bodyFat}
                  onChangeText={setBodyFat}
                  placeholder="%"
                  placeholderTextColor="white"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => router.replace('/')}
            >
              <Text style={styles.homeButtonText}>Enter home</Text>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  homeButton: {
    marginTop: 20,
    backgroundColor: '#232f30',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 18,
  },

  inputFieldTest: {
    height: 30,
    borderColor: 'black',
    borderWidth: 2,
  },

});


