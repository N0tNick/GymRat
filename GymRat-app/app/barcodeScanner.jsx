import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../components/NavBar';
import { auth } from '../firebaseConfig';

export default function BarcodeScannerScreen() {
  const router = useRouter();

  const handleSignOut = () => {
    signOut(auth)
      .then(() => router.replace('/login'))
      .catch(console.error);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={['#FFFFFF', '#808080']}
          style={styles.container}
        >
          <Text style={styles.text}>Barcode Scanner Screen</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
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
    color: '#000',
    fontSize: 28,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#a83232',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});
