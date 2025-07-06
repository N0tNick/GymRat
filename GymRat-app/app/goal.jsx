import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { data } from './nutsplash';

const userData = data

export let cals = 0

const calcCalories = ({ goal, speed }) => {
    const weight = (data.find(item => item.id === 'weight').val) / 2.205 // in kg
    const height = ((data.find(item => item.id === 'height').val)[0] * 12 + (data.find(item => item.id === 'height').val)[1]) * 2.54 // in centimeters

    const dob = (data.find(item => item.id === 'dob').val)
    const dobString = dob[2] + '-' + dob[0] + '-' + dob[1] // in format YYYY-MM-DD
    const age = calculateAge(dobString) // age in years

    const gender = (data.find(item => item.id === 'gender').val)

    let genderVar = 5
    if (gender === 'female') { genderVar = -161 }

    const bmr = (10 * weight) + (6.25 * height) - (5 * age) + (genderVar)

    const actLevel = (data.find(item => item.id === 'activityLevel').val)
    let actLevelVar = 1.3753
    if (actLevel === 'moderate') { actLevelVar = 1.4650 }
    else if (actLevel === 'high') { actLevelVar = 1.5498 }
    else if (actLevel === 'very high') { actLevelVar = 1.7249 }

    const maintenanceCals = bmr * actLevelVar

    let speedFactor = 0.045
    if (goal === 'maintain') { return maintenanceCals }
    else {
        speedFactor = (speed / 0.25) * speedFactor
        if (goal === 'lose') { return (maintenanceCals - (maintenanceCals * speedFactor)) }
        else if (goal === 'gain') { return (maintenanceCals + (maintenanceCals * speedFactor))}
    }    
}

function calculateAge(birthDateString, referenceDateString = new Date().toISOString().slice(0, 10)) {
    const birthDate = new Date(birthDateString)
    const referenceDate = new Date(referenceDateString)

    let age = referenceDate.getFullYear() - birthDate.getFullYear()

    const monthDifference = referenceDate.getMonth() - birthDate.getMonth()
    const dayDifference = referenceDate.getDate() - birthDate.getDate()

    // Adjust age if the birthday hasn't occurred yet in the current year
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
        age--
    }

    return age
}

