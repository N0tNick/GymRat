import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../components/NavBar';

export default function WorkoutScreen() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={['#8B0000', '#1a1b1c']}
          style={styles.container}
        >
          <Text style={styles.text}>Workout Screen</Text>
        </LinearGradient>
        <NavBar />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
});
