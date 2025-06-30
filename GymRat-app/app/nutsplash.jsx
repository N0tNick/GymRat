import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const data = [
  { id: 'weight', title: 'Current Weight', val: '0.0 lbs' },
  { id: 'height', title: 'Height', val: `0'0"` },
  { id: 'dob', title: 'Date of Birth', val: 'MM/DD/YYYY' },
  { id: 'gender', title: 'Gender', val: 'Gender' },
  { id: 'activityLevel', title: 'Activity Level', val: 'None' },
];

const renderItem = ({ item }) => (
  <TouchableOpacity style={styles.button}>
    <Text style={styles.itemText}>{item.title}</Text>
    <Text style={styles.itemText}>{item.val}</Text>
  </TouchableOpacity>
);

export default function NutSplash() {
  const router = useRouter();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
<LinearGradient
          colors={['#32a852', '#1a1b1c']}
          style={styles.container}
        >
                <FlatList 
                  data={data}
                  renderItem={renderItem}
                  keyExtractor={item => item.id}
                />

                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => router.push('/nutrition')}
                >
                  <Text style={styles.navButtonText}>
                    Go to Nutrition Screen
                  </Text>
                </TouchableOpacity>
            </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#1a1b1c',
    justifyContent: 'center',
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
  },
  itemText: {
    color: '#fff',
    fontSize: 20,
    padding: 10,
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
});