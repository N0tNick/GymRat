import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import exercises from '../assets/exercises.json';
import schema from '../assets/schema.json';
import ExerciseListModal from '../components/ExerciseListModal';

const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

import { doc, getFirestore, setDoc } from 'firebase/firestore';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { app } from '../firebaseConfig';
import { useUser } from '../UserContext';

export default function CreateTemplateScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [templateName, setTemplateName] = useState('New Template')
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [numOfSets, setNumOfSets] = useState({})
  var temp = ''

  const { userId, firestoreUserId } = useUser();
  const dbFirestore = getFirestore(app);

  const saveTemplateToDB = async (user_id, name, templateData) => {
    try {
      const jsonData = JSON.stringify(templateData)

      await db.runAsync(
        `INSERT OR REPLACE INTO workoutTemplates (user_id, name, data) VALUES (?, ?, ?);`,
        [user_id, name, jsonData]
      )

      console.log("Template saved!")
      router.push('/workout')

    } catch (error) {
      console.error("Error saving template: ", error)
    }
  }

  const saveTemplateToFirestore = async (userId, name, templateData) => {
    try {
      const userRef = doc(dbFirestore, `users/${userId}/workoutTemplates/${name}`);
      await setDoc(userRef, {
        name,
        data: templateData,
        createdAt: new Date().toISOString(),
      });

      console.log('Template saved to Firestore!');
      router.push('/workout');
    } catch (error) {
      console.error('Error saving to Firestore:', error);
    }
  };

  const handleSave = async () => {
    const templateData = {
      exercises: selectedExercises.map(ex => ({
        name: ex.name,
        id: ex.id,
        sets: numOfSets[ex.id] || []
      }))
    }

    if (!firestoreUserId) {
      console.error("No Firestore user ID found");
      return;
    }

    await saveTemplateToFirestore(firestoreUserId, templateName, templateData);
    // right now hardcoding user_id = 1, later replace with actual logged in user
    await saveTemplateToDB(userId, templateName, templateData);
  }

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

    let numString = '' + (index + 1)
  
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 5}}>
        <Text style={standards.regularText}>{numString.padEnd(3, ' ')}</Text>
        <Text style={[standards.regularText, {paddingLeft: 65, paddingRight: 40}]}>-</Text>
        <TextInput
        style={styles.templateInput}
        onChangeText={(val) => temp = val}
        onEndEditing={() => {setData.weight;handleWeightChange(temp)}}
        defaultValue={setData.weight}
        placeholder='-'
        keyboardType='numeric'
        placeholderTextColor={'#000'}
        />
        <TextInput
        style={styles.templateInput}
        onChangeText={(val) => temp = val}
        onEndEditing={() => {setData.reps;handleRepsChange(temp)}}
        defaultValue={setData.reps}
        placeholder='-'
        keyboardType='numeric'
        placeholderTextColor={'#000'}
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

  const renderItem = ({ item, drag}) => (
    <ScaleDecorator>
      <TouchableOpacity onLongPress={drag}>
        <Text style={standards.regularText}>{item.name}</Text>

        <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 5}}>
          <Text style={standards.regularText}>Set</Text>
          <Text style={standards.regularText}>Previous</Text>
          <Text style={standards.regularText}>lbs</Text>
          <Text style={standards.regularText}>Reps</Text>
        </View>

        {(numOfSets[item.id] || []).map((_, index) => (
          <ExerciseSetComponent key={`${String(item.id ?? 'noid')}-${index}`} index={index} itemId={item.id}/>
        ))}

        <TouchableOpacity 
        style={{backgroundColor: '#375573', padding: 10, width: '90%', alignSelf: 'center', borderRadius: 10, alignItems: 'center'}}
        onPress={() => handleAddSets(item.id)}
        >
          <Text style={standards.regularText}>Add Set</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </ScaleDecorator>
  );

  return(
      <SafeAreaProvider>
          <View style={[styles.container, {backgroundColor: '#1a1b1c'}]}
          >
            <SafeAreaView style={{ flex: 1, height: screenHeight, width: screenWidth, padding: 10, gap: 10}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <TouchableOpacity onPress={router.back}>
                  <Image style={{width: '20', height: '20'}} source={require('../assets/images/xButton.png')}/>
                </TouchableOpacity>

                <Text style={standards.headerText}>Edit Template</Text>

                <TouchableOpacity onPress={handleSave}>
                  <Image style={{width: '25', height: '25'}} source={require('../assets/images/check-mark.png')}/>
                </TouchableOpacity>
              </View>

              <TextInput
              style={[standards.headerText, {padding: 10}]}
              onChangeText={setTemplateName}
              value={templateName}
              />

              <DraggableFlatList
              data={selectedExercises}
              onDragEnd={({data}) => setSelectedExercises(data)}
              keyExtractor={(item, index) => String(item.id ?? index)}
              renderItem={renderItem}
              />

              <TouchableOpacity 
              style={styles.button}
              onPress={() => setModalVisible(true)}
              >
                <Text style={standards.regularText}>Add Exercises</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#375573',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 10,
    justifyContent: 'center',
    fontSize: 20,
  },
  whiteText: {
    color: '#fff', 
    fontSize: 20,
  },
  templateInput: {
    backgroundColor: '#e0e0e0',
    color: '#000',
    width: 50,
    paddingVertical: 5,
    borderRadius: 5,
    textAlign: 'center',
    fontSize:16,
    fontWeight:'600',
    letterSpacing:0.3
  }
});

const standards = StyleSheet.create({
  background: {
    backgroundColor: '#1a1b1c',
    width: screenWidth,
    height: screenHeight
  },
  headerText: {
    fontSize:18,
    fontWeight:'800',
    color:'#e0e0e0',
    letterSpacing:0.3
  },
  regularText: {
    fontSize:16,
    fontWeight:'600',
    color:'#e0e0e0',
    letterSpacing:0.3
  },
  smallText: {
    fontSize:16,
    fontWeight:'normal',
    color:'#e0e0e0'
  },
  regularTextBlue : {
    color: '#00eaff',
    fontSize:16,
    fontWeight:'600',
    letterSpacing:0.3
  }
})