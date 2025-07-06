import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, TextInput, View, ScrollView, Image, Modal, Pressable } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SettingsWheel from '../components/SettingsWheel.jsx';


export default function ProfileScreen() {
  const router = useRouter();

    const [modalVisible, setModalVisible] = useState(false);
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
           <View style={styles.settingsWheelWrapper}>
            <SettingsWheel />
          </View>
          
           <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.text}>Profile Screen</Text>
            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                Alert.alert('Modal has been closed.');
                setModalVisible(!modalVisible);
              }}>
              <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalView}>
                  <Text style={modalStyles.modalText}>Change Profile Picture</Text>
                  <Pressable
                    style={[modalStyles.button, modalStyles.buttonClose]}
                    onPress={() => setModalVisible(!modalVisible)}>
                    <Text style={modalStyles.textStyle}>Hide Modal</Text>
                  </Pressable>
                </View>
              </View>

            </Modal>
             <TouchableOpacity
              style={styles.logo}
              onPress={() => setModalVisible(true)}
            >
              <Image
              style={styles.logo}
              source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/6522/6522516.png',
              }}
            />
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Height:</Text>
                <TextInput
                  style={styles.inputFieldTest}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="ft"
                  maxLength={"3"}
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
                  maxLength={"3"}
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
                  maxLength={"3"}
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
                  maxLength={"2"}
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
                  maxLength={"2"}
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

  logo: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },

});

const modalStyles = StyleSheet.create ({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 30,
    height: 650,
    width: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
})


  