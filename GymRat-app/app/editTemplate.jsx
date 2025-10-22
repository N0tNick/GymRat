import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { SafeAreaView } from 'react-native-safe-area-context';
import exercises from '../assets/exercises.json';
import schema from '../assets/schema.json';
import ExerciseListModal from '../components/ExerciseListModal';
import { app } from '../firebaseConfig';
import { useUser } from '../UserContext';
import { usePersistedWorkout } from './ongoingWorkout';

const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');


export default function EditTemplateScreen() {
  const db = useSQLiteContext();
  const { firestoreUserId } = useUser();
  const dbFirestore = getFirestore(app);
  const router = useRouter();
  const [selectedExercises, setSelectedExercises] = useState([])
  // Track user-updated values for each set
  const [updatedExercises, setUpdatedExercises] = useState([])
  // Read the persisted selected template using the hook
  const [selectedTemplate] = usePersistedWorkout('selectedTemplate', null);
  const [template, setTemplate] = useState(null)
  const [templateName, setTemplateName] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    if (!selectedTemplate) return; // wait until it's loaded

    const parsedTemplate = {
      ...selectedTemplate,
      data: JSON.parse(selectedTemplate.data)
    };
    setTemplate(parsedTemplate);

    //console.log("template to edit: ", selectedTemplate); // even though this log doesnt show that the entire object is an object IT IS
  }, [selectedTemplate]);

  useEffect(() => {
    if (!template) return; // wait until template is ready

    setSelectedExercises(template.data.exercises)
    setUpdatedExercises(template.data.exercises)

    const fetchTemplates = async () => {
      try {
        const rows = await db.getAllAsync(
          `SELECT * FROM workoutTemplates WHERE id = ?`,
          [template.id]
        );
        //setUserTemplates(rows)
        //console.log("rows: ", JSON.stringify(rows));
      } catch (error) {
        console.log("Failed to get user workout templates: ", error);
      }
    };

    fetchTemplates();
  }, [template]); // <-- updated dependency

  const updateWorkoutTemplateInFirestore = async (userId, name, updatedExercises) => {
    try {
      const docRef = doc(dbFirestore, `users/${userId}/workoutTemplates/${name}`);
      await setDoc(docRef, {
        data: { exercises: updatedExercises },
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );
      console.log('Workout template updated in Firestore');
    } catch (error) {
      console.error('Error updating Firestore template:', error);
    }
  };

  // Save updated workout to DB
  const saveUpdatedWorkout = async () => {
    // const oldTemplate = JSON.stringify(template)
    // console.log("old template: ", oldTemplate)
    // const newExercises = JSON.stringify(updatedExercises)
    // console.log("updated exercises: ", newExercises)
    // console.log("updated template name: ", templateName)
    const newTemplateObj = {
      ...template,
      name: templateName || template.name,
      data: { exercises: updatedExercises },
    };

    //console.log("updated template: ", JSON.stringify(newTemplateObj));
    
    try {
      // Save to SQLite
      await db.runAsync(
        `UPDATE workoutTemplates SET name = ?, data = ? WHERE id = ?`,
        [
          newTemplateObj.name,
          JSON.stringify(newTemplateObj.data), // store JSON as string
          newTemplateObj.id,
        ]
      );
      console.log("Workout template updated in SQLite");
      if (firestoreUserId) {
        await updateWorkoutTemplateInFirestore(
          firestoreUserId,
          newTemplateObj.name,
          newTemplateObj.data.exercises
        );
      } else {
        console.warn('⚠️ No Firestore user ID found; skipping cloud update');
      }
    }
    catch (err) {
      console.error('Failed to update workout:', err.message);
    }
  };

  const deleteExercise = (exercise) => {
    let newExercises = []

    let j = 0;
    for (let i = 0; i < selectedExercises.length; i++) {
      if (exercise != selectedExercises[i]) {
        newExercises[j] = selectedExercises[i]
        console.log('Exercise ' + i + ' not deleted')
        j++
      }
    }

    setSelectedExercises(newExercises)
    setUpdatedExercises(newExercises)
    //console.log('updated exercises: ' + selectedExercises)
  }

  const handleAddSets = (exerciseId) => {
    // Immutable update: produce a new array and new exercise object
    setSelectedExercises(prev =>
      (prev || []).map(ex => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: [...(Array.isArray(ex.sets) ? ex.sets : []), { weight: null, reps: null }],
          };
        }
        return ex;
      })
    );

    setUpdatedExercises(prev =>
      (prev || []).map(ex => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: [...(Array.isArray(ex.sets) ? ex.sets : []), { weight: null, reps: null }],
          };
        }
        return ex;
      })
    )
  };

  const handleWeightInput = (newWeight, exerciseId, setIndex) => {
    setUpdatedExercises(prev =>
      (prev || []).map(exercise => {
        // If this is the exercise to update
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: (exercise.sets || []).map((set, i) => {
              if (i === setIndex) {
                return { ...set, weight: newWeight }
              }
              return set
            }),
          }
        }

        // Return unchanged exercise
        return exercise
      })
    )
  }

  const handleRepsInput = (newReps, exerciseId, setIndex) => {
    setUpdatedExercises(prev =>
      (prev || []).map(exercise => {
        // If this is the exercise to update
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: (exercise.sets || []).map((set, i) => {
              if (i === setIndex) {
                return { ...set, reps: newReps }
              }
              return set
            }),
          }
        }

        // Return unchanged exercise
        return exercise
      })
    )
  }

  const renderItem = ({ item, drag }) => (
    <ScaleDecorator>
      <View style={{marginBottom: '2.5%'}}>
        <TouchableOpacity onLongPress={drag} style={styles.exerciseContainer}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={standards.regularText}>{item.name ? item.name : 'Exercise Not Found'}</Text>
            <TouchableOpacity onPress = {() => {deleteExercise(item)}}>
              <Image style={{width: 25, height: 25}} source={require('../assets/images/white-trash-can.png')}/>
            </TouchableOpacity>
          </View>

          <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 5}}>
            <Text style={standards.regularText}>Set</Text>
            <Text style={standards.regularText}>Previous</Text>
            <Text style={standards.regularText}>lbs</Text>
            <Text style={standards.regularText}>Reps</Text>
          </View>

          {item.sets ? 
            item.sets.map((set, i) => (
              <View key={`${item.id}-set-${i}`} style={{flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, paddingLeft: 10}}>

                <Text style={[standards.regularText, {flex: 3}]}>{i + 1}</Text>

                {set.weight ? 
                  <Text style={[standards.regularText, {flex: 3}]}>{set.weight + ' x ' + set.reps}</Text>
                  :
                  <Text style={[standards.regularText, {flex: 2}]}>-</Text>
                }

                <TextInput
                style={[styles.templateInput, {flex: 2, marginHorizontal: 10}]}
                onChangeText={(text) => {handleWeightInput(text, item.id, i)}}
                onEndEditing={() => {}}
                defaultValue={set.weight}
                placeholder='-'
                keyboardType='numeric'
                placeholderTextColor={'#000'}
                />

                <TextInput
                style={[styles.templateInput, {flex: 2, marginHorizontal: 10}]}
                onChangeText={(text) => {handleRepsInput(text, item.id, i)}}
                onEndEditing={() => {}}
                defaultValue={set.reps}
                placeholder='-'
                keyboardType='numeric'
                placeholderTextColor={'#000'}
                />

              </View>
            )) : null}

          <TouchableOpacity 
          style={{backgroundColor: '#375573', padding: 10, width: '90%', alignSelf: 'center', borderRadius: 10, alignItems: 'center'}}
          onPress={() => {handleAddSets(item.id)}}
          >
            <Text style={standards.regularText}>Add Set</Text>
          </TouchableOpacity>

        </TouchableOpacity>
      </View>
    </ScaleDecorator>
  );

  return(
    <SafeAreaView style={{flex: 1, backgroundColor: '#1a1b1c', padding: 10}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        <TouchableOpacity onPress={router.back}>
          <Image style={{width: '20', height: '20'}} source={require('../assets/images/xButton.png')}/>
        </TouchableOpacity>

        <Text style={standards.headerText}>Edit Template</Text>

        <TouchableOpacity onPress={() => {saveUpdatedWorkout();router.back()}}>
          <Image style={{width: '25', height: '25'}} source={require('../assets/images/check-mark.png')}/>
        </TouchableOpacity>
      </View>

      <TextInput
      style={[standards.headerText, {padding: 20}]}
      onChangeText={setTemplateName}
      defaultValue={template?.name ?? 'No Workout found'}
      />

      <DraggableFlatList
      data={selectedExercises}
      onDragEnd={({data}) => {setSelectedExercises(data);setUpdatedExercises(data)}}
      keyExtractor={(item, index) => String(item.id ?? index)}
      renderItem={renderItem}
      containerStyle={{flex: 1, paddingBottom: 10}}
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
        onSelect={(selected) => {
          // The modal may pass either:
          //  - a full updated array (e.g. [...selectedExercises, newItem])
          //  - or a single exercise object (if modal behavior changes in future)
          // Merge into current state and dedupe by `id`, preserving previous items.
          setSelectedExercises((prev = []) => {
            // ensure prev is an array
            const prevArr = Array.isArray(prev) ? prev : [];

            // helper to push unique by id
            const pushIfNew = (out, ex, seen) => {
              if (!ex) return;
              const id = ex.id ?? ex._id ?? null;
              if (id == null) {
                // no id: try to avoid duplicates by reference
                if (!out.includes(ex)) out.push(ex);
                return;
              }
              if (!seen.has(id)) {
                out.push(ex);
                seen.add(id);
              }
            };

            const result = [];
            const seen = new Set();

            // start with existing items
            for (const ex of prevArr) {
              pushIfNew(result, ex, seen);
            }

            if (Array.isArray(selected)) {
              for (const ex of selected) {
                pushIfNew(result, ex, seen);
              }
            } else {
              pushIfNew(result, selected, seen);
            }

            console.log('selectedExercises merged ->', result);
            return result;
          });
        }}
      />

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseContainer: {
    padding: '2%',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#375573',
    backgroundColor: 'rgba(255,255,255,0.08)',
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