import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const tabs = [
  { name: 'Home',       route: '/home' },
  { name: 'Workout',    route: '/workout' },
  { name: 'Scan',       route: '/barcodeScanner' },
  { name: 'Nutrition',  route: '/nutrition' },
  { name: 'Profile',    route: 'profile' },
];

export default function NavBar() {
  const router = useRouter();
  const path = usePathname();


  return (
    <View style={styles.nav}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.route}
          style={styles.tab}
          onPress={() => router.replace(tab.route)}
        >
          <Text style={[styles.label, path === tab.route && styles.active]}>
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    height: 80,
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1a1b1c',
    backgroundColor: '#232f30',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 15,
  },
  active: {
    color: '#32a852',
    fontWeight: 'bold',
  },
});
