import { Image } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const tabs = [
  { name: 'Home',       route: '/home', image: require('../assets/images/home3.png') },
  { name: 'Workout',    route: '/workout', image: require('../assets/images/arm2.png') },
  { name: 'Scan',       route: '/barcodeScanner', image: require('../assets/images/barcode-scan2.png') },
  { name: 'Nutrition',  route: '/nutrition', image: require('../assets/images/apple2.png') },
  { name: 'Profile',    route: 'profile', image: require('../assets/images/user2.png') },
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
          {/*<Text style={[styles.label, path === tab.route && styles.active]}>
            {tab.name}
          </Text>*/}
          <Image style={[{width: 25, height: 25}, path === tab.route]} source={tab.image}/>
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
    backgroundColor: '#2c2c2e',
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
