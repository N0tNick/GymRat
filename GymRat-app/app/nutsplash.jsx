import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { React, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import standards from '../components/ui/appStandards'

const { height: ScreenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

export const data = [
    { id: 'weight', title: 'Current Weight', val: 0.0 },
    { id: 'height', title: 'Height', val: [0, 0] },
    { id: 'dob', title: 'Date of Birth', val: [1, 1, 1900] },
    { id: 'gender', title: 'Gender', val: 'Gender'},
    { id: 'activityLevel', title: 'Activity Level', val: 'None' },
];

const nutsplash = () => {
    // For Weight
    const [showWeight, setShowWeight] = useState(false)
    const [weightVal, setWeightVal] = useState('')

    const handleWeightPress = () => {
        const weightItem = data.find(item => item.id === 'weight')
        if (weightItem) {
            setWeightVal(weightItem.val)
        }
        setShowWeight(true)
    }

    // For Height
    const [showHeight, setShowHeight] = useState(false)
    const [heightVal, setHeightVal] = useState(['', ''])

    const handleHeightPress = () => {
        const heightItem = data.find(item => item.id === 'height')
        if (heightItem) {
            setHeightVal(heightItem.val)
        }
        setShowHeight(true)
    }

    // For DOB
    const [showDob, setShowDob] = useState(false)
    const [dobVal, setDobVal] = useState(['','',''])

    const handleDobPress = () => {
        const dobItem = data.find(item => item.id === 'dob')
        if (dobItem) {
            setDobVal(dobItem.val)
        }
        setShowDob(true)
    }

    // For Gender
    const [showGender, setShowGender] = useState(false)
    const [genderVal, setGenderVal] = useState('')

    const handleGenderPress = () => {
        const genderItem = data.find(item => item.id === 'gender')
        if (genderItem) {
            setGenderVal(genderItem.val)
        }
        setShowGender(true)
    }

    // For Activity Level
    const [showActLevel, setShowActLevel] = useState(false)
    const [actLevelVal, setActLevelVal] = useState('')

    const handleActLevelPress = () => {
        const actLevelItem = data.find(item => item.id === 'activityLevel')
        if (actLevelItem) {
            setActLevelVal(actLevelItem.val)
        }
        setShowActLevel(true)
    }

    const renderItem = ({ item }) => {
        let displayValue = item.val;
        if (item.id === 'weight') { displayValue = item.val + " lbs" }
        else if (item.id === 'height') { displayValue = item.val[0] + `'` + item.val[1] + `"`; }
        else if (item.id === 'dob') { displayValue = item.val[0] + '/' + item.val[1] + '/' + item.val[2]}
        else if (item.id === 'gender') { displayValue = item.val }
        else if (item.id === 'activityLevel') { displayValue = item.val }

        return (
            <TouchableOpacity 
                style={styles.button} 
                onPress={
                    item.id === 'weight' ? handleWeightPress
                    : item.id === 'height' ? handleHeightPress
                    : item.id === 'dob' ? handleDobPress
                    : item.id === 'gender' ? handleGenderPress
                    : item.id === 'activityLevel' ? handleActLevelPress
                    : undefined
                }>
                <Text style={[standards.regularText, { fontSize: 20, padding:5 }]}>{item.title}</Text>
                <Text style={[standards.regularText, { fontSize: 20, padding:5 }]}>{displayValue}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <View style={styles.container}>
                    {!(showWeight || showHeight || showDob || showGender || showActLevel) ? (
                        // Modal-style overlay for the FlatList
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalCard}>
                                <View style={{alignItems:'center',width:'100%', padding:10,borderBottomWidth:2, borderColor:'#1a1b1c'}}>
                                    <Text style={[standards.headerText, {fontSize:24}]}>Body Details</Text>
                                </View>
                                <FlatList
                                    data={data}
                                    renderItem={renderItem}
                                    keyExtractor={item => item.id}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.listContent}
                                />
                                <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:5}}>     
                                <TouchableOpacity
                                    style={[styles.saveButton, styles.nextButton]}
                                    onPress={() => router.navigate('/home')}
                                >
                                    <Text style={[standards.regularText, { fontSize: 20 }]}>Back</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.saveButton, styles.nextButton]}
                                    onPress={() => router.replace('/goal')}
                                >
                                    <Text style={[standards.regularText, { fontSize: 20 }]}>Next</Text>
                                </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ) : null}
                    {showWeight && <CurrentWeight weight={weightVal} />}
                    {showHeight && <Height height={heightVal} />}
                    {showDob && <DOB dob={dobVal} />}
                    {showGender && <Gender gender={genderVal} />}
                    {showActLevel && <ActivityLevel actLevel={actLevelVal} />}
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