const SetGoalSpeed = ({ goal }) => {
    //console.log(goal)
    const [sliderValue, setSliderValue] = React.useState(.25);

    return(
        <View style={{color: 'transparent', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <View style={[styles.inputContainer, {height: '35%'}]}>
                <Text style={[styles.text, {textAlign: 'center'}]}>How fast do you want to {goal} weight?</Text>
                <Text style={[styles.text, {fontSize: 25}]}>{sliderValue} lbs/week</Text>
                <Slider
                style={{width: 200, height: 40}}
                minimumValue={.25}
                maximumValue={2}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#000000"
                step={.25}
                tapToSeek={true}
                onValueChange={(value) => {
                    setSliderValue(value);
                }}
                />
                <TouchableOpacity style={styles.saveButton} onPress={() => {
                    //console.log(sliderValue)
                    cals = Math.round(calcCalories({ goal, speed: sliderValue }))
                    console.log(cals)
                    router.replace('/nutrition')
                }}>
                    <Text style={[styles.text, {fontSize: 20}]}>Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const SetGoalWeight = ({ currentWeight, goal }) => {
    const [tempWeight, setTempWeight] = React.useState('')
    const Increase = () => setTempWeight(prevWeight => {
        return Number(prevWeight) + 1;
    });
    const Decrease = () => setTempWeight(prevWeight => {
        if (prevWeight <= 0) {
            return 0; // Prevent going below 0
        } else {
            return Number(prevWeight - 1);
        }
    });

    
    const [showGoalSpeed, setShowGoalSpeed] = React.useState(false);

    return(
        showGoalSpeed ? (
            <SetGoalSpeed goal={goal} />
        ) : (
            <View style={{color: 'transparent', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                <View style={styles.inputContainer}>
                    <Text style={{color: '#fff', fontSize: 28, fontWeight: 'bold'}}>Goal Weight</Text>

                    <View style={{color: '#232f30', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, paddingVertical: 10}}>
                        <TouchableOpacity onPress={Decrease}>
                            <Text style={styles.text}>-</Text>
                        </TouchableOpacity>
                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '50%'}}>
                            <TextInput 
                                style={[styles.numInput, { width: '35%' }]}
                                keyboardType="numeric"
                                placeholder= {(goal === 'lose' ? (currentWeight - 1) : goal === 'gain' ? (currentWeight + 1) : currentWeight).toString()}
                                onChangeText={text => {
                                    if (goal === 'lose' && text >= currentWeight) {
                                        setTempWeight(currentWeight - 1);
                                    }
                                    else if (goal === 'gain' && text <= currentWeight) {
                                        setTempWeight(currentWeight + 1);
                                    }
                                    else { setTempWeight(parseInt(text) || '') }
                                }} // Ensure it stays a number
                                maxLength={3} // Limit to 3 digits
                            />
                            <Text style={styles.text}> lbs</Text>
                        </View>
                        <TouchableOpacity onPress={Increase}>
                            <Text style={styles.text}>+</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={() => 
                    setShowGoalSpeed(true)
                    }>
                        <Text style={[styles.text, {fontSize: 20}]}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    )
}

const Goal = () => {
    const [lose, setLose] = React.useState(false);
    const [maintain, setMaintain] = React.useState(false);
    const [gain, setGain] = React.useState(false);

    const handlePress = (goal) => {
        if (goal === 'lose') {
            setLose(true);
            setMaintain(false);
            setGain(false);
        } else if (goal === 'maintain') {
            setLose(false);
            setMaintain(true);
            setGain(false);
        } else if (goal === 'gain') {
            setLose(false);
            setMaintain(false);
            setGain(true);
        }
    }

    const [showGoalWeight, setShowGoalWeight] = React.useState(false);

    return (
            <SafeAreaProvider>
                <SafeAreaView style={{flex: 1, flexDirection: 'column', backgroundColor: '#1a1b1c', justifyContent: 'center'}}>
                    <LinearGradient style={styles.container} colors={["#32a852","#1a1b1c"]}>
                        
                        {showGoalWeight ? (
                            <SetGoalWeight currentWeight={150} goal={lose ? 'lose' : gain ? 'gain' : 'maintain'} />
                        ) : (
                            <View style={[styles.inputContainer, {height: '50%', width: '60%'}]}>
                                <Text style={styles.text}>What is your goal?</Text>
                                <TouchableOpacity style={[styles.button, {backgroundColor: lose ? '#32a852' : '#1a1b1c'}]} onPress={() => handlePress('lose')}>
                                    <Text style={[styles.text, {fontSize: 20}]}>Lose Weight</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, {backgroundColor: maintain ? '#32a852' : '#1a1b1c'}]} onPress={() => handlePress('maintain')}>
                                    <Text style={[styles.text, {fontSize: 20}]}>Maintain Weight</Text>
                                </TouchableOpacity> 
                                <TouchableOpacity style={[styles.button, {backgroundColor: gain ? '#32a852' : '#1a1b1c'}]} onPress={() => handlePress('gain')}>
                                    <Text style={[styles.text, {fontSize: 20}]}>Gain Weight</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.saveButton, {alignSelf: 'center', borderRadius: 10}]} onPress={() => setShowGoalWeight(true)}>
                                    <Text style={[styles.text, {fontSize: 20}]}>Next</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                    </LinearGradient>
                </SafeAreaView>
            </SafeAreaProvider>
        )
}

export default Goal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#1a1b1c',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#32a852',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButton: {
        backgroundColor: '#32a852',
        paddingVertical: 10,
        width: '50%',
        alignItems: 'center',
        borderRadius: 4,
        marginTop: 10,
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
    numInput: {
        height: 40,
        padding: 0,
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
});