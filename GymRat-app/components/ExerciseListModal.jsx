import { useEffect, useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ExerciseListModal({
  visible,
  onClose,
  exercises,
  schema,
  selectedExercises = [],
  onSelect,
  ...props
}) {
  const renderItem = ({ item }) => (
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

  

    useEffect(() => {
      const filtered = exercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(searchText.toLowerCase())
      )
      setFilteredExercises(filtered)
      setEFilterButtonVal('Any Equipment')
      setMFilterButtonVal('Any Muscle')
    }, [searchText])

  return (
    <Modal visible={visible} transparent={true} onRequestClose={() => onClose}>
        <View style={[styles.centeredView]}>
        <View style={styles.modalView}>
          <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
            <TouchableOpacity style={{backgroundColor: '#1478db', paddingHorizontal: 10, justifyContent: 'center', borderRadius: 5}} onPress={() => {
              onSelect() //clear selected exercises
              onClose()
              }}><Text style={[styles.xButton, {color: '#fff'}]}>X</Text></TouchableOpacity>
            <TouchableOpacity style={{backgroundColor: '#1478db', paddingHorizontal: 10, height: 35, justifyContent: 'center', borderRadius: 5}}
            onPress={() => {
              onClose()
            }}><Text style={[styles.xButton, {color: '#fff'}]}>Save</Text></TouchableOpacity>
          </View>
        

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

        <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
        />

        <Modal
        visible={muscleFilterModal}
        transparent={true}

        onRequestClose={() => { setMuscleFilterModal(!muscleFilterModal) }}>
            <View style={[styles.centeredView]}>
            <View style={[styles.filterView, {maxHeight: 595}]}>
                
                <FlatList
                scrollEnabled={false}
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
            <View style={[styles.filterView, {maxHeight: 490}]}>
                
                <FlatList
                scrollEnabled={false}
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
                <TouchableOpacity style={{backgroundColor: '#1478db', borderRadius: 10, alignItems: 'center'}}
                onPress={() => {
                  if (!selectedExercises.some(ex => ex.id === exerciseItem.id)) {
                    onSelect([...selectedExercises, exerciseItem])
                  }
                  setExerciseInfoModal(false)}}>
                  <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 20, padding: 10}}>
                    Add Exercise
                  </Text>
                </TouchableOpacity>

            </View>
            </View>
        </Modal>

        </View>
    </View>

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
    fontSize: 20,
    fontWeight: 'bold'
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
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
    height: 35,
    justifyContent: 'center',
    fontSize: 20
  },
  filterView: {
    backgroundColor: '#999',
    borderRadius: 10,
    justifyContent: 'center',
    fontSize: 20,
  },
  filterButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#1478db',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    fontSize: 20,
  }
});