import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WorkoutModal({workoutModal, setWorkoutModal, template}) {
    const db = useSQLiteContext();
    const [workoutData, setWorkoutData] = useState(null);

    useEffect(() => {
        if (!template) {
            setWorkoutData(null);
            return;
        }
        const fetchWorkout = async () => {
            try {
                const rows = await db.getAllAsync(
                    `SELECT * FROM workoutTemplates WHERE id = ?`,
                    [template.id]
                );
                if (rows && rows.length > 0) {
                    setWorkoutData(rows[0]);
                    console.log('Found row:', rows[0]);
                } else {
                    setWorkoutData(null);
                    console.log(`No row found with id = ${template.id}`);
                }
            } catch (err) {
                console.error(err.message);
                setWorkoutData(null);
            }
        };
        fetchWorkout();
    }, [template]);

    // Timer functions are from geeksforgeeks.org
    const [time, setTime] = useState(0);
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
            pauseStopwatch();
            //resetStopwatch();
        }
        // Cleanup interval on unmount
        return () => clearInterval(intervalRef.current);
    }, [workoutModal]);
    
    return(
        // Workout Modal
        <Modal
        visible={workoutModal}
        transparent={true}
        onRequestClose={() => setWorkoutModal(false)}
        >
            <View style={styles.centeredView}>
                <View style={{backgroundColor: '#1a1b1c', height: '90%', width: '100%', borderRadius: 10, padding: 10}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <TouchableOpacity style={styles.button} onPress={() => setWorkoutModal(false)}>
                    <Text style={{color: '#fff'}}>Close</Text>
                    </TouchableOpacity>
                    <Text style={{color: '#fff', fontWeight: 'normal', fontSize: 20}}>{timeHours}:{timeMinutes}:{timeSeconds}</Text>
                    <TouchableOpacity style={[styles.button, {backgroundColor: '#10bb21ff'}]} onPress={() => setWorkoutModal(false)}>
                    <Text style={{color: '#fff'}}>Finish</Text>
                    </TouchableOpacity>
                </View>

                <Text style={{color: '#fff', fontSize: 30, fontWeight: 'bold', padding: 20}}>{workoutData ? workoutData.name : 'No Workout found'}</Text>
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
  }
})