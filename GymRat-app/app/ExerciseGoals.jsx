import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@ui-kitten/components';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ExerciseGoals() {
  const router = useRouter();

  return (
    <SafeAreaProvider>
      <LinearGradient colors={['#6a5acd', '#1a1b1c']} style={styles.container}>
        <SafeAreaView style={styles.content}>
          <View style={styles.header}>
            <Text category='h3' style={styles.title}>Exercise Goals</Text>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: 'white',
    marginTop: 20,
    textAlign:'center'
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  backButton: {
    position: 'absolute',
    left:0,
    top:20,
    padding: 7,
    borderWidth: 3,
    borderRadius:10,
    borderColor:'#6a5acd',
    backgroundColor:'#2a2a2aff'
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});