const CurrentWeight = ({ weight }) => {
    const [tempWeight, setTempWeight] = useState('')
    const Increase = () => setTempWeight(prevWeight => Number(prevWeight) + 1);
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
                <Text style={[standards.regularText, { fontSize: 20 }]}>Current Weight</Text>

                <View style={{color: '#232f30', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, paddingVertical: 10}}>
                    <TouchableOpacity onPress={Decrease}>
                        <Text style={styles.text}>-</Text>
                    </TouchableOpacity>
                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '50%'}}>
                        <TextInput 
                            style={[styles.numInput, { width: '35%' }]}
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
                    data.find(item => item.id === 'weight').val = tempWeight
                    router.replace('/nutsplash')
                }}>
                    <Text style={styles.navButtonText}>Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const Height = ({ height }) => {
    const [tempHeight, setTempHeight] = useState(['',''])
    const Increase = () => setTempHeight(prevHeight => {
        if (prevHeight[1] > 10) {
            return [Number(prevHeight[0]) + 1, 0]
        }
        else {
            return [prevHeight[0],Number(prevHeight[1]) + 1]
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
                <Text style={[standards.regularText, { fontSize: 20 }]}>Height</Text>

                <View style={{color: '#232f30', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, paddingVertical: 10}}>
                    <TouchableOpacity onPress={Decrease}>
                        <Text style={styles.text}>-</Text>
                    </TouchableOpacity>
                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '50%'}}>
                        <TextInput
                            style={styles.numInput}
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
                            style={styles.numInput}
                            keyboardType="numeric"
                            value={tempHeight[1].toString()}
                            placeholder='0'
                            onChangeText={text => {
                                let newInches = parseInt(text) || '';
                                if (newInches > 11) { newInches = 11 }
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
                    data.find(item => item.id === 'height').val = tempHeight
                    router.replace('/nutsplash')
                }}>
                    <Text style={styles.navButtonText}>Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const DOB = ({ dob }) => {
    const [tempDob, setTempDob] = useState(['','',''])

    return(
        <View style={{color: 'transparent', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <View style={styles.inputContainer}>
                <Text style={[standards.regularText, { fontSize: 20 }]}>Date of Birth</Text>

                <View style={{color: '#232f30', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, paddingVertical: 10}}>
                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%'}}>
                        <TextInput
                            style={styles.numInput}
                                keyboardType="numeric"
                                value={tempDob[0].toString()}
                                placeholder='MM'
                                onChangeText={ text => {
                                    let newMonth = parseInt(text) || ''
                                    if (newMonth > 12) { newMonth = 12 }
                                    if (newMonth == 2 && tempDob[1] > 28) {
                                        newMonth = 2
                                        tempDob[1] = 28
                                    }
                                    else if (newMonth % 2 == 0 && tempDob[1] > 30) { tempDob[1] = 30 }
                                    setTempDob([newMonth, tempDob[1], tempDob[2]])
                                }} // Ensure it stays a number
                                maxLength={2} // Limit to 2 digits
                        />
                        <Text style={styles.text}>/</Text>
                        <TextInput
                            style={styles.numInput}
                                keyboardType="numeric"
                                value={tempDob[1].toString()}
                                placeholder='DD'
                                onChangeText={ text => {
                                    let newDay = parseInt(text) || ''
                                    if (tempDob[0] == 2 && newDay > 28) { newDay = 28 }
                                    else if (tempDob[0] % 2 == 0 && newDay > 30) { newDay = 30 }
                                    else if (newDay > 31) { newDay = 31 }
                                    setTempDob([tempDob[0], newDay, tempDob[2]])
                                }} // Ensure it stays a number
                                maxLength={2} // Limit to 2 digits
                        />
                        <Text style={styles.text}>/</Text>
                        <TextInput
                            style={styles.numInput}
                                keyboardType="numeric"
                                value={tempDob[2].toString()}
                                placeholder='YYYY'
                                onChangeText={ text => {
                                    let newYear = parseInt(text) || '';
                                    if (newYear > 2012) { newYear = 2012 }
                                    setTempDob([tempDob[0], tempDob[1], newYear])
                                }} // Ensure it stays a number
                                maxLength={4} // Limit to 4 digits
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={() => {
                    if (tempDob[2] >= 1900) {
                        data.find(item => item.id === 'dob').val = tempDob
                        router.replace('/nutsplash')
                    }
                }}>
                    <Text style={styles.navButtonText}>Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const Gender = ({ gender }) => {
    const [isMalePressed, setIsMalePressed] = useState(false);
    const [isFemalePressed, setIsFemalePressed] = useState(false);

    const handlePressed = (tempGender) => {
        if (tempGender === 'male') {
            setIsMalePressed(!isMalePressed);
            setIsFemalePressed(false);
        }
        else if (tempGender === 'female') {
            setIsFemalePressed(!isFemalePressed);
            setIsMalePressed(false);
        }
    }

    return(
        <View style={{color: 'transparent', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <View style={styles.inputContainer}>
                <Text style={[standards.regularText, { fontSize: 20 }]}>Gender</Text>

                <View style={{color: '#232f30', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, paddingVertical: 10}}>
                    <TouchableOpacity
                    style={{backgroundColor: isMalePressed ? '#32a852' : '#1a1b1c', borderRadius: 10, width: '40%', alignItems: 'center', paddingVertical: 10, marginRight: 10}}
                    onPress={() => handlePressed('male')}>
                        <Text style={{color: '#fff', fontSize: 20}}>Male</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                    style={{backgroundColor: isFemalePressed ? '#32a852' : '#1a1b1c', borderRadius: 10, width: '40%', alignItems: 'center', paddingVertical: 10, marginRight: 10}}
                    onPress={() => handlePressed('female')}>
                        <Text style={{color: '#fff', fontSize: 20}}>Female</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={() => {
                    if (isMalePressed || isFemalePressed) {
                        data.find(item => item.id === 'gender').val = isMalePressed ? 'Male' : isFemalePressed ? 'Female': '';
                        router.replace('/nutsplash')
                    }
                }}>
                    <Text style={styles.navButtonText}>Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const ActivityLevel = ({ actLevel }) => {
    const [isLow, setIsLow] = useState(false);
    const [isModerate, setIsModerate] = useState(false);
    const [isHigh, setIsHigh] = useState(false);
    const [isVeryHigh, setIsVeryHigh] = useState(false);

    const handlePress = (tempActLevel) => {
        if (tempActLevel === 'Low') {
            setIsLow(!isLow);
            setIsModerate(false);
            setIsHigh(false);
            setIsVeryHigh(false);
        } else if (tempActLevel === 'Moderate') {
            setIsModerate(!isModerate);
            setIsLow(false);
            setIsHigh(false);
            setIsVeryHigh(false);
        } else if (tempActLevel === 'High') {
            setIsHigh(!isHigh);
            setIsLow(false);
            setIsModerate(false);
            setIsVeryHigh(false);
        } else if (tempActLevel === 'Very High') {
            setIsVeryHigh(!isVeryHigh);
            setIsLow(false);
            setIsModerate(false);
            setIsHigh(false);
        }
    }

    return(
        <View style={{color: 'transparent', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <View style={[styles.inputContainer, {height: '50%', width: '60%'}]}>
                <Text style={[standards.regularText, { fontSize: 20 }]}>Activity Level</Text>
                    <TouchableOpacity
                    style={{backgroundColor: isLow ? '#32a852' : '#1a1b1c', borderRadius: 10, width: '50%', alignItems: 'center', paddingVertical: 10, marginRight: 10}}
                    onPress={() => handlePress('Low')}>
                        <Text style={{color: '#fff', fontSize: 20}}>Low</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                    style={{backgroundColor: isModerate ? '#32a852' : '#1a1b1c', borderRadius: 10, width: '50%', alignItems: 'center', paddingVertical: 10, marginRight: 10}}
                    onPress={() => handlePress('Moderate')}>
                        <Text style={{color: '#fff', fontSize: 20}}>Moderate</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                    style={{backgroundColor: isHigh ? '#32a852' : '#1a1b1c', borderRadius: 10, width: '50%', alignItems: 'center', paddingVertical: 10, marginRight: 10}}
                    onPress={() => handlePress('High')}>
                        <Text style={{color: '#fff', fontSize: 20}}>High</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                    style={{backgroundColor: isVeryHigh ? '#32a852' : '#1a1b1c', borderRadius: 10, width: '50%', alignItems: 'center', paddingVertical: 10, marginRight: 10}}
                    onPress={() => handlePress('Very High')}>
                        <Text style={{color: '#fff', fontSize: 20}}>Very High</Text>
                    </TouchableOpacity>
                

                <TouchableOpacity style={styles.saveButton} onPress={() => {
                    if (isLow || isModerate || isHigh || isVeryHigh) {
                        data.find(item => item.id === 'activityLevel').val = isLow ? 'Low' : isModerate ? 'Moderate' : isHigh ? 'High' : isVeryHigh ? 'Very High' : '';
                        router.replace('/nutsplash')
                    }
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
        height:ScreenHeight,
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
        backgroundColor: '#2c2c2e',
        paddingVertical: 14,
        borderBottomColor: '#1a1b1c',
        borderBottomWidth: 2,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1,
    },
    inputContainer: {
        backgroundColor: '#2c2c2e',
        width: ScreenHeight*0.75,
        height: screenWidth*0.5,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 2,
        padding: 10,
    },
    navButton: {
        marginTop: 20,
        backgroundColor: '#2c2c2e',
        paddingVertical: 5,
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
        width: '45%',
        alignItems: 'center',
        borderRadius: 4,
        margin:5,
        marginTop: 10,
    },
    numInput: {
        flex: 1,
        height: 40,
        padding: 0,
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    // New styles for modal FlatList
    modalOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#1a1b1c',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        zIndex: 5,
    },
    modalCard: {
        backgroundColor: '#2c2c2e',
        width: '80%',
        maxHeight: '70%',
        borderRadius: 16,
        paddingTop: 4,
        paddingBottom: 12,
        overflow: 'hidden',
    },
    listContent: {
        width: '100%',
    },
    nextButton: {
        alignSelf: 'center',
        borderRadius: 10,
        marginTop: 8,
    },
})