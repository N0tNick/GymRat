import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Modal, ScrollView, SectionList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import exercises from '../../assets/exercises.json';
import schema from '../../assets/schema.json';
import ExerciseCreationModal from '../../components/exerciseCreationModal';
import JimRatWorkout from '../../components/jimRatWorkout';
import { WorkoutOnboardModal } from '../../components/Onboarding/onboard';
import WorkoutModal from '../../components/WorkoutModal';
import { useUser } from '../../UserContext';
import { cals } from '../goal';
import { usePersistedBoolean, usePersistedWorkout } from '../ongoingWorkout';


const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

export default function WorkoutScreen() {
  const db = useSQLiteContext()
  const [isWorkoutOnboardModal, setWorkoutOnboardModal] = useState(false)
  const [userTemplates, setUserTemplates] = useState([])
  const [presetTemplates, setPresetTemplates] = useState([])
  const router = useRouter();
  const [isOngoingWorkout, setIsOngoingWorkout] = usePersistedBoolean('isOngoingWorkout', false);
  const [selectedTemplate, setSelectedTemplate] = usePersistedWorkout('selectedTemplate', null);
  const { userId } = useUser();
  const [streak, setStreak] = useState(0);
  const [dailyTotals, setDailyTotals] = useState(null);
  const [hasEntries, setHasEntries] = useState(false);
  const [hasWorkout, setHasWorkout] = useState(false);

  const loadTemplates = async() => {
    const result = await db.getAllAsync("SELECT * FROM workoutTemplates;")
    setUserTemplates(result)
    const result2 = await db.getAllAsync("SELECT * FROM customExercises;")
    setCustomExercises(result2)
    const result3 = await db.getAllAsync("SELECT * FROM exampleWorkoutTemplates")
    setPresetTemplates(result3)
  }

  function finishWorkout(bool) {
    setIsOngoingWorkout(!bool)
  }

  useFocusEffect(
    useCallback(() => {
      loadTemplates()
      handleOnboarding()
    }, [])
  )

    const handleOnboarding = async () => {
      try {
        const result = await db.getFirstAsync('SELECT * FROM users')
        console.log(result)
        if (result['hasOnboarded'] == 0) {
          setWorkoutOnboardModal(true)
        }
      } catch (error) {
        console.error('Error getting hasOnboarded:', error)
      }
    }

    useEffect(() => {
      (async () => {
        if (!userId) return;
        try {
          const res = await db.getAllAsync(
            'SELECT current_streak FROM userStreaks WHERE user_id = ?',
            [userId]
          );
          if (res && res[0]) {
            setStreak(res[0].current_streak);
          }
        } catch (err) {
          console.warn('streak read failed', err);
        }
      })();
    }, [db, userId]);

    useEffect(() => {
      (async () => {
        if (!userId) return;
        const date = new Date().toISOString().split('T')[0];
        try {
          const result = await db.getAllAsync(
            `SELECT 
              SUM(CAST(calories AS REAL)) AS totalCalories,
              SUM(CAST(protein AS REAL)) AS totalProtein,
              SUM(CAST(total_Carbs AS REAL)) AS totalCarbs,
              SUM(CAST(total_Fat AS REAL)) AS totalFat
            FROM dailyNutLog
            WHERE user_id = ? AND date = ?`,
            [userId, date]
          );
          const totals = result[0];
          setDailyTotals({
            totalCalories: totals?.totalCalories || 0,
            totalProtein: totals?.totalProtein || 0,
            totalCarbs: totals?.totalCarbs || 0,
            totalFat: totals?.totalFat || 0,
          });
          const entriesRes = await db.getAllAsync(
            `SELECT COUNT(*) as count FROM dailyNutLog WHERE user_id = ? AND date = ?`,
            [userId, date]
          );
          setHasEntries(entriesRes[0]?.count > 0);
          const workoutRes = await db.getAllAsync(
            `SELECT COUNT(*) as count FROM workoutLog WHERE user_id = ? AND date = ?`,
            [userId, date]
          );
          setHasWorkout(workoutRes[0]?.count > 0);
        } catch (error) {
          console.error('Error loading data:', error);
        }
      })();
    }, [db, userId]);

  const renderItem = ({ item }) => {
    if (item.primaryMuscles) {
      return (
        <TouchableOpacity 
        style={styles.card}
        onPress={() => {
          setExerciseItem(item)
          setExerciseInfoModal(true)
          }}>
          <Text style={standards.regularText}>{item.name}</Text>
          <Text style={standards.smallText}>Equipment: {item.equipment}</Text>
          <Text style={standards.smallText}>Primary Muscle: {item.primaryMuscles}</Text>
        </TouchableOpacity>
      )
    } else {
      return (
        <TouchableOpacity 
        style={styles.card}
        onPress={() => {
          setExerciseItem(item)
          setExerciseInfoModal(true)
          }}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={standards.regularText}>{item.name}</Text>
            <TouchableOpacity onPress={() => deleteExercise(item.id)}>
              <Image style={{width: 20, height: 20}} source={require('../../assets/images/white-trash-can.png')}/>
            </TouchableOpacity>
          </View>
          <Text style={standards.smallText}>Equipment: {item.equipment}</Text>
          <Text style={standards.smallText}>Primary Muscle: {item.primaryMuscle}</Text>
        </TouchableOpacity>
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
        <Text style={standards.regularText}>{displayLabel}</Text>
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
    let template = {}
    try {
      template = JSON.parse(item.data)
    }
    catch (e) {
      template = item.data
    }

    if (userTemplates.includes(item)) {
      return (
        <View>
          <TouchableOpacity onPress = {() => {if (!isOngoingWorkout) manageTemplate(item)}} style={styles.templateBox}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={standards.headerText}>{item.name}</Text>
              <TouchableOpacity onPress = {() => {deleteTemplate(item.id)}}>{/*<Text style={standards.regularText}>Delete</Text>*/}<Image style={{width: 25, height: 25}} source={require('../../assets/images/white-trash-can.png')}/></TouchableOpacity>
            </View>

            {template.exercises.slice(0, 3).map((exercise, idx) => (
              <Text key={exercise.id || idx} style={standards.smallText}>
                {exercise.name} ({exercise.sets.length} sets)
              </Text>
            ))}
            {(template.exercises.length > 3) ?
              <Text style={standards.smallText}>[...]</Text>
            : null}

          </TouchableOpacity>
          <View style={{padding: 5}}/>
        </View>
      )
    }
    else {
      return (
        <View>
          <TouchableOpacity onPress = {() => {if (!isOngoingWorkout) manageTemplate(item)}} style={styles.templateBox}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={standards.headerText}>{item.name}</Text>
            </View>

            {template.exercises.slice(0, 3).map((exercise, idx) => (
              <Text key={exercise.id || idx} style={standards.smallText}>
                {exercise.name} ({exercise.sets.length} sets)
              </Text>
            ))}
            {(template.exercises.length > 3) ?
              <Text style={standards.smallText}>[...]</Text>
            : null}

          </TouchableOpacity>
          <View style={{padding: 5}}/>
        </View>
      )
    }
    
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

  const manageTemplate = (t) => {
    setSelectedTemplate(t);
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
          <WorkoutOnboardModal isVisible={isWorkoutOnboardModal} onClose={() => setWorkoutOnboardModal(false)}/>
          {/* Exercise List Modal */}
          <Modal
          visible={modalVisible}
          transparent={true}
          
          onRequestClose={() => {
            setModalVisible(!modalVisible)
          }}>
            <BlurView intensity={25} style={[styles.centeredView]}>
              <View style={styles.modalView}>
                <TouchableOpacity style={{padding: 5}} onPress={() => setModalVisible(false)}>
                  <Image style={{width: '20', height: '20'}} source={require('../../assets/images/xButton.png')}/>
                </TouchableOpacity>

                <Text style={[standards.headerText, {paddingBottom: 5}]}>Exercises</Text>
                <TextInput
                style={styles.searchBar}
                onChangeText={setSearchText}
                value={searchText}
                placeholder='Search'
                placeholderTextColor={'#000'}
                />

                <View style={{flexDirection: 'row', justifyContent: 'space-evenly', padding: 10}}>
                  <TouchableOpacity style={styles.filterButton} onPress={() => {setMuscleFilterModal(true)}}>
                    <Text style={standards.regularText}>{mFilterButtonVal}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.filterButton} onPress={() => {setEquipmentFilterModal(true)}}>
                    <Text style={standards.regularText}>{eFilterButtonVal}</Text>
                  </TouchableOpacity>
                </View>

                {/* Display Custom exercises if exists */}
                {(customExercises.length > 0) ? (
                  <SectionList
                  sections={[{title: 'Custom Exercises', data: customExercises}, {title: 'Exercise List', data: filteredExercises}]}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                  renderSectionHeader={({section: {title}}) => (
                    <Text style={standards.headerText}>{title}</Text>
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
                  <BlurView intensity={25} style={[styles.centeredView, {backgroundColor: 'rgba(0,0,0,0)'}]}>
                    <View style={[styles.modalView, {gap: 20, height: 'auto', maxHeight: '85%'}]}>
                      <TouchableOpacity onPress={() => setExerciseInfoModal(false)}>
                        <Image style={{width: '20', height: '20'}} source={require('../../assets/images/xButton.png')}/>
                      </TouchableOpacity>
                      <Text style={standards.headerText}>{exerciseItem.name}</Text>
                      <Text style={standards.regularText}>Instructions</Text>
                      <ScrollView style={{scrollEnabled: true}}>
                        <Text style={standards.regularText}>{displayInstructions(exerciseItem.instructions)}</Text>
                      </ScrollView>

                    </View>
                  </BlurView>
                </Modal>

              </View>
            </BlurView>
          </Modal>

          {/* Template Clicked Modal */}
          <Modal
            visible={manageTemplateModal}
            transparent={true}
            onRequestClose={() => setManageTemplateModal(false)}
          >
            <BlurView intensity={25} style={styles.centeredView}>
              <View style={styles.alertView}>
                <Text style={standards.regularText}>
                  {selectedTemplate ? `Do you want to start your ${selectedTemplate.name} workout?` : ''}
                </Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                  <TouchableOpacity style={styles.button} onPress={() => {
                    setWorkoutModal(true)
                    setManageTemplateModal(false)
                    setIsOngoingWorkout(true)}}>
                    <Text style={standards.smallText}>Start</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={() => setManageTemplateModal(false)}>
                    <Text style={standards.smallText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </Modal>

          {/* Workout Modal */}
          <WorkoutModal 
            workoutModal={workoutModal} 
            setWorkoutModal={setWorkoutModal} 
            userTemplates={userTemplates}
            template={selectedTemplate}
            finishWorkout={finishWorkout}
          />

          {/* Exercise Creation Modal */}
          <ExerciseCreationModal
            visibility={exerciseCreation}
            setVisibility={setExerciseCreation}
          />

          <View style={styles.content}>
          {dailyTotals && (
            <JimRatWorkout
            dailyTotals={dailyTotals}
            targets={{
              calorieTarget: cals,
              proteinTarget: Math.round((cals * 0.25) / 4),
              carbsTarget: Math.round((cals * 0.45) / 4),
              fatTarget: Math.round((cals * 0.30) / 9),
            }}
            streak={streak}
            hasEntries={hasEntries}
            hasWorkout={hasWorkout}
          />
          )}
          </View>

          <Text style={[standards.headerText, {paddingHorizontal: 10}]}>Templates</Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 5}}>
            <TouchableOpacity style={styles.button} onPress ={() => setExerciseCreation(true)}><Text style={standards.smallText}>+ Exercise</Text></TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress ={() => router.push('/createTemplate')}><Text style={standards.smallText}>+ Template</Text></TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress ={() => setModalVisible(true)}><Text style={standards.smallText}>Exercise List</Text></TouchableOpacity>
          </View>

          {/* View Ongoing Workout Button */}
          {isOngoingWorkout ? (
            <View>
              <TouchableOpacity 
              style={{backgroundColor: '#375573', padding: 10, width: '90%', alignSelf: 'center', borderRadius: 10, alignItems: 'center'}}
              onPress={() => setWorkoutModal(true)}
              >
                <Text style={standards.smallText}>View Ongoing Workout</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={{paddingVertical: 5}}/>
          
          {/* Display Custom Templates if exists */}
          {(presetTemplates.length > 0) ? (
            <SectionList
            sections={[{title: 'Custom Templates', data: userTemplates}, {title: 'Example Templates', data: presetTemplates}]}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTemplate}
            style={{padding: 10}}
            renderSectionHeader={({section: {title}}) => (
              <View>
                <Text style={standards.headerText}>{title}</Text>
                <View style={{padding: 5}}/>
              </View>
            )}
            />
          ) : (
            <FlatList
            data={userTemplates}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTemplate}
            style={{padding: 10}}
            />
          )}

          {/*<FlatList
          data={userTemplates}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTemplate}
          style={{padding: 10}}
          ItemSeparatorComponent={<View style={{padding: 5}}/>}
          />*/}
        </SafeAreaView>
        </View>
        {/*<NavBar />*/}
    </SafeAreaProvider>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalView: {
    height: '85%',
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
    gap: 20
  },
  xButton: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold'
  },
  card: {
    flex: 1,
    backgroundColor: '#375573',
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
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
    color: '#000',
    fontSize:16,
    fontWeight:'600',
    letterSpacing:0.3
  },
  filterButton: {
    backgroundColor: '#375573',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
  },
  filterView: {
    flex: 1,
    backgroundColor: '#375573',
    borderRadius: 10,
    justifyContent: 'center',
    maxHeight: '70%'
  },
  filterButtonText: {
    flex: 1,
    fontSize:16,
    fontWeight:'600',
    color:'#e0e0e0',
    letterSpacing:0.3
  },
  button: {
    backgroundColor: '#375573',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    fontSize: 20,
  },
  templateBox: {
    padding: 10,
    backgroundColor: '#375573',
    borderRadius: 10,
    gap: 5
  },
  
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