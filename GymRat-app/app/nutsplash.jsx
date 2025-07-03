import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const data = [
    { id: 'weight', title: 'Current Weight', val: 0.0 },
    { id: 'height', title: 'Height', val: [0, 0] },
    { id: 'dob', title: 'Date of Birth', val: 'MM/DD/YYYY' },
    { id: 'gender', title: 'Gender', val: 'Gender'},
    { id: 'activityLevel', title: 'Activity Level', val: 'None' },
]



const nutsplash = () => {
    // For Weight
    const [showWeight, setShowWeight] = React.useState(false)
    const [weightVal, setWeightVal] = React.useState('')

    const handleWeightPress = () => {
        const weightItem = data.find(item => item.id === 'weight')
        if (weightItem) {
            setWeightVal(weightItem.val)
        }
        setShowWeight(true)
    }

    // For Height
    const [showHeight, setShowHeight] = React.useState(false)
    const [heightVal, setHeightVal] = React.useState(['', ''])

    const handleHeightPress = () => {
        const heightItem = data.find(item => item.id === 'height')
        if (heightItem) {
            setHeightVal(heightItem.val)
        }
        setShowHeight(true)
    }

    const renderItem = ({ item }) => {
        let displayValue = item.val;
        if (item.id === 'weight') { displayValue = item.val + " lbs" }
        else if (item.id === 'height') { displayValue = item.val[0] + `'` + item.val[1] + `"`; }

        return (
            <TouchableOpacity 
                style={styles.button} 
                onPress={
                    item.id === 'weight' ? handleWeightPress
                    : item.id === 'height' ? handleHeightPress
                    : undefined
                }>
                <Text style={{color: '#fff', fontSize: 20, padding: 10}}>{item.title}</Text>
                <Text style={{color: '#fff', fontSize: 20, padding: 10}}>{displayValue}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <LinearGradient style={styles.container} colors={["#32a852","#1a1b1c"]}>
                    <FlatList 
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    />
                    {showWeight && <CurrentWeight weight={weightVal} />}
                    {showHeight && <Height height={heightVal} />}
                </LinearGradient>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

const CurrentWeight = ({ weight }) => {
    const [tempWeight, setTempWeight] = React.useState(weight)
    const Increase = () => setTempWeight(prevWeight => prevWeight + 1);
    const Decrease = () => setTempWeight(prevWeight => {
        if (prevWeight <= 0) {
            return 0; // Prevent going below 0
        } else {
            return prevWeight - 1;
        }
    });
    return(
        <View style={{color: 'transparent', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <View style={styles.inputContainer}>
                <Text style={{color: '#fff', fontSize: 28, fontWeight: 'bold'}}>Current Weight</Text>

                <View style={{color: '#232f30', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, paddingVertical: 10}}>
                    <TouchableOpacity onPress={Decrease}>
                        <Text style={styles.text}>-</Text>
                    </TouchableOpacity>
                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '50%'}}>
                        <TextInput 
                            style={[styles.numInput, { width: '30%' }]}
                            keyboardType="numeric"
                            placeholder='0'
                            value={tempWeight.toString()}
                            onChangeText={text => setTempWeight(parseInt(text) || '')} // Ensure it stays a number
                            maxLength={3} // Limit to 3 digits
                        />
                        <Text style={styles.text}> lbs</Text>
                    </View>
                    <TouchableOpacity onPress={Increase}>
                        <Text style={styles.text}>+</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={() => {
                    weight = tempWeight
                    router.replace('/nutsplash')
                }}>
                    <Text style={styles.navButtonText}>Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const Height = ({ height }) => {
    const [tempHeight, setTempHeight] = React.useState(height)
    const Increase = () => setTempHeight(prevHeight => {
        if (prevHeight[1] > 10) {
            return [prevHeight[0] + 1, 0]
        }
        else {
            return [prevHeight[0],prevHeight[1] + 1]
        }
    });
    const Decrease = () => setTempHeight(prevHeight => {
        if (prevHeight[0] <= 0) {
            if (prevHeight[1] <= 0) {
                return [0, 0]
            }
            else {
                return [0, prevHeight[1] - 1]
            }
        }
        if (prevHeight[1] <= 0) {
            return [prevHeight[0] - 1, 11] // Prevent going below 0
        } else {
            return [prevHeight[0], prevHeight[1] - 1]
        }
    });

    return (
        <View style={{color: 'transparent', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <View style={styles.inputContainer}>
                <Text style={{color: '#fff', fontSize: 28, fontWeight: 'bold'}}>Height</Text>

                <View style={{color: '#232f30', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, paddingVertical: 10}}>
                    <TouchableOpacity onPress={Decrease}>
                        <Text style={styles.text}>-</Text>
                    </TouchableOpacity>
                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '50%'}}>
                        <TextInput 
                            style={[styles.numInput, { width: '10%' }]}
                            keyboardType="numeric"
                            value={tempHeight[0].toString()}
                            placeholder='0'
                            onChangeText={ text => {
                                const newFeet = parseInt(text) || '';
                                setTempHeight([newFeet, tempHeight[1]])
                            }} // Ensure it stays a number
                            maxLength={1} // Limit to 1 digits
                        />
                        <Text style={styles.text}> ' </Text>

                        <TextInput 
                            style={[styles.numInput, { width: '20%' }]}
                            keyboardType="numeric"
                            value={tempHeight[1].toString()}
                            placeholder='0'
                            onChangeText={text => {
                                let newInches = parseInt(text) || '';
                                if (newInches > 11) {
                                    newInches = 11;
                                }
                                setTempHeight([tempHeight[0], newInches]);
                            }} // Ensure it stays a number
                            maxLength={2} // Limit to 1 digits
                        />
                        <Text style={styles.text}>"</Text>
                    </View>
                    <TouchableOpacity onPress={Increase}>
                        <Text style={styles.text}>+</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={() => {
                    height = tempHeight
                    router.replace('/nutsplash')
                }}>
                    <Text style={styles.navButtonText}>Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default nutsplash

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#1a1b1c',
        justifyContent: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#232f30',
        paddingVertical: 10,
        borderBottomColor: '#1a1b1c',
        borderBottomWidth: 2,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1,
    },
    inputContainer: {
        backgroundColor: '#232f30',
        width: '75%',
        height: '25%',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 2,
        padding: 10,
    },
    navButton: {
        marginTop: 20,
        backgroundColor: '#232f30',
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 4,
    },
    navButtonText: {
        color: '#fff',
        fontSize: 18,
    },
    saveButton: {
        backgroundColor: '#32a852',
        paddingVertical: 10,
        width: '50%',
        alignItems: 'center',
        borderRadius: 4,
        marginTop: 10,
    },
    numInput: {
        height: 40,
        padding: 0,
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
})