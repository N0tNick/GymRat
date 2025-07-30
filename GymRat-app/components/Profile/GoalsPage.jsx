import React from 'react';
import {View, StyleSheet} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';


export default function Goals() {
    return (
        <SafeAreaProvider>
          <SafeAreaView style={styles.container}>
        
          </SafeAreaView>
        </SafeAreaProvider>
    )
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    margin: 10,
  },
})