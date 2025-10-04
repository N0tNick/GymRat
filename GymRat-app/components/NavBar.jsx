import { Image } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View, Animated, Touchable } from 'react-native';
import { useState, useRef } from 'react';

import FoodModal from './FoodModal';

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

  const [scanExpanded, setScanExpanded] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const [foodModalVisible, setFoodModalVisible] = useState(false);

  const toggleScan = () => {
    setScanExpanded(!scanExpanded);
    Animated.spring(anim, {
      toValue: scanExpanded ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

  const leftTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60],
  });
  const rightTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60],
  });
  const upTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80],
  });

  return (
    <>
    <View style={styles.nav}>
      {tabs.map((tab) => {
        const isActive = path === tab.route || (tab.route === 'profile' && path === '/profile');
        if (tab.name === 'Scan') {
          return (
            <View key="scan" style={styles.scanWrapper}>
              <TouchableOpacity
                style={[styles.tab, scanExpanded && styles.closeButton]}
                onPress={toggleScan}
              >
                <Image
                  style={{
                    width: 25,
                    height: 25,
                    tintColor: '#fff',
                  }}
                  source={
                    scanExpanded
                      ? require('../assets/images/close.png')
                      : tab.image
                  }
                />
              </TouchableOpacity>

              {/* Left option: Barcode */}
              {scanExpanded && (
                <Animated.View
                  style={[
                    styles.option,
                    {
                      transform: [
                        { translateX: leftTranslate },
                        { translateY: upTranslate },
                      ],
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.optionBtn}
                    onPress={() => {
                      toggleScan();
                      router.replace('/barcodeScanner');
                    }}
                  >
                    <Image
                      style={{ width: 25, height: 25, tintColor: '#fff' }}
                      source={require('../assets/images/barcode-scan2.png')}
                    />
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* Right option: Add Food */}
              {scanExpanded && (
                <Animated.View
                  style={[
                    styles.option,
                    {
                      transform: [
                        { translateX: rightTranslate },
                        { translateY: upTranslate },
                      ],
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.optionBtn}
                    onPress={() => {
                      toggleScan();
                      setFoodModalVisible(true);
                    }}
                  >
                    <Image
                      style={{ width: 25, height: 25, tintColor: '#fff' }}
                      source={require('../assets/images/apple2.png')}
                    />
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          );
        }

        // Normal tab
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

    <FoodModal
      visible={foodModalVisible}
      onClose={() => setFoodModalVisible(false)}
    />
    </>
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
  scanWrapper: {
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
    scanContainer: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: '#32a852',
    borderRadius: 35,
    padding: 14,
  },
  closeButton: {
    backgroundColor: '',
  },
  option: {
    position: 'absolute',
  },
  optionBtn: {
    backgroundColor: '#444',
    padding: 18,
    borderRadius: 35,
  },
});
