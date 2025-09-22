import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { Dimensions, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

export default function ExerciseCreationModal({visibility, setVisibility}) {
  const db = useSQLiteContext()
  const [exerciseName, setExerciseName] = useState(null)
  const [exerciseEquipment, setExerciseEquipment] = useState(null)
  const [primaryMuscle, setPrimaryMuscle] = useState(null)
  const [exerciseInstructions, setExerciseInstructions] = useState('')
  const isComplete = exerciseName && exerciseEquipment && primaryMuscle

  const saveExercise = async () => {
    if (exerciseName && exerciseEquipment && primaryMuscle) {
      try {
        await db.runAsync(
          `INSERT OR REPLACE INTO customExercises (user_id, name, equipment, primaryMuscle, instructions) VALUES (?, ?, ?, ?, ?);`,
          [1, exerciseName, exerciseEquipment, primaryMuscle, exerciseInstructions]
        )

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
      <View style={styles.centeredView}>
        <View style={[styles.modalView, {alignContent: 'space-between'}]}>

          <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10}}>
            <TouchableOpacity style={styles.button} onPress={() => setVisibility(false)}>
              <Text style={styles.whiteText}>Close</Text>
            </TouchableOpacity>
            <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 20}}>Create Exercise</Text>
            {isComplete ? (
              <TouchableOpacity style={styles.button} onPress={saveExercise}>
                <Text style={styles.whiteText}>Save</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.button, {backgroundColor: '#666'}]}>
                <Text style={styles.whiteText}>Save</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{flexDirection: 'row', paddingVertical: 10}}>
            <Text style={[styles.whiteText, {fontSize: 20, fontWeight: 'bold'}]}>Name: </Text>
            <TextInput 
            style={{flex: 1, backgroundColor: '#999', borderRadius: 5, fontSize: 20, paddingHorizontal: 5}}
            onChangeText={setExerciseName}
            />
          </View>

          <View style={{flexDirection: 'row', paddingVertical: 10}}>
            <Text style={[styles.whiteText, {fontSize: 20, fontWeight: 'bold'}]}>Equipment: </Text>
            <TextInput 
            style={{flex: 1, backgroundColor: '#999', borderRadius: 5, fontSize: 20, paddingHorizontal: 5}}
            onChangeText={setExerciseEquipment}
            />
          </View>

          <View style={{flexDirection: 'row', paddingVertical: 10}}>
            <Text style={[styles.whiteText, {fontSize: 20, fontWeight: 'bold'}]}>Primary Muscle: </Text>
            <TextInput 
            style={{flex: 1, backgroundColor: '#999', borderRadius: 5, fontSize: 20, paddingHorizontal: 5}}
            onChangeText={setPrimaryMuscle}
            />
          </View>

          <View style={{flex: 1, flexDirection: 'row', paddingVertical: 10}}>
            <Text style={[styles.whiteText, {fontSize: 20, fontWeight: 'bold'}]}>Instructions: </Text>
            <TextInput 
            style={{flex: 1, backgroundColor: '#999', borderRadius: 5, fontSize: 20, paddingHorizontal: 5}}
            onChangeText={setExerciseInstructions}
            multiline={true}
            />
          </View>
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
    height: '50%',
    width: '85%',
    backgroundColor: '#1a1b1c',
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
    
  },
  templateInput: {
    backgroundColor: '#999',
    width: 40,
    borderRadius: 5,
    fontWeight: 'bold',
    textAlign: 'center'
  }
})
