import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { Dimensions, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

import { useUser } from "../UserContext";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";
const dbFirestore = getFirestore(app);

export default function ExerciseCreationModal({visibility, setVisibility}) {
  const db = useSQLiteContext()
  const [exerciseName, setExerciseName] = useState(null)
  const [exerciseEquipment, setExerciseEquipment] = useState(null)
  const [primaryMuscle, setPrimaryMuscle] = useState(null)
  const [exerciseInstructions, setExerciseInstructions] = useState('')
  const isComplete = exerciseName && exerciseEquipment && primaryMuscle
  const { userId, firestoreUserId } = useUser();
  

  const saveExercise = async () => {
    if (exerciseName && exerciseEquipment && primaryMuscle) {
      try {
        await db.runAsync(
          `INSERT OR REPLACE INTO customExercises (user_id, name, equipment, primaryMuscle, instructions) VALUES (?, ?, ?, ?, ?);`,
          [userId, exerciseName, exerciseEquipment, primaryMuscle, exerciseInstructions]
        )

        if (firestoreUserId) {
          try {
            const exercisesRef = collection(dbFirestore, `users/${firestoreUserId}/customExercises`);
            await addDoc(exercisesRef, {
              name: exerciseName,
              equipment: exerciseEquipment,
              primaryMuscle: primaryMuscle,
              instructions: exerciseInstructions,
              timestamp: new Date().toISOString(),
            });
            console.log("Exercise added to Firestore!");
          } catch (error) {
            console.error("Error adding exercise to Firestore:", error);
          }
        }

        console.log("Exercise saved!")
        setVisibility(false)

      } catch (error) {
        console.error("Error saving exercise: ", error)
      }
    } else {

    }
  }

  return(
    <Modal
    visible={visibility}
    transparent={true}
    onRequestClose={() => setVisibility(false)}
    >
      <BlurView intensity={25} style={styles.centeredView}>
        <View style={[styles.modalView]}>

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <TouchableOpacity onPress={() => setVisibility(false)}>
              <Image style={{width: '20', height: '20'}} source={require('../assets/images/xButton.png')}/>
            </TouchableOpacity>
            <Text style={standards.headerText}>Create Exercise</Text>
            {isComplete ? (
              <TouchableOpacity onPress={saveExercise}>
                <Image style={{width: '25', height: '25'}} source={require('../assets/images/check-mark.png')}/>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity>
                <Image style={{width: '25', height: '25'}} source={require('../assets/images/check-mark-grey.png')}/>
              </TouchableOpacity>
            )}
          </View>

          <View style={{flexDirection: 'row', paddingVertical: 10, justifyContent: 'space-evenly'}}>
            <Text style={standards.regularText}>Name: </Text>
            <TextInput 
            style={styles.smallInput}
            onChangeText={setExerciseName}
            />
          </View>

          <View style={{flexDirection: 'row', paddingVertical: 10, justifyContent: 'space-evenly'}}>
            <Text style={standards.regularText}>Equipment: </Text>
            <TextInput
            style={styles.smallInput}
            onChangeText={setExerciseEquipment}
            />
          </View>

          <View style={{flexDirection: 'row', paddingVertical: 10, justifyContent: 'space-evenly'}}>
            <Text style={standards.regularText}>Primary Muscle: </Text>
            <TextInput 
            style={styles.smallInput}
            onChangeText={setPrimaryMuscle}
            />
          </View>

          <View style={{flexDirection: 'row', paddingVertical: 10, justifyContent: 'space-evenly'}}>
            <Text style={standards.regularText}>Instructions: </Text>
            <TextInput 
            style={styles.largeInput}
            onChangeText={setExerciseInstructions}
            multiline={true}
            />
          </View>
        </View>
      </BlurView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallInput: {
    flex: 1, 
    backgroundColor: '#fff', 
    borderRadius: 5, 
    paddingHorizontal: 5,
    textAlignVertical: 'top',
    fontSize:16,
    maxWidth: '60%'
  },
  largeInput: {
    flex: 1, 
    backgroundColor: '#fff', 
    borderRadius: 5, 
    paddingHorizontal: 5,
    textAlignVertical: 'top',
    fontSize: 16,
    maxWidth: '60%',
    minHeight: '15%'
  },
  text: {
    flex: 1,
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  modalView: {
    width: '85%',
    backgroundColor: '#1a1b1c',
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
    
  },
  templateInput: {
    backgroundColor: '#999',
    width: 40,
    borderRadius: 5,
    fontWeight: 'bold',
    textAlign: 'center'
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