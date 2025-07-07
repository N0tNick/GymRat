import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../components/NavBar';
import { cals } from './goal';

export default function Nutrition() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <LinearGradient style={styles.gradient} colors={['#32a852', '#1a1b1c']}>
          <View style={styles.content}>
            <Text style={styles.text}>Nutrition Screen</Text>
            <Text style={[styles.text, { fontSize: 20 }]}>
              Today's Calorie Goal:
            </Text>
            <Text style={[styles.text, { fontSize: 20 }]}>{cals}</Text>
          </View>
        </LinearGradient>
        <NavBar />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
});
