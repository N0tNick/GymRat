import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import exercises from '../assets/exercises.json';
import NavBar from '../components/NavBar';

export default function WorkoutScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.subtitle}>Level: {item.level}</Text>
      <Text style={styles.subtitle}>Category: {item.category}</Text>
    </View>
  );

  const [modalVisible, setModalVisible] = useState(false);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={['#8B0000', '#1a1b1c']}
          style={styles.container}
        >
          <Modal
          visible={modalVisible}
          transparent={true}
          
          onRequestClose={() => {
            setModalVisible(!modalVisible)
          }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <TouchableOpacity style={{backgroundColor: '#808080', width: 25, alignItems: 'center', borderRadius: 5}} onPress={() => setModalVisible(false)}>
                  <Text style={styles.xButton}>X</Text>
                </TouchableOpacity>

                <Text style={{color: '#000', fontSize: 40, fontWeight: 'bold'}}>Exercises</Text>

                <FlatList
                  data={exercises}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                />

              </View>
            </View>
          </Modal>

          <TouchableOpacity onPress ={() => setModalVisible(true)}><Text>Exercises</Text></TouchableOpacity>
          <Text style={styles.text}>Workout Screen</Text>
        </LinearGradient>
        <NavBar />
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
  modalView: {
    height: '85%',
    width: '85%',
    backgroundColor: '#fff',
    overflow: 'scroll',
    borderRadius: 15,
    padding: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xButton: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
