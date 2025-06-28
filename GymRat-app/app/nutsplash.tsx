import React from 'react'
import { Button, FlatList, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const data = [
    { id: 'weight', title: 'Current Weight' },
    { id: 'height', title: 'Height' },
    { id: 'dob', title: 'Date of Birth' },
    { id: 'gender', title: 'Gender' },
    { id: 'activityLevel', title: 'Activity Level' },
]

const renderItem = ({ item }: { item: { id: string; title: string } }) => (
    <Button title={item.title} />    
)

const nutsplash = () => {
  return (
    <SafeAreaView style={styles.container}>
        <FlatList 
            data={data}
            renderItem={renderItem}
            keyExtractor={item => item.id}
        />
    </SafeAreaView>
  )
}

export default nutsplash

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#001f3f',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
})