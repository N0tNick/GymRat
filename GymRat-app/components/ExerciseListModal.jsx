import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, FlatList, Modal, ScrollView, SectionList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

export default function ExerciseListModal({
  visible,
  onClose,
  exercises,
  schema,
  selectedExercises = [],
  onSelect,
  ...props
}) {

  const db = useSQLiteContext()

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
              <Image style={{width: 20, height: 20}} source={require('../assets/images/white-trash-can.png')}/>
            </TouchableOpacity>
          </View>
          <Text style={standards.smallText}>Equipment: {item.equipment}</Text>
          <Text style={standards.smallText}>Primary Muscle: {item.primaryMuscle}</Text>
        </TouchableOpacity>
      )
    }
    
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
    if (!Array.isArray(instructions)) return 'No instructions available.'
    let instructionText = ''
    for (let i = 0; i < instructions.length; i++) {
      instructionText += i+1 + '. ' + instructions[i] + '\n\n'
    }
    return instructionText
  }

  const [searchText, setSearchText] = useState('')
  const [filteredExercises, setFilteredExercises] = useState(exercises)
  const [muscleFilterModal, setMuscleFilterModal] = useState(false)
  const [equipmentFilterModal, setEquipmentFilterModal] = useState(false)
  const [mFilterButtonVal, setMFilterButtonVal] = useState('Any Muscle')
  const [eFilterButtonVal, setEFilterButtonVal] = useState('Any Equipment')
  const [exerciseInfoModal, setExerciseInfoModal] = useState(false)
  const [exerciseItem, setExerciseItem] = useState('')
  const [customExercises, setCustomExercises] = useState([])

  

    useEffect(() => {
      const filtered = exercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(searchText.toLowerCase())
      )
      setFilteredExercises(filtered)
      setEFilterButtonVal('Any Equipment')
      setMFilterButtonVal('Any Muscle')
    }, [searchText])

  const loadExercises = async() => {
    const result2 = await db.getAllAsync("SELECT * FROM customExercises;")
    setCustomExercises(result2)
  }

  useFocusEffect(
    useCallback(() => {
      loadExercises()
    }, [])
  )

  return (
    <Modal visible={visible} transparent={true} animationType='fade' onRequestClose={() => onClose}>
        <BlurView intensity={25} style={[styles.centeredView]}>
        <View style={styles.modalView}>
          <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
            <TouchableOpacity style={{padding: 5}} onPress={() => {
              //onSelect() //clear selected exercises
              onClose()
              }}>
                <Image style={{width: '20', height: '20'}} source={require('../assets/images/xButton.png')}/>
              </TouchableOpacity>
            <TouchableOpacity style={{padding: 5}} onPress={() => {
              onClose()
            }}>
              <Image style={{width: '25', height: '25'}} source={require('../assets/images/check-mark.png')}/>
            </TouchableOpacity>
          </View>
        

        <Text style={[standards.headerText, {paddingBottom: 5}]}>Exercises</Text>
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
            {/* <View style={[styles.filterView]}>
                
                <FlatList
                scrollEnabled={true}
                data={schema.properties.primaryMuscles.items[0].enum}
                keyExtractor={(item, index) => (item == null ? `null-${index}` : item.toString())}
                renderItem={renderFilterItem('muscle')}
                />
                

            </View> */}
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
            {/* <View style={[styles.filterView]}>
                
                <FlatList
                scrollEnabled={true}
                data={schema.properties.equipment.enum}
                keyExtractor={(item, index) => (item == null ? `null-${index}` : item.toString())}
                renderItem={renderFilterItem('equipment')}
                />
                

            </View> */}
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
                  <Image style={{width: '20', height: '20'}} source={require('../assets/images/xButton.png')}/>
                </TouchableOpacity>
                <Text style={standards.headerText}>{exerciseItem.name}</Text>
                <Text style={standards.regularText}>Instructions</Text>
                <ScrollView style={{scrollEnabled: true}}>
                <Text style={standards.regularText}>{displayInstructions(exerciseItem.instructions)}</Text>
                </ScrollView>
                <TouchableOpacity style={styles.button}
                onPress={() => {
                  if (!selectedExercises.some(ex => ex.id === exerciseItem.id)) {
                    onSelect([...selectedExercises, exerciseItem])
                  }
                  setExerciseInfoModal(false)}}>
                  <Text style={standards.regularText}>
                    Add Exercise
                  </Text>
                </TouchableOpacity>

            </View>
          </BlurView>
        </Modal>

        </View>
    </BlurView>

    </Modal>
    
  );
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
  xButton: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  card: {
    flex: 1,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#375573',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  title: {
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