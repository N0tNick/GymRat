import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../components/NavBar';
import SettingsWheel from '../components/SettingsWheel';

export default function ProfileScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [bmi, setBmi] = useState('');
  const [bodyFat, setBodyFat] = useState('');

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient colors={['#6a5acd', '#1a1b1c']} style={styles.container}>
          <View style={styles.settingsWheelWrapper}>
            <SettingsWheel />
          </View>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.text}>Profile Screen</Text>
            {/* your modal & inputs here… */}
            {/* … */}
          </ScrollView>
        </LinearGradient>
        <NavBar />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  settingsWheelWrapper: { position: 'absolute', top: 20, right: 20 },
  scrollContainer: { padding: 20, paddingTop: 80 },
  text: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
});
