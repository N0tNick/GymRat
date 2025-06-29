import React from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

const data = [
    { id: 'weight', title: 'Current Weight', val: '0.0 lbs' },
    { id: 'height', title: 'Height', val: `0'0"` },
    { id: 'dob', title: 'Date of Birth', val: 'MM/DD/YYYY' },
    { id: 'gender', title: 'Gender', val: 'Gender'},
    { id: 'activityLevel', title: 'Activity Level', val: 'None' },
]

const renderItem = ({ item }: { item: { id: string; title: string; val: string} }) => (
    <TouchableOpacity style={styles.button}>
        <Text style={{color: '#fff', fontSize: 20, padding: 10}}>{item.title}</Text>
        <Text style={{color: '#fff', fontSize: 20, padding: 10}}>{item.val}</Text>
    </TouchableOpacity>
)

const nutsplash = () => {
  return (
    <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
            <FlatList 
                data={data}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
        </SafeAreaView>
    </SafeAreaProvider>
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
    }
})