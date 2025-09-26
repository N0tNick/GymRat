import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Modal, ScrollView, SectionList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import exercises from '../assets/exercises.json';
import schema from '../assets/schema.json';
import NavBar from '../components/NavBar';
import WorkoutModal from '../components/WorkoutModal';
import ExerciseCreationModal from '../components/exerciseCreationModal';
import { usePersistedBoolean, usePersistedWorkout } from './ongoingWorkout';

const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

export default function WorkoutScreen() {
  const db = useSQLiteContext()
  const [userTemplates, setUserTemplates] = useState([])
  const router = useRouter();
  const [isOngoingWorkout, setIsOngoingWorkout] = usePersistedBoolean('isOngoingWorkout', false);
  const [selectedTemplate, setSelectedTemplate] = usePersistedWorkout('selectedTemplate', null)

  const loadTemplates = async() => {
    const result = await db.getAllAsync("SELECT * FROM workoutTemplates;")
    setUserTemplates(result)
    const result2 = await db.getAllAsync("SELECT * FROM customExercises;")
    setCustomExercises(result2)
  }

  function finishWorkout(bool) {
    setIsOngoingWorkout(!bool)
  }

  useFocusEffect(
    useCallback(() => {
      loadTemplates()
    }, [])
  )

  const renderItem = ({ item }) => {
    if (item.primaryMuscles) {
      return (
        <TouchableOpacity 
        style={styles.card}
        onPress={() => {
          setExerciseItem(item)
          setExerciseInfoModal(true)
          }}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.subtitle}>Equipment: {item.equipment}</Text>
          <Text style={styles.subtitle}>Primary Muscle: {item.primaryMuscles}</Text>
        </TouchableOpacity>
      )
    } else {
      return (
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <TouchableOpacity 
          style={styles.card}
          onPress={() => {
            setExerciseItem(item)
            setExerciseInfoModal(true)
            }}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.subtitle}>Equipment: {item.equipment}</Text>
            <Text style={styles.subtitle}>Primary Muscle: {item.primaryMuscle}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{backgroundColor: '#999', alignItems: 'center', justifyContent: 'center',borderRadius: 10, padding: 10, height: 40}} onPress={() => deleteExercise(item.id)}><Text>Delete</Text></TouchableOpacity>
        </View>
      )
    }
    
  }

  const deleteExercise = (id) => {
    Alert.alert('Delete Custom Exercise', 'Are you sure you want to delete this exercise?', [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await db.runAsync(
              `DELETE FROM customExercises WHERE id = ?;`,
              [id]
            );
            console.log('Exercise deleted successfully');
            loadTemplates(); // refresh list AFTER deletion
          } catch (error) {
            console.log('Error deleting exercise: ', error);
          }
        },
      }
    ])
    loadTemplates()
  }

  const applyFilters = (muscle, equipment) => {
    let filtered = exercises

    if (muscle && muscle !== 'Any Muscle') {
      filtered = filtered.filter(ex => ex.primaryMuscles.includes(muscle))
    }
    if (equipment && equipment !== 'Any Equipment') {
      if (equipment && equipment === 'No Equipment') {
        filtered = filtered.filter(ex => ex.equipment === null)
      }
      else {
        filtered = filtered.filter(ex => ex.equipment === equipment)
      }
    }

    setFilteredExercises(filtered)
  }

  const renderFilterItem = (filterType) => ({ item }) => {
    const displayLabel = item == null ? 'No Equipment' : item

    return (
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => {
          if (filterType === 'muscle') {
            setMFilterButtonVal(item)
            applyFilters(item, eFilterButtonVal)
            setMuscleFilterModal(false)
          } else if (filterType === 'equipment') {
            setEFilterButtonVal(displayLabel)
            applyFilters(mFilterButtonVal, displayLabel)
            setEquipmentFilterModal(false)
          }
        }}
      >
        <Text style={styles.filterButtonText}>{displayLabel}</Text>
      </TouchableOpacity>
    );
  };

  const displayInstructions = (instructions) => {
    let instructionText = ''
    if (!Array.isArray(instructions)) {
      instructionText = instructions
      //console.log(instructions)
      //return 'No instructions available.'
    }
    else {
      for (let i = 0; i < instructions.length; i++) {
        instructionText += i+1 + '. ' + instructions[i] + '\n\n'
      }
    }
    return instructionText
  }

  const renderTemplate = ({ item }) => {
    const template = JSON.parse(item.data)

    return (
      <TouchableOpacity onPress = {() => {if (!isOngoingWorkout) manageTemplate(item.id, item.name)}} style={styles.templateBox}>
        <View style={{flexDirection: 'row'}}>
          <Text style={styles.text}>{item.name}</Text>
          <TouchableOpacity onPress = {() => {deleteTemplate(item.id)}}><Text>Delete</Text></TouchableOpacity>
        </View>

        {template.exercises.map((exercise, idx) => (
          <Text key={exercise.id || idx} style={[styles.subtitle, {color: '#fff'}]}>
            {exercise.name} ({exercise.sets.length} sets)
          </Text>
        ))}
      </TouchableOpacity>
    )
  }

  const deleteTemplate = (id) => {
    Alert.alert('Delete Template', 'Are you sure you want to delete this template?', [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await db.runAsync(
              `DELETE FROM workoutTemplates WHERE id = ?;`,
              [id]
            );
            console.log('Template deleted successfully');
            loadTemplates(); // refresh list AFTER deletion
          } catch (error) {
            console.log('Error deleting template: ', error);
          }
        },
      }
    ])
    loadTemplates()
  }

  const manageTemplate = (id, name) => {
    setSelectedTemplate({ id, name });
    setManageTemplateModal(true);
  }

  const [modalVisible, setModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [filteredExercises, setFilteredExercises] = useState(exercises)
  const [muscleFilterModal, setMuscleFilterModal] = useState(false)
  const [equipmentFilterModal, setEquipmentFilterModal] = useState(false)
  const [mFilterButtonVal, setMFilterButtonVal] = useState('Any Muscle')
  const [eFilterButtonVal, setEFilterButtonVal] = useState('Any Equipment')
  const [exerciseInfoModal, setExerciseInfoModal] = useState(false)
  const [exerciseItem, setExerciseItem] = useState('')
  const [manageTemplateModal, setManageTemplateModal] = useState(false)
  const [workoutModal, setWorkoutModal] = useState(null)
  const [exerciseCreation, setExerciseCreation] = useState(null)
  const [customExercises, setCustomExercises] = useState([])

    useEffect(() => {
      const filtered = exercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(searchText.toLowerCase())
      )
      setFilteredExercises(filtered)
      setEFilterButtonVal('Any Equipment')
      setMFilterButtonVal('Any Muscle')
    }, [searchText])

  return (
    <SafeAreaProvider>
        <View
          backgroundColor={'#1a1b1c'}
          style={styles.container}
        >
          <SafeAreaView style={{ flex: 1, height: screenHeight, width: screenWidth}}>
          
          {/* Exercise List Modal */}
          <Modal
          visible={modalVisible}
          transparent={true}
          
          onRequestClose={() => {
            setModalVisible(!modalVisible)
          }}>
            <View style={[styles.centeredView]}>
              <View style={styles.modalView}>
                <TouchableOpacity style={{backgroundColor: '#999', width: 25, alignItems: 'center', borderRadius: 5}} onPress={() => setModalVisible(false)}>
                  <Text style={styles.xButton}>X</Text>
                </TouchableOpacity>

                <Text style={{color: '#000', fontSize: 40, fontWeight: 'bold'}}>Exercises</Text>
                <TextInput
                style={styles.searchBar}
                onChangeText={setSearchText}
                value={searchText}
                placeholder='Search'
                />

                <View style={{flexDirection: 'row', justifyContent: 'space-evenly', padding: 10}}>
                  <TouchableOpacity style={styles.filterButton} onPress={() => {setMuscleFilterModal(true)}}>
                    <Text style={styles.filterButtonText}>{mFilterButtonVal}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.filterButton} onPress={() => {setEquipmentFilterModal(true)}}>
                    <Text style={styles.filterButtonText}>{eFilterButtonVal}</Text>
                  </TouchableOpacity>
                </View>

                {/* Display Custom exercises if exists */}
                {(customExercises.length > 0) ? (
                  <SectionList
                  sections={[{title: 'Custom Exercises', data: customExercises}, {title: 'Exercise List', data: filteredExercises}]}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                  renderSectionHeader={({section: {title}}) => (
                    <Text style={styles.title}>{title}</Text>
                  )}
                  />
                ) : (
                  <FlatList
                    data={filteredExercises}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                  />
                )}

                <Modal
                visible={muscleFilterModal}
                transparent={true}

                onRequestClose={() => { setMuscleFilterModal(!muscleFilterModal) }}>
                  <View style={[styles.centeredView]}>
                    <View style={[styles.filterView]}>
                      
                      <FlatList
                        scrollEnabled={true}
                        data={schema.properties.primaryMuscles.items[0].enum}
                        keyExtractor={(item, index) => (item == null ? `null-${index}` : item.toString())}
                        renderItem={renderFilterItem('muscle')}
                      />
                      

                    </View>
                  </View>
                </Modal>

                <Modal
                visible={equipmentFilterModal}
                transparent={true}

                onRequestClose={() => { setEquipmentFilterModal(!equipmentFilterModal) }}>
                  <View style={[styles.centeredView]}>
                    <View style={[styles.filterView]}>
                      
                      <FlatList
                        scrollEnabled={true}
                        data={schema.properties.equipment.enum}
                        keyExtractor={(item, index) => (item == null ? `null-${index}` : item.toString())}
                        renderItem={renderFilterItem('equipment')}
                      />
                      

                    </View>
                  </View>
                </Modal>

                <Modal
                visible={exerciseInfoModal}
                transparent={true}

                onRequestClose={() => { setExerciseInfoModal(!exerciseInfoModal) }}>
                  <View style={[styles.centeredView, {backgroundColor: 'rgba(0,0,0,0)'}]}>
                    <View style={styles.modalView}>

                      <TouchableOpacity style={{backgroundColor: '#999', width: 25, alignItems: 'center', borderRadius: 5}} onPress={() => setExerciseInfoModal(false)}>
                        <Text style={styles.xButton}>X</Text>
                      </TouchableOpacity>
                      <Text style={{color: '#000', fontSize: 40, fontWeight: 'bold'}}>{exerciseItem.name}</Text>
                      <Text style={styles.title}>Instructions</Text>
                      <ScrollView style={{scrollEnabled: true}}>
                        <Text style={{fontSize: 18, color: '#000', paddingTop: 20}}>{displayInstructions(exerciseItem.instructions)}</Text>
                      </ScrollView>

                    </View>
                  </View>
                </Modal>

              </View>
            </View>
          </Modal>

          {/* Template Clicked Modal */}
          <Modal
            visible={manageTemplateModal}
            transparent={true}
            onRequestClose={() => setManageTemplateModal(false)}
          >
            <View style={styles.centeredView}>
              <View style={styles.alertView}>
                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 25, textAlign: 'center', paddingBottom: 50}}>
                  {selectedTemplate ? `Do you want to start your ${selectedTemplate.name} workout?` : ''}
                </Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                  <TouchableOpacity style={styles.button} onPress={() => {
                    setWorkoutModal(true)
                    setManageTemplateModal(false)
                    setIsOngoingWorkout(true)}}>
                    <Text style={{color: '#fff', fontSize: 20, fontWeight: 'bold'}}>Start</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={() => setManageTemplateModal(false)}>
                    <Text style={{color: '#fff', fontSize: 20, fontWeight: 'bold'}}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Workout Modal */}
          <WorkoutModal 
            workoutModal={workoutModal} 
            setWorkoutModal={setWorkoutModal} 
            template={selectedTemplate}
            finishWorkout={finishWorkout}
          />

          {/* Exercise Creation Modal */}
          <ExerciseCreationModal
            visibility={exerciseCreation}
            setVisibility={setExerciseCreation}
          />

          {/*<View style={{flexDirection: 'row', justifyContent: 'space-between', padding: 10}}>
            <Text style={styles.text}>Workout Screen</Text>
            <TouchableOpacity style={styles.button} onPress ={() => setModalVisible(true)}><Text style={{color: '#fff'}}>Exercise List</Text></TouchableOpacity>
          </View>*/}

          <View style={{flexDirection: 'row', justifyContent: 'space-between', padding: 10}}>
            <Text style={{color: '#fff', fontSize: 20, fontWeight: 'bold',}}>Templates</Text>
            <View style={{flexDirection: 'row', gap: 10}}>
              <TouchableOpacity style={styles.button} onPress ={() => setExerciseCreation(true)}><Text style={{color: '#fff'}}>+ Exercise</Text></TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress ={() => router.push('/createTemplate')}><Text style={{color: '#fff'}}>+ Template</Text></TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress ={() => setModalVisible(true)}><Text style={{color: '#fff'}}>Exercise List</Text></TouchableOpacity>
            </View>
          </View>

          {/* View Ongoing Workout Button */}
          {isOngoingWorkout ? (
            <TouchableOpacity 
            style={{backgroundColor: '#1478db', padding: 10, width: '90%', alignSelf: 'center', borderRadius: 10, alignItems: 'center'}}
            onPress={() => setWorkoutModal(true)}
            >
              <Text style={{color: '#fff', fontWeight: 'bold'}}>View Ongoing Workout</Text>
            </TouchableOpacity>
          ) : null}
          

          <FlatList
          data={userTemplates}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTemplate}
          style={{padding: 10}}
          ItemSeparatorComponent={<View style={{padding: 5}}/>}
          />
        </SafeAreaView>
        </View>
        <NavBar />
    </SafeAreaProvider>
  );
}

export const styles = StyleSheet.create({
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
    borderWidth: 1,
    borderRadius: 10,
  }
});
