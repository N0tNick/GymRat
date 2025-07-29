import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, TextInput, View, ScrollView, Image, Modal, Pressable, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../../components/NavBar';
import SettingsWheel from '../../components/Profile/SettingsWheel';

const { height: screenHeight } = Dimensions.get('window');

export default function ProfileScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  

  return (
     <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, height: screenHeight }}>
        <LinearGradient colors={['#6a5acd', '#1a1b1c']} style={styles.container}>

          <View style={settingsStyles.settingsWheelWrapper}>
            <SettingsWheel/>
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
          </ScrollView>
        </LinearGradient>
        <NavBar />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    height: screenHeight,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
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
    height: '80%',
    width: '90%',
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
});

const settingsStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  settingsWheelWrapper: { position: 'absolute', top: 20, right: 20 },
  scrollContainer: { padding: 20, paddingTop: 80 },
  text: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
});
