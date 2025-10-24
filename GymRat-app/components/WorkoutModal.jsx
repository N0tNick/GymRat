import { Image } from 'expo-image';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useStatePersist } from 'use-state-persist';
import listExercises from '../assets/exercises.json';
import schema from '../assets/schema.json';

const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

import { addDoc, collection, doc, getFirestore, setDoc } from 'firebase/firestore';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { app } from '../firebaseConfig';
import { useUser } from '../UserContext';
import ExerciseListModal from './ExerciseListModal';

export default function WorkoutModal({workoutModal, setWorkoutModal, userTemplates, template, finishWorkout}) {
  const db = useSQLiteContext()
  const [workoutData, setWorkoutData] = useState(null)
  const [exercises, setExercises] = useState([])
  // Track user-updated values for each set
  const [updatedExercises, setUpdatedExercises] = useState([])
  const [isExampleTemplate, setIsExampleTemplate] = useState(null)
  const { firestoreUserId } = useUser();
  const dbFirestore = getFirestore(app);
  const [exerciseListVisible, setExerciseListVisible] = useState(false)

  useEffect(() => {
    if (!template) {
      setWorkoutData(null);
      setExercises([]);
      setUpdatedExercises([]);
      return;
    }
    const fetchWorkout = async () => {
      let workout = null;

      // First try user templates
      const userRows = await db.getAllAsync(
        `SELECT * FROM workoutTemplates WHERE id = ?`,
        [template.id]
      );
      if (userRows.length > 0) {
        workout = userRows[0];
        setIsExampleTemplate(false);
      } else {
        // Fallback to example templates
        const exampleRows = await db.getAllAsync(
          `SELECT * FROM exampleWorkoutTemplates WHERE id = ?`,
          [template.id]
        );
        if (exampleRows.length > 0) {
          workout = exampleRows[0];
          setIsExampleTemplate(true);
        }
      }

      if (workout) {
        setWorkoutData(workout);
        const parsed = JSON.parse(workout.data || '{}');
        setExercises(parsed.exercises || []);
        setUpdatedExercises(JSON.parse(JSON.stringify(parsed.exercises || [])));
      } else {
        setWorkoutData(null);
        setExercises([]);
        setUpdatedExercises([]);
      }
    };
    
    fetchWorkout();
  }, [template]);

  const updateWorkoutTemplateInFirestore = async (userId, workoutKey, updatedExercises, isExample = false) => {
    try {
      const targetCollection = isExample ? 'exampleWorkoutTemplates' : 'workoutTemplates';
      const docRef = doc(dbFirestore, `users/${userId}/${targetCollection}/${workoutKey}`);

      await setDoc(
        docRef,
        {
          data: { exercises: updatedExercises },
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );

      console.log(`updated Firestore template at ${targetCollection}/${workoutKey}`);
    } catch (error) {
      console.error('error updating Firestore template:', error);
    }
  };

  const insertWorkoutLogToFirestore = async (userId, workoutName) => {
    try {
      const logRef = collection(dbFirestore, `users/${userId}/workoutLog`);
      await addDoc(logRef, {
        workout_name: workoutName,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
      });
      console.log('Workout log inserted in Firestore');
    } catch (error) {
      console.error('Error inserting workout log in Firestore:', error);
    }
  };


    // Timer functions are from geeksforgeeks.org
    const [time, setTime] = useStatePersist('@timer', 0);
    const timeSeconds = time % 60
    const timeMinutes = Math.floor(time / 60)
    const timeHours = Math.floor(time / 3600)
    const [running, setRunning] = useState(false);
    const intervalRef = useRef(null);
    const startTimeRef = useRef(0);

    const startStopwatch = () => {
    // Set the start time, accounting for any previously elapsed time
    startTimeRef.current = Date.now() - time * 1000;
    // Start interval to update time every second
    intervalRef.current = setInterval(() => {
        // Update time state with elapsed seconds
        setTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    // Set running state to true
    setRunning(true);
    };

    const pauseStopwatch = () => {
    // Clear the interval to stop updating time
    clearInterval(intervalRef.current);
    // Set running state to false
    setRunning(false);
    };

    const resetStopwatch = () => {
    // Clear the interval
    clearInterval(intervalRef.current);
    // Reset time to 0
    setTime(0);
    // Set running state to false
    setRunning(false);
    };

    useEffect(() => {
        if (workoutModal) {
            startStopwatch();
        } else {
            //pauseStopwatch();
            //resetStopwatch();
        }
        // Cleanup interval on unmount
        return () => clearInterval(intervalRef.current);
    }, [workoutModal]);

    // Helper to update user input for a set
    const handleSetChange = (exerciseIdx, setIdx, field, value) => {
      setUpdatedExercises(prev => {
        const updated = [...prev];
        if (!updated[exerciseIdx] || !updated[exerciseIdx].sets[setIdx]) return prev;
        updated[exerciseIdx] = { ...updated[exerciseIdx], sets: [...updated[exerciseIdx].sets] };
        updated[exerciseIdx].sets[setIdx] = { ...updated[exerciseIdx].sets[setIdx], [field]: value };
        return updated;
      });
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

  const handleAddSets = (exerciseId) => {
    // Immutable update: produce a new array and new exercise object
    setExercises(prev =>
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

    const renderItem = ({ item, index: exerciseIdx, drag }) => {
      if (isExampleTemplate) {
        return (
          <View style={{marginBottom: '2.5%'}}>
            <TouchableOpacity onLongPress={drag} style={styles.exerciseContainer}>
              <Text style={standards.regularText}>{item.name}</Text>

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

            </TouchableOpacity>
          </View>
        )
      }
      else {
        return (
          <ScaleDecorator>
            <View style={{marginBottom: '2.5%'}}>
              <TouchableOpacity onLongPress={drag} style={styles.exerciseContainer}>
                <Text style={standards.regularText}>{item.name}</Text>

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
        )
      }
    };
    
    // Save updated workout to DB
    const saveUpdatedWorkout = async () => {
      if (!workoutData) return
      else if (!isExampleTemplate) {
        try {
          const updatedData = JSON.stringify({ exercises: updatedExercises });
          console.log("updated data: ", updatedData)
          const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
          await db.runAsync(
            `UPDATE workoutTemplates SET data = ? WHERE id = ?`,
            [updatedData, workoutData.id]
          );
          await db.runAsync(
            `INSERT INTO workoutLog (user_id, workout_name, date) VALUES (?, ?, ?)`,
            [workoutData.user_id, workoutData.name, today]
          );

          const workRows = await db.getAllAsync(
            `SELECT * FROM workoutLog WHERE id = ?`,
            [template.id]
          );
          console.log(workRows[0])
          console.log('Workout updated!');

          if (firestoreUserId) {
            await updateWorkoutTemplateInFirestore(
              firestoreUserId,
              workoutData.name,
              updatedExercises,
              false
            );
            await insertWorkoutLogToFirestore(
              firestoreUserId,
              workoutData.name
            );
          } else {
            console.warn('No Firestore user ID found; skipping cloud update');
          }
        } catch (err) {
          console.error('Failed to update workout:', err.message);
        }
      }
      else {
        try {
          const updatedData = JSON.stringify({ exercises: updatedExercises });
          const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
          await db.runAsync(
            `UPDATE exampleWorkoutTemplates SET data = ? WHERE id = ?`,
            [updatedData, workoutData.id]
          );
          await db.runAsync(
            `INSERT INTO workoutLog (user_id, workout_name, date) VALUES (?, ?, ?)`,
            [workoutData.user_id, workoutData.name, today]
          );

          const workRows = await db.getAllAsync(
            `SELECT * FROM workoutLog WHERE id = ?`,
            [template.id]
          );
          console.log(workRows[0])
          console.log('Example workout updated!');

          if (firestoreUserId) {
            await updateWorkoutTemplateInFirestore(
              firestoreUserId,
              workoutData.id,
              updatedExercises,
              true
            );
            await insertWorkoutLogToFirestore(
              firestoreUserId,
              workoutData.name
            );
          } else {
            console.warn('No Firestore user ID found; skipping cloud update');
          }
        } catch (err) {
          console.error('Failed to update workout:', err.message);
        }
      }
    };

    return(
        // Workout Modal
        <Modal
        visible={workoutModal}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setWorkoutModal(false)}
        >
            <View style={styles.centeredView}>
                <View style={{backgroundColor: '#1a1b1c', height: '90%', width: '100%', borderRadius: 10, padding: 10}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <TouchableOpacity onPress={() => setWorkoutModal(false)}>
                      <Image style={{width: '20', height: '20'}} source={require('../assets/images/xButton.png')}/>
                    </TouchableOpacity>
                    <Text style={standards.headerText}>{timeHours}:{timeMinutes}:{timeSeconds}</Text>
                    <TouchableOpacity
                      onPress={async () => {
                        await saveUpdatedWorkout();
                        setWorkoutModal(false);
                        finishWorkout(true);
                        resetStopwatch();
                      }}
                    >
                      <Image style={{width: '25', height: '25'}} source={require('../assets/images/check-mark.png')}/>
                    </TouchableOpacity>
                </View>

                <Text style={[standards.headerText, {padding: 20}]}>{workoutData ? workoutData.name : 'No Workout found'}</Text>

                {isExampleTemplate ?
                  <FlatList
                  data={exercises}
                  keyExtractor={(item, index) => String(item.id ?? index)}
                  renderItem={renderItem}
                  />
                :
                  <DraggableFlatList
                  data={exercises}
                  onDragEnd={({data}) => {setExercises(data);setUpdatedExercises(data)}}
                  keyExtractor={(item, index) => String(item.id ?? index)}
                  renderItem={renderItem}
                  containerStyle={{flex: 1, paddingBottom: 10}}
                  />
                }

                <TouchableOpacity 
                style={[styles.button, {marginBottom: 5}]}
                onPress={() => setExerciseListVisible(true)}
                >
                  <Text style={standards.regularText}>Add Exercises</Text>
                </TouchableOpacity>
          
                <ExerciseListModal
                  visible={exerciseListVisible}
                  onClose={() => setExerciseListVisible(false)}
                  exercises={listExercises}
                  schema={schema}
                  selectedExercises={exercises}
                  onSelect={(selected) => {
                    // The modal may pass either:
                    //  - a full updated array (e.g. [...selectedExercises, newItem])
                    //  - or a single exercise object (if modal behavior changes in future)
                    // Merge into current state and dedupe by `id`, preserving previous items.
                    setExercises((prev = []) => {
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
                    setUpdatedExercises((prev = []) => {
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

                <TouchableOpacity 
                onPress={() => {
                  setWorkoutModal(false);
                  finishWorkout(true);
                  resetStopwatch();
                }} 
                style={[styles.button, {backgroundColor: '#fa4646', borderWidth: 0}]}>
                  <Text style={standards.regularText}>Cancel Workout</Text>
                </TouchableOpacity>

                </View>
            </View>
        </Modal>
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