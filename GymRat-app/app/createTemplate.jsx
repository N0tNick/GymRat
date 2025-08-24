import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import exercises from '../assets/exercises.json';
import schema from '../assets/schema.json';
import ExerciseListModal from '../components/ExerciseListModal';

const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');
const router = useRouter();

export const data = []

export default function CreateTemplateScreen() {
  const db = useSQLiteContext();
  const [templateName, setTemplateName] = useState('New Template')
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [numOfSets, setNumOfSets] = useState({})

  /*const saveTemplateToDB = async () => {
    try{
      await db.execAsync("INSERT INTO workoutTemplates (name) VALUES (?);", [
        templateName
      ])
      router.back()
    } catch (error) {
      console.error(error)
      console.log('error saving template')
    }
  }*/

  const ExerciseSetComponent = ({ index, itemId }) => {
    const setData = numOfSets[itemId][index];

    const handleWeightChange = (text) => {
      setNumOfSets((prev) => {
        const sets = [...prev[itemId]];
        sets[index] = { ...sets[index], weight: text };
        return { ...prev, [itemId]: sets };
      });
    };

    const handleRepsChange = (text) => {
      setNumOfSets((prev) => {
        const sets = [...prev[itemId]];
        sets[index] = { ...sets[index], reps: text };
        return { ...prev, [itemId]: sets };
      });
    };
  
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10}}>
        <Text style={styles.whiteText}>{index + 1}</Text>
        <Text style={styles.whiteText}>-</Text>
        <TextInput
        style={styles.whiteText}
        onChangeText={handleWeightChange}
        value={setData.weight}
        placeholder='-'
        keyboardType='numeric'
        />
        <TextInput
        style={styles.whiteText}
        onChangeText={handleRepsChange}
        value={setData.reps}
        placeholder='-'
        keyboardType='numeric'
        />
      </View>
    )}

  const handleAddSets = (itemId) => {
    setNumOfSets((prev) => {
      const current = prev[itemId] || [];
      return {
        ...prev,
        [itemId]: [...current, { weight: '', reps: '' }],
      };
    });
  };

  const renderItem = ({ item }) => (
    <View>
      <Text style={[styles.whiteText, {paddingVertical: 10}]}>{item.name}</Text>

      <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10}}>
        <Text style={styles.whiteText}>Set</Text>
        <Text style={styles.whiteText}>Previous</Text>
        <Text style={styles.whiteText}>lbs</Text>
        <Text style={styles.whiteText}>Reps</Text>
      </View>

      {(numOfSets[item.id] || []).map((_, index) => (
        <ExerciseSetComponent key={index} index={index} itemId={item.id}/>
      ))}

      <TouchableOpacity 
      style={{backgroundColor: '#1478db', padding: 10, width: '90%', alignSelf: 'center', borderRadius: 10, alignItems: 'center'}}
      onPress={() => handleAddSets(item.id)}
      >
        <Text style={{color: '#fff', fontWeight: 'bold'}}>Add Set</Text>
      </TouchableOpacity>
    </View>
  );

  return(
      <SafeAreaProvider>
          <View style={[styles.container, {backgroundColor: '#1a1b1c'}]}
          >
            <SafeAreaView style={{ flex: 1, height: screenHeight, width: screenWidth, padding: 10}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <TouchableOpacity style={{backgroundColor: '#1478db', paddingHorizontal: 10, justifyContent: 'center', borderRadius: 5}}
                onPress={router.back}><Text style={[styles.xButton, {color: '#fff'}]}>X</Text></TouchableOpacity>

                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 20}}>New Template</Text>

                <TouchableOpacity style={{backgroundColor: '#1478db', paddingHorizontal: 10, justifyContent: 'center', borderRadius: 5}}
                onPress={saveTemplateToDB}>
                  <Text style={[styles.xButton, {color: '#fff'}]}>Save</Text>
                </TouchableOpacity>
              </View>

              <TextInput
              style={{color: '#fff', fontSize: 30, fontWeight: 'bold', padding: 20}}
              onChangeText={setTemplateName}
              value={templateName}
              />

              <FlatList
              data={selectedExercises}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              />

              <TouchableOpacity 
              style={{backgroundColor: '#1478db', padding: 10, width: '90%', alignSelf: 'center', borderRadius: 10, alignItems: 'center'}}
              onPress={() => setModalVisible(true)}
              >
                <Text style={{color: '#fff', fontWeight: 'bold'}}>Add Exercises</Text>
              </TouchableOpacity>

              <ExerciseListModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                exercises={exercises}
                schema={schema}
                selectedExercises={selectedExercises}
                onSelect={setSelectedExercises}
              />

            </SafeAreaView>
            
          </View>
      </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    color: '#fff',
    fontSize: 40,
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
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  xButton: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  searchBar: {
    backgroundColor: '#999',
    height: 35,
    borderRadius: 10,
    padding: 10,
    fontWeight: 'bold',
    fontSize: 15,
  },
  filterButton: {
    backgroundColor: '#999',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    fontSize: 20
  },
  filterView: {
    flex: 1,
    backgroundColor: '#999',
    borderRadius: 10,
    justifyContent: 'center',
    maxHeight: '75%'
  },
  filterButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#1478db',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    fontSize: 20,
  },
  whiteText: {
    color: '#fff', 
    fontSize: 20,
  }
});