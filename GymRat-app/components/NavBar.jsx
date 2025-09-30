import { Image } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const tabs = [
  { name: 'Home',       route: '/home', 
    image: require('../assets/images/home3.png'), 
    selected: require('../assets/images/home(selected).png') },
  { name: 'Workout',    route: '/workout', 
    image: require('../assets/images/arm2.png'), 
    selected: require('../assets/images/arm(selected).png') },
  { name: 'Scan',       route: '/barcodeScanner', 
    image: require('../assets/images/barcode-scan2.png'), 
    selected: require('../assets/images/barcode(selected).png') },
  { name: 'Nutrition',  route: '/nutrition', 
    image: require('../assets/images/apple2.png'), 
    selected: require('../assets/images/apple(selected).png') },
  { name: 'Profile',    route: 'profile', 
    image: require('../assets/images/user2.png'), 
    selected: require('../assets/images/user(selected).png') },
];

export default function NavBar() {
  const router = useRouter();
  const path = usePathname();

  return (
    <View style={styles.nav}>
      {tabs.map((tab) => {
        const isActive = path === tab.route || (tab.route === 'profile' && path === '/profile');
        return (
          <TouchableOpacity
            key={tab.route}
            style={styles.tab}
            onPress={() => router.replace(tab.route)}
          >
            {/*<Text style={[styles.label, isActive && styles.active]}>
              {tab.name}
            </Text>*/}
            <Image
              style={{ width: 25, height: 25 }}
              source={isActive ? tab.selected : tab.image}
            />
          </TouchableOpacity>
        );
      })}
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
