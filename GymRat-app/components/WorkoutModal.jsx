import { Image } from 'expo-image';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useStatePersist } from 'use-state-persist';

const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

import { addDoc, collection, doc, getFirestore, setDoc } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { useUser } from '../UserContext';

export default function WorkoutModal({workoutModal, setWorkoutModal, userTemplates,template, finishWorkout}) {
  const db = useSQLiteContext()
  const [workoutData, setWorkoutData] = useState(null)
  const [exercises, setExercises] = useState([])
  // Track user-updated values for each set
  const [updatedExercises, setUpdatedExercises] = useState([])

  const { firestoreUserId } = useUser();
  const dbFirestore = getFirestore(app);

  useEffect(() => {
    if (!template) {
      setWorkoutData(null);
      setExercises([]);
      setUpdatedExercises([]);
      return;
    }
    const fetchWorkout = async () => {
      if (userTemplates.includes(template)) {
        try {
          const rows = await db.getAllAsync(
            `SELECT * FROM workoutTemplates WHERE id = ?`,
            [template.id]
          );
          if (rows && rows.length > 0) {
            const workout = rows[0]
            setWorkoutData(workout)
            //console.log('Found row:', rows[0]);
            if (workout.data) {
              const parsed = JSON.parse(workout.data);
              setExercises(parsed.exercises || []);
              // Deep copy for user editing
              setUpdatedExercises(JSON.parse(JSON.stringify(parsed.exercises || [])));
            }
            else { 
              setExercises([])
              setUpdatedExercises([])
            }
          } else {
            setWorkoutData(null);
            setExercises([]);
            setUpdatedExercises([]);
            //console.log(`No row found with id = ${template.id}`);
          }
        } catch (err) {
          console.error(err.message);
          setWorkoutData(null);
          setExercises([]);
          setUpdatedExercises([]);
        }
      }
      else {
        try {
          const rows = await db.getAllAsync(
            `SELECT * FROM exampleWorkoutTemplates WHERE id = ?`,
            [template.id]
          );
          if (rows && rows.length > 0) {
            const workout = rows[0]
            setWorkoutData(workout)
            //console.log('Found row:', rows[0]);
            if (workout.data) {
              const parsed = JSON.parse(workout.data);
              setExercises(parsed.exercises || []);
              // Deep copy for user editing
              setUpdatedExercises(JSON.parse(JSON.stringify(parsed.exercises || [])));
            }
            else { 
              setExercises([])
              setUpdatedExercises([])
            }
          } else {
            setWorkoutData(null);
            setExercises([]);
            setUpdatedExercises([]);
            //console.log(`No row found with id = ${template.id}`);
          }
        } catch (err) {
          console.error(err.message);
          setWorkoutData(null);
          setExercises([]);
          setUpdatedExercises([]);
        }
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

    const renderItem = ({ item, index: exerciseIdx }) => (
      <View>
        <Text style={[standards.regularText, {paddingVertical: 10}]}>{item.name}</Text>

        <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 5}}>
          <Text style={standards.regularText}>Set</Text>
          <Text style={standards.regularText}>Previous</Text>
          <Text style={standards.regularText}>lbs</Text>
          <Text style={standards.regularText}>Reps</Text>
        </View>

        {(item.sets || []).map((set, setIdx) => (
          <View key={setIdx} style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5}}>
            <Text style={standards.regularText}>{'  ' + (setIdx + 1) + ' '}</Text>
            <Text style={standards.regularText}>{set.weight ? (set.weight + 'x' + set.reps).padStart(15,' ') : '                 -          '}</Text>
            <TextInput
              style={styles.templateInput}
              value={updatedExercises[exerciseIdx]?.sets[setIdx]?.weight?.toString() || ''}
              onChangeText={val => handleSetChange(exerciseIdx, setIdx, 'weight', val)}
              placeholder='-'
              keyboardType='numeric'
            />
            <TextInput
              style={styles.templateInput}
              value={updatedExercises[exerciseIdx]?.sets[setIdx]?.reps?.toString() || ''}
              onChangeText={val => handleSetChange(exerciseIdx, setIdx, 'reps', val)}
              placeholder='-'
              keyboardType='numeric'
            />
          </View>
        ))}

      </View>
    );
    
    // Save updated workout to DB
    const saveUpdatedWorkout = async () => {
      if (!workoutData) return
      else if (userTemplates.includes(template)) {
        try {
          const updatedData = JSON.stringify({ exercises: updatedExercises });
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

                <FlatList
                data={exercises}
                keyExtractor={(item, index) => String(item.id ?? index)}
                renderItem={({item, index}) => renderItem({item, index})}
                />
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
  alertView: {
    backgroundColor: '#1a1b1c',
    borderRadius: 15,
    padding: 10,
    alignSelf: 'center',
    maxWidth: '80%',
  },
  xButton: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold'
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
    maxHeight: '70%'
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
  templateBox: {
    padding: 10,
    backgroundColor: '#666',
    borderWidth: '1',
    borderRadius: 10,
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
})

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