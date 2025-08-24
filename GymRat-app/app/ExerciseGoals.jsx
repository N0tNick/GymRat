import { View, StyleSheet, TouchableOpacity, Modal, FlatList, TextInput, ScrollView, Dimensions } from 'react-native';
import { Text } from '@ui-kitten/components';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import exercises from '../assets/exercises.json';

const { width: screenWidth } = Dimensions.get('window');

export default function ExerciseGoals() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredExercises, setFilteredExercises] = useState(exercises);
  const [exerciseInfoModal, setExerciseInfoModal] = useState(false);
  const [exerciseItem, setExerciseItem] = useState('');

  useEffect(() => {
    const filtered = exercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredExercises(filtered);
  }, [searchText]);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        setExerciseItem(item);
        setExerciseInfoModal(true);
      }}
    >
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.subtitle}>Equipment: {item.equipment}</Text>
      <Text style={styles.subtitle}>Primary Muscle: {item.primaryMuscles}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaProvider>
      <LinearGradient colors={['#6a5acd', '#1a1b1c']} style={styles.container}>
        <SafeAreaView style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text category='h3' style={styles.title}>Exercise Goals</Text>
          </View>

          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.searchButtonText}>Search Exercises</Text>
          </TouchableOpacity>

          <Modal
            visible={modalVisible}
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>

                <Text style={styles.modalTitle}>Exercises</Text>
                <TextInput
                  style={styles.searchBar}
                  onChangeText={setSearchText}
                  value={searchText}
                  placeholder='Search'
                />

                <FlatList
                  data={filteredExercises}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                />
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: 'white',
    marginTop: 20,
    textAlign:'center'
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  backButton: {
    position: 'absolute',
    left:0,
    top:20,
    padding: 7,
    borderWidth: 3,
    borderRadius:10,
    borderColor:'#6a5acd',
    backgroundColor:'#2a2a2aff'
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: '#2a2a2aff',
    padding: 10,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#6a5acd',
    marginTop: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    height: '85%',
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
  },
  closeButton: {
    backgroundColor: '#999',
    width: 25,
    alignItems: 'center',
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalTitle: {
    color: '#000',
    fontSize: 40,
    fontWeight: 'bold',
  },
  searchBar: {
    backgroundColor: '#999',
    height: 35,
    borderRadius: 10,
    padding: 10,
    fontWeight: 'bold',
    fontSize: 15,
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  }
});