import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SwipeGesture } from "react-native-swipe-gesture-handler";
import NavBar from '../components/NavBar';
import TopTab from '../components/Profile/ProfileTopTab';
import SettingsWheel from '../components/Profile/SettingsWheel';
import standards from '../components/ui/appStandards';

const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

export default function ProfileScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();


  const onSwipePerformed = (action) => {
    switch(action){
      case 'left':{
        console.log('left Swipe performed');
        break;
      }
        case 'right':{ 
        console.log('right Swipe performed');
        router.push('/nutrition')
        break;
      }
        case 'up':{ 
        console.log('up Swipe performed'); 
        break;
      }
        case 'down':{ 
        console.log('down Swipe performed'); 
        break;
      }
        default : {
        console.log('Undeteceted action');
        }
    }
  }
  
  return (
     <SafeAreaProvider>
          <ScrollView style={standards.background}>
            <SwipeGesture onSwipePerformed={onSwipePerformed}>
            <SafeAreaView style={{ flex: 1, height: screenHeight, width: screenWidth, alignItems:'center' }}>
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
              style={{width:50, height:50, position:'relative', marginRight:300}}
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
              marginTop: 20,
            }}>
              <TopTab/> 
            </View>
          </SafeAreaView>
          </SwipeGesture>
          </ScrollView>
        <NavBar />
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
    color: 'e0e0e0e',
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
  settingsWheelWrapper: { position: 'absolute', top: 65, right: 20 },
  text: { color: '#e0e0e0', fontSize: 28, fontWeight: 'bold' },
});
