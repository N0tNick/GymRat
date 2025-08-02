import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');
const router = useRouter();

export default function CreateTemplateScreen() {
  const [templateName, setTemplateName] = useState('New Template')

  return(
      <SafeAreaProvider>
          <View style={[styles.container, {backgroundColor: '#1a1b1c'}]}
          >
            <SafeAreaView style={{ flex: 1, height: screenHeight, width: screenWidth}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', padding: 10}}>
                <TouchableOpacity style={{backgroundColor: '#1478db', paddingHorizontal: 10, justifyContent: 'center', borderRadius: 5}}
                onPress={router.back}><Text style={[styles.xButton, {color: '#fff'}]}>X</Text></TouchableOpacity>
                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 20}}>New Template</Text>
                <TouchableOpacity style={{backgroundColor: '#1478db', paddingHorizontal: 10, height: 35, justifyContent: 'center', borderRadius: 5}}><Text style={[styles.xButton, {color: '#fff'}]}>Save</Text></TouchableOpacity>
              </View>

              <TextInput
              style={{color: '#fff', fontSize: 30, fontWeight: 'bold', padding: 25}}
              onChangeText={setTemplateName}
              value={templateName}
              />

            </SafeAreaView>
            
          </View>
      </SafeAreaProvider>
  )
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
    color: '#fff',
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