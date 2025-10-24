import React, { useState, useEffect, useCallback } from 'react';
import { BlurView } from 'expo-blur';
import { StyleSheet, FlatList, SectionList, Dimensions, TouchableOpacity, Image, View, Modal, Pressable, Text, TextInput, ScrollView } from 'react-native';
import { Layout, Tab, TabView } from '@ui-kitten/components'
import { useFocusEffect, useRouter } from 'expo-router';
import Calendar from './ProfileCalendar'
import { QuestionModal1, QuestionModal2, QuestionModal3, WeightTouchable ,GoalWeightTouchable, BodyFatTouchable, BMRTouchable } from './bodyTabModals'
import { useSQLiteContext } from 'expo-sqlite';
import LineChart from './weightHistoryChart'
import standards from '../ui/appStandards'
import addButton from '../../assets/images/add-button.png'
import exercises from '../../assets/exercises.json';
import schema from '../../assets/schema.json';


const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

const TopTab = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isQuestionModal1Visible, setQuestionModal1Visible] = useState(false);
  const [isQuestionModal2Visible, setQuestionModal2Visible] = useState(false);
  const [isQuestionModal3Visible, setQuestionModal3Visible] = useState(false);
  const [isWeightTouchableVisible, setWeightTouchableVisible] = useState(false);
  const [isGoalWeightTouchableVisible, setGoalWeightTouchableVisible] = useState(false);
  const [isBodyFatTouchableVisible, setBodyFatTouchableVisible] = useState(false);
  const [isBMRTouchableVisible, setBMRTouchableVisible] = useState(false);
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
  const [isTemplatePreset, setIsTemplatePreset] = useState(false)


  const router = useRouter();
  const [weight, setWeight] = useState('')
  const [lastWeight, setLastWeight] = useState(null) 
  
  const [goalWeight, setGoalWeight] = useState('')
  const [lastGoalWeight, setLastGoalWeight] = useState(null) 

  const [BMI, setBMI] = useState('')
  const [lastBMI, setLastBMI] = useState(null) 

  const [body_fat, setBodyFat] = useState('')
  const [lastBodyFat, setLastBodyFat] = useState(null)
  
  const [BMR, setBMR] = useState('')
  const [lastBMR, setLastBMR] = useState(null) 
  
  const db = useSQLiteContext()

  // New state for Exercise Goal modal and inputs
  const [exerciseGoalModalVisible, setExerciseGoalModalVisible] = useState(false);
  const [goalWeightInput, setGoalWeightInput] = useState('');
  const [goalRepsInput, setGoalRepsInput] = useState('');
  const [savingExerciseGoal, setSavingExerciseGoal] = useState(false);
  const [goalError, setGoalError] = useState(null);
  // New: hold saved exercise goals
  const [exerciseGoals, setExerciseGoals] = useState([])


  // Open goal modal for selected exercise
  const openExerciseGoalModal = (item) => {
    setExerciseItem(item);
    setGoalWeightInput('');
    setGoalRepsInput('');
    setGoalError(null);
    setModalVisible(false); // close the selection modal to avoid stacked overlays
    setExerciseGoalModalVisible(true);
  };

  // Persist the goal to the DB
  const saveExerciseGoal = async () => {
    try {
      setGoalError(null);
      const weightVal = parseFloat(goalWeightInput);
      const repsVal = parseInt(goalRepsInput, 10);

      if (Number.isNaN(weightVal) || Number.isNaN(repsVal)) {
        setGoalError('Enter valid numbers for weight and reps.');
        return;
      }

      // Ensure table exists
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS userExerciseGoals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          exercise_id TEXT NOT NULL,
          weight REAL,
          reps INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Get user id
      const user = await db.getFirstAsync('SELECT id FROM users');
      if (!user || !user.id) {
        setGoalError('No user found.');
        return;
      }

      // Insert goal
      setSavingExerciseGoal(true);
      await db.runAsync(
        'INSERT INTO userExerciseGoals (user_id, exercise_id, weight, reps) VALUES (?, ?, ?, ?)',

        [user.id, exerciseItem?.id ?? String(exerciseItem?.name ?? ''), weightVal, repsVal]
      );

      setSavingExerciseGoal(false);
      setExerciseGoalModalVisible(false);
      // New: refresh goals after save
      fetchExerciseGoals();
    } catch (err) {
      console.error('Error saving exercise goal:', err);
      setSavingExerciseGoal(false);
      setGoalError('Failed to save. Try again.');
    }
  };

  // New: fetch saved exercise goals
  const fetchExerciseGoals = async () => {
    try {
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS userExerciseGoals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          exercise_id TEXT NOT NULL,
          weight REAL,
          reps INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const user = await db.getFirstAsync('SELECT id FROM users');
      if (!user || !user.id) return;

      const rows = await db.getAllAsync(
        'SELECT * FROM userExerciseGoals WHERE user_id = ? ORDER BY created_at DESC, id DESC',
        [user.id]
      );
      setExerciseGoals(rows ?? []);
    } catch (e) {
      console.error('Error fetching exercise goals:', e);
    }
  };

  const renderItem = ({ item }) => {
      if (item.primaryMuscles) {
        return (
          <TouchableOpacity 
          style={styles.card}
          onPress={() => {
            openExerciseGoalModal(item)
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
            openExerciseGoalModal(item)
          }}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={standards.regularText}>{item.name}</Text>
              <TouchableOpacity onPress={() => deleteExercise(item.id, item.name)}>
                <Image style={{width: 20, height: 20}} source={require('../../assets/images/white-trash-can.png')}/>
              </TouchableOpacity>
            </View>
            <Text style={standards.smallText}>Equipment: {item.equipment}</Text>
            <Text style={standards.smallText}>Primary Muscle: {item.primaryMuscle}</Text>
          </TouchableOpacity>
        )
      }
      
  }

  // Implement the goal modal (rendered below)
  const exerciseGoalModal = () => (
    <Modal
      visible={exerciseGoalModalVisible}
      transparent={true}
      animationType='fade'
      onRequestClose={() => setExerciseGoalModalVisible(false)}
    >
      <BlurView intensity={25} style={[styles.centeredView]}>
        <View style={[styles.modalView, {height: 'auto', maxHeight: '85%'}]}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
            <Text style={standards.headerText}>Set Goal</Text>
            <TouchableOpacity style={{padding: 5}} onPress={() => setExerciseGoalModalVisible(false)}>
              <Image style={{width: 20, height: 20}} source={require('../../assets/images/xButton.png')}/>
            </TouchableOpacity>
          </View>

          <Text style={[standards.regularText, {marginTop: 10}]}>
            {exerciseItem?.name ?? 'Exercise'}
          </Text>

          <View style={{marginTop: 10, gap: 10}}>
            <View>
              <Text style={standards.smallText}>Weight (lbs)</Text>
              <TextInput
                style={styles.searchBar}
                keyboardType='numeric'
                value={goalWeightInput}
                onChangeText={setGoalWeightInput}
                placeholder='e.g., 135'
                placeholderTextColor={'#000'}
              />
            </View>
            <View>
              <Text style={standards.smallText}>Reps</Text>
              <TextInput
                style={styles.searchBar}
                keyboardType='numeric'
                value={goalRepsInput}
                onChangeText={setGoalRepsInput}
                placeholder='e.g., 8'
                placeholderTextColor={'#000'}
              />
            </View>
          </View>

          {goalError ? (
            <Text style={[standards.smallText, {color:'#ff6b6b', marginTop: 8}]}>{goalError}</Text>
          ) : null}

          <View style={{flexDirection:'row', justifyContent:'flex-end', gap: 10, marginTop: 15}}>
            <TouchableOpacity style={styles.button} onPress={() => setExerciseGoalModalVisible(false)}>
              <Text style={standards.regularText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={saveExerciseGoal} disabled={savingExerciseGoal}>
              <Text style={standards.regularText}>{savingExerciseGoal ? 'Saving...' : 'Save Goal'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );

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

  useEffect(() => {
    fetchUserStats()
    // New: also fetch goals on mount
    fetchExerciseGoals()
    const intervalId = setInterval(() => {
      fetchUserStats()
    }, 5000)
    return () => clearInterval(intervalId)
  }, []);
  
  const fetchUserStats = async () => {
    try {
      const user = await db.getFirstAsync('SELECT id FROM users');

      if (!user) {
        console.log("no user found")
        return;
      }

      const result = await db.getFirstAsync('SELECT * FROM userStats WHERE user_id = ?', [user.id]);

      //console.log(result)
      if (result) {
        setLastWeight(result['weight']) 
        setLastGoalWeight(result['goal_weight'])
        setLastBodyFat(result['body_fat'])
        setLastBMI(result['BMI']) 
        setLastBMR(result['BMR']) 
      } else {
        await db.runAsync('INSERT INTO userStats (user_id) VALUES (?)',[user.id]);
      }

    } catch (error) {
      console.error('Error fetching profile values:', error)
    }
  }

  // either putting values in during onboarding will fix this or a 
  // merger needs to be put in layour to force the table to exist
  
    useFocusEffect(
      useCallback(() => {
      }, [])
    )
  return (
      <TabView 
      selectedIndex={selectedIndex} 
      onSelect={index => setSelectedIndex(index)} 
      indicatorStyle={{height:0}}
      style={{backgroundColor: '#2c2c2e', borderTopWidth:2,borderColor:'#6a5acd'}}
      tabBarStyle={styles.tabBarStyle}
      >
        <Tab 
          title={evaProps => <Text {...evaProps} style={[standards.headerText]}>Overview</Text>}
          style={[styles.tabBase, selectedIndex === 0 && styles.activeTab]} 
        >         
          <Layout style={styles.tabContainer}>
              <Calendar/>

              {/* Exercise selection modal */}
              <Modal
                visible={modalVisible}
                transparent={true}
                animationType='fade'
                onRequestClose={() => {
                  setModalVisible(!modalVisible)
                }}>
                  <BlurView intensity={25} style={[styles.centeredView]}>
                    <View style={styles.modalView}>
                      <TouchableOpacity style={{padding: 5}} onPress={() => setModalVisible(false)}>
                        <Image style={{width: 20, height: 20}} source={require('../../assets/images/xButton.png')}/>
                      </TouchableOpacity>
              
                      <Text style={[standards.headerText, {paddingBottom: 5}]}>Pick or search an exercise</Text>
                      <TextInput
                      style={styles.searchBar}
                      onChangeText={setSearchText}
                      value={searchText}
                      placeholder='Search'
                      placeholderTextColor={'#000'}
                      />
              
                      <View style={{flexDirection: 'row', justifyContent: 'space-evenly', padding: 10}}>
                        <TouchableOpacity style={styles.button} onPress={() => {setMuscleFilterModal(true)}}>
                          <Text style={standards.regularText}>{mFilterButtonVal}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => {setEquipmentFilterModal(true)}}>
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
                      animationType='fade'
                      onRequestClose={() => { setMuscleFilterModal(!muscleFilterModal) }}>
                        <BlurView intensity={25} style={[styles.centeredView]}>
                          <ScrollView style={{maxHeight: screenHeight * .80, backgroundColor: '#1a1b1c', borderRadius: 8}}>
                            {schema.properties.primaryMuscles.items[0].enum.map((item, index) => (
                              <TouchableOpacity
                              style={styles.button}
                              key={index}
                              onPress={() => {
                                setMFilterButtonVal(item)
                                applyFilters(item, eFilterButtonVal)
                                setMuscleFilterModal(false)
                              }}
                              >
                                <Text style={standards.regularText}>{item}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </BlurView>
                      </Modal>
              
                      <Modal
                      visible={equipmentFilterModal}
                      transparent={true}
                      animationType='fade'
                      onRequestClose={() => { setEquipmentFilterModal(!equipmentFilterModal) }}>
                        <BlurView intensity={25} style={[styles.centeredView]}>
                          <ScrollView style={{maxHeight: screenHeight * .80, backgroundColor: '#1a1b1c', borderRadius: 8}}>
                            {schema.properties.equipment.enum.map((item, index) => {
                              const displayLabel = item == null ? 'No Equipment' : item
              
                              return(
                                <TouchableOpacity
                                style={styles.button}
                                key={index}
                                onPress={() => {
                                  setEFilterButtonVal(displayLabel)
                                  applyFilters(mFilterButtonVal, displayLabel)
                                  setEquipmentFilterModal(false)
                                }}
                                >
                                  <Text style={standards.regularText}>{displayLabel}</Text>
                                </TouchableOpacity>
                              )
                            })}
                          </ScrollView>
                        </BlurView>
                      </Modal>
              
                      <Modal
                      visible={exerciseInfoModal}
                      transparent={true}
                      animationType='fade'
                      onRequestClose={() => { setExerciseInfoModal(!exerciseInfoModal) }}>
                        <BlurView intensity={25} style={[styles.centeredView, {backgroundColor: 'rgba(0,0,0,0)'}]}>
                          <View style={[styles.modalView, {gap: 20, height: 'auto', maxHeight: '85%'}]}>
                            <TouchableOpacity onPress={() => setExerciseInfoModal(false)}>
                              <Image style={{width: 20, height: 20}} source={require('../../assets/images/xButton.png')}/>
                            </TouchableOpacity>
                            <Text style={standards.headerText}>{exerciseItem.name}</Text>
                            <Text style={standards.regularText}>Instructions</Text>
                            <ScrollView style={{scrollEnabled: true}}>
                              {/* Removed incorrect exerciseGoalModal() rendering */}
                              <Text style={standards.regularText}></Text>
                            </ScrollView>
                          </View>
                        </BlurView>
                      </Modal>
              
                    </View>
                  </BlurView>
              </Modal>
              
              {/* Render the Exercise Goal modal */}
              {exerciseGoalModal()}

              {/* Exercise Goals card with list */}
              <View style = {{margin:20, width:screenWidth*0.95, backgroundColor:'#2c2c2e',borderRadius:10,padding:10}}>
                <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                  <Text style = {[standards.regularText, {}]}>Exercise Goals</Text>
                  <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Image style={{width:50, height:50}} source={addButton}/>
                  </TouchableOpacity>
                </View>

                {exerciseGoals?.length ? (
                  <FlatList
                    style={{marginTop:10, maxHeight: screenHeight * 0.3}}
                    data={exerciseGoals}
                    keyExtractor={(item) => String(item.id)}
                    ItemSeparatorComponent={() => <View style={{height:8}}/>}
                    renderItem={({item}) => {
                      const builtIn = exercises.find(ex => ex.id === item.exercise_id);
                      const custom = customExercises.find(ex => ex.id === item.exercise_id);
                      const displayName = builtIn?.name || custom?.name || String(item.exercise_id);
                      return (
                        <View style={[styles.card, {padding:10, marginVertical:0}]}>
                          <Text style={standards.regularText}>{displayName}</Text>
                          <Text style={standards.smallText}>Weight: {item.weight} lbs | Reps: {item.reps}</Text>
                        </View>
                      );
                    }}
                  />
                ) : (
                  <Text style={[standards.smallText, {marginTop:8}]}>No exercise goals yet.</Text>
                )}
              </View>
          </Layout>
        </Tab>
        
        <Tab 
          title={evaProps => <Text {...evaProps} style={[standards.headerText]}>Body</Text>}
          style={[styles.tabBase, selectedIndex === 1 && styles.activeTab]}
        >         
          <Layout style={styles.tabContainer}>
            <View style={{backgroundColor:'#2c2c2e', width:screenWidth*0.95,borderRadius:10, padding:5, marginBottom:20}}>
              <LineChart/>
            </View>
            <View style={{width:screenWidth*0.95,height:screenHeight*0.11, padding:5, marginBottom:20,borderRadius:10,backgroundColor:'#2c2c2e'}}>
              <Text style={[standards.headerText, { paddingLeft:8,paddingTop:3,paddingBottom:5}]}>Progress</Text>
              <View style = {{ flexDirection:'row',justifyContent:'space-between',padding:5,paddingRight:10}}>
                <View style={{paddingLeft:10}}>
                  <WeightTouchable isVisible={isWeightTouchableVisible} onClose={() => setWeightTouchableVisible(false)}/>
                  <View style={{paddingBottom:3}}>
                    <Text style={standards.regularText}>Weight</Text>
                  </View>
                  <Pressable 
                    style = {({ pressed }) => [styles.bodyCompContainers]}
                    onPress={() => setWeightTouchableVisible(true)}> 
                    {({ pressed }) => (
                    <Text style = {[standards.smallText,{color: pressed ? '#6a5acd' : '#e0e0e0'}]}>
                      {lastWeight ? `${lastWeight}` : '__'} lbs
                    </Text> )}
                  </Pressable>
                </View>  

                <View>
                  <GoalWeightTouchable isVisible={isGoalWeightTouchableVisible} onClose={() => setGoalWeightTouchableVisible(false)}/>
                  <View style={{paddingBottom:3}}>
                    <Text category='h6' style={standards.regularText}>Goal Weight</Text>
                  </View>
                  <Pressable 
                    style = {({ pressed }) => [styles.bodyCompContainers]}
                    onPress={() => setGoalWeightTouchableVisible(true)}> 
                    {({ pressed }) => (
                    <Text style = {[standards.smallText,{color: pressed ? '#6a5acd' : '#e0e0e0'}]}>
                      {lastGoalWeight ? `${lastGoalWeight}` : '__'} lbs
                    </Text> )}
                  </Pressable>
                </View>  

              </View>
            </View>

            <View style={{width:screenWidth*0.95,height:screenHeight*0.11, padding:5, marginBottom:20,borderRadius:10,backgroundColor:'#2c2c2e'}}>
              <Text style={[standards.headerText, {paddingLeft:8,paddingTop:3}]}>Composition</Text>
              <View style = {{ flexDirection:'row',justifyContent:'space-between',padding:10}}>
                   
                <View style={{flexDirection:'row'}}>
                <View style={{flexDirection:'column',paddingRight:5}}>
                  <QuestionModal1 isVisible={isQuestionModal1Visible} onClose={() => setQuestionModal1Visible(false)}/>
                  <Text style={standards.regularText}>Body Fat %</Text>
                  <BodyFatTouchable isVisible={isBodyFatTouchableVisible} onClose={() => setBodyFatTouchableVisible(false)}/>
                  <Pressable 
                    style = {({ pressed }) => [styles.bodyCompContainers]}
                    onPress={() => setBodyFatTouchableVisible(true)}> 
                    {({ pressed }) => (
                    <Text style = {[standards.smallText,{textAlign:'center'},{color: pressed ? '#6a5acd' : '#e0e0e0'}]}>
                      {lastBodyFat ? `${lastBodyFat}` : '__'}%
                    </Text> )}
                  </Pressable>
               </View>
                <TouchableOpacity 
                  style ={styles.logoContainer}
                  onPress={() => setQuestionModal1Visible(true)} >
                  <Image style={styles.logo} source={{uri:'https://upload.wikimedia.org/wikipedia/commons/2/28/Question_mark_white.png'}}/>
                </TouchableOpacity>
              </View> 

              <View style ={{flexDirection:'row'}}>
              <View style={{alignItems:'column',paddingRight:5}}>
                <QuestionModal2 isVisible={isQuestionModal2Visible} onClose={() => setQuestionModal2Visible(false)}/>
                <Text style={standards.regularText}>BMI</Text>
                <View style = {styles.bodyCompContainers}>
                  <Text style = {[standards.smallText,{textAlign:'center'}]}>
                    {lastBMI ? `${lastBMI}` : '__'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style ={styles.logoContainer}
                onPress={() => setQuestionModal2Visible(true)}>
                <Image style={styles.logo} source={{uri:'https://upload.wikimedia.org/wikipedia/commons/2/28/Question_mark_white.png'}}/>
              </TouchableOpacity>
              </View>
 
              <View style={{flexDirection:'row'}}>
                <View style={{alignItems:'column', paddingRight:5}}>
                  <QuestionModal3 isVisible={isQuestionModal3Visible} onClose={() => setQuestionModal3Visible(false)}/>
                  <Text style={standards.regularText}>BMR</Text>
                <BMRTouchable isVisible={isBMRTouchableVisible} onClose={() => setBMRTouchableVisible(false)}/>
                  <Pressable 
                    style = {({ pressed }) => [styles.bodyCompContainers]}
                    onPress={() => setBMRTouchableVisible(true)}> 
                    {({ pressed }) => (
                    <Text style = {[standards.smallText,{textAlign:'left'},{color: pressed ? '#6a5acd' : '#e0e0e0'}]}>
                      {lastBMR ? `${lastBMR}` : '__'}
                    </Text> )}
                  </Pressable>
                  </View>
                  <TouchableOpacity 
                      style ={styles.logoContainer}
                      onPress={() => setQuestionModal3Visible(true)}>
                    <Image style={styles.logo} source={{uri:'https://upload.wikimedia.org/wikipedia/commons/2/28/Question_mark_white.png'}}/>
                  </TouchableOpacity>
              </View>
            </View>
            </View>
          </Layout>
        </Tab>
      </TabView>
    );
}

export default TopTab

const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: '#2c2c2e',
    padding:0,
    margin:0,
    height:screenHeight*0.04
  },
  tabStyle: {
    backgroundColor: 'transparent',
  },
  tabBase: {
    flex:1,
    margin:-4,
    backgroundColor:'transparent',
  },
  activeTab: {
    backgroundColor: '#6a5acd',
  },
  tabText: {
    color: '#e0e0e0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabContainer: {
    height: screenHeight,
    width: screenWidth,
    alignSelf:'center',
    justifyContent:'flex-start',
    flexDirection:'column',
    alignItems: 'center',
    backgroundColor: '#1a1b1c',
    padding:15
  },
  bodyCompContainers: {
    alignSelf:'center',
    height: screenHeight*0.03,
  },
  logoContainer: {
    width: screenWidth*0.05,
    height: screenHeight*0.025,
  },
  logo: {
    width:'100%',
    height:'100%'
  },
  // Modal/backdrop and list styles used by the Exercise List modal
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    height: '85%',
    width: '85%',
    backgroundColor: '#1a1b1c',
    overflow: 'scroll',
    borderRadius: 15,
    padding: 10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#6a5acd',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 10,
    fontSize: 20,
  },
  searchBar: {
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  card: {
    flex: 1,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#6a5acd',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});

const textStyles = StyleSheet.create({
  compText: {
    paddingLeft: 5, 
    color:'#e0e0e0', 
    position: 'absolute', 
    fontWeight: 'bold', 
    fontSize: 18
  },

  compTitlesText: {
    marginTop:30,
    paddingLeft:10,
    color:'#e0e0e0', 
    fontWeight:'600', 
    fontSize: 16
  },
  compBodyText: {
    marginTop:10, 
    paddingLeft:15,
    color:'#e0e0e0', 
    position:'absolute', 
    fontWeight:'normal',
    fontSize:16, 
  }
})

