import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const data = [
    { id: 'weight', title: 'Current Weight', val: 0.0 },
    { id: 'height', title: 'Height', val: `0'0"` },
    { id: 'dob', title: 'Date of Birth', val: 'MM/DD/YYYY' },
    { id: 'gender', title: 'Gender', val: 'Gender'},
    { id: 'activityLevel', title: 'Activity Level', val: 'None' },
]



const nutsplash = () => {
    const [showWeight, setShowWeight] = React.useState(false)
    const [weightVal, setWeightVal] = React.useState('')

    const handleWeightPress = () => {
        const weightItem = data.find(item => item.id === 'weight')
        if (weightItem) {
            setWeightVal(weightItem.val)
        }
        setShowWeight(true)
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity 
        style={styles.button} 
        onPress={item.id === 'weight' ? handleWeightPress : undefined}>
            <Text style={{color: '#fff', fontSize: 20, padding: 10}}>{item.title}</Text>
            <Text style={{color: '#fff', fontSize: 20, padding: 10}}>{item.val}</Text>
        </TouchableOpacity>
    )

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
                </LinearGradient>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

const CurrentWeight = ({ weight }) => {
    const [tempWeight, setTempWeight] = React.useState(weight)
    const Increase = () => setTempWeight(prevWeight => prevWeight + 1);
    const Decrease = () => setTempWeight(prevWeight => prevWeight - 1);
    return(
        <View style={styles.inputContainer}>
            <View>
                <Text>Current Weight</Text>
                <Text>{tempWeight} lbs</Text>
                <TouchableOpacity onPress={Increase}><Text>Increase</Text></TouchableOpacity>
                <TouchableOpacity onPress={Decrease}><Text>Decrease</Text></TouchableOpacity>
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
        backgroundColor: 'transparent',
        width: '100%',
        height: '100%',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
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
})