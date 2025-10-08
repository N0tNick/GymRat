import { LinearGradient } from 'expo-linear-gradient';
import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, TextInput, View, ScrollView, Image, Modal, Pressable, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../components/NavBar'
import SettingsWheel from '../components/Profile/SettingsWheel'
import TopTab from '../components/Profile/ProfileTopTab'
import standards from '../components/ui/appStandards'
import { ProfileOnboardModal } from '../components/Onboarding/onboard';
import { useSQLiteContext } from 'expo-sqlite';

const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

export default function ProfileScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [isProfileOnboardModal, setProfileOnboardModal] = useState(false);
  const db = useSQLiteContext();
  
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
        setProfileOnboardModal(true)
      }
    } catch (error) {
      console.error('Error getting hasOnboarded:', error)
    }
  }

  return (
     <SafeAreaProvider style={{flex:1}}>
          <View style={{flex:1}} contentContainerStyle={{flexGrow:1}}>
            <LinearGradient style={styles.gradient} colors={['#6a5acd', '#1a1b1c']} locations={[0,0.15,1]}>
            <ProfileOnboardModal isVisible={isProfileOnboardModal} onClose={() => setProfileOnboardModal(false)}/>
            <View style={settingsStyles.settingsWheelWrapper}>
              <SettingsWheel/>
            </View>
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
              style={{ height:10, position:'absolute', marginRight:100}}
              onPress={() => setModalVisible(true)}
            >
              <Image
              style={styles.logo}
              source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/6522/6522516.png',
              }}
            />
            </TouchableOpacity>
            <View style={{
              width: screenWidth,
              marginTop: 150,
            }}>
              <TopTab/> 
            </View>
          </LinearGradient>
          </View>
      <NavBar/>
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
  gradient: { 
    flex:1,
    backgroundColor:'#1a1b1c',
    alignItems:'center'
  },
  text: {
    color: '#e0e0e0',
    fontSize: 28,
    fontWeight: '',
  },

  inputFieldTest: {
    height: 30,
    borderColor: 'black',
    borderWidth: 2,
  },

  logo: {
    width: '100%',
    height: '100%',
  },
}); 

const modalStyles = StyleSheet.create ({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
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
    color: '#e0e0e0e',
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
  settingsWheelWrapper: { position: 'absolute', top: screenHeight*0.05, right: 20 },
  text: { color: '#e0e0e0', fontSize: 28, fontWeight: 'bold' },
});
